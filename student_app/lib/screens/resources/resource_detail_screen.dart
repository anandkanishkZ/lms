import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:url_launcher/url_launcher.dart';
import '../../models/resource.dart' as ResourceModel;
import '../../services/resource_service.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';

// Conditional imports are handled at compilation time
// For web-only features, we'll use kIsWeb runtime check instead

class ResourceDetailScreen extends StatefulWidget {
  final ResourceModel.Resource resource;

  const ResourceDetailScreen({
    super.key,
    required this.resource,
  });

  @override
  State<ResourceDetailScreen> createState() => _ResourceDetailScreenState();
}

class _ResourceDetailScreenState extends State<ResourceDetailScreen> {
  ResourceService? _resourceService;
  bool _isDownloading = false;
  bool _showPreview = true;
  String? _resourceUrl;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    if (_resourceService == null) {
      final authProvider = context.read<AuthProvider>();
      _resourceService = ResourceService(authProvider.authService);
      _trackView();
      _initResourceUrl();
    }
  }

  void _initResourceUrl() {
    if (_resourceService == null) return;
    
    if (widget.resource.type.toUpperCase() == 'LINK' && widget.resource.externalUrl != null) {
      _resourceUrl = widget.resource.externalUrl;
    } else if (widget.resource.fileUrl != null) {
      // Use fileUrl from API and clean up malformed paths
      String url = widget.resource.fileUrl!;
      
      // Extract just the filename from malformed backend URLs
      // Backend returns: http://server.../uploads//home/zwicky/lms/backend/uploads/resources/filename.jpg
      // We need: https://server.../uploads/resources/filename.jpg
      
      if (url.contains('/uploads/') && url.contains('/home/')) {
        // Extract the filename (last part of the path)
        final fileName = url.split('/').last;
        // Reconstruct the proper URL
        url = 'https://server.freeeducationinnepal.com/uploads/resources/$fileName';
      } else {
        // For normal URLs, just ensure HTTPS and clean double slashes
        url = url.replaceAll('http://', 'https://');
        url = url.replaceAll('//', '/');
        url = url.replaceFirst('https:/', 'https://');
      }
      
      _resourceUrl = url;
    } else if (widget.resource.filePath != null) {
      // Construct URL from filePath
      _resourceUrl = _resourceService!.getResourceUrl(widget.resource.filePath);
    }
    
    print('Cleaned Resource URL: $_resourceUrl');
    setState(() {});
  }

  Future<void> _trackView() async {
    if (_resourceService == null) return;
    try {
      await _resourceService!.trackAccess(widget.resource.id, 'VIEW');
    } catch (e) {
      print('Error tracking view: $e');
    }
  }

  IconData _getIcon() {
    switch (widget.resource.type.toUpperCase()) {
      case 'VIDEO':
        return Icons.play_circle_filled;
      case 'LINK':
        return Icons.link;
      case 'IMAGE':
        return Icons.image;
      case 'DOCUMENT':
      case 'FILE':
        if (widget.resource.fileType?.toLowerCase().contains('pdf') == true) {
          return Icons.picture_as_pdf;
        } else if (widget.resource.fileType?.toLowerCase().contains('doc') == true) {
          return Icons.description;
        } else if (widget.resource.fileType?.toLowerCase().contains('xls') == true ||
                   widget.resource.fileType?.toLowerCase().contains('sheet') == true) {
          return Icons.table_chart;
        } else if (widget.resource.fileType?.toLowerCase().contains('ppt') == true ||
                   widget.resource.fileType?.toLowerCase().contains('slide') == true) {
          return Icons.slideshow;
        } else if (widget.resource.fileType?.toLowerCase().contains('image') == true ||
                   widget.resource.fileType?.toLowerCase().contains('jpg') == true ||
                   widget.resource.fileType?.toLowerCase().contains('png') == true) {
          return Icons.image;
        } else if (widget.resource.fileType?.toLowerCase().contains('zip') == true ||
                   widget.resource.fileType?.toLowerCase().contains('rar') == true) {
          return Icons.folder_zip;
        } else {
          return Icons.insert_drive_file;
        }
      default:
        return Icons.insert_drive_file;
    }
  }

  Color _getIconColor() {
    switch (widget.resource.type.toUpperCase()) {
      case 'VIDEO':
        return Colors.red;
      case 'LINK':
        return Theme.of(context).colorScheme.primary;
      case 'IMAGE':
        return Colors.purple[700]!;
      case 'DOCUMENT':
      case 'FILE':
        if (widget.resource.fileType?.toLowerCase().contains('pdf') == true) {
          return Colors.red[700]!;
        } else if (widget.resource.fileType?.toLowerCase().contains('doc') == true) {
          return Theme.of(context).colorScheme.primary;
        } else if (widget.resource.fileType?.toLowerCase().contains('xls') == true ||
                   widget.resource.fileType?.toLowerCase().contains('sheet') == true) {
          return Colors.green[700]!;
        } else if (widget.resource.fileType?.toLowerCase().contains('ppt') == true ||
                   widget.resource.fileType?.toLowerCase().contains('slide') == true) {
          return Colors.orange[700]!;
        } else if (widget.resource.fileType?.toLowerCase().contains('image') == true ||
                   widget.resource.fileType?.toLowerCase().contains('jpg') == true ||
                   widget.resource.fileType?.toLowerCase().contains('png') == true) {
          return Colors.purple[700]!;
        } else if (widget.resource.fileType?.toLowerCase().contains('zip') == true ||
                   widget.resource.fileType?.toLowerCase().contains('rar') == true) {
          return Colors.amber[700]!;
        } else {
          return Colors.grey[700]!;
        }
      default:
        return Colors.grey[700]!;
    }
  }

  Future<void> _openResource() async {
    if (_resourceService == null) return;

    setState(() {
      _isDownloading = true;
    });

    try {
      if (widget.resource.type.toUpperCase() == 'LINK' && widget.resource.externalUrl != null) {
        // Open external link
        final url = Uri.parse(widget.resource.externalUrl!);
        if (await canLaunchUrl(url)) {
          await launchUrl(url, mode: LaunchMode.externalApplication);
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Could not open link')),
            );
          }
        }
      } else if (widget.resource.filePath != null) {
        // Download/open file
        final fileUrl = _resourceService!.getResourceUrl(widget.resource.filePath);
        final url = Uri.parse(fileUrl);
        
        if (await canLaunchUrl(url)) {
          await launchUrl(url, mode: LaunchMode.externalApplication);
          // Track download
          await _resourceService!.trackAccess(widget.resource.id, 'DOWNLOAD');
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Could not open resource')),
            );
          }
        }
      }
    } catch (e) {
      print('Error opening resource: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isDownloading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final iconColor = _getIconColor();
    
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.resource.title),
        elevation: 0,
        actions: [
          // File type badge in app bar
          if (widget.resource.fileType != null)
            Center(
              child: Container(
                margin: const EdgeInsets.only(right: 16),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(_getIcon(), size: 16, color: iconColor),
                    const SizedBox(width: 6),
                    Text(
                      widget.resource.fileType!.toUpperCase(),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: iconColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Preview Section - Main focus
            if (_resourceUrl != null && _showPreview) ...[
              _buildPreview(),
              const SizedBox(height: 16),
            ],

            // Details
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (widget.resource.description != null && widget.resource.description!.isNotEmpty) ...[
                    Text(
                      'Description',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.resource.description!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        height: 1.5,
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  Text(
                    'Details',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),

                  _buildInfoRow(
                    icon: Icons.category_outlined,
                    label: 'Type',
                    value: widget.resource.type,
                  ),
                  if (widget.resource.formattedFileSize.isNotEmpty)
                    _buildInfoRow(
                      icon: Icons.file_present_outlined,
                      label: 'Size',
                      value: widget.resource.formattedFileSize,
                    ),
                  if (widget.resource.accessCount != null)
                    _buildInfoRow(
                      icon: Icons.visibility_outlined,
                      label: 'Views',
                      value: widget.resource.accessCount.toString(),
                    ),
                  if (widget.resource.downloadCount != null && widget.resource.downloadCount! > 0)
                    _buildInfoRow(
                      icon: Icons.download_outlined,
                      label: 'Downloads',
                      value: widget.resource.downloadCount.toString(),
                    ),
                  _buildInfoRow(
                    icon: Icons.calendar_today_outlined,
                    label: 'Uploaded',
                    value: _formatDate(widget.resource.createdAt),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              // Download button (optional for most types)
              if (widget.resource.type.toUpperCase() != 'LINK')
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isDownloading ? null : _openResource,
                    icon: _isDownloading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                            ),
                          )
                        : const Icon(Icons.download),
                    label: Text(
                      _isDownloading ? 'Downloading...' : 'Download',
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      textStyle: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              
              if (widget.resource.type.toUpperCase() != 'LINK')
                const SizedBox(width: 12),
              
              // Primary action button
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: widget.resource.type.toUpperCase() == 'LINK'
                      ? _openResource
                      : () {
                          // Toggle preview visibility
                          setState(() {
                            _showPreview = !_showPreview;
                          });
                          // Scroll to preview if showing
                          if (_showPreview) {
                            // Optional: Add scroll to preview logic
                          }
                        },
                  icon: Icon(
                    widget.resource.type.toUpperCase() == 'LINK'
                        ? Icons.open_in_new
                        : _showPreview
                            ? Icons.visibility_off
                            : Icons.visibility,
                  ),
                  label: Text(
                    widget.resource.type.toUpperCase() == 'LINK'
                        ? 'Open Link'
                        : _showPreview
                            ? 'Hide Preview'
                            : 'Show Preview',
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: iconColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    textStyle: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return weeks == 1 ? '1 week ago' : '$weeks weeks ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return months == 1 ? '1 month ago' : '$months months ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return years == 1 ? '1 year ago' : '$years years ago';
    }
  }

  Widget _buildPreview() {
    final type = widget.resource.type.toUpperCase();
    
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(
        minHeight: 300,
        maxHeight: 600,
      ),
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border(
          bottom: BorderSide(color: Colors.grey[300]!, width: 1),
        ),
      ),
      child: _buildPreviewContent(type),
    );
  }

  Widget _buildPreviewContent(String type) {
    if (_resourceUrl == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(48.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(_getIcon(), size: 64, color: Colors.white70),
              const SizedBox(height: 16),
              const Text(
                'No preview available',
                style: TextStyle(color: Colors.white70),
              ),
            ],
          ),
        ),
      );
    }

    switch (type) {
      case 'IMAGE':
        return Image.network(
          _resourceUrl!,
          fit: BoxFit.contain,
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return Center(
              child: CircularProgressIndicator(
                color: Colors.white,
                value: loadingProgress.expectedTotalBytes != null
                    ? loadingProgress.cumulativeBytesLoaded /
                        loadingProgress.expectedTotalBytes!
                    : null,
              ),
            );
          },
          errorBuilder: (context, error, stackTrace) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(48.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.red),
                    const SizedBox(height: 16),
                    const Text(
                      'Failed to load image',
                      style: TextStyle(color: Colors.white70),
                    ),
                  ],
                ),
              ),
            );
          },
        );

      case 'VIDEO':
        // For video, show iframe with video player for web
        return _buildIframe(_resourceUrl!, height: 400);

      case 'DOCUMENT':
      case 'FILE':
        // For PDF and documents, use iframe
        final fileExtension = _resourceUrl!.split('.').last.toLowerCase();
        if (fileExtension == 'pdf') {
          return _buildIframe(_resourceUrl!, height: 500);
        } else {
          // For other files, show download prompt
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(48.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _getIcon(),
                    size: 64,
                    color: _getIconColor().withOpacity(0.7),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Preview not available',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Download to view this file',
                    style: TextStyle(color: Colors.white70),
                  ),
                ],
              ),
            ),
          );
        }

      case 'LINK':
        // For external links, show iframe
        return _buildIframe(_resourceUrl!, height: 500);

      default:
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(48.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _getIcon(),
                  size: 64,
                  color: _getIconColor().withOpacity(0.7),
                ),
                const SizedBox(height: 16),
                Text(
                  'Preview not available for this type',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        );
    }
  }

  Widget _buildIframe(String url, {double height = 500}) {
    // For mobile platforms, show a button to open in external browser
    // Web platform will be handled differently in production
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.open_in_browser,
              size: 64,
              color: Theme.of(context).colorScheme.primary.withOpacity(0.7),
            ),
            const SizedBox(height: 16),
            Text(
              'Open in Browser',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'This resource will open in your default browser',
              style: TextStyle(color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () async {
                final uri = Uri.parse(url);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              },
              icon: const Icon(Icons.launch),
              label: const Text('Open'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
