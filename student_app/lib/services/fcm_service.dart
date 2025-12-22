import 'dart:convert';
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';
import 'package:device_info_plus/device_info_plus.dart';

// Top-level function for background messages
@pragma('vm:entry-point')
Future<void> _firebaseBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('📩 Background message received: ${message.notification?.title}');
}

class FCMService {
  static final FCMService _instance = FCMService._internal();
  factory FCMService() => _instance;
  FCMService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  final AuthService _authService = AuthService();
  
  String? _fcmToken;
  bool _isInitialized = false;
  
  /// Initialize FCM service
  Future<void> initialize() async {
    if (_isInitialized) {
      debugPrint('⚠️ FCM already initialized');
      return;
    }

    try {
      // Request notification permissions
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
        criticalAlert: false,
        announcement: false,
      );

      if (settings.authorizationStatus != AuthorizationStatus.authorized) {
        debugPrint('⚠️ Notification permission denied');
        return;
      }

      debugPrint('✅ Notification permission granted');

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Get FCM token
      _fcmToken = await _firebaseMessaging.getToken();
      if (_fcmToken != null) {
        debugPrint('📱 FCM Token: $_fcmToken');
        
        // Register token with backend if user is logged in
        final isLoggedIn = await _authService.isLoggedIn();
        if (isLoggedIn) {
          await _registerTokenWithBackend(_fcmToken!);
        }
      }

      // Listen for token refresh
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        debugPrint('🔄 FCM Token refreshed');
        _fcmToken = newToken;
        _authService.isLoggedIn().then((isLoggedIn) {
          if (isLoggedIn) {
            _registerTokenWithBackend(newToken);
          }
        });
      });

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle background messages
      FirebaseMessaging.onBackgroundMessage(_firebaseBackgroundHandler);

      // Handle notification tap when app is in background
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      // Check if app was opened from terminated state
      RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
      if (initialMessage != null) {
        _handleNotificationTap(initialMessage);
      }

      _isInitialized = true;
      debugPrint('✅ FCM Service initialized successfully');
    } catch (e) {
      debugPrint('❌ FCM initialization error: $e');
    }
  }

  /// Initialize local notifications
  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      settings,
      onDidReceiveNotificationResponse: (details) {
        if (details.payload != null) {
          _navigateToNotice(details.payload!);
        }
      },
    );

    // Create high importance channel for Android
    const androidChannel = AndroidNotificationChannel(
      'high_importance_channel',
      'High Importance Notifications',
      description: 'This channel is used for important notices and announcements',
      importance: Importance.high,
      playSound: true,
      enableVibration: true,
      showBadge: true,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);

    debugPrint('✅ Local notifications initialized');
  }

  /// Register FCM token with backend
  Future<void> _registerTokenWithBackend(String token) async {
    try {
      final accessToken = await _authService.getAccessToken();
      
      if (accessToken == null) {
        debugPrint('⚠️ No access token available for FCM registration');
        return;
      }

      final deviceId = await _getDeviceId();
      const appVersion = '1.0.0'; // TODO: Get from package_info_plus

      final response = await http.post(
        Uri.parse('${ApiConfig.apiUrl}/fcm/register'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
        },
        body: jsonEncode({
          'token': token,
          'platform': Platform.isAndroid ? 'android' : 'ios',
          'deviceId': deviceId,
          'appVersion': appVersion,
        }),
      );

      if (response.statusCode == 200) {
        debugPrint('✅ FCM token registered successfully');
      } else {
        debugPrint('❌ Failed to register FCM token: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      debugPrint('❌ Error registering FCM token: $e');
    }
  }

  /// Unregister FCM token from backend
  Future<void> unregisterToken() async {
    if (_fcmToken == null) {
      debugPrint('⚠️ No FCM token to unregister');
      return;
    }

    try {
      final accessToken = await _authService.getAccessToken();
      
      if (accessToken == null) {
        debugPrint('⚠️ No access token available for FCM unregistration');
        return;
      }

      final response = await http.post(
        Uri.parse('${ApiConfig.apiUrl}/fcm/unregister'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
        },
        body: jsonEncode({'token': _fcmToken}),
      );

      if (response.statusCode == 200) {
        debugPrint('✅ FCM token unregistered successfully');
      } else {
        debugPrint('❌ Failed to unregister FCM token: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('❌ Error unregistering FCM token: $e');
    }
  }

  /// Handle foreground messages
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('📩 Foreground message received: ${message.notification?.title}');
    
    // Show local notification when app is in foreground
    _showLocalNotification(message);
  }

  /// Show local notification
  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;

    if (notification != null) {
      await _localNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            'high_importance_channel',
            'High Importance Notifications',
            channelDescription: 'This channel is used for important notices and announcements',
            importance: Importance.high,
            priority: Priority.high,
            icon: '@mipmap/ic_launcher',
            playSound: true,
            enableVibration: true,
            showWhen: true,
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        payload: message.data['noticeId'],
      );
    }
  }

  /// Handle notification tap
  void _handleNotificationTap(RemoteMessage message) {
    debugPrint('🔔 Notification tapped: ${message.data}');
    
    final noticeId = message.data['noticeId'];
    if (noticeId != null) {
      _navigateToNotice(noticeId);
    }
  }

  /// Navigate to notice detail
  void _navigateToNotice(String noticeId) {
    // TODO: Implement navigation to notice detail screen
    // This should be handled by your app's navigation system
    debugPrint('📄 Navigate to notice: $noticeId');
    
    // Example implementation:
    // Navigator.of(context).pushNamed('/notice-detail', arguments: noticeId);
  }

  /// Get device ID
  Future<String> _getDeviceId() async {
    try {
      final deviceInfo = DeviceInfoPlugin();
      
      if (Platform.isAndroid) {
        final androidInfo = await deviceInfo.androidInfo;
        return androidInfo.id; // Android ID
      } else if (Platform.isIOS) {
        final iosInfo = await deviceInfo.iosInfo;
        return iosInfo.identifierForVendor ?? 'unknown_ios';
      }
      
      return 'unknown_device';
    } catch (e) {
      debugPrint('❌ Error getting device ID: $e');
      return 'error_device_${DateTime.now().millisecondsSinceEpoch}';
    }
  }

  /// Register token manually (call after login)
  Future<void> registerTokenAfterLogin() async {
    if (_fcmToken != null) {
      await _registerTokenWithBackend(_fcmToken!);
    } else {
      // Try to get token again
      _fcmToken = await _firebaseMessaging.getToken();
      if (_fcmToken != null) {
        await _registerTokenWithBackend(_fcmToken!);
      }
    }
  }

  /// Get current FCM token
  String? get fcmToken => _fcmToken;

  /// Check if FCM is initialized
  bool get isInitialized => _isInitialized;
}
