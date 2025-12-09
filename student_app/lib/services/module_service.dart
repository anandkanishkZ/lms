import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/module.dart';
import 'auth_service.dart';

class ModuleService {
  final AuthService _authService = AuthService();

  // Get all modules
  Future<List<Module>> getAllModules() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.modules),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List<dynamic> modulesJson = data['data'];
          return modulesJson.map((json) => Module.fromJson(json)).toList();
        } else {
          throw Exception(data['message'] ?? 'Failed to load modules');
        }
      } else {
        throw Exception('Failed to load modules');
      }
    } catch (e) {
      throw Exception('Error loading modules: $e');
    }
  }

  // Get featured modules
  Future<List<Module>> getFeaturedModules() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.featuredModules),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List<dynamic> modulesJson = data['data'];
          return modulesJson.map((json) => Module.fromJson(json)).toList();
        } else {
          throw Exception(data['message'] ?? 'Failed to load featured modules');
        }
      } else {
        throw Exception('Failed to load featured modules');
      }
    } catch (e) {
      throw Exception('Error loading featured modules: $e');
    }
  }

  // Get module by ID
  Future<Module> getModuleById(String id) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.moduleById(id)),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return Module.fromJson(data['data']);
        } else {
          throw Exception(data['message'] ?? 'Failed to load module');
        }
      } else {
        throw Exception('Failed to load module');
      }
    } catch (e) {
      throw Exception('Error loading module: $e');
    }
  }

  // Get my enrollments
  Future<List<Module>> getMyEnrollments() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    // Get current user to get their ID
    final user = await _authService.getCurrentUser();
    if (user == null) throw Exception('User not found');

    try {
      final url = ApiConfig.myEnrollments(user.id);
      print('Fetching enrollments from: $url');
      
      final response = await http.get(
        Uri.parse(url),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      print('Enrollment response status: ${response.statusCode}');
      print('Enrollment response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // Handle both wrapped and unwrapped responses
        List<dynamic> enrollmentsJson;
        if (data is List) {
          enrollmentsJson = data;
        } else if (data['success'] == true) {
          enrollmentsJson = data['data'];
        } else if (data['data'] != null) {
          enrollmentsJson = data['data'];
        } else {
          throw Exception(data['message'] ?? 'Failed to load enrollments');
        }
        
        print('Found ${enrollmentsJson.length} enrollments');
        
        // Extract module from each enrollment and add progress
        return enrollmentsJson.map((enrollment) {
          final moduleJson = Map<String, dynamic>.from(enrollment['module'] as Map<String, dynamic>);
          // Add progress from enrollment to module
          moduleJson['progress'] = enrollment['progress'] as int?;
          moduleJson['isEnrolled'] = true;
          moduleJson['enrolledAt'] = enrollment['enrolledAt'] as String?;
          return Module.fromJson(moduleJson);
        }).toList();
      } else {
        throw Exception('Failed to load enrollments: ${response.statusCode}');
      }
    } catch (e) {
      print('Error in getMyEnrollments: $e');
      throw Exception('Error loading enrollments: $e');
    }
  }

  // Enroll in module
  Future<void> enrollInModule(String moduleId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    // Get current user to get their ID
    final user = await _authService.getCurrentUser();
    if (user == null) throw Exception('User not found');

    try {
      final response = await http.post(
        Uri.parse(ApiConfig.enrollments),
        headers: ApiConfig.headers(token: token),
        body: json.encode({
          'moduleId': moduleId,
          'studentId': user.id,
        }),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode != 200 && response.statusCode != 201) {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Failed to enroll');
      }
    } catch (e) {
      throw Exception('Error enrolling in module: $e');
    }
  }
}
