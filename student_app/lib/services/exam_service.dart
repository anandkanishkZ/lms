import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/exam.dart';
import 'auth_service.dart';

class ExamService {
  final AuthService _authService = AuthService();

  // Get all available exams
  Future<List<Exam>> getAllExams() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.exams),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List<dynamic> examsJson = data['data'];
          return examsJson.map((json) => Exam.fromJson(json)).toList();
        } else {
          throw Exception(data['message'] ?? 'Failed to load exams');
        }
      } else {
        throw Exception('Failed to load exams');
      }
    } catch (e) {
      throw Exception('Error loading exams: $e');
    }
  }

  // Start exam attempt
  Future<Map<String, dynamic>> startExam(String examId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.post(
        Uri.parse(ApiConfig.startExam(examId)),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['data'];
        } else {
          throw Exception(data['message'] ?? 'Failed to start exam');
        }
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Failed to start exam');
      }
    } catch (e) {
      throw Exception('Error starting exam: $e');
    }
  }

  // Submit exam answers
  Future<Map<String, dynamic>> submitExam(String examId, Map<String, dynamic> answers) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.post(
        Uri.parse(ApiConfig.submitExam(examId)),
        headers: ApiConfig.headers(token: token),
        body: json.encode(answers),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['data'];
        } else {
          throw Exception(data['message'] ?? 'Failed to submit exam');
        }
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Failed to submit exam');
      }
    } catch (e) {
      throw Exception('Error submitting exam: $e');
    }
  }

  // Get exam results
  Future<Map<String, dynamic>> getExamResults(String examId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.examResults(examId)),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['data'];
        } else {
          throw Exception(data['message'] ?? 'Failed to load results');
        }
      } else {
        throw Exception('Failed to load results');
      }
    } catch (e) {
      throw Exception('Error loading results: $e');
    }
  }

  // Get my exam attempts
  Future<List<Map<String, dynamic>>> getMyExamAttempts() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.exams),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List<dynamic> attemptsJson = data['data'];
          return attemptsJson.cast<Map<String, dynamic>>();
        } else {
          throw Exception(data['message'] ?? 'Failed to load attempts');
        }
      } else {
        throw Exception('Failed to load attempts');
      }
    } catch (e) {
      throw Exception('Error loading attempts: $e');
    }
  }
}
