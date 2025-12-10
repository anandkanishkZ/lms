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
import '../lessons/lesson_detail_screen.dart';

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
      print('Loaded ${allClasses.length} live classes for module ${widget.module.id}');
      
      if (allClasses.isNotEmpty) {
        print('First class: ${allClasses[0].title}, Status: ${allClasses[0].status}, Time: ${allClasses[0].startTime}');
      }
      
      final now = DateTime.now();
      final upcoming = <LiveClass>[];
      final past = <LiveClass>[];
      
      for (var liveClass in allClasses) {
        // Prioritize status-based classification
        if (liveClass.status == 'SCHEDULED' || liveClass.status == 'LIVE') {
          // SCHEDULED or LIVE classes always go to upcoming
          upcoming.add(liveClass);
        } else if (liveClass.status == 'COMPLETED' || liveClass.status == 'CANCELLED') {
          // COMPLETED or CANCELLED always go to past
          past.add(liveClass);
        } else {
          // For unknown statuses, use time-based classification
          if (liveClass.startTime.isAfter(now)) {
            upcoming.add(liveClass);
          } else {
            past.add(liveClass);
          }
        }
      }
      
      // Sort upcoming: latest (soonest) first
      upcoming.sort((a, b) => a.startTime.compareTo(b.startTime));
      
      // Sort past: latest (most recent) first
      past.sort((a, b) => b.startTime.compareTo(a.startTime));
      
      setState(() {
        _upcomingClasses = upcoming;
        _pastClasses = past;
        _isLoadingLiveClasses = false;
      });
      
      print('Upcoming: ${_upcomingClasses.length}, Past: ${_pastClasses.length}');
    } catch (e) {
      print('Error loading live classes: $e');
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
          // Featured Video Section
          if (widget.module.featuredVideoUrl != null) ...[
            Text(
              'Featured Video',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: () => _launchUrl(widget.module.featuredVideoUrl!),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.black,
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // YouTube thumbnail
                      if (_extractYouTubeVideoId(widget.module.featuredVideoUrl!) != null)
                        Image.network(
                          'https://img.youtube.com/vi/${_extractYouTubeVideoId(widget.module.featuredVideoUrl!)}/maxresdefault.jpg',
                          height: 200,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            height: 200,
                            color: Colors.grey[300],
                            child: const Icon(Icons.videocam, size: 64, color: Colors.grey),
                          ),
                        )
                      else
                        Container(
                          height: 200,
                          color: Colors.grey[800],
                          child: const Icon(Icons.play_circle_outline, size: 80, color: Colors.white),
                        ),
                      // Play button overlay
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.play_arrow,
                          color: Colors.white,
                          size: 40,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            if (widget.module.featuredVideoTitle != null) ...[
              const SizedBox(height: 8),
              Text(
                widget.module.featuredVideoTitle!,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
            if (widget.module.featuredVideoDescription != null) ...[
              const SizedBox(height: 4),
              Text(
                widget.module.featuredVideoDescription!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
            const SizedBox(height: 24),
          ],
          
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
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => LessonDetailScreen(
                                lessonId: lesson.id,
                                moduleId: widget.module.id,
                              ),
                            ),
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
    
    // Get YouTube thumbnail if available
    String? thumbnailUrl;
    if (liveClass.youtubeUrl != null) {
      final videoId = _extractYouTubeVideoId(liveClass.youtubeUrl!);
      if (videoId != null) {
        thumbnailUrl = 'https://img.youtube.com/vi/$videoId/maxresdefault.jpg';
      }
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // YouTube Thumbnail
          if (thumbnailUrl != null)
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Image.network(
                    thumbnailUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: Colors.grey[300],
                      child: const Icon(Icons.videocam, size: 48, color: Colors.grey),
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: liveClass.status == 'LIVE' 
                        ? Colors.red 
                        : liveClass.status == 'SCHEDULED'
                          ? Colors.blue
                          : Colors.grey,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      liveClass.status,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                Positioned.fill(
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () {
                        if (liveClass.youtubeUrl != null) {
                          _launchUrl(liveClass.youtubeUrl!);
                        }
                      },
                      child: const Center(
                        child: Icon(
                          Icons.play_circle_outline,
                          size: 64,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          
          Padding(
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
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Text(
                      dateFormat.format(liveClass.startTime),
                      style: TextStyle(color: Colors.grey[700]),
                    ),
                    const SizedBox(width: 16),
                    Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Text(
                      timeFormat.format(liveClass.startTime),
                      style: TextStyle(color: Colors.grey[700]),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    if (liveClass.youtubeUrl != null)
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _launchUrl(liveClass.youtubeUrl!),
                          icon: const Icon(Icons.video_library),
                          label: Text(liveClass.status == 'LIVE' ? 'Watch Live' : 'YouTube'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: liveClass.status == 'LIVE' ? Colors.red : Colors.blue,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ),
                    if (liveClass.youtubeUrl != null && liveClass.meetingLink != null)
                      const SizedBox(width: 8),
                    if (liveClass.meetingLink != null)
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _launchUrl(liveClass.meetingLink!),
                          icon: const Icon(Icons.video_call),
                          label: const Text('Join'),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
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

  String? _extractYouTubeVideoId(String url) {
    try {
      final uri = Uri.parse(url);
      
      // Handle different YouTube URL formats
      if (uri.host.contains('youtube.com')) {
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        return uri.queryParameters['v'];
      } else if (uri.host.contains('youtu.be')) {
        // Format: https://youtu.be/VIDEO_ID
        return uri.pathSegments.isNotEmpty ? uri.pathSegments[0] : null;
      }
      
      return null;
    } catch (e) {
      print('Error extracting YouTube video ID: $e');
      return null;
    }
  }
}
