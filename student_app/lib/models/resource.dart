class Resource {
  final String id;
  final String title;
  final String? description;
  final String type; // FILE, LINK, VIDEO, DOCUMENT
  final String? filePath;
  final String? externalUrl;
  final String? fileType; // pdf, doc, video, etc
  final int? fileSize;
  final bool isVisible;
  final int? order;
  final String? moduleId;
  final String? topicId;
  final String? lessonId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int? accessCount;
  final int? downloadCount;

  Resource({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    this.filePath,
    this.externalUrl,
    this.fileType,
    this.fileSize,
    required this.isVisible,
    this.order,
    this.moduleId,
    this.topicId,
    this.lessonId,
    required this.createdAt,
    required this.updatedAt,
    this.accessCount,
    this.downloadCount,
  });

  factory Resource.fromJson(Map<String, dynamic> json) {
    return Resource(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      type: json['type'] ?? 'FILE',
      filePath: json['filePath'],
      externalUrl: json['externalUrl'],
      fileType: json['fileType'],
      fileSize: json['fileSize'],
      isVisible: json['isVisible'] ?? true,
      order: json['order'],
      moduleId: json['moduleId'],
      topicId: json['topicId'],
      lessonId: json['lessonId'],
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : DateTime.now(),
      accessCount: json['accessCount'],
      downloadCount: json['downloadCount'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type,
      'filePath': filePath,
      'externalUrl': externalUrl,
      'fileType': fileType,
      'fileSize': fileSize,
      'isVisible': isVisible,
      'order': order,
      'moduleId': moduleId,
      'topicId': topicId,
      'lessonId': lessonId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'accessCount': accessCount,
      'downloadCount': downloadCount,
    };
  }

  String get formattedFileSize {
    if (fileSize == null) return '';
    final kb = fileSize! / 1024;
    if (kb < 1024) {
      return '${kb.toStringAsFixed(1)} KB';
    }
    final mb = kb / 1024;
    return '${mb.toStringAsFixed(1)} MB';
  }
}
