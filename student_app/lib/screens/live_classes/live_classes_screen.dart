import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/topic.dart';
import '../../services/live_class_service.dart';
import '../../services/notification_service.dart';
import '../../providers/auth_provider.dart';
import 'youtube_player_screen.dart';

class LiveClassesScreen extends StatefulWidget {
  const LiveClassesScreen({super.key});

  @override
  State<LiveClassesScreen> createState() => _LiveClassesScreenState();
}

class _LiveClassesScreenState extends State<LiveClassesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  LiveClassService? _liveClassService;
  
  List<LiveClass> _currentClasses = [];
  List<LiveClass> _upcomingClasses = [];
  List<LiveClass> _pastClasses = [];
  
  bool _isLoadingCurrent = false;
  bool _isLoadingUpcoming = false;
  bool _isLoadingPast = false;
  
  String? _currentError;
  String? _upcomingError;
  String? _pastError;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        // Load data when switching tabs
        switch (_tabController.index) {
          case 0:
            if (_currentClasses.isEmpty && !_isLoadingCurrent) _loadCurrentClasses();
            break;
          case 1:
            if (_upcomingClasses.isEmpty && !_isLoadingUpcoming) _loadUpcomingClasses();
            break;
          case 2:
            if (_pastClasses.isEmpty && !_isLoadingPast) _loadPastClasses();
            break;
        }
      }
    });
    
    // Request notification permissions on first load
    _requestNotificationPermissions();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    if (_liveClassService == null) {
      final authProvider = context.read<AuthProvider>();
      _liveClassService = LiveClassService(authProvider.authService);
      _loadAllClasses();
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Load all classes and filter client-side based on time (same as module detail screen)
  Future<void> _loadAllClasses() async {
    if (_liveClassService == null) return;
    
    setState(() {
      _isLoadingCurrent = true;
      _isLoadingUpcoming = true;
      _isLoadingPast = true;
      _currentError = null;
      _upcomingError = null;
      _pastError = null;
    });

    try {
      final allClasses = await _liveClassService!.getAllLiveClasses();
      print('Loaded ${allClasses.length} total live classes');
      
      if (allClasses.isNotEmpty) {
        print('First class: ${allClasses[0].title}, Status: ${allClasses[0].status}, Time: ${allClasses[0].startTime}');
      }
      
      final now = DateTime.now();
      final current = <LiveClass>[];
      final upcoming = <LiveClass>[];
      final past = <LiveClass>[];
      
      for (var liveClass in allClasses) {
        // Use time-based detection to determine actual status
        final actualStatus = _getActualStatus(liveClass, now);
        
        if (actualStatus == 'LIVE') {
          current.add(liveClass);
        } else if (actualStatus == 'SCHEDULED') {
          upcoming.add(liveClass);
        } else if (actualStatus == 'COMPLETED' || liveClass.status == 'CANCELLED') {
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
      
      // Sort upcoming: soonest first
      upcoming.sort((a, b) => a.startTime.compareTo(b.startTime));
      
      // Sort past: most recent first
      past.sort((a, b) => b.startTime.compareTo(a.startTime));
      
      // Sort current: soonest first
      current.sort((a, b) => a.startTime.compareTo(b.startTime));
      
      if (mounted) {
        setState(() {
          _currentClasses = current;
          _upcomingClasses = upcoming;
          _pastClasses = past;
          _isLoadingCurrent = false;
          _isLoadingUpcoming = false;
          _isLoadingPast = false;
        });
        
        print('Current: ${_currentClasses.length}, Upcoming: ${_upcomingClasses.length}, Past: ${_pastClasses.length}');
        
        // Schedule notifications for upcoming classes
        _scheduleNotifications(upcoming);
      }
    } catch (e) {
      print('Error loading live classes: $e');
      if (mounted) {
        final errorMsg = e.toString().replaceAll('Exception: ', '');
        setState(() {
          _currentError = errorMsg;
          _upcomingError = errorMsg;
          _pastError = errorMsg;
          _isLoadingCurrent = false;
          _isLoadingUpcoming = false;
          _isLoadingPast = false;
        });
      }
    }
  }

  String _getActualStatus(LiveClass liveClass, DateTime now) {
    // If status is CANCELLED, keep it
    if (liveClass.status == 'CANCELLED') return 'CANCELLED';
    
    // Check if class is currently live (within start and end time)
    final endTime = liveClass.endTime;
    if (endTime != null) {
      if (now.isAfter(liveClass.startTime) && now.isBefore(endTime)) {
        return 'LIVE';
      }
      if (now.isAfter(endTime)) {
        return 'COMPLETED';
      }
    } else {
      // No end time - assume 1 hour duration
      final estimatedEnd = liveClass.startTime.add(const Duration(hours: 1));
      if (now.isAfter(liveClass.startTime) && now.isBefore(estimatedEnd)) {
        return 'LIVE';
      }
      if (now.isAfter(estimatedEnd)) {
        return 'COMPLETED';
      }
    }
    
    // Future class
    if (now.isBefore(liveClass.startTime)) {
      return 'SCHEDULED';
    }
    
    // Default to database status
    return liveClass.status;
  }

  Future<void> _loadCurrentClasses() async {
    // No longer used - refresh all data instead
    await _loadAllClasses();
  }

  Future<void> _loadUpcomingClasses() async {
    // No longer used - refresh all data instead
    await _loadAllClasses();
  }

  Future<void> _loadPastClasses() async {
    // No longer used - refresh all data instead
    await _loadAllClasses();
  }

  // Request notification permissions
  Future<void> _requestNotificationPermissions() async {
    final notificationService = NotificationService();
    await notificationService.requestPermissions();
  }

  // Schedule notifications for upcoming classes
  Future<void> _scheduleNotifications(List<LiveClass> classes) async {
    final notificationService = NotificationService();
    await notificationService.scheduleLiveClassNotifications(classes);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Classes'),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(
              icon: Icon(Icons.live_tv),
              text: 'Live Now',
            ),
            Tab(
              icon: Icon(Icons.schedule),
              text: 'Upcoming',
            ),
            Tab(
              icon: Icon(Icons.history),
              text: 'Past Classes',
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCurrentClassesTab(),
          _buildUpcomingClassesTab(),
          _buildPastClassesTab(),
        ],
      ),
    );
  }

  Widget _buildCurrentClassesTab() {
    if (_isLoadingCurrent) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_currentError != null) {
      return _buildErrorWidget(_currentError!, _loadCurrentClasses);
    }

    if (_currentClasses.isEmpty) {
      return _buildEmptyState(
        icon: Icons.live_tv_outlined,
        title: 'No Live Classes',
        subtitle: 'There are no live classes at the moment',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadCurrentClasses,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _currentClasses.length,
        itemBuilder: (context, index) {
          return _buildLiveClassCard(_currentClasses[index], isLive: true);
        },
      ),
    );
  }

  Widget _buildUpcomingClassesTab() {
    if (_isLoadingUpcoming) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_upcomingError != null) {
      return _buildErrorWidget(_upcomingError!, _loadUpcomingClasses);
    }

    if (_upcomingClasses.isEmpty) {
      return _buildEmptyState(
        icon: Icons.schedule_outlined,
        title: 'No Upcoming Classes',
        subtitle: 'Check back later for scheduled live classes',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadUpcomingClasses,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _upcomingClasses.length,
        itemBuilder: (context, index) {
          return _buildLiveClassCard(_upcomingClasses[index]);
        },
      ),
    );
  }

  Widget _buildPastClassesTab() {
    if (_isLoadingPast) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_pastError != null) {
      return _buildErrorWidget(_pastError!, _loadPastClasses);
    }

    if (_pastClasses.isEmpty) {
      return _buildEmptyState(
        icon: Icons.history_outlined,
        title: 'No Past Classes',
        subtitle: 'Completed classes will appear here',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadPastClasses,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _pastClasses.length,
        itemBuilder: (context, index) {
          return _buildLiveClassCard(_pastClasses[index]);
        },
      ),
    );
  }

  Widget _buildLiveClassCard(LiveClass liveClass, {bool isLive = false}) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    final timeFormat = DateFormat('hh:mm a');
    
    // Extract YouTube video ID
    String? videoId;
    if (liveClass.youtubeUrl != null) {
      videoId = _extractYouTubeVideoId(liveClass.youtubeUrl!);
    }
    
    final thumbnailUrl = videoId != null
        ? 'https://img.youtube.com/vi/$videoId/maxresdefault.jpg'
        : null;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Thumbnail with live badge
          Stack(
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: thumbnailUrl != null
                    ? Image.network(
                        thumbnailUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          color: Colors.grey[300],
                          child: const Icon(Icons.videocam, size: 48, color: Colors.grey),
                        ),
                      )
                    : Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Theme.of(context).primaryColor.withOpacity(0.8),
                              Theme.of(context).primaryColor,
                            ],
                          ),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.videocam,
                            size: 64,
                            color: Colors.white70,
                          ),
                        ),
                      ),
              ),
              if (isLive)
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withOpacity(0.5),
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.only(right: 6),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const Text(
                          'LIVE',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
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
                    onTap: videoId != null
                        ? () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => YouTubePlayerScreen(
                                  videoId: videoId!,
                                  title: liveClass.title,
                                  isLive: isLive,
                                ),
                              ),
                            );
                          }
                        : null,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.play_arrow_rounded,
                          size: 48,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          
          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  liveClass.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 8),
                // Subject, Class, Teacher info
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  children: [
                    if (liveClass.subjectName != null)
                      _buildInfoChip(
                        icon: Icons.subject,
                        label: liveClass.subjectName!,
                        color: Colors.blue,
                      ),
                    if (liveClass.className != null)
                      _buildInfoChip(
                        icon: Icons.class_,
                        label: liveClass.className!,
                        color: Colors.green,
                      ),
                    if (liveClass.teacherName != null)
                      _buildInfoChip(
                        icon: Icons.person,
                        label: liveClass.teacherName!,
                        color: Colors.orange,
                      ),
                  ],
                ),
                if (liveClass.moduleName != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.book,
                          size: 14,
                          color: Theme.of(context).primaryColor,
                        ),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            liveClass.moduleName!,
                            style: TextStyle(
                              color: Theme.of(context).primaryColor,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                if (liveClass.description != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    liveClass.description!,
                    style: TextStyle(
                      color: Colors.grey[700],
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 16),
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      size: 16,
                      color: Theme.of(context).primaryColor,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      dateFormat.format(liveClass.startTime),
                      style: const TextStyle(fontSize: 14),
                    ),
                    const SizedBox(width: 16),
                    Icon(
                      Icons.access_time,
                      size: 16,
                      color: Theme.of(context).primaryColor,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      timeFormat.format(liveClass.startTime),
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Action buttons
                Row(
                  children: [
                    if (videoId != null)
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => YouTubePlayerScreen(
                                  videoId: videoId!,
                                  title: liveClass.title,
                                  isLive: isLive,
                                ),
                              ),
                            );
                          },
                          icon: Icon(isLive ? Icons.live_tv : Icons.play_circle_filled),
                          label: Text(isLive ? 'Watch Live' : 'Watch Recording'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isLive ? Colors.red : Theme.of(context).primaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    if (videoId != null && liveClass.meetingLink != null)
                      const SizedBox(width: 8),
                    if (liveClass.meetingLink != null)
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            final Uri url = Uri.parse(liveClass.meetingLink!);
                            if (await canLaunchUrl(url)) {
                              await launchUrl(url, mode: LaunchMode.externalApplication);
                            }
                          },
                          icon: const Icon(Icons.meeting_room),
                          label: const Text('Join Meeting'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
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

  Widget _buildInfoChip({
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorWidget(String error, VoidCallback onRetry) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(
              'Oops! Something went wrong',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 24),
          Text(
            title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 48),
            child: Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[500],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String? _extractYouTubeVideoId(String url) {
    final regExp = RegExp(
      r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})',
      caseSensitive: false,
    );
    final match = regExp.firstMatch(url);
    return match?.group(1);
  }
}
