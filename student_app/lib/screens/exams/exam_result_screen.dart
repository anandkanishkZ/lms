import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/exam_service.dart';

class ExamResultScreen extends StatefulWidget {
  final String examId;
  final Map<String, dynamic>? resultData;

  const ExamResultScreen({
    Key? key,
    required this.examId,
    this.resultData,
  }) : super(key: key);

  @override
  State<ExamResultScreen> createState() => _ExamResultScreenState();
}

class _ExamResultScreenState extends State<ExamResultScreen> {
  final ExamService _examService = ExamService();
  Map<String, dynamic>? _result;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.resultData != null) {
      _result = widget.resultData;
      _isLoading = false;
    } else {
      _loadResult();
    }
  }

  Future<void> _loadResult() async {
    try {
      final result = await _examService.getExamResult(widget.examId);
      setState(() {
        _result = result;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Color _getGradeColor() {
    if (_result == null) return Colors.grey;
    
    final obtained = _result!['totalMarksObtained'] ?? 0;
    final total = _result!['exam']?['totalMarks'] ?? 100;
    final percentage = (obtained / total) * 100;
    
    if (percentage >= 80) return Colors.green;
    if (percentage >= 60) return Colors.blue;
    if (percentage >= 40) return Colors.orange;
    return Colors.red;
  }

  String _getGradeText() {
    if (_result == null) return 'N/A';
    
    final obtained = _result!['totalMarksObtained'] ?? 0;
    final total = _result!['exam']?['totalMarks'] ?? 100;
    final percentage = (obtained / total) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  }

  bool _isPassed() {
    if (_result == null) return false;
    
    final obtained = _result!['totalMarksObtained'] ?? 0;
    final passing = _result!['exam']?['passingMarks'] ?? 0;
    
    return obtained >= passing;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Exam Result'),
        backgroundColor: _getGradeColor(),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                      const SizedBox(height: 16),
                      Text('Error: $_error'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadResult,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  child: Column(
                    children: [
                      // Result header
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              _getGradeColor(),
                              _getGradeColor().withOpacity(0.7),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              _isPassed() ? Icons.check_circle : Icons.cancel,
                              size: 80,
                              color: Colors.white,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _isPassed() ? 'Passed!' : 'Failed',
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _result!['exam']?['title'] ?? 'Exam',
                              style: const TextStyle(
                                fontSize: 18,
                                color: Colors.white,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Score card
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.baseline,
                                textBaseline: TextBaseline.alphabetic,
                                children: [
                                  Text(
                                    '${_result!['totalMarksObtained'] ?? 0}',
                                    style: TextStyle(
                                      fontSize: 64,
                                      fontWeight: FontWeight.bold,
                                      color: _getGradeColor(),
                                    ),
                                  ),
                                  Text(
                                    '/${_result!['exam']?['totalMarks'] ?? 0}',
                                    style: TextStyle(
                                      fontSize: 32,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                                decoration: BoxDecoration(
                                  color: _getGradeColor().withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  'Grade: ${_getGradeText()}',
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: _getGradeColor(),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Stats
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Column(
                          children: [
                            _buildStatRow(
                              'Passing Marks',
                              '${_result!['exam']?['passingMarks'] ?? 0}',
                              Icons.rule,
                              Colors.blue,
                            ),
                            const SizedBox(height: 12),
                            _buildStatRow(
                              'Percentage',
                              '${(((_result!['totalMarksObtained'] ?? 0) / (_result!['exam']?['totalMarks'] ?? 1)) * 100).toStringAsFixed(1)}%',
                              Icons.percent,
                              Colors.purple,
                            ),
                            const SizedBox(height: 12),
                            _buildStatRow(
                              'Total Questions',
                              '${_result!['totalQuestions'] ?? 0}',
                              Icons.quiz,
                              Colors.orange,
                            ),
                            const SizedBox(height: 12),
                            _buildStatRow(
                              'Correct Answers',
                              '${_result!['correctAnswers'] ?? 0}',
                              Icons.check_circle,
                              Colors.green,
                            ),
                            const SizedBox(height: 12),
                            _buildStatRow(
                              'Wrong Answers',
                              '${(_result!['totalQuestions'] ?? 0) - (_result!['correctAnswers'] ?? 0)}',
                              Icons.cancel,
                              Colors.red,
                            ),
                            const SizedBox(height: 12),
                            _buildStatRow(
                              'Submitted At',
                              _result!['submittedAt'] != null
                                  ? DateFormat('MMM d, yyyy h:mm a').format(
                                      DateTime.parse(_result!['submittedAt']),
                                    )
                                  : 'N/A',
                              Icons.access_time,
                              Colors.grey,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 32),

                      // Actions
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Column(
                          children: [
                            if (_result!['exam']?['allowReview'] == true)
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton.icon(
                                  onPressed: () {
                                    // Navigate to review answers
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Review feature coming soon!'),
                                      ),
                                    );
                                  },
                                  icon: const Icon(Icons.rate_review),
                                  label: const Text('Review Answers'),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                  ),
                                ),
                              ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  Navigator.of(context).popUntil((route) => route.isFirst);
                                },
                                icon: const Icon(Icons.home),
                                label: const Text('Back to Dashboard'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 32),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatRow(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
