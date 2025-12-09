import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/notice.dart';
import 'auth_service.dart';

class NoticeService {
  final AuthService _authService = AuthService();

  Future<List<Notice>> getAllNotices() async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('No authentication token found');
    }

    try {
      final url = ApiConfig.notices;
      print('Fetching notices from: $url');
      
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(ApiConfig.timeout);

      print('Notice response status: ${response.statusCode}');
      print('Notice response body: ${response.body}');

      if (response.statusCode == 200) {
        final dynamic data = json.decode(response.body);
        
        // Handle both wrapped and unwrapped responses
        List<dynamic> noticesJson;
        if (data is List) {
          noticesJson = data;
        } else if (data['success'] == true) {
          noticesJson = data['data'];
        } else if (data['data'] != null) {
          noticesJson = data['data'];
        } else {
          throw Exception('Invalid response format');
        }
        
        print('Found ${noticesJson.length} notices');
        return noticesJson.map((json) => Notice.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load notices: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('Error in getAllNotices: $e');
      throw Exception('Error loading notices: $e');
    }
  }

  Future<void> markAsRead(String noticeId) async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('No authentication token found');
    }

    final response = await http.post(
      Uri.parse(ApiConfig.markNoticeAsRead(noticeId)),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to mark notice as read: ${response.body}');
    }
  }

  Future<int> getUnreadCount() async {
    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('No authentication token found');
    }

    final response = await http.get(
      Uri.parse(ApiConfig.unreadNoticesCount),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['count'] ?? 0;
    } else {
      throw Exception('Failed to get unread count: ${response.body}');
    }
  }
}
