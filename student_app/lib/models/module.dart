class Module {
  final String id;
  final String title;
  final String slug;
  final String? description;
  final String? thumbnailUrl;
  final String? status;
  final int? order;
  final bool? isFeatured;
  final String? subjectId;
  final String? teacherId;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  
  // Featured video fields
  final String? featuredVideoUrl;
  final String? featuredVideoTitle;
  final String? featuredVideoDescription;
  
  // Additional fields from API
  final int? totalTopics;
  final int? totalLessons;
  final int? duration;
  final Teacher? teacher;
  
  // Additional fields from enrollment
  final int? progress;
  final bool? isEnrolled;
  final DateTime? enrolledAt;
  final String? enrollmentId;

  Module({
    required this.id,
    required this.title,
    required this.slug,
    this.description,
    this.thumbnailUrl,
    this.status,
    this.order,
    this.isFeatured,
    this.subjectId,
    this.teacherId,
    this.createdAt,
    this.updatedAt,
    this.featuredVideoUrl,
    this.featuredVideoTitle,
    this.featuredVideoDescription,
    this.totalTopics,
    this.totalLessons,
    this.duration,
    this.teacher,
    this.progress,
    this.isEnrolled,
    this.enrolledAt,
    this.enrollmentId,
  });

  factory Module.fromJson(Map<String, dynamic> json) {
    try {
      print('Parsing module JSON: ${json.keys.join(", ")}');
      return Module(
        id: json['id'] as String,
        title: json['title'] as String,
        slug: json['slug'] as String,
        description: json['description'] as String?,
        thumbnailUrl: json['thumbnailUrl'] as String?,
        status: json['status'] as String?,
        order: json['order'] as int?,
        isFeatured: json['isFeatured'] as bool?,
        subjectId: json['subjectId'] as String?,
        teacherId: json['teacherId'] as String?,
        createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
        updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
        featuredVideoUrl: json['featuredVideoUrl'] as String?,
        featuredVideoTitle: json['featuredVideoTitle'] as String?,
        featuredVideoDescription: json['featuredVideoDescription'] as String?,
        totalTopics: json['totalTopics'] as int?,
        totalLessons: json['totalLessons'] as int?,
        duration: json['duration'] as int?,
        teacher: json['teacher'] != null ? Teacher.fromJson(json['teacher']) : null,
        progress: json['progress'] as int?,
        isEnrolled: json['isEnrolled'] as bool?,
        enrollmentId: json['enrollmentId'] as String?,
        enrolledAt: json['enrolledAt'] != null ? DateTime.parse(json['enrolledAt']) : null,
      );
    } catch (e, stackTrace) {
      print('Error parsing module JSON: $e');
      print('JSON data: $json');
      print('Stack trace: $stackTrace');
      rethrow;
    }
  }
}

class Teacher {
  final String id;
  final String name;

  Teacher({
    required this.id,
    required this.name,
  });

  factory Teacher.fromJson(Map<String, dynamic> json) {
    return Teacher(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }
}

class Lesson {
  final String id;
  final String title;
  final String? content;
  final String type;
  final int? order;
  final int? duration;
  final String? videoUrl;
  final String topicId;
  final bool? isCompleted;
  final DateTime? completedAt;

  Lesson({
    required this.id,
    required this.title,
    this.content,
    required this.type,
    this.order,
    this.duration,
    this.videoUrl,
    required this.topicId,
    this.isCompleted,
    this.completedAt,
  });

  factory Lesson.fromJson(Map<String, dynamic> json) {
    return Lesson(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      type: json['type'],
      order: json['order'],
      duration: json['duration'],
      videoUrl: json['videoUrl'],
      topicId: json['topicId'],
      isCompleted: json['isCompleted'],
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt']) : null,
    );
  }
}
