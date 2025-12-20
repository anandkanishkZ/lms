import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/notice_provider.dart';
import '../../models/notice.dart';
import '../../widgets/skeleton_loader.dart';
import 'package:intl/intl.dart';
import 'notice_detail_screen.dart';

class NoticesScreen extends StatefulWidget {
  const NoticesScreen({super.key});

  @override
  State<NoticesScreen> createState() => _NoticesScreenState();
}

class _NoticesScreenState extends State<NoticesScreen> {
  String _selectedFilter = 'all'; // all, unread, pinned

  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => Provider.of<NoticeProvider>(context, listen: false).loadNotices(),
    );
  }

  List<Notice> _getFilteredNotices(NoticeProvider provider) {
    switch (_selectedFilter) {
      case 'unread':
        return provider.unreadNotices;
      case 'pinned':
        return provider.pinnedNotices;
      default:
        return provider.notices;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notices'),
        actions: [
          Consumer<NoticeProvider>(
            builder: (context, provider, child) {
              if (provider.unreadCount > 0) {
                return Stack(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.notifications),
                      onPressed: () {
                        setState(() {
                          _selectedFilter = 'unread';
                        });
                      },
                    ),
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 18,
                          minHeight: 18,
                        ),
                        child: Text(
                          '${provider.unreadCount}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ],
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                _buildFilterChip('All', 'all'),
                const SizedBox(width: 8),
                _buildFilterChip('Unread', 'unread'),
                const SizedBox(width: 8),
                _buildFilterChip('Pinned', 'pinned'),
              ],
            ),
          ),
          
          // Notices list
          Expanded(
            child: Consumer<NoticeProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading) {
                  return SkeletonNoticeList();
                }

                if (provider.error != null) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 60, color: Colors.red),
                        const SizedBox(height: 16),
                        Text('Error: ${provider.error}'),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => provider.loadNotices(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                final filteredNotices = _getFilteredNotices(provider);

                if (filteredNotices.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.notifications_none,
                          size: 80,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _selectedFilter == 'unread'
                              ? 'No unread notices'
                              : _selectedFilter == 'pinned'
                                  ? 'No pinned notices'
                                  : 'No notices available',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: provider.refresh,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filteredNotices.length,
                    itemBuilder: (context, index) {
                      return _NoticeCard(
                        notice: filteredNotices[index],
                        onTap: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => NoticeDetailScreen(
                                notice: filteredNotices[index],
                              ),
                            ),
                          );
                          // Mark as read after viewing
                          if (filteredNotices[index].isRead == false) {
                            provider.markAsRead(filteredNotices[index].id);
                          }
                        },
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedFilter = value;
        });
      },
    );
  }
}

class _NoticeCard extends StatelessWidget {
  final Notice notice;
  final VoidCallback onTap;

  const _NoticeCard({
    required this.notice,
    required this.onTap,
  });

  Color _getCategoryColor() {
    switch (notice.category) {
      case 'ACADEMIC':
        return Colors.blue;
      case 'EVENT':
        return Colors.green;
      case 'EXAM':
        return Colors.orange;
      case 'URGENT':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Color _getPriorityColor() {
    switch (notice.priority) {
      case 'HIGH':
        return Colors.red;
      case 'MEDIUM':
        return Colors.orange;
      case 'LOW':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: notice.isRead == false ? 3 : 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: notice.isRead == false 
              ? Theme.of(context).primaryColor.withOpacity(0.3)
              : Colors.transparent,
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with badges and pin icon
              Row(
                children: [
                  // Category badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getCategoryColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      notice.category,
                      style: TextStyle(
                        color: _getCategoryColor(),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  
                  // Priority indicator
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _getPriorityColor(),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const Spacer(),
                  
                  // Pin icon
                  if (notice.isPinned)
                    const Icon(
                      Icons.push_pin,
                      size: 16,
                      color: Colors.orange,
                    ),
                  const SizedBox(width: 8),
                  
                  // Unread indicator
                  if (notice.isRead == false)
                    Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: Colors.blue,
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              
              // Title
              Text(
                notice.title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: notice.isRead == false 
                      ? FontWeight.bold 
                      : FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              
              // Content preview
              Text(
                notice.content,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 12),
              
              // Footer with metadata
              Row(
                children: [
                  Icon(Icons.person_outline, size: 14, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    notice.publishedByUser?.name ?? 'Unknown',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const Spacer(),
                  Icon(Icons.access_time, size: 14, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    notice.publishedAt != null
                        ? DateFormat('MMM dd, yyyy').format(notice.publishedAt!)
                        : 'N/A',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
