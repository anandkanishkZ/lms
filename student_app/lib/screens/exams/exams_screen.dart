import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/exam_provider.dart';
import '../../models/exam.dart';
import '../../widgets/skeleton_loader.dart';
import 'exam_preview_screen.dart';
import 'take_exam_screen.dart';
import 'exam_result_screen.dart';
import 'dart:async';

class ExamsScreen extends StatefulWidget {
  const ExamsScreen({super.key});

  @override
  State<ExamsScreen> createState() => _ExamsScreenState();
}

enum ExamTab { active, upcoming, completed }

class _ExamsScreenState extends State<ExamsScreen> {
  ExamTab _selectedTab = ExamTab.active;
  String _searchQuery = '';
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ExamProvider>(context, listen: false).loadExams();
    });
    
    // Auto-refresh every minute to update timers
    _refreshTimer = Timer.periodic(const Duration(minutes: 1), (timer) {
      if (mounted) {
        Provider.of<ExamProvider>(context, listen: false).loadExams();
      }
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ExamProvider>(context);
    
    // Categorize exams by status
    final categorizedExams = _categorizeExams(provider.exams);
    final filteredExams = _filterExams(categorizedExams);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Exams'),
        elevation: 0,
      ),
      body: provider.isLoading
          ? SkeletonExamList()
          : provider.error != null
              ? _buildErrorState(provider)
              : Column(
                  children: [
                    _buildStatsCards(categorizedExams),
                    _buildTabBar(categorizedExams),
                    _buildSearchBar(),
                    Expanded(
                      child: filteredExams.isEmpty
                          ? _buildEmptyState()
                          : _buildExamsList(filteredExams),
                    ),
                  ],
                ),
    );
  }

  Map<ExamTab, List<Exam>> _categorizeExams(List<Exam> exams) {
    final now = DateTime.now();
    final Map<ExamTab, List<Exam>> categorized = {
      ExamTab.active: [],
      ExamTab.upcoming: [],
      ExamTab.completed: [],
    };

    for (final exam in exams) {
      if (exam.status.toLowerCase() == 'cancelled') continue;

      if (exam.startTime != null && exam.endTime != null) {
        if (now.isBefore(exam.startTime!)) {
          categorized[ExamTab.upcoming]!.add(exam);
        } else if (now.isAfter(exam.endTime!)) {
          categorized[ExamTab.completed]!.add(exam);
        } else {
          categorized[ExamTab.active]!.add(exam);
        }
      } else {
        // Fallback to status field if dates not available
        if (exam.status.toLowerCase() == 'upcoming') {
          categorized[ExamTab.upcoming]!.add(exam);
        } else if (exam.status.toLowerCase() == 'completed') {
          categorized[ExamTab.completed]!.add(exam);
        } else {
          categorized[ExamTab.active]!.add(exam);
        }
      }
    }

    return categorized;
  }

  List<Exam> _filterExams(Map<ExamTab, List<Exam>> categorized) {
    final exams = categorized[_selectedTab] ?? [];
    if (_searchQuery.isEmpty) return exams;

    return exams.where((exam) {
      final titleMatch = exam.title.toLowerCase().contains(_searchQuery.toLowerCase());
      final descMatch = exam.description?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false;
      return titleMatch || descMatch;
    }).toList();
  }

  Widget _buildStatsCards(Map<ExamTab, List<Exam>> categorized) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.grey[50],
      child: Row(
        children: [
          Expanded(
            child: _StatCard(
              title: 'Upcoming',
              count: categorized[ExamTab.upcoming]!.length,
              icon: Icons.calendar_today,
              color: Colors.blue,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              title: 'Active',
              count: categorized[ExamTab.active]!.length,
              icon: Icons.timer,
              color: Colors.green,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              title: 'Completed',
              count: categorized[ExamTab.completed]!.length,
              icon: Icons.check_circle,
              color: Colors.purple,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar(Map<ExamTab, List<Exam>> categorized) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          _TabButton(
            label: 'Active',
            count: categorized[ExamTab.active]!.length,
            isSelected: _selectedTab == ExamTab.active,
            onTap: () => setState(() => _selectedTab = ExamTab.active),
          ),
          const SizedBox(width: 8),
          _TabButton(
            label: 'Upcoming',
            count: categorized[ExamTab.upcoming]!.length,
            isSelected: _selectedTab == ExamTab.upcoming,
            onTap: () => setState(() => _selectedTab = ExamTab.upcoming),
          ),
          const SizedBox(width: 8),
          _TabButton(
            label: 'Completed',
            count: categorized[ExamTab.completed]!.length,
            isSelected: _selectedTab == ExamTab.completed,
            onTap: () => setState(() => _selectedTab = ExamTab.completed),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: TextField(
        onChanged: (value) => setState(() => _searchQuery = value),
        decoration: InputDecoration(
          hintText: 'Search exams...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () => setState(() => _searchQuery = ''),
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          filled: true,
          fillColor: Colors.grey[100],
        ),
      ),
    );
  }

  Widget _buildExamsList(List<Exam> exams) {
    return RefreshIndicator(
      onRefresh: () => Provider.of<ExamProvider>(context, listen: false).loadExams(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: exams.length,
        itemBuilder: (context, index) {
          return _ExamCard(
            exam: exams[index],
            tab: _selectedTab,
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    String message;
    switch (_selectedTab) {
      case ExamTab.active:
        message = "You don't have any active exams right now.";
        break;
      case ExamTab.upcoming:
        message = 'No upcoming exams scheduled.';
        break;
      case ExamTab.completed:
        message = "You haven't completed any exams yet.";
        break;
    }

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.quiz, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'No ${_selectedTab.name} exams',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[500],
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(ExamProvider provider) {
    // Parse error to provide better messaging
    String errorMessage = provider.error ?? 'Unknown error occurred';
    String title = 'Error Loading Exams';
    IconData icon = Icons.error_outline;
    Color iconColor = Colors.red;
    String suggestion = 'Please check your internet connection and try again.';

    if (errorMessage.toLowerCase().contains('network') || 
        errorMessage.toLowerCase().contains('connection')) {
      title = 'Connection Error';
      icon = Icons.wifi_off;
      iconColor = Colors.orange;
      suggestion = 'Please check your internet connection and try again.';
    } else if (errorMessage.toLowerCase().contains('timeout')) {
      title = 'Request Timeout';
      icon = Icons.timer_off;
      iconColor = Colors.orange;
      suggestion = 'The server is taking too long to respond. Please try again.';
    } else if (errorMessage.toLowerCase().contains('unauthorized') || 
               errorMessage.toLowerCase().contains('not authenticated')) {
      title = 'Authentication Error';
      icon = Icons.lock_outline;
      iconColor = Colors.red;
      suggestion = 'Please log out and log in again.';
    } else if (errorMessage.toLowerCase().contains('server') || 
               errorMessage.toLowerCase().contains('500')) {
      title = 'Server Error';
      icon = Icons.cloud_off;
      iconColor = Colors.grey;
      suggestion = 'The server is experiencing issues. Please try again later.';
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 64, color: iconColor),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              suggestion,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                    height: 1.5,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              margin: const EdgeInsets.only(top: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.info_outline, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      errorMessage.replaceAll('Exception:', '').trim(),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[700],
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => provider.loadExams(),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Stats Card Widget
class _StatCard extends StatelessWidget {
  final String title;
  final int count;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.count,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 8),
            Text(
              count.toString(),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

// Tab Button Widget
class _TabButton extends StatelessWidget {
  final String label;
  final int count;
  final bool isSelected;
  final VoidCallback onTap;

  const _TabButton({
    required this.label,
    required this.count,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            gradient: isSelected
                ? const LinearGradient(
                    colors: [Colors.blue, Colors.purple],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  )
                : null,
            color: isSelected ? null : Colors.grey[200],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.grey[700],
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '($count)',
                style: TextStyle(
                  color: isSelected ? Colors.white70 : Colors.grey[600],
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Exam Card Widget
class _ExamCard extends StatelessWidget {
  final Exam exam;
  final ExamTab tab;

  const _ExamCard({
    required this.exam,
    required this.tab,
  });

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final isActive = tab == ExamTab.active;
    final isUpcoming = tab == ExamTab.upcoming;
    final isCompleted = tab == ExamTab.completed;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          if (isCompleted) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ExamResultScreen(examId: exam.id),
              ),
            );
          } else if (isUpcoming) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ExamPreviewScreen(examId: exam.id),
              ),
            );
          }
        },
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with gradient background
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isActive
                      ? [Colors.green[50]!, Colors.green[100]!]
                      : isUpcoming
                          ? [Colors.blue[50]!, Colors.blue[100]!]
                          : [Colors.grey[50]!, Colors.grey[100]!],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _TypeChip(type: exam.type),
                      if (isActive) ...[
                        const SizedBox(width: 8),
                        _LiveBadge(),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    exam.title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  if (exam.description != null && exam.description!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      exam.description!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),

            // Body
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    children: [
                      Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        '${exam.duration} mins',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(width: 16),
                      Icon(Icons.grade, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(
                        '${exam.totalMarks} marks',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const Spacer(),
                      if (exam.startTime != null)
                        Text(
                          _formatDate(exam.startTime!),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                    ],
                  ),
                  if (isActive && exam.endTime != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.timer, size: 16, color: Colors.red[700]),
                        const SizedBox(width: 4),
                        Text(
                          _getTimeRemaining(exam.endTime!),
                          style: TextStyle(
                            color: Colors.red[700],
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  if (isCompleted) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Icon(Icons.check_circle, size: 16, color: Colors.green[600]),
                        const SizedBox(width: 4),
                        Text(
                          'Submitted',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            // Footer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(12),
                  bottomRight: Radius.circular(12),
                ),
              ),
              child: _buildActionButton(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(BuildContext context) {
    if (tab == ExamTab.active) {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: () async {
            final provider = Provider.of<ExamProvider>(context, listen: false);
            final result = await provider.startExam(exam.id);
            if (result != null && context.mounted) {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => TakeExamScreen(
                    examId: exam.id,
                    examData: result,
                  ),
                ),
              );
            }
          },
          icon: const Icon(Icons.play_arrow),
          label: const Text('Start Exam'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
      );
    } else if (tab == ExamTab.upcoming) {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ExamPreviewScreen(examId: exam.id),
                  ),
                );
              },
              icon: const Icon(Icons.visibility),
              label: const Text('Preview'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: null,
              icon: const Icon(Icons.access_time),
              label: const Text('Not Started'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.grey[300],
                foregroundColor: Colors.grey[600],
              ),
            ),
          ),
        ],
      );
    } else {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ExamResultScreen(examId: exam.id),
              ),
            );
          },
          icon: const Icon(Icons.emoji_events),
          label: const Text('View Result'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
      );
    }
  }

  String _formatDate(DateTime date) {
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  String _getTimeRemaining(DateTime endTime) {
    final now = DateTime.now();
    final diff = endTime.difference(now);

    if (diff.isNegative) return 'Ended';

    final hours = diff.inHours;
    final minutes = diff.inMinutes % 60;

    if (hours > 24) {
      final days = hours ~/ 24;
      return '${days}d ${hours % 24}h left';
    }
    if (hours > 0) return '${hours}h ${minutes}m left';
    return '${minutes}m left';
  }
}

// Type Chip Widget
class _TypeChip extends StatelessWidget {
  final String type;

  const _TypeChip({required this.type});

  Color _getColor() {
    switch (type.toUpperCase()) {
      case 'MIDTERM':
        return Colors.purple[800]!;
      case 'FINAL':
        return Colors.red[800]!;
      case 'QUIZ':
        return Colors.orange[800]!;
      case 'ASSIGNMENT':
        return Colors.blue[800]!;
      case 'PROJECT':
        return Colors.green[800]!;
      default:
        return Colors.grey[800]!;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getColor();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        border: Border.all(color: color.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        type.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

// Live Badge Widget
class _LiveBadge extends StatefulWidget {
  @override
  State<_LiveBadge> createState() => _LiveBadgeState();
}

class _LiveBadgeState extends State<_LiveBadge> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.red[100],
          border: Border.all(color: Colors.red[300]!),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          'LIVE',
          style: TextStyle(
            color: Colors.red[800],
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

