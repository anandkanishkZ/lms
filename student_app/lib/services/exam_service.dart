import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/exam.dart';
import 'auth_service.dart';

class ExamService {
  final AuthService _authService = AuthService();

  // Get exam preview (safe for students, no answers)
  Future<Map<String, dynamic>> getExamPreview(String examId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.exams}/$examId/preview'),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      print('Exam Preview Response Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['data'];
        } else {
          throw Exception(data['message'] ?? 'Failed to load exam preview');
        }
      } else {
        final errorBody = response.body;
        print('Error response: $errorBody');
        throw Exception('Failed to load exam preview: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception in getExamPreview: $e');
      throw Exception('Error loading exam preview: $e');
    }
  }

  // Get all available exams
  Future<List<Exam>> getAllExams() async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.exams),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      print('Exam API Response Status: ${response.statusCode}');
      print('Exam API Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List<dynamic> examsJson = data['data'];
          print('Number of exams received: ${examsJson.length}');
          
          // Parse each exam with error handling
          final List<Exam> exams = [];
          for (int i = 0; i < examsJson.length; i++) {
            try {
              final exam = Exam.fromJson(examsJson[i]);
              exams.add(exam);
            } catch (e) {
              print('Error parsing exam at index $i: $e');
              print('Exam JSON: ${examsJson[i]}');
            }
          }
          
          return exams;
        } else {
          throw Exception(data['message'] ?? 'Failed to load exams');
        }
      } else {
        final errorBody = response.body;
        print('Error response: $errorBody');
        throw Exception('Failed to load exams: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception in getAllExams: $e');
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
