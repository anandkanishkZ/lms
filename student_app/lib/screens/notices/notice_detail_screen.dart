import 'package:flutter/material.dart';
import '../../models/notice.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

class NoticeDetailScreen extends StatelessWidget {
  final Notice notice;

  const NoticeDetailScreen({
    super.key,
    required this.notice,
  });

  Color _getCategoryColor() {
    switch (notice.category) {
      case 'ACADEMIC':
        return const Color(0xFF2460E9);
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

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notice Details'),
        actions: [
          if (notice.isPinned)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Icon(Icons.push_pin, color: Colors.orange),
            ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header badges
              Row(
                children: [
                  // Category badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getCategoryColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _getCategoryColor(),
                        width: 1,
                      ),
                    ),
                    child: Text(
                      notice.category,
                      style: TextStyle(
                        color: _getCategoryColor(),
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  
                  // Priority badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getPriorityColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _getPriorityColor(),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.flag,
                          size: 16,
                          color: _getPriorityColor(),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          notice.priority,
                          style: TextStyle(
                            color: _getPriorityColor(),
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Title
              Text(
                notice.title,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              
              // Metadata
              _buildMetadataRow(
                icon: Icons.person,
                label: 'Published by',
                value: notice.publishedByUser?.name ?? 'Unknown',
              ),
              const SizedBox(height: 8),
              _buildMetadataRow(
                icon: Icons.email,
                label: 'Email',
                value: notice.publishedByUser?.email ?? 'N/A',
              ),
              const SizedBox(height: 8),
              _buildMetadataRow(
                icon: Icons.badge,
                label: 'Role',
                value: notice.publishedByUser?.role ?? 'N/A',
              ),
              const SizedBox(height: 8),
              _buildMetadataRow(
                icon: Icons.calendar_today,
                label: 'Published on',
                value: notice.publishedAt != null
                    ? DateFormat('MMMM dd, yyyy - hh:mm a').format(notice.publishedAt!)
                    : 'N/A',
              ),
              if (notice.expiresAt != null) ...[
                const SizedBox(height: 8),
                _buildMetadataRow(
                  icon: Icons.event_busy,
                  label: 'Expires on',
                  value: DateFormat('MMMM dd, yyyy - hh:mm a').format(notice.expiresAt!),
                ),
              ],
              const SizedBox(height: 8),
              _buildMetadataRow(
                icon: Icons.visibility,
                label: 'Views',
                value: '${notice.viewCount}',
              ),
              const SizedBox(height: 24),
              
              // Divider
              const Divider(thickness: 1),
              const SizedBox(height: 24),
              
              // Content
              const Text(
                'Content',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                notice.content,
                style: const TextStyle(
                  fontSize: 16,
                  height: 1.6,
                ),
              ),
              
              // Action button
              if (notice.actionUrl != null) ...[
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _launchUrl(notice.actionUrl!),
                    icon: const Icon(Icons.open_in_new),
                    label: const Text('Open Link'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                    ),
                  ),
                ),
              ],
              
              // Attachment
              if (notice.attachmentUrl != null) ...[
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => _launchUrl(notice.attachmentUrl!),
                    icon: const Icon(Icons.attachment),
                    label: const Text('View Attachment'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetadataRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey[600]),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}
