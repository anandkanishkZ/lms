import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/exam_service.dart';
import '../../widgets/skeleton_loader.dart';
import 'take_exam_screen.dart';

class ExamPreviewScreen extends StatefulWidget {
  final String examId;

  const ExamPreviewScreen({
    Key? key,
    required this.examId,
  }) : super(key: key);

  @override
  State<ExamPreviewScreen> createState() => _ExamPreviewScreenState();
}

class _ExamPreviewScreenState extends State<ExamPreviewScreen> {
  final ExamService _examService = ExamService();
  Map<String, dynamic>? _examPreview;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadExamPreview();
  }

  Future<void> _loadExamPreview() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final preview = await _examService.getExamPreview(widget.examId);
      setState(() {
        _examPreview = preview;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _startExam() async {
    setState(() => _isLoading = true);

    try {
      final result = await _examService.startExam(widget.examId);
      
      if (!mounted) return;
      
      // Navigate to take exam screen
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => TakeExamScreen(
            examId: widget.examId,
            examData: result,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      
      setState(() => _isLoading = false);
      
      // Show detailed error dialog
      _showErrorDialog(e.toString());
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showErrorDialog(String errorMessage) {
    // Parse error message
    String title = 'Error Starting Exam';
    String message = errorMessage;
    IconData icon = Icons.error_outline;
    Color iconColor = Colors.red;

    if (errorMessage.toLowerCase().contains('maximum attempts')) {
      title = 'Maximum Attempts Reached';
      message = 'You have already used all available attempts for this exam.';
      icon = Icons.block;
      iconColor = Colors.orange;
    } else if (errorMessage.toLowerCase().contains('not started yet') || 
               errorMessage.toLowerCase().contains('before start time')) {
      title = 'Exam Not Available Yet';
      message = 'This exam has not started yet. Please check back at the scheduled time.';
      icon = Icons.schedule;
      iconColor = Theme.of(context).colorScheme.primary;
    } else if (errorMessage.toLowerCase().contains('expired') || 
               errorMessage.toLowerCase().contains('after end time')) {
      title = 'Exam Has Ended';
      message = 'This exam has already ended and is no longer accepting submissions.';
      icon = Icons.event_busy;
      iconColor = Colors.grey;
    } else if (errorMessage.toLowerCase().contains('not found')) {
      title = 'Exam Not Found';
      message = 'The exam you are trying to access could not be found.';
      icon = Icons.search_off;
      iconColor = Colors.grey;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 48,
                color: iconColor,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              message,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            if (_examPreview != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    if (_examPreview!['attemptsMade'] != null && 
                        _examPreview!['maxAttempts'] != null)
                      _buildInfoRow(
                        'Attempts',
                        '${_examPreview!['attemptsMade']}/${_examPreview!['maxAttempts']}',
                      ),
                  ],
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: Colors.grey[600],
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  String _formatDateTime(String? dateTime) {
    if (dateTime == null) return 'Not specified';
    try {
      final date = DateTime.parse(dateTime);
      return DateFormat('MMM d, yyyy h:mm a').format(date);
    } catch (e) {
      return dateTime;
    }
  }

  String _formatDuration(int? minutes) {
    if (minutes == null || minutes == 0) return 'Not specified';
    if (minutes < 60) return '$minutes minutes';
    final hours = minutes ~/ 60;
    final mins = minutes % 60;
    if (mins == 0) return '$hours ${hours == 1 ? 'hour' : 'hours'}';
    return '$hours ${hours == 1 ? 'hour' : 'hours'} $mins minutes';
  }

  Color _getTypeColor(String type) {
    switch (type.toUpperCase()) {
      case 'MIDTERM':
        return Colors.orange;
      case 'FINAL':
        return Colors.red;
      case 'ASSIGNMENT':
        return Theme.of(context).colorScheme.primary;
      case 'QUIZ':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  IconData _getQuestionTypeIcon(String type) {
    switch (type.toUpperCase()) {
      case 'MCQ':
        return Icons.radio_button_checked;
      case 'TRUE_FALSE':
        return Icons.toggle_on;
      case 'SHORT_ANSWER':
        return Icons.short_text;
      case 'LONG_ANSWER':
        return Icons.subject;
      default:
        return Icons.help_outline;
    }
  }

  String _formatQuestionType(String type) {
    switch (type.toUpperCase()) {
      case 'MCQ':
        return 'Multiple Choice';
      case 'TRUE_FALSE':
        return 'True/False';
      case 'SHORT_ANSWER':
        return 'Short Answer';
      case 'LONG_ANSWER':
        return 'Long Answer';
      default:
        return type;
    }
  }

  Widget _buildInfoCard(String title, String value, {IconData? icon, Color? color}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, color: color ?? Colors.grey[600], size: 24),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 24, bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Exam Preview'),
        elevation: 0,
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? SkeletonDetailContent()
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                      const SizedBox(height: 16),
                      Text(
                        'Failed to load exam preview',
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _error!,
                        style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _loadExamPreview,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _examPreview == null
                  ? const Center(child: Text('No data available'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Exam Title Card
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  _getTypeColor(_examPreview!['type'] ?? ''),
                                  _getTypeColor(_examPreview!['type'] ?? '').withOpacity(0.7),
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: _getTypeColor(_examPreview!['type'] ?? '').withOpacity(0.3),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.3),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    _examPreview!['type'] ?? '',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  _examPreview!['title'] ?? 'Untitled Exam',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (_examPreview!['description'] != null && 
                                    _examPreview!['description'].toString().isNotEmpty) ...[
                                  const SizedBox(height: 8),
                                  Text(
                                    _examPreview!['description'],
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),

                          // Quick Stats
                          _buildSectionTitle('Quick Overview'),
                          Row(
                            children: [
                              Expanded(
                                child: _buildInfoCard(
                                  'Duration',
                                  _formatDuration(_examPreview!['duration']),
                                  icon: Icons.timer,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildInfoCard(
                                  'Total Marks',
                                  '${_examPreview!['totalMarks'] ?? 0}',
                                  icon: Icons.grade,
                                  color: Colors.amber,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: _buildInfoCard(
                                  'Passing Marks',
                                  '${_examPreview!['passingMarks'] ?? 0}',
                                  icon: Icons.check_circle,
                                  color: Colors.green,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildInfoCard(
                                  'Questions',
                                  '${_examPreview!['questionCount'] ?? 0}',
                                  icon: Icons.quiz,
                                  color: Colors.purple,
                                ),
                              ),
                            ],
                          ),

                          // Schedule
                          _buildSectionTitle('Schedule'),
                          _buildInfoCard(
                            'Start Time',
                            _formatDateTime(_examPreview!['startTime']),
                            icon: Icons.access_time,
                            color: Colors.green,
                          ),
                          const SizedBox(height: 12),
                          _buildInfoCard(
                            'End Time',
                            _formatDateTime(_examPreview!['endTime']),
                            icon: Icons.access_time_filled,
                            color: Colors.red,
                          ),

                          // Question Types
                          if (_examPreview!['questionTypes'] != null &&
                              (_examPreview!['questionTypes'] as Map).isNotEmpty) ...[
                            _buildSectionTitle('Question Breakdown'),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.grey[200]!),
                              ),
                              child: Column(
                                children: (_examPreview!['questionTypes'] as Map)
                                    .entries
                                    .map((entry) => Padding(
                                          padding: const EdgeInsets.symmetric(vertical: 8),
                                          child: Row(
                                            children: [
                                              Icon(
                                                _getQuestionTypeIcon(entry.key),
                                                color: Theme.of(context).colorScheme.primary,
                                                size: 20,
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Text(
                                                  _formatQuestionType(entry.key),
                                                  style: const TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ),
                                              Container(
                                                padding: const EdgeInsets.symmetric(
                                                  horizontal: 12,
                                                  vertical: 4,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                                  borderRadius: BorderRadius.circular(12),
                                                ),
                                                child: Text(
                                                  '${entry.value}',
                                                  style: TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.bold,
                                                    color: Theme.of(context).colorScheme.primary,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ))
                                    .toList(),
                              ),
                            ),
                          ],

                          // Exam Rules
                          _buildSectionTitle('Exam Rules'),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.grey[200]!),
                            ),
                            child: Column(
                              children: [
                                _buildRuleItem(
                                  'Late Submission',
                                  _examPreview!['allowLateSubmission'] == true
                                      ? 'Allowed'
                                      : 'Not Allowed',
                                  _examPreview!['allowLateSubmission'] == true,
                                ),
                                _buildRuleItem(
                                  'Question Shuffle',
                                  _examPreview!['shuffleQuestions'] == true
                                      ? 'Enabled'
                                      : 'Disabled',
                                  _examPreview!['shuffleQuestions'] == true,
                                ),
                                _buildRuleItem(
                                  'Immediate Results',
                                  _examPreview!['showResultsImmediately'] == true
                                      ? 'Yes'
                                      : 'No',
                                  _examPreview!['showResultsImmediately'] == true,
                                ),
                                _buildRuleItem(
                                  'Review Answers',
                                  _examPreview!['allowReview'] == true
                                      ? 'Allowed'
                                      : 'Not Allowed',
                                  _examPreview!['allowReview'] == true,
                                ),
                                if (_examPreview!['maxAttempts'] != null)
                                  _buildRuleItem(
                                    'Max Attempts',
                                    '${_examPreview!['maxAttempts']} attempt(s)',
                                    true,
                                  ),
                              ],
                            ),
                          ),

                          // Attempt Status
                          if (_examPreview!['attemptCount'] != null) ...[
                            _buildSectionTitle('Your Attempts'),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: _examPreview!['canAttempt'] == true
                                    ? Colors.green[50]
                                    : Colors.red[50],
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: _examPreview!['canAttempt'] == true
                                      ? Colors.green[200]!
                                      : Colors.red[200]!,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    _examPreview!['canAttempt'] == true
                                        ? Icons.check_circle
                                        : Icons.warning,
                                    color: _examPreview!['canAttempt'] == true
                                        ? Colors.green[700]
                                        : Colors.red[700],
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Attempts: ${_examPreview!['attemptCount']}/${_examPreview!['maxAttempts'] ?? '∞'}',
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          _examPreview!['canAttempt'] == true
                                              ? 'You can take this exam'
                                              : 'Maximum attempts reached',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey[600],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],

                          // Instructions
                          if (_examPreview!['instructions'] != null &&
                              _examPreview!['instructions'].toString().isNotEmpty) ...[
                            _buildSectionTitle('Instructions'),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.amber[50],
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.amber[200]!),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.info_outline, color: Colors.amber[700]),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Important Instructions',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.amber[900],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    _examPreview!['instructions'],
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[800],
                                      height: 1.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],

                          const SizedBox(height: 32),

                          // Start Exam Button
                          if (_examPreview!['canAttempt'] == true)
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: _isLoading ? null : _startExam,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Theme.of(context).colorScheme.primary,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: _isLoading
                                    ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                        ),
                                      )
                                    : const Text(
                                        'Start Exam',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                              ),
                            ),

                          const SizedBox(height: 16),
                        ],
                      ),
                    ),
    );
  }

  Widget _buildRuleItem(String title, String value, bool isEnabled) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(
            isEnabled ? Icons.check_circle : Icons.cancel,
            color: isEnabled ? Colors.green : Colors.red,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
}
