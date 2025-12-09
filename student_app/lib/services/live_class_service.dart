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

    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/youtube-live/module/$moduleId'),
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
      // If endpoint doesn't exist, filter from all upcoming classes
      final allClasses = await getUpcomingLiveClasses();
      return allClasses.where((lc) => lc.moduleId == moduleId).toList();
    }
  }
}
