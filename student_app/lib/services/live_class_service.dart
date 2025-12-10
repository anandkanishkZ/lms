import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/topic.dart';
import 'auth_service.dart';

class LiveClassService {
  final AuthService _authService;

  LiveClassService(this._authService);

  Future<List<LiveClass>> getUpcomingLiveClasses() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    final response = await http.get(
      Uri.parse(ApiConfig.upcomingLiveSessions),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final liveClasses = (data['data'] as List)
          .map((liveClassJson) => LiveClass.fromJson(liveClassJson))
          .toList();
      return liveClasses;
    } else {
      throw Exception('Failed to load upcoming live classes: ${response.statusCode}');
    }
  }

  Future<List<LiveClass>> getCurrentLiveClasses() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    final response = await http.get(
      Uri.parse(ApiConfig.currentLiveSessions),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final liveClasses = (data['data'] as List)
          .map((liveClassJson) => LiveClass.fromJson(liveClassJson))
          .toList();
      return liveClasses;
    } else {
      throw Exception('Failed to load current live classes: ${response.statusCode}');
    }
  }

  Future<List<LiveClass>> getPastLiveClasses() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    final response = await http.get(
      Uri.parse(ApiConfig.pastLiveSessions),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final liveClasses = (data['data'] as List)
          .map((liveClassJson) => LiveClass.fromJson(liveClassJson))
          .toList();
      return liveClasses;
    } else {
      throw Exception('Failed to load past live classes: ${response.statusCode}');
    }
  }

  Future<List<LiveClass>> getLiveClassesByModule(String moduleId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    print('Fetching live classes for module: $moduleId');
    final url = '${ApiConfig.baseUrl}/live-classes/module/$moduleId';
    print('URL: $url');

    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      
      if (data['success'] == true && data['data'] != null) {
        // Backend now returns { success: true, data: { liveClasses: [...], pagination: {...} } }
        final liveClassesData = data['data']['liveClasses'] as List;
        final liveClasses = liveClassesData
            .map((liveClassJson) => LiveClass.fromJson(liveClassJson))
            .toList();
        print('Parsed ${liveClasses.length} live classes');
        return liveClasses;
      } else {
        print('No data in response or success=false');
        return [];
      }
    } else {
      // If endpoint doesn't exist, return empty list
      print('Failed to load live classes for module: ${response.statusCode}');
      print('Error: ${response.body}');
      return [];
    }
  }
}
