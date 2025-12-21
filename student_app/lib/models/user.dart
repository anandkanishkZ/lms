class User {
  final String id;
  final String name;
  final String? firstName;
  final String? middleName;
  final String? lastName;
  final String email;
  final String? phone;
  final String? symbolNo;
  final String role;
  final String? profileImage;
  final bool verified;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? batchId;

  User({
    required this.id,
    required this.name,
    this.firstName,
    this.middleName,
    this.lastName,
    required this.email,
    this.phone,
    this.symbolNo,
    required this.role,
    this.profileImage,
    required this.verified,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.batchId,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    try {
      return User(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? 'Unknown',
        firstName: json['firstName']?.toString(),
        middleName: json['middleName']?.toString(),
        lastName: json['lastName']?.toString(),
        email: json['email']?.toString() ?? '',
        phone: json['phone']?.toString(),
        symbolNo: json['symbolNo']?.toString(),
        role: json['role']?.toString() ?? 'STUDENT',
        profileImage: json['profileImage']?.toString(),
        verified: json['verified'] == true || json['verified'] == 'true',
        isActive: json['isActive'] == true || json['isActive'] == 'true' || json['isActive'] == null,
        createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
        updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : DateTime.now(),
        batchId: json['batchId']?.toString(),
      );
    } catch (e) {
      print('Error parsing user JSON: $e');
      print('JSON data: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'firstName': firstName,
      'middleName': middleName,
      'lastName': lastName,
      'email': email,
      'phone': phone,
      'symbolNo': symbolNo,
      'role': role,
      'profileImage': profileImage,
      'verified': verified,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'batchId': batchId,
    };
  }
}

class AuthResponse {
  final User user;
  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;

  AuthResponse({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    // Backend returns single 'token' field, we'll use it for both access and refresh
    final token = (json['token'] ?? json['accessToken'] ?? '') as String;
    
    if (token.isEmpty) {
      throw Exception('No authentication token received');
    }
    
    return AuthResponse(
      user: User.fromJson(json['user'] ?? {}),
      accessToken: token,
      refreshToken: token, // Using same token for both
      expiresAt: DateTime.now().add(const Duration(hours: 2)), // JWT expires in 120m
    );
  }
}
