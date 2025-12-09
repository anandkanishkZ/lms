import 'package:flutter/material.dart';
import '../../models/exam.dart';
import '../../services/exam_service.dart';

class ExamProvider extends ChangeNotifier {
  final ExamService _examService = ExamService();

  List<Exam> _exams = [];
  List<Map<String, dynamic>> _attempts = [];
  bool _isLoading = false;
  String? _error;

  List<Exam> get exams => _exams;
  List<Map<String, dynamic>> get attempts => _attempts;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load all exams
  Future<void> loadExams() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _exams = await _examService.getAllExams();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load exam attempts
  Future<void> loadAttempts() async {
    try {
      _attempts = await _examService.getMyExamAttempts();
      notifyListeners();
    } catch (e) {
      // Ignore attempts errors
    }
  }

  // Start exam
  Future<Map<String, dynamic>?> startExam(String examId) async {
    try {
      final result = await _examService.startExam(examId);
      await loadAttempts();
      return result;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  // Submit exam
  Future<Map<String, dynamic>?> submitExam(String examId, Map<String, dynamic> answers) async {
    try {
      final result = await _examService.submitExam(examId, answers);
      await loadAttempts();
      return result;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  // Get exam results
  Future<Map<String, dynamic>?> getResults(String examId) async {
    try {
      return await _examService.getExamResults(examId);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }
}
