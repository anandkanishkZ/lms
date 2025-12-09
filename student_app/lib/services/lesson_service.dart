import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/topic.dart';
import 'auth_service.dart';

class LessonService {
  final AuthService _authService;

  LessonService(this._authService);

  Future<List<Lesson>> getLessonsByTopic(String topicId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    final response = await http.get(
      Uri.parse(ApiConfig.lessonsByTopic(topicId)),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final lessons = (data['data'] as List)
          .map((lessonJson) => Lesson.fromJson(lessonJson))
          .toList();
      return lessons;
    } else {
      throw Exception('Failed to load lessons: ${response.statusCode}');
    }
  }

  Future<Lesson> getLessonById(String lessonId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    final response = await http.get(
      Uri.parse(ApiConfig.lessonById(lessonId)),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Lesson.fromJson(data['data']);
    } else {
      throw Exception('Failed to load lesson: ${response.statusCode}');
    }
  }

  Future<void> markLessonComplete(String lessonId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/progress/lessons/$lessonId/complete'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to mark lesson complete: ${response.statusCode}');
    }
  }
}
