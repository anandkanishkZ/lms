import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/topic.dart';
import 'auth_service.dart';

class TopicService {
  final AuthService _authService;

  TopicService(this._authService);

  Future<List<Topic>> getTopicsByModule(String moduleId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    final response = await http.get(
      Uri.parse(ApiConfig.topicsByModule(moduleId)),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final topics = (data['data'] as List)
          .map((topicJson) => Topic.fromJson(topicJson))
          .toList();
      return topics;
    } else {
      throw Exception('Failed to load topics: ${response.statusCode}');
    }
  }

  Future<Topic> getTopicById(String topicId) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('No token found');

    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/topics/$topicId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Topic.fromJson(data['data']);
    } else {
      throw Exception('Failed to load topic: ${response.statusCode}');
    }
  }
}
