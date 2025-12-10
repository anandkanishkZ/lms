import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/review.dart';
import 'auth_service.dart';

class ReviewService {
  final AuthService _authService;

  ReviewService(this._authService);

  /// Submit or update a review for a module
  Future<ModuleReview> submitReview(String moduleId, int rating, String? comment) async {
    try {
      final token = await _authService.getToken();
      if (token == null) throw Exception('No token found');

      final url = '${ApiConfig.baseUrl}/modules/$moduleId/reviews';
      print('Submitting review to: $url');

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'rating': rating,
          'comment': comment,
        }),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout - please check your internet connection');
        },
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null) {
          return ModuleReview.fromJson(data['data']);
        } else {
          throw Exception(data['message'] ?? 'Failed to submit review');
        }
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Failed to submit review');
      }
    } catch (e) {
      print('Exception in submitReview: $e');
      rethrow;
    }
  }

  /// Get the current user's review for a module
  Future<ModuleReview?> getMyReview(String moduleId) async {
    try {
      final token = await _authService.getToken();
      if (token == null) throw Exception('No token found');

      final url = '${ApiConfig.baseUrl}/modules/$moduleId/reviews/my';
      print('Fetching my review from: $url');

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      print('Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null) {
          return ModuleReview.fromJson(data['data']);
        } else {
          return null;
        }
      } else if (response.statusCode == 404) {
        // No review found, this is normal
        return null;
      } else {
        print('Failed to fetch my review: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Exception in getMyReview: $e');
      return null;
    }
  }

  /// Get all reviews for a module with pagination
  Future<ReviewsResponse> getModuleReviews(String moduleId, {int page = 1, int limit = 10}) async {
    try {
      final token = await _authService.getToken();
      if (token == null) throw Exception('No token found');

      final url = '${ApiConfig.baseUrl}/modules/$moduleId/reviews?page=$page&limit=$limit';
      print('Fetching module reviews from: $url');

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      print('Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null) {
          return ReviewsResponse.fromJson(data['data']);
        } else {
          return ReviewsResponse(
            reviews: [],
            pagination: ReviewPagination(
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: limit,
              hasNextPage: false,
              hasPreviousPage: false,
            ),
          );
        }
      } else {
        print('Failed to fetch reviews: ${response.statusCode}');
        return ReviewsResponse(
          reviews: [],
          pagination: ReviewPagination(
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPreviousPage: false,
          ),
        );
      }
    } catch (e) {
      print('Exception in getModuleReviews: $e');
      rethrow;
    }
  }

  /// Get rating statistics for a module
  Future<RatingStats> getRatingStats(String moduleId) async {
    try {
      final token = await _authService.getToken();
      if (token == null) throw Exception('No token found');

      final url = '${ApiConfig.baseUrl}/modules/$moduleId/reviews/stats';
      print('Fetching rating stats from: $url');

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      print('Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null) {
          return RatingStats.fromJson(data['data']);
        } else {
          return RatingStats(
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: [],
          );
        }
      } else {
        print('Failed to fetch rating stats: ${response.statusCode}');
        return RatingStats(
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: [],
        );
      }
    } catch (e) {
      print('Exception in getRatingStats: $e');
      rethrow;
    }
  }

  /// Delete the current user's review
  Future<void> deleteReview(String moduleId) async {
    try {
      final token = await _authService.getToken();
      if (token == null) throw Exception('No token found');

      final url = '${ApiConfig.baseUrl}/modules/$moduleId/reviews/my';
      print('Deleting review at: $url');

      final response = await http.delete(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      print('Response status: ${response.statusCode}');

      if (response.statusCode != 200) {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Failed to delete review');
      }
    } catch (e) {
      print('Exception in deleteReview: $e');
      rethrow;
    }
  }
}
