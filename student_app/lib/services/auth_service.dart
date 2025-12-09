import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userKey = 'user_data';

  // Login
  Future<AuthResponse> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.studentLogin),
        headers: ApiConfig.headers(),
        body: json.encode({
          'identifier': email,
          'password': password,
        }),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final authResponse = AuthResponse.fromJson(data['data']);
          await _saveAuthData(authResponse);
          return authResponse;
        } else {
          throw Exception(data['message'] ?? 'Login failed');
        }
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Login failed');
      }
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  // Register
  Future<AuthResponse> register({
    required String email,
    required String password,
    required String name,
    String? phone,
    String? symbolNo,
  }) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.studentRegister),
        headers: ApiConfig.headers(),
        body: json.encode({
          'email': email,
          'password': password,
          'name': name,
          'phone': phone,
          'symbolNo': symbolNo,
          'role': 'STUDENT',
        }),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final authResponse = AuthResponse.fromJson(data['data']);
          await _saveAuthData(authResponse);
          return authResponse;
        } else {
          throw Exception(data['message'] ?? 'Registration failed');
        }
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Registration failed');
      }
    } catch (e) {
      throw Exception('Registration error: $e');
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      final token = await getToken();
      if (token != null) {
        await http.post(
          Uri.parse(ApiConfig.logout),
          headers: ApiConfig.headers(token: token),
        ).timeout(ApiConfig.timeout);
      }
    } catch (e) {
      // Ignore logout API errors
    } finally {
      await _clearAuthData();
    }
  }

  // Get current user
  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString(_userKey);
    
    if (userData != null) {
      return User.fromJson(json.decode(userData));
    }
    return null;
  }

  // Get token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Check if logged in
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null;
  }

  // Save auth data
  Future<void> _saveAuthData(AuthResponse authResponse) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, authResponse.accessToken);
    await prefs.setString(_refreshTokenKey, authResponse.refreshToken);
    await prefs.setString(_userKey, json.encode(authResponse.user.toJson()));
  }

  // Clear auth data
  Future<void> _clearAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_refreshTokenKey);
    await prefs.remove(_userKey);
  }

  // Update profile
  Future<User> updateProfile({
    required String name,
    String? phone,
    String? symbolNo,
  }) async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
    final response = await http.put(
      Uri.parse(ApiConfig.updateProfile),
        headers: ApiConfig.headers(token: token),
        body: json.encode({
          'name': name,
          'phone': phone,
          'symbolNo': symbolNo,
        }),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final user = User.fromJson(data['data']);
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(_userKey, json.encode(user.toJson()));
          return user;
        } else {
          throw Exception(data['message'] ?? 'Update failed');
        }
      } else {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Update failed');
      }
    } catch (e) {
      throw Exception('Update error: $e');
    }
  }

  // Change password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');

    try {
    final response = await http.post(
      Uri.parse(ApiConfig.changePassword),
        headers: ApiConfig.headers(token: token),
        body: json.encode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      ).timeout(ApiConfig.timeout);

      if (response.statusCode != 200) {
        final error = json.decode(response.body);
        throw Exception(error['message'] ?? 'Password change failed');
      }
    } catch (e) {
      throw Exception('Password change error: $e');
    }
  }
}
