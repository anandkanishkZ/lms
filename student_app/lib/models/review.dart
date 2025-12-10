class ModuleReview {
  final String id;
  final String moduleId;
  final String studentId;
  final int rating;
  final String? comment;
  final bool isPublished;
  final DateTime createdAt;
  final DateTime updatedAt;
  final ReviewStudent? student;

  ModuleReview({
    required this.id,
    required this.moduleId,
    required this.studentId,
    required this.rating,
    this.comment,
    required this.isPublished,
    required this.createdAt,
    required this.updatedAt,
    this.student,
  });

  factory ModuleReview.fromJson(Map<String, dynamic> json) {
    return ModuleReview(
      id: json['id'] ?? '',
      moduleId: json['moduleId'] ?? '',
      studentId: json['studentId'] ?? '',
      rating: json['rating'] ?? 0,
      comment: json['comment'],
      isPublished: json['isPublished'] ?? true,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : DateTime.now(),
      student: json['student'] != null 
          ? ReviewStudent.fromJson(json['student']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'moduleId': moduleId,
      'studentId': studentId,
      'rating': rating,
      'comment': comment,
      'isPublished': isPublished,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      if (student != null) 'student': student!.toJson(),
    };
  }
}

class ReviewStudent {
  final String id;
  final String name;
  final String? profileImage;

  ReviewStudent({
    required this.id,
    required this.name,
    this.profileImage,
  });

  factory ReviewStudent.fromJson(Map<String, dynamic> json) {
    return ReviewStudent(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Unknown',
      profileImage: json['profileImage'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'profileImage': profileImage,
    };
  }
}

class RatingStats {
  final double averageRating;
  final int totalReviews;
  final List<RatingDistribution> ratingDistribution;

  RatingStats({
    required this.averageRating,
    required this.totalReviews,
    required this.ratingDistribution,
  });

  factory RatingStats.fromJson(Map<String, dynamic> json) {
    return RatingStats(
      averageRating: (json['averageRating'] ?? 0).toDouble(),
      totalReviews: json['totalReviews'] ?? 0,
      ratingDistribution: (json['ratingDistribution'] as List<dynamic>?)
          ?.map((item) => RatingDistribution.fromJson(item))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'averageRating': averageRating,
      'totalReviews': totalReviews,
      'ratingDistribution': ratingDistribution.map((r) => r.toJson()).toList(),
    };
  }
}

class RatingDistribution {
  final int rating;
  final int count;

  RatingDistribution({
    required this.rating,
    required this.count,
  });

  factory RatingDistribution.fromJson(Map<String, dynamic> json) {
    return RatingDistribution(
      rating: json['rating'] ?? 0,
      count: json['count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'rating': rating,
      'count': count,
    };
  }
}

class ReviewsResponse {
  final List<ModuleReview> reviews;
  final ReviewPagination pagination;

  ReviewsResponse({
    required this.reviews,
    required this.pagination,
  });

  factory ReviewsResponse.fromJson(Map<String, dynamic> json) {
    return ReviewsResponse(
      reviews: (json['reviews'] as List<dynamic>?)
          ?.map((item) => ModuleReview.fromJson(item))
          .toList() ?? [],
      pagination: json['pagination'] != null 
          ? ReviewPagination.fromJson(json['pagination']) 
          : ReviewPagination(
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: 10,
              hasNextPage: false,
              hasPreviousPage: false,
            ),
    );
  }
}

class ReviewPagination {
  final int currentPage;
  final int totalPages;
  final int totalItems;
  final int itemsPerPage;
  final bool hasNextPage;
  final bool hasPreviousPage;

  ReviewPagination({
    required this.currentPage,
    required this.totalPages,
    required this.totalItems,
    required this.itemsPerPage,
    required this.hasNextPage,
    required this.hasPreviousPage,
  });

  factory ReviewPagination.fromJson(Map<String, dynamic> json) {
    return ReviewPagination(
      currentPage: json['currentPage'] ?? 1,
      totalPages: json['totalPages'] ?? 1,
      totalItems: json['totalItems'] ?? 0,
      itemsPerPage: json['itemsPerPage'] ?? 10,
      hasNextPage: json['hasNextPage'] ?? false,
      hasPreviousPage: json['hasPreviousPage'] ?? false,
    );
  }
}
