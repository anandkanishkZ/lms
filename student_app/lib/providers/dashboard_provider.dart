import 'package:flutter/material.dart';
import '../../services/dashboard_service.dart';

class DashboardProvider extends ChangeNotifier {
  final DashboardService _dashboardService = DashboardService();

  Map<String, dynamic> _stats = {};
  List<Map<String, dynamic>> _recentActivity = [];
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic> get stats => _stats;
  List<Map<String, dynamic>> get recentActivity => _recentActivity;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load dashboard data
  Future<void> loadDashboard() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _stats = await _dashboardService.getDashboardStats();
      _recentActivity = await _dashboardService.getRecentActivity();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  int get enrolledCount => _stats['enrolledModules'] ?? 0;
  int get completedCount => _stats['completedModules'] ?? 0;
  int get examsCount => _stats['totalExams'] ?? 0;
  double get avgScore => (_stats['averageScore'] ?? 0.0).toDouble();
}
