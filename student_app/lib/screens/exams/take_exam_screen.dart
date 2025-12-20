import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import '../../services/exam_service.dart';
import '../../config/api_config.dart';
import '../../widgets/skeleton_loader.dart';
import 'exam_result_screen.dart';

class TakeExamScreen extends StatefulWidget {
  final String examId;
  final Map<String, dynamic> examData;

  const TakeExamScreen({
    Key? key,
    required this.examId,
    required this.examData,
  }) : super(key: key);

  @override
  State<TakeExamScreen> createState() => _TakeExamScreenState();
}

class _TakeExamScreenState extends State<TakeExamScreen> with WidgetsBindingObserver {
  final ExamService _examService = ExamService();
  
  // Exam data
  Map<String, dynamic>? _exam;
  Map<String, dynamic>? _attempt;
  List<dynamic> _questions = [];
  
  // UI state
  int _currentQuestionIndex = 0;
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _error;
  
  // Answers storage
  Map<String, dynamic> _answers = {}; // questionId -> answer
  Map<String, bool> _questionStatus = {}; // questionId -> isAnswered
  
  // Text controllers for text input questions
  Map<String, TextEditingController> _textControllers = {};
  
  // Timer
  Timer? _timer;
  int _remainingSeconds = 0;
  
  // Navigation
  bool _canGoBack = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadExamData();
  }

  @override
  void dispose() {
    _timer?.cancel();
    // Dispose all text controllers
    for (var controller in _textControllers.values) {
      controller.dispose();
    }
    _textControllers.clear();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Warn if app goes to background
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      _showWarning('App minimized! This may be flagged as suspicious activity.');
    }
  }

  Future<void> _loadExamData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = widget.examData;
      _exam = data['exam'];
      _attempt = data['attempt'];
      
      if (_exam == null || _attempt == null) {
        throw Exception('Invalid exam data');
      }

      // Extract questions
      if (_exam!['questions'] != null) {
        _questions = _exam!['questions'] as List<dynamic>;
        
        // Initialize question status
        for (var question in _questions) {
          final questionId = question['question']['id'];
          _questionStatus[questionId] = false;
        }
      }

      // Load existing answers if resuming
      if (_attempt!['answers'] != null) {
        final existingAnswers = _attempt!['answers'] as List<dynamic>;
        for (var answer in existingAnswers) {
          final questionId = answer['questionId'];
          _answers[questionId] = answer['selectedOptionId'] ?? answer['textAnswer'];
          _questionStatus[questionId] = true;
        }
      }

      // Start timer
      final duration = _exam!['duration'] ?? 60; // minutes
      _remainingSeconds = duration * 60;
      _startTimer();

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  // Get or create a text controller for a question
  TextEditingController _getController(String questionId, dynamic currentAnswer) {
    if (!_textControllers.containsKey(questionId)) {
      _textControllers[questionId] = TextEditingController(
        text: currentAnswer?.toString() ?? '',
      );
    } else {
      // Update text if answer changed externally
      final existingText = _textControllers[questionId]!.text;
      final newText = currentAnswer?.toString() ?? '';
      if (existingText != newText) {
        _textControllers[questionId]!.text = newText;
      }
    }
    return _textControllers[questionId]!;
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_remainingSeconds > 0) {
          _remainingSeconds--;
          
          // Warning at 5 minutes
          if (_remainingSeconds == 300) {
            _showWarning('⚠️ Only 5 minutes remaining!');
          }
          
          // Auto-submit at 0
          if (_remainingSeconds == 0) {
            _autoSubmitExam();
          }
        }
      });
    });
  }

  void _showWarning(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.orange,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _submitAnswer(String questionId, dynamic answer) async {
    setState(() {
      _answers[questionId] = answer;
      _questionStatus[questionId] = true;
    });

    try {
      // Submit answer to backend
      final attemptId = _attempt!['id'];
      await _examService.submitAnswer(
        widget.examId,
        attemptId,
        questionId,
        answer,
      );
    } catch (e) {
      print('Error submitting answer: $e');
      // Don't show error to user, they can still continue
    }
  }

  Future<void> _submitExam() async {
    // Check if all questions are answered
    final unansweredCount = _questions.length - _answers.length;
    
    if (unansweredCount > 0) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Submit Exam?'),
          content: Text(
            'You have $unansweredCount unanswered question(s).\n\nAre you sure you want to submit?'
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Submit Anyway'),
            ),
          ],
        ),
      );
      
      if (confirm != true) return;
    } else {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Submit Exam?'),
          content: const Text('Are you sure you want to submit your exam?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Submit'),
            ),
          ],
        ),
      );
      
      if (confirm != true) return;
    }

    setState(() => _isSubmitting = true);

    try {
      final attemptId = _attempt!['id'];
      final result = await _examService.submitExamAttempt(
        widget.examId,
        attemptId,
      );

      _timer?.cancel();
      
      // Navigate to results
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => ExamResultScreen(
            examId: widget.examId,
            resultData: result,
          ),
        ),
      );
    } catch (e) {
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to submit exam: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _autoSubmitExam() async {
    _showWarning('⏰ Time\'s up! Auto-submitting exam...');
    await _submitExam();
  }

  String _formatTime(int seconds) {
    final hours = seconds ~/ 3600;
    final minutes = (seconds % 3600) ~/ 60;
    final secs = seconds % 60;
    
    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
    }
    return '${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  Color _getTimerColor() {
    if (_remainingSeconds <= 300) return Colors.red; // < 5 min
    if (_remainingSeconds <= 600) return Colors.orange; // < 10 min
    return Colors.green;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (_canGoBack) return true;
        
        final confirm = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Exit Exam?'),
            content: const Text('Your progress will be saved. You can resume later.'),
            actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context, true),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  child: const Text('Exit'),
                ),
              ],
            ),
          );
          
          return confirm ?? false;
        },
        child: Scaffold(
        appBar: AppBar(
          title: Text(_exam?['title'] ?? 'Taking Exam'),
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
          elevation: 0,
          automaticallyImplyLeading: false,
          actions: [
            // Timer
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
              decoration: BoxDecoration(
                color: _getTimerColor().withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _getTimerColor()),
              ),
              child: Row(
                children: [
                  Icon(Icons.timer, color: _getTimerColor(), size: 20),
                  const SizedBox(width: 8),
                  Text(
                    _formatTime(_remainingSeconds),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: _getTimerColor(),
                    ),
                  ),
                ],
              ),
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
                          onPressed: _loadExamData,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : Column(
                    children: [
                      // Progress bar
                      _buildProgressBar(),
                      
                      // Question navigator
                      _buildQuestionNavigator(),
                      
                      // Question content
                      Expanded(
                        child: _buildQuestionContent(),
                      ),
                      
                      // Navigation buttons
                      _buildNavigationButtons(),
                    ],
                  ),
      ),
    );
  }

  Widget _buildProgressBar() {
    final answeredCount = _answers.length;
    final totalCount = _questions.length;
    final progress = totalCount > 0 ? answeredCount / totalCount : 0.0;

    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.grey[100],
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Text(
                  'Question ${_currentQuestionIndex + 1} of $totalCount',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  'Answered: $answeredCount/$totalCount',
                  style: TextStyle(
                    color: progress == 1.0 ? Colors.green : Colors.orange,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(
              progress == 1.0 ? Colors.green : Colors.blue,
            ),
            minHeight: 6,
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionNavigator() {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        itemCount: _questions.length,
        itemBuilder: (context, index) {
          final question = _questions[index];
          final questionId = question['question']['id'];
          final isAnswered = _questionStatus[questionId] ?? false;
          final isCurrent = index == _currentQuestionIndex;

          return GestureDetector(
            onTap: () {
              setState(() => _currentQuestionIndex = index);
            },
            child: Container(
              width: 44,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: isCurrent
                    ? Colors.blue
                    : isAnswered
                        ? Colors.green
                        : Colors.grey[300],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isCurrent ? Colors.blue[700]! : Colors.transparent,
                  width: 2,
                ),
              ),
              child: Center(
                child: Text(
                  '${index + 1}',
                  style: TextStyle(
                    color: isCurrent || isAnswered ? Colors.white : Colors.black,
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

  Widget _buildQuestionContent() {
    if (_questions.isEmpty || _currentQuestionIndex >= _questions.length) {
      return const Center(child: Text('No questions available'));
    }

    final questionData = _questions[_currentQuestionIndex];
    final question = questionData['question'];
    final questionId = question['id'];
    final questionText = question['questionText'] ?? '';
    final questionType = question['questionType'];
    final marks = questionData['marks'] ?? question['marks'] ?? 0;
    final options = question['options'] as List<dynamic>? ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Question header
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.blue[200]!),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: Text(
                    _formatQuestionType(questionType),
                    style: TextStyle(
                      color: Colors.blue[700],
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.amber,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$marks marks',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Question text
          Text(
            questionText,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              height: 1.5,
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Answer input based on type
          _buildAnswerInput(questionId, questionType, options),
        ],
      ),
    );
  }

  Widget _buildAnswerInput(String questionId, String questionType, List<dynamic> options) {
    final currentAnswer = _answers[questionId];
    final questionData = _questions[_currentQuestionIndex];
    final question = questionData['question'];

    switch (questionType.toUpperCase()) {
      case 'MCQ':
      case 'MULTIPLE_CHOICE':
        return _buildMCQOptions(questionId, options, currentAnswer);
      
      case 'TRUE_FALSE':
        return _buildTrueFalseOptions(questionId, currentAnswer);
      
      case 'SHORT_ANSWER':
        return _buildShortAnswerInput(questionId, currentAnswer);
      
      case 'LONG_ANSWER':
      case 'ESSAY':
        return _buildLongAnswerInput(questionId, currentAnswer);
      
      case 'FILE_UPLOAD':
        return _buildFileUploadInput(questionId, question, currentAnswer);
      
      default:
        return Text('Unsupported question type: $questionType');
    }
  }

  Widget _buildMCQOptions(String questionId, List<dynamic> options, dynamic currentAnswer) {
    return Column(
      children: options.map<Widget>((option) {
        final optionId = option['id'];
        final optionText = option['optionText'] ?? '';
        final isSelected = currentAnswer == optionId;

        return GestureDetector(
          onTap: () => _submitAnswer(questionId, optionId),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isSelected ? Colors.blue[50] : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? Colors.blue : Colors.grey[300]!,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                  color: isSelected ? Colors.blue : Colors.grey,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    optionText,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      color: isSelected ? Colors.blue[900] : Colors.black87,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTrueFalseOptions(String questionId, dynamic currentAnswer) {
    final trueSelected = currentAnswer == 'true';
    final falseSelected = currentAnswer == 'false';

    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () => _submitAnswer(questionId, 'true'),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: trueSelected ? Colors.green[50] : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: trueSelected ? Colors.green : Colors.grey[300]!,
                  width: trueSelected ? 2 : 1,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    trueSelected ? Icons.check_circle : Icons.check_circle_outline,
                    color: trueSelected ? Colors.green : Colors.grey,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'True',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: trueSelected ? FontWeight.bold : FontWeight.normal,
                      color: trueSelected ? Colors.green[900] : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: GestureDetector(
            onTap: () => _submitAnswer(questionId, 'false'),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: falseSelected ? Colors.red[50] : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: falseSelected ? Colors.red : Colors.grey[300]!,
                  width: falseSelected ? 2 : 1,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    falseSelected ? Icons.cancel : Icons.cancel_outlined,
                    color: falseSelected ? Colors.red : Colors.grey,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'False',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: falseSelected ? FontWeight.bold : FontWeight.normal,
                      color: falseSelected ? Colors.red[900] : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildShortAnswerInput(String questionId, dynamic currentAnswer) {
    final controller = _getController(questionId, currentAnswer);
    
    return TextField(
      controller: controller,
      maxLines: 3,
      textDirection: TextDirection.ltr,
      decoration: InputDecoration(
        hintText: 'Type your answer here...',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: Colors.grey[50],
      ),
      onChanged: (value) => _submitAnswer(questionId, value),
    );
  }

  Widget _buildLongAnswerInput(String questionId, dynamic currentAnswer) {
    final controller = _getController(questionId, currentAnswer);
    
    return TextField(
      controller: controller,
      maxLines: 10,
      textDirection: TextDirection.ltr,
      decoration: InputDecoration(
        hintText: 'Type your detailed answer here...',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
        fillColor: Colors.grey[50],
      ),
      onChanged: (value) => _submitAnswer(questionId, value),
    );
  }

  Widget _buildFileUploadInput(String questionId, Map<String, dynamic> question, dynamic currentAnswer) {
    // Get file upload constraints from question
    final allowMultiple = question['allowMultipleFiles'] ?? true;
    final maxFiles = question['maxFiles'] ?? 5;
    final acceptedTypes = question['acceptedFileTypes'] as String?;
    final maxSizeMB = question['maxFileSizeMB'] ?? 10;

    // Parse currently uploaded files
    List<Map<String, dynamic>> uploadedFiles = [];
    if (currentAnswer != null) {
      if (currentAnswer is List) {
        uploadedFiles = List<Map<String, dynamic>>.from(currentAnswer);
      } else if (currentAnswer is Map) {
        uploadedFiles = [Map<String, dynamic>.from(currentAnswer)];
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Upload constraints info
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.blue[200]!),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue[700], size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'File Upload Requirements',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.blue[700],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text('• Max files: ${allowMultiple ? maxFiles : 1}'),
              Text('• Max size per file: $maxSizeMB MB'),
              if (acceptedTypes != null && acceptedTypes.isNotEmpty)
                Text('• Accepted types: ${_formatFileTypes(acceptedTypes)}'),
            ],
          ),
        ),
        
        const SizedBox(height: 16),

        // Upload button
        ElevatedButton.icon(
          onPressed: uploadedFiles.length >= (allowMultiple ? maxFiles : 1)
              ? null
              : () => _pickFiles(questionId, allowMultiple, maxFiles, acceptedTypes, maxSizeMB),
          icon: const Icon(Icons.upload_file),
          label: Text(uploadedFiles.isEmpty ? 'Choose Files' : 'Add More Files'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          ),
        ),

        const SizedBox(height: 16),

        // Display uploaded files
        if (uploadedFiles.isNotEmpty) ...[
          Text(
            'Uploaded Files (${uploadedFiles.length})',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 12),
          ...uploadedFiles.asMap().entries.map((entry) {
            final index = entry.key;
            final file = entry.value;
            final fileName = file['name'] ?? 'Unknown';
            final fileSize = file['size'] ?? 0;
            final fileSizeMB = (fileSize / (1024 * 1024)).toStringAsFixed(2);

            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Icon(
                  _getFileIcon(fileName),
                  color: Colors.blue,
                  size: 32,
                ),
                title: Text(
                  fileName,
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
                subtitle: Text('$fileSizeMB MB'),
                trailing: IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () => _removeFile(questionId, index, uploadedFiles),
                ),
              ),
            );
          }).toList(),
        ],

        if (uploadedFiles.isEmpty)
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey[300]!, style: BorderStyle.solid, width: 2),
            ),
            child: const Center(
              child: Column(
                children: [
                  Icon(Icons.cloud_upload_outlined, size: 48, color: Colors.grey),
                  SizedBox(height: 8),
                  Text(
                    'No files uploaded yet',
                    style: TextStyle(color: Colors.grey, fontSize: 16),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  String _formatFileTypes(String types) {
    // Convert "image/jpeg,image/png,application/pdf" to "JPEG, PNG, PDF"
    return types.split(',').map((type) {
      final parts = type.trim().split('/');
      return parts.length > 1 ? parts[1].toUpperCase() : type.toUpperCase();
    }).join(', ');
  }

  IconData _getFileIcon(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    switch (extension) {
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'doc':
      case 'docx':
        return Icons.description;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return Icons.image;
      case 'zip':
      case 'rar':
        return Icons.folder_zip;
      case 'txt':
        return Icons.text_snippet;
      default:
        return Icons.insert_drive_file;
    }
  }

  Future<void> _pickFiles(String questionId, bool allowMultiple, int maxFiles, String? acceptedTypes, int maxSizeMB) async {
    try {
      // Parse accepted file types
      List<String>? allowedExtensions;
      if (acceptedTypes != null && acceptedTypes.isNotEmpty) {
        // Convert MIME types to extensions
        allowedExtensions = acceptedTypes.split(',').map((type) {
          final parts = type.trim().split('/');
          return parts.length > 1 ? parts[1] : type;
        }).toList();
      }

      final result = await FilePicker.platform.pickFiles(
        allowMultiple: allowMultiple,
        type: allowedExtensions != null ? FileType.custom : FileType.any,
        allowedExtensions: allowedExtensions,
      );

      if (result != null) {
        // Get currently uploaded files
        List<Map<String, dynamic>> currentFiles = [];
        if (_answers[questionId] != null) {
          if (_answers[questionId] is List) {
            currentFiles = List<Map<String, dynamic>>.from(_answers[questionId]);
          } else if (_answers[questionId] is Map) {
            currentFiles = [Map<String, dynamic>.from(_answers[questionId])];
          }
        }

        // Validate and add new files
        for (var file in result.files) {
          // Check file count
          if (currentFiles.length >= maxFiles) {
            _showWarning('Maximum $maxFiles files allowed');
            break;
          }

          // Check file size
          if (file.size > maxSizeMB * 1024 * 1024) {
            _showWarning('File ${file.name} exceeds maximum size of $maxSizeMB MB');
            continue;
          }

          // Add file
          currentFiles.add({
            'name': file.name,
            'size': file.size,
            'path': file.path,
            'bytes': file.bytes, // For web
          });
        }

        // Update answer
        _submitAnswer(questionId, currentFiles);
      }
    } catch (e) {
      _showWarning('Error picking files: $e');
    }
  }

  void _removeFile(String questionId, int index, List<Map<String, dynamic>> currentFiles) {
    currentFiles.removeAt(index);
    _submitAnswer(questionId, currentFiles.isEmpty ? null : currentFiles);
  }

  Widget _buildNavigationButtons() {
    final isFirst = _currentQuestionIndex == 0;
    final isLast = _currentQuestionIndex == _questions.length - 1;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          if (!isFirst)
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  setState(() => _currentQuestionIndex--);
                },
                icon: const Icon(Icons.arrow_back),
                label: const Text('Previous'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          if (!isFirst && !isLast) const SizedBox(width: 16),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: _isSubmitting
                  ? null
                  : isLast
                      ? _submitExam
                      : () {
                          setState(() => _currentQuestionIndex++);
                        },
              icon: Icon(isLast ? Icons.check : Icons.arrow_forward),
              label: Text(isLast ? 'Submit Exam' : 'Next'),
              style: ElevatedButton.styleFrom(
                backgroundColor: isLast ? Colors.green : Colors.blue,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatQuestionType(String type) {
    switch (type.toUpperCase()) {
      case 'MCQ':
      case 'MULTIPLE_CHOICE':
        return 'Multiple Choice';
      case 'TRUE_FALSE':
        return 'True/False';
      case 'SHORT_ANSWER':
        return 'Short Answer';
      case 'LONG_ANSWER':
      case 'ESSAY':
        return 'Essay Question';
      default:
        return type;
    }
  }
}
