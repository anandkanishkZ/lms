import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import '../../models/module.dart';
import '../../models/topic.dart';
import '../../models/review.dart';
import '../../models/resource.dart' as ResourceModel;
import '../../models/featured_video.dart';
import '../../services/topic_service.dart';
import '../../services/lesson_service.dart';
import '../../services/live_class_service.dart';
import '../../services/review_service.dart';
import '../../services/resource_service.dart';
import '../../services/module_service.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/skeleton_loader.dart';
import 'package:intl/intl.dart';
import '../lessons/lesson_detail_screen.dart';
import '../live_classes/youtube_player_screen.dart';
import '../resources/resource_detail_screen.dart';

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
  ReviewService? _reviewService;
  ResourceService? _resourceService;
  ModuleService? _moduleService;

  List<Topic> _topics = [];
  List<LiveClass> _upcomingClasses = [];
  List<LiveClass> _pastClasses = [];
  List<ResourceModel.Resource> _resources = [];
  FeaturedVideo? _featuredVideo;
  bool _isLoadingTopics = false;
  bool _isLoadingLiveClasses = false;
  bool _isLoadingResources = false;
  bool _isLoadingFeaturedVideo = false;
  String? _topicsError;
  String? _liveClassesError;
  String? _resourcesError;

  // Review related state
  ModuleReview? _myReview;
  List<ModuleReview> _allReviews = [];
  RatingStats _ratingStats = RatingStats(
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [],
  );
  bool _isLoadingReviews = false;
  String? _reviewsError;
  int _reviewsPage = 1;
  bool _hasMoreReviews = false;
  bool _showReviewForm = false;
  bool _isEditingReview = false;
  int _selectedRating = 0;
  final TextEditingController _reviewCommentController = TextEditingController();

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
      _reviewService = ReviewService(authProvider.authService);
      _resourceService = ResourceService(authProvider.authService);
      _moduleService = ModuleService();

      _loadTopics();
      _loadLiveClasses();
      _loadReviews();
      _loadResources();
      _loadFeaturedVideo();
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _reviewCommentController.dispose();
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

  Future<void> _loadResources() async {
    if (_resourceService == null) return;
    
    setState(() {
      _isLoadingResources = true;
      _resourcesError = null;
    });

    try {
      print('Loading resources for module: ${widget.module.id}');
      final resources = await _resourceService!.getModuleResources(widget.module.id);
      print('Successfully loaded ${resources.length} resources');
      setState(() {
        _resources = resources;
        _isLoadingResources = false;
      });
    } catch (e) {
      print('Error in _loadResources: $e');
      setState(() {
        _resourcesError = e.toString();
        _isLoadingResources = false;
      });
    }
  }

  // Helper method to determine actual status based on time
  String _getActualStatus(LiveClass liveClass, DateTime now) {
    // Check if completed based on endTime
    if (liveClass.endTime != null && now.isAfter(liveClass.endTime!)) {
      return 'COMPLETED';
    }
    
    // Check if live (between startTime and endTime)
    if (now.isAfter(liveClass.startTime) || now.isAtSameMomentAs(liveClass.startTime)) {
      // If no endTime, consider it live if status is LIVE or SCHEDULED
      if (liveClass.endTime == null) {
        if (liveClass.status == 'LIVE' || liveClass.status == 'SCHEDULED') {
          return 'LIVE';
        }
      } else {
        // If we have endTime, check if current time is before it
        if (now.isBefore(liveClass.endTime!)) {
          return 'LIVE';
        }
      }
    }
    
    // Check if scheduled (before startTime)
    if (now.isBefore(liveClass.startTime)) {
      return 'SCHEDULED';
    }
    
    // Return original status if none of the above conditions match
    return liveClass.status;
  }

  Future<void> _loadFeaturedVideo() async {
    if (_moduleService == null) return;
    
    setState(() {
      _isLoadingFeaturedVideo = true;
    });

    try {
      final featuredVideo = await _moduleService!.getModuleFeaturedVideo(widget.module.id);
      setState(() {
        _featuredVideo = featuredVideo;
        _isLoadingFeaturedVideo = false;
      });
    } catch (e) {
      print('Error loading featured video: $e');
      setState(() {
        _featuredVideo = null;
        _isLoadingFeaturedVideo = false;
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
        // Use time-based detection to determine actual status
        final actualStatus = _getActualStatus(liveClass, now);
        
        if (actualStatus == 'LIVE') {
          // Live classes go to upcoming (they're happening now)
          upcoming.add(liveClass);
        } else if (actualStatus == 'SCHEDULED') {
          // Scheduled classes go to upcoming
          upcoming.add(liveClass);
        } else if (actualStatus == 'COMPLETED' || liveClass.status == 'CANCELLED') {
          // Completed or cancelled go to past
          past.add(liveClass);
        } else {
          // Fallback to time-based classification
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

  Future<void> _loadReviews() async {
    if (_reviewService == null) return;
    
    setState(() {
      _isLoadingReviews = true;
      _reviewsError = null;
    });

    try {
      // Load all review data concurrently
      final results = await Future.wait([
        _reviewService!.getRatingStats(widget.module.id),
        _reviewService!.getModuleReviews(widget.module.id, page: _reviewsPage),
        _reviewService!.getMyReview(widget.module.id),
      ]);

      final stats = results[0] as RatingStats;
      final reviewsResponse = results[1] as ReviewsResponse;
      final myReview = results[2] as ModuleReview?;

      setState(() {
        _ratingStats = stats;
        _allReviews = reviewsResponse.reviews;
        _hasMoreReviews = reviewsResponse.pagination.hasNextPage;
        _myReview = myReview;
        
        // Set form data if user has existing review
        if (_myReview != null) {
          _selectedRating = _myReview!.rating;
          _reviewCommentController.text = _myReview!.comment ?? '';
        }
        
        _isLoadingReviews = false;
      });
      
      print('Loaded ${_allReviews.length} reviews. Average rating: ${_ratingStats.averageRating}');
    } catch (e) {
      print('Error loading reviews: $e');
      setState(() {
        _reviewsError = e.toString();
        _isLoadingReviews = false;
      });
    }
  }

  Future<void> _submitReview() async {
    if (_reviewService == null) return;
    
    if (_selectedRating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a rating')),
      );
      return;
    }

    try {
      final review = await _reviewService!.submitReview(
        widget.module.id,
        _selectedRating,
        _reviewCommentController.text.trim().isEmpty 
            ? null 
            : _reviewCommentController.text.trim(),
      );

      setState(() {
        _myReview = review;
        _showReviewForm = false;
        _isEditingReview = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isEditingReview 
              ? 'Review updated successfully' 
              : 'Review submitted successfully'),
        ),
      );

      // Reload reviews to get updated stats
      _loadReviews();
    } catch (e) {
      print('Error submitting review: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit review: ${e.toString()}')),
      );
    }
  }

  Future<void> _deleteReview() async {
    if (_reviewService == null || _myReview == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Review'),
        content: const Text('Are you sure you want to delete your review?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await _reviewService!.deleteReview(widget.module.id);
      
      setState(() {
        _myReview = null;
        _selectedRating = 0;
        _reviewCommentController.clear();
        _isEditingReview = false;
        _showReviewForm = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Review deleted successfully')),
      );

      // Reload reviews to get updated stats
      _loadReviews();
    } catch (e) {
      print('Error deleting review: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to delete review: ${e.toString()}')),
      );
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
          // Featured Video Section - Only show if video URL exists and type is not 'none'
          if (_isLoadingFeaturedVideo)
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: Colors.black,
              ),
              height: 200,
              child: const Center(
                child: CircularProgressIndicator(color: Colors.white),
              ),
            )
          else if (_featuredVideo != null && 
                   _featuredVideo!.videoUrl != null && 
                   _featuredVideo!.type != 'none') ...[
            Text(
              _featuredVideo!.isLive ? '🔴 Live Now' : 'Featured Video',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: _featuredVideo!.isLive ? Colors.red : null,
              ),
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: () {
                _playYouTubeVideo(_featuredVideo!.videoUrl!, _featuredVideo!.title);
              },
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
                      if (_extractYouTubeVideoId(_featuredVideo!.videoUrl!) != null)
                        Image.network(
                          'https://img.youtube.com/vi/${_extractYouTubeVideoId(_featuredVideo!.videoUrl!)}/maxresdefault.jpg',
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
                        decoration: const BoxDecoration(
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
            const SizedBox(height: 8),
            Text(
              _featuredVideo!.title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            if (_featuredVideo!.description.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                _featuredVideo!.description,
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
                        valueColor: AlwaysStoppedAnimation<Color>(Theme.of(context).colorScheme.primary),
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
    if (_isLoadingResources) {
      return SkeletonListItems();
    }

    if (_resourcesError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
              const SizedBox(height: 16),
              Text(
                'Error loading resources',
                style: TextStyle(
                  color: Colors.red[700],
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red[200]!),
                ),
                child: Text(
                  _resourcesError!,
                  style: TextStyle(
                    color: Colors.red[900],
                    fontSize: 12,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _loadResources,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_resources.isEmpty) {
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

    return RefreshIndicator(
      onRefresh: _loadResources,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _resources.length,
        itemBuilder: (context, index) {
          final resource = _resources[index];
          return _buildResourceCard(resource);
        },
      ),
    );
  }

  Widget _buildResourceCard(ResourceModel.Resource resource) {
    IconData icon;
    Color iconColor;

    switch (resource.type.toUpperCase()) {
      case 'VIDEO':
        icon = Icons.play_circle_filled;
        iconColor = Colors.red;
        break;
      case 'LINK':
        icon = Icons.link;
        iconColor = Theme.of(context).colorScheme.primary;
        break;
      case 'DOCUMENT':
      case 'FILE':
        if (resource.fileType?.toLowerCase().contains('pdf') == true) {
          icon = Icons.picture_as_pdf;
          iconColor = Colors.red[700]!;
        } else if (resource.fileType?.toLowerCase().contains('doc') == true) {
          icon = Icons.description;
          iconColor = Theme.of(context).colorScheme.primary;
        } else if (resource.fileType?.toLowerCase().contains('xls') == true ||
                   resource.fileType?.toLowerCase().contains('sheet') == true) {
          icon = Icons.table_chart;
          iconColor = Colors.green[700]!;
        } else if (resource.fileType?.toLowerCase().contains('ppt') == true ||
                   resource.fileType?.toLowerCase().contains('slide') == true) {
          icon = Icons.slideshow;
          iconColor = Colors.orange[700]!;
        } else if (resource.fileType?.toLowerCase().contains('image') == true ||
                   resource.fileType?.toLowerCase().contains('jpg') == true ||
                   resource.fileType?.toLowerCase().contains('png') == true) {
          icon = Icons.image;
          iconColor = Colors.purple[700]!;
        } else if (resource.fileType?.toLowerCase().contains('zip') == true ||
                   resource.fileType?.toLowerCase().contains('rar') == true) {
          icon = Icons.folder_zip;
          iconColor = Colors.amber[700]!;
        } else {
          icon = Icons.insert_drive_file;
          iconColor = Colors.grey[700]!;
        }
        break;
      default:
        icon = Icons.insert_drive_file;
        iconColor = Colors.grey[700]!;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () => _handleResourceTap(resource),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: iconColor, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      resource.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (resource.description != null && resource.description!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        resource.description!,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[600],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        if (resource.fileType != null) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: iconColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              resource.fileType!.toUpperCase(),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: iconColor,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        if (resource.formattedFileSize.isNotEmpty) ...[
                          Icon(Icons.file_present, size: 14, color: Colors.grey[500]),
                          const SizedBox(width: 4),
                          Text(
                            resource.formattedFileSize,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                        if (resource.accessCount != null && resource.accessCount! > 0) ...[
                          const SizedBox(width: 12),
                          Icon(Icons.visibility, size: 14, color: Colors.grey[500]),
                          const SizedBox(width: 4),
                          Text(
                            '${resource.accessCount}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(Icons.chevron_right, color: Colors.grey[400]),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleResourceTap(ResourceModel.Resource resource) async {
    // Navigate to resource detail screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ResourceDetailScreen(resource: resource),
      ),
    );
  }

  Widget _buildTopicsLessonsTab() {
    if (_isLoadingTopics) {
      return SkeletonListItems();
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
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${topic.lessonsCount} lessons',
                          style: TextStyle(
                            fontSize: 12,
                            color: Theme.of(context).colorScheme.primary,
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
                                enrollmentId: widget.module.enrollmentId,
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
      return SkeletonLiveClassList();
    }

    if (_liveClassesError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
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
              const SizedBox(height: 8),
              Text(
                _liveClassesError!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
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
    
    // Determine actual status based on time
    final now = DateTime.now();
    final actualStatus = _getActualStatus(liveClass, now);
    
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
                      color: actualStatus == 'LIVE' 
                        ? Colors.red 
                        : actualStatus == 'SCHEDULED'
                          ? Theme.of(context).colorScheme.primary
                          : Colors.grey,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (actualStatus == 'LIVE')
                          Container(
                            width: 8,
                            height: 8,
                            margin: const EdgeInsets.only(right: 4),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                          ),
                        Text(
                          actualStatus == 'LIVE' ? 'Live Now' : actualStatus,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned.fill(
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () {
                        if (liveClass.youtubeUrl != null) {
                          _playYouTubeVideo(liveClass.youtubeUrl!, liveClass.title);
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
                      color: isUpcoming ? Theme.of(context).colorScheme.primary : Colors.grey,
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
                          onPressed: () => _playYouTubeVideo(liveClass.youtubeUrl!, liveClass.title),
                          icon: const Icon(Icons.video_library),
                          label: Text(actualStatus == 'LIVE' ? 'Watch Live' : 'YouTube'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: actualStatus == 'LIVE' ? Colors.red : Theme.of(context).colorScheme.primary,
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
    if (_isLoadingReviews) {
      return SkeletonListItems(itemCount: 3);
    }

    if (_reviewsError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
              const SizedBox(height: 16),
              Text(
                'Error Loading Reviews',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.red[700],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _reviewsError!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _loadReviews,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Rating Overview
          _buildRatingOverview(),
          
          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 24),
          
          // My Review Section
          _buildMyReviewSection(),
          
          const SizedBox(height: 24),
          
          // All Reviews
          if (_allReviews.isNotEmpty) ...[
            const Divider(),
            const SizedBox(height: 24),
            Text(
              'Recent Reviews',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildReviewsList(),
          ] else if (_ratingStats.totalReviews == 0 && _myReview == null) ...[
            Center(
              child: Column(
                children: [
                  Icon(Icons.rate_review, size: 48, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    'No reviews yet',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Be the first to review this module!',
                    style: TextStyle(color: Colors.grey[500], fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRatingOverview() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          Text(
            'Module Ratings & Reviews',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              // Average Rating
              Expanded(
                child: Column(
                  children: [
                    Text(
                      _ratingStats.averageRating.toStringAsFixed(1),
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    _buildStarRating(_ratingStats.averageRating, size: 24),
                    const SizedBox(height: 8),
                    Text(
                      'Based on ${_ratingStats.totalReviews} review${_ratingStats.totalReviews != 1 ? 's' : ''}',
                      style: TextStyle(color: Colors.grey[600], fontSize: 12),
                    ),
                  ],
                ),
              ),
              
              // Rating Distribution
              Expanded(
                child: Column(
                  children: [5, 4, 3, 2, 1].map((rating) {
                    final count = _ratingStats.ratingDistribution
                        .firstWhere(
                          (r) => r.rating == rating,
                          orElse: () => RatingDistribution(rating: rating, count: 0),
                        )
                        .count;
                    final percentage = _ratingStats.totalReviews > 0
                        ? (count / _ratingStats.totalReviews) * 100
                        : 0.0;
                    
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          Text('$rating', style: const TextStyle(fontSize: 12)),
                          const SizedBox(width: 4),
                          const Icon(Icons.star, size: 12, color: Colors.amber),
                          const SizedBox(width: 8),
                          Expanded(
                            child: LinearProgressIndicator(
                              value: percentage / 100,
                              backgroundColor: Colors.grey[200],
                              valueColor: const AlwaysStoppedAnimation<Color>(Colors.amber),
                            ),
                          ),
                          const SizedBox(width: 8),
                          SizedBox(
                            width: 24,
                            child: Text(
                              '$count',
                              style: const TextStyle(fontSize: 12),
                              textAlign: TextAlign.end,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMyReviewSection() {
    if (_myReview != null && !_isEditingReview) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Your Review',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: () {
                        setState(() {
                          _isEditingReview = true;
                          _selectedRating = _myReview!.rating;
                          _reviewCommentController.text = _myReview!.comment ?? '';
                        });
                      },
                      icon: const Icon(Icons.edit, size: 20),
                      tooltip: 'Edit',
                    ),
                    IconButton(
                      onPressed: _deleteReview,
                      icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                      tooltip: 'Delete',
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
            _buildStarRating(_myReview!.rating.toDouble()),
            if (_myReview!.comment != null && _myReview!.comment!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                _myReview!.comment!,
                style: const TextStyle(fontSize: 14),
              ),
            ],
            const SizedBox(height: 8),
            Text(
              'Reviewed on ${DateFormat('MMM dd, yyyy').format(_myReview!.createdAt)}',
              style: TextStyle(fontSize: 11, color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    if (_showReviewForm || _isEditingReview) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _isEditingReview ? 'Edit Your Review' : 'Write a Review',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            
            // Rating Selection
            const Text('Rating *', style: TextStyle(fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            _buildInteractiveStarRating(),
            
            const SizedBox(height: 16),
            
            // Comment
            const Text('Comment (optional)', style: TextStyle(fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            TextField(
              controller: _reviewCommentController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Share your thoughts about this module...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.white,
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Buttons
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: _submitReview,
                  icon: const Icon(Icons.send, size: 18),
                  label: Text(_isEditingReview ? 'Update Review' : 'Submit Review'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                ),
                const SizedBox(width: 12),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _showReviewForm = false;
                      _isEditingReview = false;
                      if (_myReview != null) {
                        _selectedRating = _myReview!.rating;
                        _reviewCommentController.text = _myReview!.comment ?? '';
                      } else {
                        _selectedRating = 0;
                        _reviewCommentController.clear();
                      }
                    });
                  },
                  child: const Text('Cancel'),
                ),
              ],
            ),
          ],
        ),
      );
    }

    // Show "Write a Review" button if user hasn't reviewed yet
    return ElevatedButton.icon(
      onPressed: () {
        setState(() {
          _showReviewForm = true;
          _selectedRating = 0;
          _reviewCommentController.clear();
        });
      },
      icon: const Icon(Icons.rate_review),
      label: const Text('Write a Review'),
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    );
  }

  Widget _buildReviewsList() {
    return Column(
      children: [
        ..._allReviews.map((review) => _buildReviewCard(review)),
        
        if (_hasMoreReviews) ...[
          const SizedBox(height: 16),
          Center(
            child: TextButton(
              onPressed: () async {
                setState(() => _reviewsPage++);
                try {
                  final response = await _reviewService!.getModuleReviews(
                    widget.module.id, 
                    page: _reviewsPage,
                  );
                  setState(() {
                    _allReviews.addAll(response.reviews);
                    _hasMoreReviews = response.pagination.hasNextPage;
                  });
                } catch (e) {
                  setState(() => _reviewsPage--);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to load more reviews: $e')),
                  );
                }
              },
              child: const Text('Load More Reviews'),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildReviewCard(ModuleReview review) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: Colors.grey[300],
                child: Text(
                  review.student?.name.substring(0, 1).toUpperCase() ?? '?',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      review.student?.name ?? 'Anonymous',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      DateFormat('MMM dd, yyyy').format(review.createdAt),
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              _buildStarRating(review.rating.toDouble(), size: 16),
            ],
          ),
          
          if (review.comment != null && review.comment!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              review.comment!,
              style: const TextStyle(fontSize: 14),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStarRating(double rating, {double size = 20}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        return Icon(
          index < rating ? Icons.star : Icons.star_border,
          color: Colors.amber,
          size: size,
        );
      }),
    );
  }

  Widget _buildInteractiveStarRating() {
    return Row(
      children: List.generate(5, (index) {
        final starValue = index + 1;
        return GestureDetector(
          onTap: () {
            setState(() {
              _selectedRating = starValue;
            });
          },
          child: Icon(
            starValue <= _selectedRating ? Icons.star : Icons.star_border,
            color: starValue <= _selectedRating ? Colors.amber : Colors.grey,
            size: 32,
          ),
        );
      }),
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

  void _playYouTubeVideo(String youtubeUrl, String title) {
    final videoId = YoutubePlayer.convertUrlToId(youtubeUrl);
    if (videoId != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => YouTubePlayerScreen(
            videoId: videoId,
            title: title,
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid YouTube URL')),
      );
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
