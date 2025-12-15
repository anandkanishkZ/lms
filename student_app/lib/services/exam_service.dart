import 'dart:convert';
import 'package:http/http.dart' as http;
import 'dart:typed_data';
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

  // Submit individual answer (for auto-save)
  Future<void> submitAnswer(
    String examId,
    String attemptId,
    String questionId,
    dynamic answer,
  ) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      // Check if answer contains file uploads
      bool hasFiles = false;
      List<Map<String, dynamic>> files = [];
      
      if (answer is List) {
        // Check if it's a list of file objects
        if (answer.isNotEmpty && answer[0] is Map && answer[0].containsKey('bytes')) {
          hasFiles = true;
          files = List<Map<String, dynamic>>.from(answer);
        }
      }

      if (hasFiles) {
        // Handle file upload with multipart/form-data
        var request = http.MultipartRequest(
          'POST',
          Uri.parse(ApiConfig.submitAnswer(examId, attemptId)),
        );
        
        // Add headers
        request.headers['Authorization'] = 'Bearer $token';
        
        // Add fields
        request.fields['questionId'] = questionId;
        
        // Add files
        for (var i = 0; i < files.length; i++) {
          final file = files[i];
          final fileName = file['name'] as String;
          final bytes = file['bytes'] as Uint8List?;
          
          if (bytes != null) {
            request.files.add(
              http.MultipartFile.fromBytes(
                'files',
                bytes,
                filename: fileName,
              ),
            );
          }
        }
        
        final streamedResponse = await request.send();
        final response = await http.Response.fromStream(streamedResponse);
        
        if (response.statusCode != 200 && response.statusCode != 201) {
          final error = json.decode(response.body);
          throw Exception(error['message'] ?? 'Failed to submit answer');
        }
      } else {
        // Handle regular answer submission (text, MCQ, etc.)
        Map<String, dynamic> bodyData = {'questionId': questionId};
        
        // Determine answer type and add appropriate field
        if (answer is String) {
          // For MCQ (option ID), TRUE_FALSE, SHORT_ANSWER, LONG_ANSWER
          if (answer == 'true' || answer == 'false') {
            bodyData['textAnswer'] = answer;
          } else if (answer.length < 50) {
            // Likely an option ID (MCQ) or short answer
            // Try to determine if it's an MCQ option ID (usually starts with 'cm')
            if (answer.startsWith('cm') || answer.startsWith('cl')) {
              bodyData['selectedOptionId'] = answer;
            } else {
              bodyData['textAnswer'] = answer;
            }
          } else {
            bodyData['textAnswer'] = answer;
          }
        } else if (answer != null) {
          bodyData['textAnswer'] = answer.toString();
        }
        
        final response = await http.post(
          Uri.parse(ApiConfig.submitAnswer(examId, attemptId)),
          headers: ApiConfig.headers(token: token),
          body: json.encode(bodyData),
        ).timeout(ApiConfig.timeout);

        if (response.statusCode != 200 && response.statusCode != 201) {
          final error = json.decode(response.body);
          throw Exception(error['message'] ?? 'Failed to submit answer');
        }
      }
    } catch (e) {
      print('Error submitting answer: $e');
      // Don't throw for auto-save failures - just log
    }
  }

  // Submit exam attempt (final submission)
  Future<Map<String, dynamic>> submitExamAttempt(
    String examId,
    String attemptId,
  ) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.post(
        Uri.parse(ApiConfig.submitExam(examId, attemptId)),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
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

  // Submit exam (alias for submitExamAttempt for backward compatibility)
  Future<Map<String, dynamic>> submitExam(
    String examId,
    String attemptId,
  ) async {
    return submitExamAttempt(examId, attemptId);
  }

  // Get exam result
  Future<Map<String, dynamic>> getExamResult(String examId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
      final response = await http.get(
        Uri.parse(ApiConfig.examResult(examId)),
        headers: ApiConfig.headers(token: token),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['data'];
        } else {
          throw Exception(data['message'] ?? 'Failed to load result');
        }
      } else {
        throw Exception('Failed to load result');
      }
    } catch (e) {
      throw Exception('Error loading result: $e');
    }
  }

  // Alias for backwards compatibility
  Future<Map<String, dynamic>> getExamResults(String examId) async {
    return getExamResult(examId);
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
