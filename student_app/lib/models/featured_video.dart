class FeaturedVideo {
  final String type; // 'live', 'featured', or 'none'
  final bool isLive;
  final String? videoUrl;
  final String title;
  final String description;
  final String? moduleId;
  final String? liveClassId;
  final DateTime? startTime;
  final DateTime? endTime;

  FeaturedVideo({
    required this.type,
    required this.isLive,
    this.videoUrl,
    required this.title,
    required this.description,
    this.moduleId,
    this.liveClassId,
    this.startTime,
    this.endTime,
  });

  factory FeaturedVideo.fromJson(Map<String, dynamic> json) {
    return FeaturedVideo(
      type: json['type'] as String,
      isLive: json['isLive'] as bool,
      videoUrl: json['videoUrl'] as String?,
      title: json['title'] as String,
      description: json['description'] as String,
      moduleId: json['moduleId'] as String?,
      liveClassId: json['liveClassId'] as String?,
      startTime: json['startTime'] != null ? DateTime.parse(json['startTime']) : null,
      endTime: json['endTime'] != null ? DateTime.parse(json['endTime']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'isLive': isLive,
      'videoUrl': videoUrl,
      'title': title,
      'description': description,
      'moduleId': moduleId,
      'liveClassId': liveClassId,
      'startTime': startTime?.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
    };
  }
}
