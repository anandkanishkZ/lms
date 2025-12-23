class ApiConfig {
  // Base URLs
  static const String baseUrl = 'https://server.freeeducationinnepal.com/api/v1';
  static const String devBaseUrl = 'http://localhost:5005/api/v1';
  
  // Always use production URL for now
  static const String apiUrl = baseUrl;
  
  // Auth Endpoints
  static const String studentLogin = '$apiUrl/auth/login';
  static const String studentRegister = '$apiUrl/auth/register';
  static const String logout = '$apiUrl/auth/logout';
  static const String profile = '$apiUrl/auth/profile';
  static const String me = '$apiUrl/auth/me';
  static const String updateProfile = '$apiUrl/auth/profile';
  static const String changePassword = '$apiUrl/auth/change-password';
  static const String forgotPassword = '$apiUrl/auth/forgot-password';
  static const String verifyOTP = '$apiUrl/auth/verify-otp';
  static const String resetPassword = '$apiUrl/auth/reset-password';
  static const String requestVerificationOTP = '$apiUrl/auth/request-verification-otp';
  static const String verifyPhone = '$apiUrl/auth/verify-phone';
  
  // Module Endpoints
  static const String modules = '$apiUrl/modules';
  static String moduleById(String id) => '$modules/$id';
  static String moduleBySlug(String slug) => '$modules/slug/$slug';
  static const String featuredModules = '$modules/featured';
  
  // Enrollment Endpoints
  static const String enrollments = '$apiUrl/enrollments';
  static String myEnrollments(String studentId) => '$enrollments/students/$studentId/enrollments';
  static String studentEnrollments(String studentId) => '$enrollments/students/$studentId/enrollments';
  static String moduleEnrollments(int moduleId) => '$enrollments/modules/$moduleId/enrollments';
  
  // Topics Endpoints
  static const String topics = '$apiUrl/topics';
  static String topicsByModule(String moduleId) => '$topics/modules/$moduleId/topics';
  
  // Lesson Endpoints
  static const String lessons = '$apiUrl/lessons';
  static String lessonById(String id) => '$lessons/$id';
  static String lessonsByTopic(String topicId) => '$lessons/topics/$topicId/lessons';
  static String lessonView(String id) => '$lessons/$id/view';
  
  // Progress Endpoints
  static const String progress = '$apiUrl/progress';
  static String moduleProgress(int moduleId) => '$progress/modules/$moduleId';
  static String lessonProgress(int lessonId) => '$progress/lessons/$lessonId';
  static String markLessonComplete(int lessonId) => '$progress/lessons/$lessonId/complete';
  
  // Exam Endpoints
  static const String exams = '$apiUrl/exams';
  static String examById(String id) => '$exams/$id';
  static String startExam(String id) => '$exams/$id/start';
  static String submitAnswer(String examId, String attemptId) => '$exams/$examId/attempts/$attemptId/answer';
  static String submitExam(String examId, String attemptId) => '$exams/$examId/attempts/$attemptId/submit';
  static String examResults(String examId) => '$exams/$examId/results';
  static String examResult(String id) => '$exams/$id/my-result';
  
  // Notice Endpoints
  static const String notices = '$apiUrl/notices';
  static String noticeById(String id) => '$notices/$id';
  static String markNoticeAsRead(String id) => '$notices/$id/read';
  static const String unreadNoticesCount = '$notices/unread/count';
  
  // Dashboard Endpoints
  static const String dashboard = '$apiUrl/students/dashboard';
  static const String studentStats = '$apiUrl/analytics/student/stats';
  
  // Notification Endpoints
  static const String notifications = '$apiUrl/notifications';
  static String markNotificationRead(int id) => '$notifications/$id/read';
  
  // YouTube Live Endpoints
  static const String youtubeLive = '$apiUrl/youtube-live';
  static const String upcomingLiveSessions = '$youtubeLive/upcoming';
  static const String currentLiveSessions = '$youtubeLive/current';
  static const String pastLiveSessions = '$youtubeLive/past';
  
  // Timeout
  static const Duration timeout = Duration(seconds: 30);
  
  // Headers
  static Map<String, String> headers({String? token}) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    return headers;
  }
}
