import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/topic.dart';
import 'auth_service.dart';

class LiveClassService {
  final AuthService _authService;

  LiveClassService(this._authService);

  Future<List<LiveClass>> getAllLiveClasses() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    print('Fetching all live classes...');
    final url = '${ApiConfig.baseUrl}/live-classes?limit=100';
    print('URL: $url');

    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    print('All classes response status: ${response.statusCode}');
    print('All classes response body: ${response.body}');

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['data'] == null || data['data']['liveClasses'] is! List) {
        print('No data or invalid format');
        return [];
      }
      final liveClasses = (data['data']['liveClasses'] as List)
          .map((liveClassJson) => LiveClass.fromJson(liveClassJson))
          .toList();
      print('Parsed ${liveClasses.length} total live classes');
      return liveClasses;
    } else {
      throw Exception('Failed to load live classes: ${response.statusCode}');
    }
  }

  Future<List<LiveClass>> getUpcomingLiveClasses() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/live-classes?upcoming=true'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['data'] == null || data['data']['liveClasses'] is! List) {
        return [];
      }
      final liveClasses = (data['data']['liveClasses'] as List)
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
      Uri.parse('${ApiConfig.baseUrl}/live-classes?status=LIVE'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['data'] == null || data['data']['liveClasses'] is! List) {
        return [];
      }
      final liveClasses = (data['data']['liveClasses'] as List)
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

    print('Fetching past live classes...');
    final url = '${ApiConfig.baseUrl}/live-classes?status=COMPLETED';
    print('URL: $url');

    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    print('Past classes response status: ${response.statusCode}');
    print('Past classes response body: ${response.body}');

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['data'] == null || data['data']['liveClasses'] is! List) {
        print('No data or invalid format');
        return [];
      }
      final liveClasses = (data['data']['liveClasses'] as List)
          .map((liveClassJson) => LiveClass.fromJson(liveClassJson))
          .toList();
      print('Parsed ${liveClasses.length} past live classes');
      return liveClasses;
    } else {
      throw Exception('Failed to load past live classes: ${response.statusCode}');
    }
  }

  Future<List<LiveClass>> getLiveClassesByModule(String moduleId) async {
    try {
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
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout - please check your internet connection');
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
    } catch (e) {
      print('Exception in getLiveClassesByModule: $e');
      rethrow;
    }
  }
}
