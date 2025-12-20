import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../services/auth_service.dart';
import '../models/resource.dart';

class ResourceService {
  final AuthService _authService;

  ResourceService(this._authService);

  // Get resources for a module
  Future<List<Resource>> getModuleResources(String moduleId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/resources/modules/$moduleId'),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> resourcesJson = data['data'];
          return resourcesJson.map((json) => Resource.fromJson(json)).toList();
        }
      }
      throw Exception('Failed to load resources');
    } catch (e) {
      throw Exception('Error loading resources: $e');
    }
  }

  // Get resources for a topic
  Future<List<Resource>> getTopicResources(String topicId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/resources/topics/$topicId'),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> resourcesJson = data['data'];
          return resourcesJson.map((json) => Resource.fromJson(json)).toList();
        }
      }
      throw Exception('Failed to load resources');
    } catch (e) {
      throw Exception('Error loading resources: $e');
    }
  }

  // Get resources for a lesson
  Future<List<Resource>> getLessonResources(String lessonId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/resources/lessons/$lessonId'),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> resourcesJson = data['data'];
          return resourcesJson.map((json) => Resource.fromJson(json)).toList();
        }
      }
      throw Exception('Failed to load resources');
    } catch (e) {
      throw Exception('Error loading resources: $e');
    }
  }

  // Track resource access
  Future<void> trackAccess(String resourceId, String actionType) async {
    final token = await _authService.getToken();
    if (token == null) return;

    try {
      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/resources/$resourceId/track'),
        headers: ApiConfig.headers(token: token),
        body: json.encode({'actionType': actionType}),
      ).timeout(ApiConfig.timeout);
    } catch (e) {
      print('Error tracking resource access: $e');
    }
  }

  // Get resource download URL
  String getResourceUrl(String? filePath) {
    if (filePath == null || filePath.isEmpty) return '';
    // If it's already a full URL, return it
    if (filePath.startsWith('http')) return filePath;
    // Otherwise, construct the URL
    return '${ApiConfig.baseUrl}/$filePath';
  }
}
