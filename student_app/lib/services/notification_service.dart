import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import '../models/topic.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  /// Initialize the notification service
  Future<void> initialize() async {
    if (_initialized) return;

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    _initialized = true;
  }

  /// Handle notification tap
  void _onNotificationTapped(NotificationResponse response) {
    // Handle navigation based on notification payload
    print('Notification tapped: ${response.payload}');
  }

  /// Request notification permissions
  Future<bool> requestPermissions() async {
    if (!_initialized) await initialize();

    final androidPlugin = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    
    if (androidPlugin != null) {
      final granted = await androidPlugin.requestNotificationsPermission();
      return granted ?? false;
    }

    final iosPlugin = _notifications.resolvePlatformSpecificImplementation<
        IOSFlutterLocalNotificationsPlugin>();
    
    if (iosPlugin != null) {
      final granted = await iosPlugin.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );
      return granted ?? false;
    }

    return true;
  }

  /// Show instant notification
  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    if (!_initialized) await initialize();

    const androidDetails = AndroidNotificationDetails(
      'live_classes_channel',
      'Live Classes',
      channelDescription: 'Notifications for live classes',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(
      id,
      title,
      body,
      details,
      payload: payload,
    );
  }

  /// Schedule notification for upcoming live class
  Future<void> scheduleLiveClassNotification(LiveClass liveClass) async {
    if (!_initialized) await initialize();

    final now = DateTime.now();
    final classTime = liveClass.startTime;

    // Schedule notification 15 minutes before class
    final notificationTime = classTime.subtract(const Duration(minutes: 15));
    
    // Don't schedule if the time has already passed
    if (notificationTime.isBefore(now)) {
      return;
    }

    const androidDetails = AndroidNotificationDetails(
      'live_classes_channel',
      'Live Classes',
      channelDescription: 'Notifications for upcoming live classes',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
      styleInformation: BigTextStyleInformation(''),
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    try {
      await _notifications.zonedSchedule(
        liveClass.id.hashCode,
        '🔴 Live Class Starting Soon!',
        '${liveClass.title} starts in 15 minutes',
        tz.TZDateTime.from(notificationTime, tz.local),
        details,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: 'live_class:${liveClass.id}',
      );

      print('Scheduled notification for: ${liveClass.title} at $notificationTime');
    } catch (e) {
      print('Error scheduling notification: $e');
    }
  }

  /// Schedule notifications for multiple live classes
  Future<void> scheduleLiveClassNotifications(List<LiveClass> liveClasses) async {
    for (final liveClass in liveClasses) {
      await scheduleLiveClassNotification(liveClass);
    }
  }

  /// Schedule notification 5 minutes before class
  Future<void> scheduleUrgentNotification(LiveClass liveClass) async {
    if (!_initialized) await initialize();

    final now = DateTime.now();
    final classTime = liveClass.startTime;

    // Schedule notification 5 minutes before class
    final notificationTime = classTime.subtract(const Duration(minutes: 5));
    
    // Don't schedule if the time has already passed
    if (notificationTime.isBefore(now)) {
      return;
    }

    const androidDetails = AndroidNotificationDetails(
      'urgent_live_classes_channel',
      'Urgent Live Class Alerts',
      channelDescription: 'Urgent notifications for live classes starting soon',
      importance: Importance.max,
      priority: Priority.max,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      interruptionLevel: InterruptionLevel.critical,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    try {
      await _notifications.zonedSchedule(
        '${liveClass.id}_urgent'.hashCode,
        '🔴 LIVE CLASS STARTING NOW!',
        '${liveClass.title} is about to start. Join now!',
        tz.TZDateTime.from(notificationTime, tz.local),
        details,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: 'live_class_urgent:${liveClass.id}',
      );
    } catch (e) {
      print('Error scheduling urgent notification: $e');
    }
  }

  /// Cancel specific notification
  Future<void> cancelNotification(int id) async {
    await _notifications.cancel(id);
  }

  /// Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
  }

  /// Get pending notifications
  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _notifications.pendingNotificationRequests();
  }

  /// Cancel notifications for a specific live class
  Future<void> cancelLiveClassNotifications(String liveClassId) async {
    await _notifications.cancel(liveClassId.hashCode);
    await _notifications.cancel('${liveClassId}_urgent'.hashCode);
  }
}
