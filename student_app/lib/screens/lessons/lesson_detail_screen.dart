import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_html/flutter_html.dart';
import '../../models/topic.dart';
import '../../services/lesson_service.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/skeleton_loader.dart';

class LessonDetailScreen extends StatefulWidget {
  final String lessonId;
  final String moduleId;

  const LessonDetailScreen({
    super.key,
    required this.lessonId,
    required this.moduleId,
  });

  @override
  State<LessonDetailScreen> createState() => _LessonDetailScreenState();
}

class _LessonDetailScreenState extends State<LessonDetailScreen> {
  LessonService? _lessonService;
  Lesson? _lesson;
  bool _isLoading = true;
  String? _error;
  bool _isCompleted = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    if (_lessonService == null) {
      final authProvider = context.read<AuthProvider>();
      _lessonService = LessonService(authProvider.authService);
      _loadLesson();
    }
  }

  Future<void> _loadLesson() async {
    if (_lessonService == null) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final lesson = await _lessonService!.getLessonById(widget.lessonId);
      
      setState(() {
        _lesson = lesson;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  IconData _getLessonIcon(String type) {
    switch (type) {
      case 'VIDEO':
        return Icons.play_circle_outline;
      case 'TEXT':
        return Icons.article_outlined;
      case 'PDF':
        return Icons.picture_as_pdf_outlined;
      case 'YOUTUBE_LIVE':
        return Icons.live_tv;
      case 'QUIZ':
        return Icons.quiz_outlined;
      case 'ASSIGNMENT':
        return Icons.assignment_outlined;
      case 'EXTERNAL_LINK':
        return Icons.link;
      default:
        return Icons.book_outlined;
    }
  }

  Widget _buildContent() {
    if (_lesson == null) return const SizedBox();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Lesson Header
          Row(
            children: [
              Icon(
                _getLessonIcon(_lesson!.type),
                size: 32,
                color: Theme.of(context).primaryColor,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _lesson!.title,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (_lesson!.duration != null)
                      Row(
                        children: [
                          const Icon(Icons.access_time, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            '${_lesson!.duration} min',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Lesson Type Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _getLessonIcon(_lesson!.type),
                  size: 16,
                  color: Theme.of(context).primaryColor,
                ),
                const SizedBox(width: 6),
                Text(
                  _lesson!.type,
                  style: TextStyle(
                    color: Theme.of(context).primaryColor,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Video Player (if VIDEO type)
          if (_lesson!.type == 'VIDEO' && _lesson!.videoUrl != null) ...[
            Card(
              clipBehavior: Clip.antiAlias,
              child: InkWell(
                onTap: () => _launchUrl(_lesson!.videoUrl!),
                child: Container(
                  height: 200,
                  decoration: BoxDecoration(
                    color: Colors.grey[900],
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.play_circle_filled,
                          size: 64,
                          color: Colors.white.withOpacity(0.9),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Tap to play video',
                          style: TextStyle(color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],

          // YouTube Video (if YOUTUBE_LIVE or YOUTUBE type)
          if ((_lesson!.type == 'YOUTUBE_LIVE' || _lesson!.type == 'YOUTUBE') && _lesson!.videoUrl != null) ...[
            Card(
              clipBehavior: Clip.antiAlias,
              child: InkWell(
                onTap: () => _launchUrl(_lesson!.videoUrl!),
                child: Column(
                  children: [
                    Container(
                      height: 200,
                      decoration: BoxDecoration(
                        color: Colors.grey[900],
                      ),
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.play_arrow,
                            size: 48,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(12),
                      color: Colors.grey[100],
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.ondemand_video, size: 20, color: Colors.red),
                          SizedBox(width: 8),
                          Text(
                            'Watch on YouTube',
                            style: TextStyle(fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],

          // PDF Viewer (if PDF type)
          if (_lesson!.type == 'PDF' && _lesson!.videoUrl != null) ...[
            Card(
              child: ListTile(
                leading: const Icon(Icons.picture_as_pdf, color: Colors.red, size: 40),
                title: const Text('PDF Document'),
                subtitle: const Text('Tap to open'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () => _launchUrl(_lesson!.videoUrl!),
              ),
            ),
            const SizedBox(height: 24),
          ],

          // External Link (if EXTERNAL_LINK type)
          if (_lesson!.type == 'EXTERNAL_LINK' && _lesson!.videoUrl != null) ...[
            Card(
              child: ListTile(
                leading: const Icon(Icons.link, color: Colors.blue, size: 40),
                title: const Text('External Resource'),
                subtitle: Text(_lesson!.videoUrl!),
                trailing: const Icon(Icons.open_in_new),
                onTap: () => _launchUrl(_lesson!.videoUrl!),
              ),
            ),
            const SizedBox(height: 24),
          ],

          // Rich Text Content
          if (_lesson!.content != null && _lesson!.content!.isNotEmpty) ...[
            Text(
              'Content',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Html(
                  data: _lesson!.content!,
                  style: {
                    "body": Style(
                      fontSize: FontSize(16),
                      lineHeight: const LineHeight(1.5),
                    ),
                  },
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],

          // Mark as Complete Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isCompleted ? null : () {
                setState(() {
                  _isCompleted = true;
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Lesson marked as complete!'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
              icon: Icon(_isCompleted ? Icons.check_circle : Icons.check_circle_outline),
              label: Text(_isCompleted ? 'Completed' : 'Mark as Complete'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _isCompleted ? Colors.green : Theme.of(context).primaryColor,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lesson Details'),
      ),
      body: _isLoading
          ? SkeletonDetailContent()
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(
                        'Failed to load lesson',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(_error!, textAlign: TextAlign.center),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _loadLesson,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _buildContent(),
    );
  }
}
