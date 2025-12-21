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
      final url = '${ApiConfig.baseUrl}/resources/modules/$moduleId';
      print('Fetching module resources from: $url');
      
      final response = await http.get(
        Uri.parse(url),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      print('Module resources response status: ${response.statusCode}');
      print('Module resources response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          // Handle the data structure: data can be either a Map with 'resources' key or a List directly
          List<dynamic> resourcesJson = [];
          
          if (data['data'] == null) {
            print('No resources found for module $moduleId (null data)');
            return [];
          } else if (data['data'] is Map) {
            // Backend returns: { "data": { "resources": [...], "pagination": {...} } }
            final dataMap = data['data'] as Map<String, dynamic>;
            if (dataMap['resources'] != null && dataMap['resources'] is List) {
              resourcesJson = dataMap['resources'] as List<dynamic>;
            } else {
              print('No resources array found in data map');
              return [];
            }
          } else if (data['data'] is List) {
            // Backend returns: { "data": [...] }
            resourcesJson = data['data'] as List<dynamic>;
          }
          
          if (resourcesJson.isEmpty) {
            print('No resources found for module $moduleId (empty array)');
            return [];
          }
          
          final resources = resourcesJson.map((json) => Resource.fromJson(json)).toList();
          print('Loaded ${resources.length} resources');
          return resources;
        } else {
          throw Exception(data['message'] ?? 'Failed to load resources');
        }
      } else if (response.statusCode == 404) {
        // Return empty list for 404 (no resources found)
        print('No resources endpoint found (404), returning empty list');
        return [];
      } else {
        throw Exception('Server error ${response.statusCode}: ${response.body}');
      }
    } on http.ClientException catch (e) {
      print('Network error loading resources: $e');
      throw Exception('Network error: Unable to connect to server');
    } on FormatException catch (e) {
      print('Parse error loading resources: $e');
      throw Exception('Invalid response format from server');
    } catch (e) {
      print('Error loading module resources: $e');
      throw Exception('Error loading resources: $e');
    }
  }

  // Get resources for a topic
  Future<List<Resource>> getTopicResources(String topicId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final url = '${ApiConfig.baseUrl}/resources/topics/$topicId';
      print('Fetching topic resources from: $url');
      
      final response = await http.get(
        Uri.parse(url),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      print('Topic resources response status: ${response.statusCode}');
      print('Topic resources response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          // Handle the data structure: data can be either a Map with 'resources' key or a List directly
          List<dynamic> resourcesJson = [];
          
          if (data['data'] == null) {
            print('No resources found for topic $topicId (null data)');
            return [];
          } else if (data['data'] is Map) {
            // Backend returns: { "data": { "resources": [...], "pagination": {...} } }
            final dataMap = data['data'] as Map<String, dynamic>;
            if (dataMap['resources'] != null && dataMap['resources'] is List) {
              resourcesJson = dataMap['resources'] as List<dynamic>;
            } else {
              print('No resources array found in data map');
              return [];
            }
          } else if (data['data'] is List) {
            // Backend returns: { "data": [...] }
            resourcesJson = data['data'] as List<dynamic>;
          }
          
          if (resourcesJson.isEmpty) {
            print('No resources found for topic $topicId (empty array)');
            return [];
          }
          
          final resources = resourcesJson.map((json) => Resource.fromJson(json)).toList();
          print('Loaded ${resources.length} resources');
          return resources;
        } else {
          throw Exception(data['message'] ?? 'Failed to load resources');
        }
      } else if (response.statusCode == 404) {
        // Return empty list for 404 (no resources found)
        print('No resources endpoint found (404), returning empty list');
        return [];
      } else {
        throw Exception('Server error ${response.statusCode}: ${response.body}');
      }
    } on http.ClientException catch (e) {
      print('Network error loading resources: $e');
      throw Exception('Network error: Unable to connect to server');
    } on FormatException catch (e) {
      print('Parse error loading resources: $e');
      throw Exception('Invalid response format from server');
    } catch (e) {
      print('Error loading topic resources: $e');
      throw Exception('Error loading resources: $e');
    }
  }

  // Get resources for a lesson
  Future<List<Resource>> getLessonResources(String lessonId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final url = '${ApiConfig.baseUrl}/resources/lessons/$lessonId';
      print('Fetching lesson resources from: $url');
      
      final response = await http.get(
        Uri.parse(url),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      print('Lesson resources response status: ${response.statusCode}');
      print('Lesson resources response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          // Handle the data structure: data can be either a Map with 'resources' key or a List directly
          List<dynamic> resourcesJson = [];
          
          if (data['data'] == null) {
            print('No resources found for lesson $lessonId (null data)');
            return [];
          } else if (data['data'] is Map) {
            // Backend returns: { "data": { "resources": [...], "pagination": {...} } }
            final dataMap = data['data'] as Map<String, dynamic>;
            if (dataMap['resources'] != null && dataMap['resources'] is List) {
              resourcesJson = dataMap['resources'] as List<dynamic>;
            } else {
              print('No resources array found in data map');
              return [];
            }
          } else if (data['data'] is List) {
            // Backend returns: { "data": [...] }
            resourcesJson = data['data'] as List<dynamic>;
          }
          
          if (resourcesJson.isEmpty) {
            print('No resources found for lesson $lessonId (empty array)');
            return [];
          }
          
          final resources = resourcesJson.map((json) => Resource.fromJson(json)).toList();
          print('Loaded ${resources.length} resources');
          return resources;
        } else {
          throw Exception(data['message'] ?? 'Failed to load resources');
        }
      } else if (response.statusCode == 404) {
        // Return empty list for 404 (no resources found)
        print('No resources endpoint found (404), returning empty list');
        return [];
      } else {
        throw Exception('Server error ${response.statusCode}: ${response.body}');
      }
    } on http.ClientException catch (e) {
      print('Network error loading resources: $e');
      throw Exception('Network error: Unable to connect to server');
    } on FormatException catch (e) {
      print('Parse error loading resources: $e');
      throw Exception('Invalid response format from server');
    } catch (e) {
      print('Error loading lesson resources: $e');
      throw Exception('Error loading resources: $e');
    }
  }

  // Track resource access
  Future<void> trackAccess(String resourceId, String actionType) async {
    final token = await _authService.getToken();
    if (token == null) return;

    try {
      print('Tracking resource access: $resourceId, action: $actionType');
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/resources/$resourceId/track'),
        headers: ApiConfig.headers(token: token),
        body: json.encode({'action': actionType}),
      ).timeout(ApiConfig.timeout);
      
      print('Track response status: ${response.statusCode}');
      print('Track response body: ${response.body}');
      
      if (response.statusCode != 200 && response.statusCode != 201) {
        print('Failed to track resource access: ${response.statusCode} - ${response.body}');
      }
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
