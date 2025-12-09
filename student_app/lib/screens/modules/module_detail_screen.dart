import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/module.dart';
import '../../models/topic.dart';
import '../../services/topic_service.dart';
import '../../services/lesson_service.dart';
import '../../services/live_class_service.dart';
import '../../providers/auth_provider.dart';
import 'package:intl/intl.dart';

class ModuleDetailScreen extends StatefulWidget {
  final Module module;

  const ModuleDetailScreen({
    super.key,
    required this.module,
  });

  @override
  State<ModuleDetailScreen> createState() => _ModuleDetailScreenState();
}

class _ModuleDetailScreenState extends State<ModuleDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  TopicService? _topicService;
  LessonService? _lessonService;
  LiveClassService? _liveClassService;

  List<Topic> _topics = [];
  List<LiveClass> _upcomingClasses = [];
  List<LiveClass> _pastClasses = [];
  bool _isLoadingTopics = false;
  bool _isLoadingLiveClasses = false;
  String? _topicsError;
  String? _liveClassesError;

  final Set<String> _expandedTopics = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    // Initialize services here where context is available
    if (_topicService == null) {
      final authProvider = context.read<AuthProvider>();
      _topicService = TopicService(authProvider.authService);
      _lessonService = LessonService(authProvider.authService);
      _liveClassService = LiveClassService(authProvider.authService);

      _loadTopics();
      _loadLiveClasses();
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadTopics() async {
    if (_topicService == null) return;
    
    setState(() {
      _isLoadingTopics = true;
      _topicsError = null;
    });

    try {
      final topics = await _topicService!.getTopicsByModule(widget.module.id);
      
      // Load lessons for each topic
      final updatedTopics = <Topic>[];
      for (var topic in topics) {
        try {
          final lessons = await _lessonService!.getLessonsByTopic(topic.id);
          updatedTopics.add(Topic(
            id: topic.id,
            title: topic.title,
            description: topic.description,
            order: topic.order,
            moduleId: topic.moduleId,
            duration: topic.duration,
            createdAt: topic.createdAt,
            updatedAt: topic.updatedAt,
            lessonsCount: lessons.length,
            lessons: lessons,
          ));
        } catch (e) {
          print('Error loading lessons for topic ${topic.id}: $e');
          updatedTopics.add(topic);
        }
      }
      
      setState(() {
        _topics = updatedTopics;
        _isLoadingTopics = false;
      });
    } catch (e) {
      setState(() {
        _topicsError = e.toString();
        _isLoadingTopics = false;
      });
    }
  }

  Future<void> _loadLiveClasses() async {
    if (_liveClassService == null) return;
    
    setState(() {
      _isLoadingLiveClasses = true;
      _liveClassesError = null;
    });

    try {
      final allClasses = await _liveClassService!.getLiveClassesByModule(widget.module.id);
      final now = DateTime.now();
      
      setState(() {
        _upcomingClasses = allClasses.where((lc) => lc.scheduledAt.isAfter(now) && lc.status != 'completed').toList();
        _pastClasses = allClasses.where((lc) => lc.status == 'completed' || lc.scheduledAt.isBefore(now)).toList();
        _isLoadingLiveClasses = false;
      });
    } catch (e) {
      setState(() {
        _liveClassesError = e.toString();
        _isLoadingLiveClasses = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.module.title),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: TabBar(
            controller: _tabController,
            isScrollable: true,
            tabs: const [
              Tab(text: 'Overview'),
              Tab(text: 'Resources'),
              Tab(text: 'Topics & Lessons'),
              Tab(text: 'Live Classes'),
              Tab(text: 'Reviews'),
            ],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildResourcesTab(),
          _buildTopicsLessonsTab(),
          _buildLiveClassesTab(),
          _buildReviewsTab(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Module Header
          if (widget.module.thumbnailUrl != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                widget.module.thumbnailUrl!,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  height: 200,
                  color: Colors.grey[300],
                  child: const Icon(Icons.image, size: 64, color: Colors.grey),
                ),
              ),
            ),
          const SizedBox(height: 16),

          Text(
            widget.module.title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          // Module Stats Card
          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildStatRow(
                    icon: Icons.schedule,
                    label: 'Duration',
                    value: '${widget.module.duration ?? 0} minutes',
                  ),
                  const Divider(height: 24),
                  _buildStatRow(
                    icon: Icons.topic,
                    label: 'Topics',
                    value: '${widget.module.totalTopics ?? 0} topics',
                  ),
                  const Divider(height: 24),
                  _buildStatRow(
                    icon: Icons.play_lesson,
                    label: 'Lessons',
                    value: '${widget.module.totalLessons ?? 0} lessons',
                  ),
                  if (widget.module.teacher != null) ...[
                    const Divider(height: 24),
                    _buildStatRow(
                      icon: Icons.person,
                      label: 'Instructor',
                      value: widget.module.teacher!.name,
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Progress Card
          if (widget.module.progress != null) ...[
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Your Progress',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '${widget.module.progress}%',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: widget.module.progress! / 100,
                        backgroundColor: Colors.grey[200],
                        minHeight: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Description
          if (widget.module.description != null && widget.module.description!.isNotEmpty) ...[
            Text(
              'About This Module',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              widget.module.description!,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildResourcesTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.folder_open, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'No Resources Available',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              'Resources for this module will be added soon',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[500],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopicsLessonsTab() {
    if (_isLoadingTopics) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_topicsError != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(
              'Error Loading Topics',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Colors.red[700],
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                _topicsError!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _loadTopics,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_topics.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.book_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No Topics Yet',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Topics and lessons will be added soon',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _topics.length,
      itemBuilder: (context, index) {
        final topic = _topics[index];
        final isExpanded = _expandedTopics.contains(topic.id);

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Column(
            children: [
              ListTile(
                leading: CircleAvatar(
                  backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                  child: Text(
                    '${index + 1}',
                    style: TextStyle(
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                title: Text(
                  topic.title,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: topic.description != null
                    ? Text(
                        topic.description!,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      )
                    : null,
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (topic.lessonsCount != null && topic.lessonsCount! > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${topic.lessonsCount} lessons',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.blue,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    const SizedBox(width: 8),
                    Icon(
                      isExpanded ? Icons.expand_less : Icons.expand_more,
                    ),
                  ],
                ),
                onTap: () {
                  setState(() {
                    if (isExpanded) {
                      _expandedTopics.remove(topic.id);
                    } else {
                      _expandedTopics.add(topic.id);
                    }
                  });
                },
              ),
              if (isExpanded && topic.lessons != null && topic.lessons!.isNotEmpty)
                Column(
                  children: topic.lessons!.map((lesson) {
                    return Container(
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(color: Colors.grey[300]!),
                        ),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.only(left: 56, right: 16),
                        leading: Icon(
                          _getLessonIcon(lesson.type),
                          color: lesson.isCompleted == true ? Colors.green : Colors.grey,
                        ),
                        title: Text(lesson.title),
                        subtitle: lesson.duration != null
                            ? Text('${lesson.duration} min')
                            : null,
                        trailing: lesson.isCompleted == true
                            ? const Icon(Icons.check_circle, color: Colors.green)
                            : null,
                        onTap: () {
                          // TODO: Navigate to lesson detail
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Opening: ${lesson.title}')),
                          );
                        },
                      ),
                    );
                  }).toList(),
                ),
              if (isExpanded && (topic.lessons == null || topic.lessons!.isEmpty))
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    'No lessons in this topic yet',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLiveClassesTab() {
    if (_isLoadingLiveClasses) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_liveClassesError != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(
              'Error Loading Live Classes',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Colors.red[700],
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _loadLiveClasses,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_upcomingClasses.isEmpty && _pastClasses.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.video_call, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No Live Classes',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Live classes will be scheduled soon',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_upcomingClasses.isNotEmpty) ...[
          Text(
            'Upcoming Classes',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ..._upcomingClasses.map((liveClass) => _buildLiveClassCard(liveClass, true)),
          const SizedBox(height: 24),
        ],
        if (_pastClasses.isNotEmpty) ...[
          Text(
            'Past Classes',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ..._pastClasses.map((liveClass) => _buildLiveClassCard(liveClass, false)),
        ],
      ],
    );
  }

  Widget _buildLiveClassCard(LiveClass liveClass, bool isUpcoming) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    final timeFormat = DateFormat('hh:mm a');

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isUpcoming ? Icons.schedule : Icons.history,
                  color: isUpcoming ? Colors.blue : Colors.grey,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    liveClass.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ],
            ),
            if (liveClass.description != null) ...[
              const SizedBox(height: 8),
              Text(
                liveClass.description!,
                style: TextStyle(color: Colors.grey[700]),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Text(
                  dateFormat.format(liveClass.scheduledAt),
                  style: TextStyle(color: Colors.grey[700]),
                ),
                const SizedBox(width: 16),
                Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 8),
                Text(
                  timeFormat.format(liveClass.scheduledAt),
                  style: TextStyle(color: Colors.grey[700]),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (isUpcoming && liveClass.meetingUrl != null)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _launchUrl(liveClass.meetingUrl!),
                  icon: const Icon(Icons.video_call),
                  label: const Text('Join Live Class'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                ),
              )
            else if (!isUpcoming && liveClass.recordingUrl != null)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _launchUrl(liveClass.recordingUrl!),
                  icon: const Icon(Icons.play_circle),
                  label: const Text('Watch Recording'),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewsTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.star_border, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'No Reviews Yet',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              'Be the first to review this module',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[500],
              ),
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              // TODO: Implement add review
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Review feature coming soon')),
              );
            },
            icon: const Icon(Icons.rate_review),
            label: const Text('Write a Review'),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[600],
            ),
          ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  IconData _getLessonIcon(String type) {
    switch (type.toLowerCase()) {
      case 'video':
        return Icons.play_circle_outline;
      case 'reading':
        return Icons.article_outlined;
      case 'quiz':
        return Icons.quiz_outlined;
      case 'assignment':
        return Icons.assignment_outlined;
      default:
        return Icons.play_lesson;
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open: $url')),
        );
      }
    }
  }
}
