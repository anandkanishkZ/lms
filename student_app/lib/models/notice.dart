class Notice {
  final String id;
  final String title;
  final String content;
  final String category;
  final String priority;
  final String? attachmentUrl;
  final bool isPinned;
  final bool isPublished;
  final bool isActive;
  final DateTime? publishedAt;
  final DateTime? expiresAt;
  final String? actionUrl;
  final int viewCount;
  final String publishedBy;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool? isRead;
  final PublishedByUser? publishedByUser;

  Notice({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    required this.priority,
    this.attachmentUrl,
    required this.isPinned,
    required this.isPublished,
    required this.isActive,
    this.publishedAt,
    this.expiresAt,
    this.actionUrl,
    required this.viewCount,
    required this.publishedBy,
    required this.createdAt,
    required this.updatedAt,
    this.isRead,
    this.publishedByUser,
  });

  factory Notice.fromJson(Map<String, dynamic> json) {
    return Notice(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      category: json['category'],
      priority: json['priority'],
      attachmentUrl: json['attachmentUrl'],
      isPinned: json['isPinned'] ?? false,
      isPublished: json['isPublished'] ?? false,
      isActive: json['isActive'] ?? true,
      publishedAt: json['publishedAt'] != null ? DateTime.parse(json['publishedAt']) : null,
      expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
      actionUrl: json['actionUrl'],
      viewCount: json['viewCount'] ?? 0,
      publishedBy: json['publishedBy'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      isRead: json['isRead'],
      publishedByUser: json['publishedByUser'] != null 
          ? PublishedByUser.fromJson(json['publishedByUser']) 
          : null,
    );
  }
}

class PublishedByUser {
  final String id;
  final String name;
  final String email;
  final String role;

  PublishedByUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  factory PublishedByUser.fromJson(Map<String, dynamic> json) {
    return PublishedByUser(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      role: json['role'],
    );
  }
}
