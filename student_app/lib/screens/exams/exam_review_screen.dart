import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/exam_service.dart';
import '../../widgets/skeleton_loader.dart';

class ExamReviewScreen extends StatefulWidget {
  final String examId;
  final Map<String, dynamic>? attemptData;

  const ExamReviewScreen({
    Key? key,
    required this.examId,
    this.attemptData,
  }) : super(key: key);

  @override
  State<ExamReviewScreen> createState() => _ExamReviewScreenState();
}

class _ExamReviewScreenState extends State<ExamReviewScreen> {
  final ExamService _examService = ExamService();
  Map<String, dynamic>? _attemptData;
  bool _isLoading = true;
  String? _error;
  int _currentQuestionIndex = 0;
  bool _showExplanations = true;
  String _filterType = 'all'; // 'all', 'correct', 'wrong', 'unanswered'

  @override
  void initState() {
    super.initState();
    if (widget.attemptData != null) {
      _attemptData = widget.attemptData;
      _isLoading = false;
    } else {
      _loadAttemptData();
    }
  }

  Future<void> _loadAttemptData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final result = await _examService.getExamResult(widget.examId);
      setState(() {
        _attemptData = result;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  List<Map<String, dynamic>> _getFilteredAnswers() {
    if (_attemptData == null || _attemptData!['answers'] == null) {
      return [];
    }

    List<Map<String, dynamic>> answers = List<Map<String, dynamic>>.from(
      _attemptData!['answers'] as List<dynamic>,
    );

    if (_filterType == 'correct') {
      answers = answers.where((a) => a['isCorrect'] == true).toList();
    } else if (_filterType == 'wrong') {
      answers = answers.where((a) => a['isCorrect'] == false).toList();
    } else if (_filterType == 'unanswered') {
      answers = answers
          .where((a) =>
              a['selectedOptionId'] == null &&
              (a['textAnswer'] == null || a['textAnswer'].toString().isEmpty) &&
              (a['uploadedFiles'] == null || (a['uploadedFiles'] as List).isEmpty))
          .toList();
    }

    return answers;
  }

  Map<String, int> _getAnswerStats() {
    if (_attemptData == null || _attemptData!['answers'] == null) {
      return {'total': 0, 'correct': 0, 'wrong': 0, 'unanswered': 0};
    }

    List<dynamic> answers = _attemptData!['answers'] as List<dynamic>;
    int total = answers.length;
    int correct = 0;
    int wrong = 0;
    int unanswered = 0;

    for (var answer in answers) {
      if (answer['isCorrect'] == true) {
        correct++;
      } else if (answer['selectedOptionId'] != null ||
          (answer['textAnswer'] != null && answer['textAnswer'].toString().isNotEmpty) ||
          (answer['uploadedFiles'] != null && (answer['uploadedFiles'] as List).isNotEmpty)) {
        wrong++;
      } else {
        unanswered++;
      }
    }

    return {
      'total': total,
      'correct': correct,
      'wrong': wrong,
      'unanswered': unanswered,
    };
  }

  Color _getAnswerStatusColor(Map<String, dynamic> answer) {
    if (answer['isCorrect'] == true) {
      return Colors.green;
    } else if (answer['selectedOptionId'] != null ||
        (answer['textAnswer'] != null && answer['textAnswer'].toString().isNotEmpty) ||
        (answer['uploadedFiles'] != null && (answer['uploadedFiles'] as List).isNotEmpty)) {
      return Colors.red;
    }
    return Colors.grey;
  }

  IconData _getAnswerStatusIcon(Map<String, dynamic> answer) {
    if (answer['isCorrect'] == true) {
      return Icons.check_circle;
    } else if (answer['selectedOptionId'] != null ||
        (answer['textAnswer'] != null && answer['textAnswer'].toString().isNotEmpty) ||
        (answer['uploadedFiles'] != null && (answer['uploadedFiles'] as List).isNotEmpty)) {
      return Icons.cancel;
    }
    return Icons.help_outline;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Review Answers'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(_showExplanations ? Icons.visibility : Icons.visibility_off),
            onPressed: () {
              setState(() {
                _showExplanations = !_showExplanations;
              });
            },
            tooltip: _showExplanations ? 'Hide Explanations' : 'Show Explanations',
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              setState(() {
                _filterType = value;
                _currentQuestionIndex = 0;
              });
            },
            icon: const Icon(Icons.filter_list),
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'all', child: Text('All Questions')),
              const PopupMenuItem(value: 'correct', child: Text('Correct Only')),
              const PopupMenuItem(value: 'wrong', child: Text('Wrong Only')),
              const PopupMenuItem(value: 'unanswered', child: Text('Unanswered Only')),
            ],
          ),
        ],
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
                      Text('Error: $_error'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadAttemptData,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Stats overview
                    _buildStatsOverview(),
                    
                    // Question navigator
                    _buildQuestionNavigator(),
                    
                    // Question review content
                    Expanded(
                      child: _buildReviewContent(),
                    ),
                    
                    // Navigation buttons
                    _buildNavigationButtons(),
                  ],
                ),
    );
  }

  Widget _buildStatsOverview() {
    final stats = _getAnswerStats();
    final examData = _attemptData?['exam'];
    final totalMarks = examData?['totalMarks'] ?? 0;
    final obtainedMarks = _attemptData?['totalScore'] ?? 0;
    final percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toStringAsFixed(1) : '0';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        border: Border(bottom: BorderSide(color: Colors.blue[100]!)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem('Score', '$obtainedMarks/$totalMarks', Colors.blue),
              _buildStatItem('Percentage', '$percentage%', Colors.purple),
              _buildStatItem('Correct', '${stats['correct']}', Colors.green),
              _buildStatItem('Wrong', '${stats['wrong']}', Colors.red),
            ],
          ),
          if (stats['unanswered']! > 0) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.orange[100],
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${stats['unanswered']} Unanswered',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.orange,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  Widget _buildQuestionNavigator() {
    final filteredAnswers = _getFilteredAnswers();
    
    if (filteredAnswers.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        child: const Text(
          'No questions match the current filter',
          style: TextStyle(color: Colors.grey),
        ),
      );
    }

    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        itemCount: filteredAnswers.length,
        itemBuilder: (context, index) {
          final answer = filteredAnswers[index];
          final isCurrent = index == _currentQuestionIndex;
          final color = _getAnswerStatusColor(answer);

          return GestureDetector(
            onTap: () {
              setState(() => _currentQuestionIndex = index);
            },
            child: Container(
              width: 44,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: isCurrent ? color : color.withOpacity(0.3),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isCurrent ? color.withOpacity(0.8) : Colors.transparent,
                  width: 2,
                ),
              ),
              child: Center(
                child: Text(
                  '${index + 1}',
                  style: TextStyle(
                    color: isCurrent ? Colors.white : color,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildReviewContent() {
    final filteredAnswers = _getFilteredAnswers();
    
    if (filteredAnswers.isEmpty || _currentQuestionIndex >= filteredAnswers.length) {
      return const Center(
        child: Text('No questions to review'),
      );
    }

    final answer = filteredAnswers[_currentQuestionIndex];
    final question = answer['question'];
    final questionText = question['questionText'] ?? '';
    final questionType = question['questionType'];
    final marks = answer['marksAwarded'] ?? 0;
    final maxMarks = question['marks'] ?? 0;
    final isCorrect = answer['isCorrect'] == true;
    final explanation = question['explanation'];
    final feedback = answer['feedback'];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Question header with status
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _getAnswerStatusColor(answer).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _getAnswerStatusColor(answer).withOpacity(0.3),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  _getAnswerStatusIcon(answer),
                  color: _getAnswerStatusColor(answer),
                  size: 32,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isCorrect ? 'Correct Answer' : 'Incorrect Answer',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: _getAnswerStatusColor(answer),
                        ),
                      ),
                      Text(
                        'Marks: $marks / $maxMarks',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 20),

          // Question text
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.blue[100],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Q${_currentQuestionIndex + 1}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.orange[100],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        questionType.toString().replaceAll('_', ' '),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.orange,
                        ),
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '$maxMarks marks',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  questionText,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Display answer based on question type
          if (questionType == 'MULTIPLE_CHOICE')
            _buildMCQReview(answer, question)
          else if (questionType == 'SHORT_ANSWER' || questionType == 'LONG_ANSWER')
            _buildTextAnswerReview(answer)
          else if (questionType == 'FILE_UPLOAD')
            _buildFileAnswerReview(answer),

          // Teacher feedback
          if (feedback != null && feedback.toString().isNotEmpty) ...[
            const SizedBox(height: 20),
            Container(
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
                    children: const [
                      Icon(Icons.feedback, color: Colors.amber, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Teacher Feedback',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.amber,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    feedback.toString(),
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ),
          ],

          // Explanation
          if (_showExplanations && explanation != null && explanation.toString().isNotEmpty) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.lightbulb, color: Colors.blue, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Explanation',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    explanation.toString(),
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildMCQReview(Map<String, dynamic> answer, Map<String, dynamic> question) {
    final options = question['options'] as List<dynamic>? ?? [];
    final selectedOptionId = answer['selectedOptionId'];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Options:',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 12),
        ...options.map((option) {
          final optionId = option['id'];
          final optionText = option['optionText'] ?? '';
          final isCorrect = option['isCorrect'] == true;
          final isSelected = optionId == selectedOptionId;

          Color borderColor = Colors.grey[300]!;
          Color backgroundColor = Colors.white;
          IconData? icon;
          Color? iconColor;

          if (isCorrect) {
            borderColor = Colors.green;
            backgroundColor = Colors.green[50]!;
            icon = Icons.check_circle;
            iconColor = Colors.green;
          } else if (isSelected) {
            borderColor = Colors.red;
            backgroundColor = Colors.red[50]!;
            icon = Icons.cancel;
            iconColor = Colors.red;
          }

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: backgroundColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: borderColor, width: 2),
            ),
            child: Row(
              children: [
                if (icon != null) ...[
                  Icon(icon, color: iconColor, size: 24),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: Text(
                    optionText,
                    style: const TextStyle(fontSize: 15),
                  ),
                ),
                if (isCorrect)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Correct',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                if (isSelected && !isCorrect)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Your Answer',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildTextAnswerReview(Map<String, dynamic> answer) {
    final textAnswer = answer['textAnswer']?.toString() ?? '';
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Your Answer:',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[300]!),
          ),
          child: Text(
            textAnswer.isEmpty ? 'Not answered' : textAnswer,
            style: TextStyle(
              fontSize: 15,
              color: textAnswer.isEmpty ? Colors.grey : Colors.black,
              fontStyle: textAnswer.isEmpty ? FontStyle.italic : FontStyle.normal,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFileAnswerReview(Map<String, dynamic> answer) {
    final uploadedFiles = answer['uploadedFiles'] as List<dynamic>? ?? [];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Uploaded Files:',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 12),
        if (uploadedFiles.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: const Text(
              'No files uploaded',
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey,
                fontStyle: FontStyle.italic,
              ),
            ),
          )
        else
          ...uploadedFiles.map((file) {
            final fileName = file.toString();
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: Row(
                children: [
                  const Icon(Icons.attach_file, color: Colors.blue, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      fileName,
                      style: const TextStyle(fontSize: 14),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
      ],
    );
  }

  Widget _buildNavigationButtons() {
    final filteredAnswers = _getFilteredAnswers();
    final isFirst = _currentQuestionIndex == 0;
    final isLast = _currentQuestionIndex >= filteredAnswers.length - 1;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: isFirst
                  ? null
                  : () {
                      setState(() => _currentQuestionIndex--);
                    },
              icon: const Icon(Icons.arrow_back),
              label: const Text('Previous'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: isLast
                  ? null
                  : () {
                      setState(() => _currentQuestionIndex++);
                    },
              icon: const Icon(Icons.arrow_forward),
              label: const Text('Next'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
