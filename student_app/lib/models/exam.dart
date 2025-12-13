class Exam {
  final String id;
  final String title;
  final String? description;
  final String type;
  final DateTime? startTime;
  final DateTime? endTime;
  final int duration;
  final int totalMarks;
  final int passingMarks;
  final String status;
  final bool isPublished;
  final String? moduleId;
  final String? subjectId;
  final String? classId;
  final String? teacherId;
  final DateTime createdAt;
  
  // Student-specific fields
  final bool? isSubmitted;
  final int? obtainedMarks;
  final DateTime? submittedAt;

  Exam({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    this.startTime,
    this.endTime,
    required this.duration,
    required this.totalMarks,
    required this.passingMarks,
    required this.status,
    required this.isPublished,
    this.moduleId,
    this.subjectId,
    this.classId,
    this.teacherId,
    required this.createdAt,
    this.isSubmitted,
    this.obtainedMarks,
    this.submittedAt,
  });

  factory Exam.fromJson(Map<String, dynamic> json) {
    return Exam(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Untitled Exam',
      description: json['description'],
      type: json['type'] ?? 'QUIZ',
      startTime: json['startTime'] != null ? DateTime.parse(json['startTime']) : null,
      endTime: json['endTime'] != null ? DateTime.parse(json['endTime']) : null,
      duration: json['duration'] ?? 0,
      totalMarks: json['totalMarks'] ?? 0,
      passingMarks: json['passingMarks'] ?? 0,
      status: json['status'] ?? 'ACTIVE',
      isPublished: json['isPublished'] ?? false,
      moduleId: json['moduleId'],
      subjectId: json['subjectId'],
      classId: json['classId'],
      teacherId: json['createdBy'], // Backend uses 'createdBy' not 'teacherId'
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      isSubmitted: json['isSubmitted'],
      obtainedMarks: json['obtainedMarks'],
      submittedAt: json['submittedAt'] != null ? DateTime.parse(json['submittedAt']) : null,
    );
  }
}

class Question {
  final String id;
  final String question;
  final String type;
  final List<String> options;
  final int marks;
  final int order;

  Question({
    required this.id,
    required this.question,
    required this.type,
    required this.options,
    required this.marks,
    required this.order,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'],
      question: json['question'],
      type: json['type'],
      options: List<String>.from(json['options'] ?? []),
      marks: json['marks'],
      order: json['order'],
    );
  }
}
