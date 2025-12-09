import 'package:flutter/material.dart';
import '../../models/module.dart';
import '../../services/module_service.dart';

class ModuleProvider extends ChangeNotifier {
  final ModuleService _moduleService = ModuleService();

  List<Module> _modules = [];
  List<Module> _enrolledModules = [];
  List<Module> _featuredModules = [];
  bool _isLoading = false;
  String? _error;

  List<Module> get modules => _modules;
  List<Module> get enrolledModules => _enrolledModules;
  List<Module> get featuredModules => _featuredModules;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load all modules
  Future<void> loadModules() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _modules = await _moduleService.getAllModules();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load enrolled modules
  Future<void> loadEnrolledModules() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _enrolledModules = await _moduleService.getMyEnrollments();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load featured modules
  Future<void> loadFeaturedModules() async {
    try {
      _featuredModules = await _moduleService.getFeaturedModules();
      notifyListeners();
    } catch (e) {
      // Ignore featured module errors
    }
  }

  // Enroll in module
  Future<bool> enrollInModule(String moduleId) async {
    try {
      await _moduleService.enrollInModule(moduleId);
      await loadEnrolledModules();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Check if enrolled
  bool isEnrolled(String moduleId) {
    return _enrolledModules.any((m) => m.id == moduleId);
  }
}
