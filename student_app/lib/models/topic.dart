class Topic {
  final String id;
  final String title;
  final String? description;
  final int? order;
  final String moduleId;
  final int? duration;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int? lessonsCount;
  final List<Lesson>? lessons;

  Topic({
    required this.id,
    required this.title,
    this.description,
    this.order,
    required this.moduleId,
    this.duration,
    required this.createdAt,
    required this.updatedAt,
    this.lessonsCount,
    this.lessons,
  });

  factory Topic.fromJson(Map<String, dynamic> json) {
    return Topic(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      order: json['order'] as int?,
      moduleId: json['moduleId'] as String,
      duration: json['duration'] as int?,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      lessonsCount: json['lessonsCount'] as int? ?? json['_count']?['lessons'] as int?,
      lessons: json['lessons'] != null
          ? (json['lessons'] as List).map((l) => Lesson.fromJson(l)).toList()
          : null,
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
  final String? thumbnailUrl;
  final String topicId;
  final bool? isCompleted;
  final DateTime? completedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  Lesson({
    required this.id,
    required this.title,
    this.content,
    required this.type,
    this.order,
    this.duration,
    this.videoUrl,
    this.thumbnailUrl,
    required this.topicId,
    this.isCompleted,
    this.completedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Lesson.fromJson(Map<String, dynamic> json) {
    return Lesson(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String?,
      type: json['type'] as String,
      order: json['order'] as int?,
      duration: json['duration'] as int?,
      videoUrl: json['videoUrl'] as String?,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      topicId: json['topicId'] as String,
      isCompleted: json['isCompleted'] as bool?,
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt']) : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

class Resource {
  final String id;
  final String title;
  final String? description;
  final String type;
  final String url;
  final String? fileSize;
  final String moduleId;
  final DateTime createdAt;
  final DateTime updatedAt;

  Resource({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    required this.url,
    this.fileSize,
    required this.moduleId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Resource.fromJson(Map<String, dynamic> json) {
    return Resource(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      type: json['type'] as String,
      url: json['url'] as String,
      fileSize: json['fileSize'] as String?,
      moduleId: json['moduleId'] as String,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

class LiveClass {
  final String id;
  final String title;
  final String? description;
  final String? meetingUrl;
  final DateTime scheduledAt;
  final DateTime? endedAt;
  final String status;
  final String? moduleId;
  final String? recordingUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  LiveClass({
    required this.id,
    required this.title,
    this.description,
    this.meetingUrl,
    required this.scheduledAt,
    this.endedAt,
    required this.status,
    this.moduleId,
    this.recordingUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  factory LiveClass.fromJson(Map<String, dynamic> json) {
    return LiveClass(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      meetingUrl: json['meetingUrl'] as String?,
      scheduledAt: DateTime.parse(json['scheduledAt']),
      endedAt: json['endedAt'] != null ? DateTime.parse(json['endedAt']) : null,
      status: json['status'] as String,
      moduleId: json['moduleId'] as String?,
      recordingUrl: json['recordingUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

class Review {
  final String id;
  final int rating;
  final String? comment;
  final String studentId;
  final String moduleId;
  final Student? student;
  final DateTime createdAt;
  final DateTime updatedAt;

  Review({
    required this.id,
    required this.rating,
    this.comment,
    required this.studentId,
    required this.moduleId,
    this.student,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] as String,
      rating: json['rating'] as int,
      comment: json['comment'] as String?,
      studentId: json['studentId'] as String,
      moduleId: json['moduleId'] as String,
      student: json['student'] != null ? Student.fromJson(json['student']) : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

class Student {
  final String id;
  final String name;
  final String? email;

  Student({
    required this.id,
    required this.name,
    this.email,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String?,
    );
  }
}
