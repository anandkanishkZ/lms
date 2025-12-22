# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you complete the Firebase Cloud Messaging integration for real-time push notifications in your LMS application.

## Backend Setup (✅ COMPLETED)

The backend FCM infrastructure is fully implemented:
- ✅ DeviceToken model in Prisma schema
- ✅ Firebase service layer with comprehensive FCM functions
- ✅ FCM API endpoints (register, unregister, get tokens)
- ✅ Notice creation sends push notifications automatically
- ✅ Prisma migration applied

## 1. Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name: "Free Education Nepal LMS" (or your choice)
4. Enable/disable Google Analytics (optional)
5. Click "Create project"

### 1.2 Generate Service Account Key
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to **Service Accounts** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** - this downloads a JSON file
5. Save this file securely as `firebase-service-account.json`
6. **IMPORTANT**: Never commit this file to Git - it's already in .gitignore

### 1.3 Configure Backend Environment Variables

Option A: Using Service Account File (Recommended for Development)
```env
# Add to backend/.env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

Option B: Using Individual Environment Variables (Recommended for Production)
```env
# Extract values from firebase-service-account.json and add to backend/.env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
```

**Current backend/.env has placeholders - replace them with actual values!**

## 2. Flutter App Setup

### 2.1 Add Firebase to Android App

1. In Firebase Console, click **"Add app"** and select **Android**

2. Register your Android app:
   - **Android package name**: `com.anand.student_app` (check `student_app/android/app/build.gradle.kts`)
   - **App nickname**: "Student App" (optional)
   - **Debug signing certificate SHA-1**: (optional for testing)

3. Download `google-services.json`

4. Place the file in: `student_app/android/app/google-services.json`

5. Update `student_app/android/build.gradle.kts`:
```kotlin
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.7.3")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.0.21")
        classpath("com.google.gms:google-services:4.4.2")  // Add this line
    }
}
```

6. Update `student_app/android/app/build.gradle.kts`:
```kotlin
plugins {
    id("com.android.application")
    id("kotlin-android")
    id("dev.flutter.flutter-gradle-plugin")
    id("com.google.gms.google-services")  // Add this line
}
```

### 2.2 Add Firebase Dependencies to Flutter

Update `student_app/pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # Existing dependencies...
  
  # Firebase dependencies
  firebase_core: ^3.8.1
  firebase_messaging: ^15.1.5
  
  # Already present (for local notifications)
  flutter_local_notifications: ^18.0.1
```

Run: `flutter pub get`

### 2.3 Update AndroidManifest.xml

Update `student_app/android/app/src/main/AndroidManifest.xml`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Add permissions -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.WAKE_LOCK"/>
    
    <application
        android:label="Free Education In Nepal"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">
        
        <!-- Existing activity -->
        <activity
            android:name=".MainActivity"
            ...>
            ...
        </activity>
        
        <!-- Add Firebase Messaging Service -->
        <service
            android:name="com.google.firebase.messaging.FirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT"/>
            </intent-filter>
        </service>
        
        <!-- Default notification channel -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="high_importance_channel"/>
    </application>
</manifest>
```

### 2.4 Update Minimum SDK Version

Update `student_app/android/app/build.gradle.kts`:
```kotlin
android {
    defaultConfig {
        minSdk = 21  // Change from 19 to 21 (required for Firebase)
        targetSdk = flutter.targetSdkVersion
        // ...
    }
}
```

## 3. Flutter Code Implementation

### 3.1 Create FCM Service

Create `student_app/lib/services/fcm_service.dart`:

```dart
import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

class FCMService {
  static final FCMService _instance = FCMService._internal();
  factory FCMService() => _instance;
  FCMService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  
  String? _fcmToken;
  
  // Initialize FCM
  Future<void> initialize() async {
    try {
      // Request notification permissions (iOS)
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        debugPrint('✅ Notification permission granted');
      } else {
        debugPrint('⚠️ Notification permission denied');
        return;
      }

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Get FCM token
      _fcmToken = await _firebaseMessaging.getToken();
      if (_fcmToken != null) {
        debugPrint('📱 FCM Token: $_fcmToken');
        await _registerTokenWithBackend(_fcmToken!);
      }

      // Listen for token refresh
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        debugPrint('🔄 FCM Token refreshed: $newToken');
        _fcmToken = newToken;
        _registerTokenWithBackend(newToken);
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

    } catch (e) {
      debugPrint('❌ FCM initialization error: $e');
    }
  }

  // Initialize local notifications
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
      description: 'This channel is used for important notices',
      importance: Importance.high,
      playSound: true,
      enableVibration: true,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);
  }

  // Register token with backend
  Future<void> _registerTokenWithBackend(String token) async {
    try {
      final authService = AuthService();
      final accessToken = await authService.getAccessToken();
      
      if (accessToken == null) {
        debugPrint('⚠️ No access token available for FCM registration');
        return;
      }

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/fcm/register'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
        },
        body: jsonEncode({
          'token': token,
          'platform': 'android',
          'deviceId': await _getDeviceId(),
          'appVersion': '1.0.0',
        }),
      );

      if (response.statusCode == 200) {
        debugPrint('✅ FCM token registered successfully');
      } else {
        debugPrint('❌ Failed to register FCM token: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('❌ Error registering FCM token: $e');
    }
  }

  // Unregister token from backend
  Future<void> unregisterToken() async {
    if (_fcmToken == null) return;

    try {
      final authService = AuthService();
      final accessToken = await authService.getAccessToken();
      
      if (accessToken == null) return;

      await http.post(
        Uri.parse('${ApiConfig.baseUrl}/fcm/unregister'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
        },
        body: jsonEncode({'token': _fcmToken}),
      );

      debugPrint('✅ FCM token unregistered');
    } catch (e) {
      debugPrint('❌ Error unregistering FCM token: $e');
    }
  }

  // Handle foreground messages
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('📩 Foreground message received: ${message.notification?.title}');
    
    // Show local notification
    _showLocalNotification(message);
  }

  // Show local notification
  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    final android = message.notification?.android;

    if (notification != null) {
      await _localNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            'high_importance_channel',
            'High Importance Notifications',
            channelDescription: 'This channel is used for important notices',
            importance: Importance.high,
            priority: Priority.high,
            icon: '@mipmap/ic_launcher',
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

  // Handle notification tap
  void _handleNotificationTap(RemoteMessage message) {
    debugPrint('🔔 Notification tapped: ${message.data}');
    
    final noticeId = message.data['noticeId'];
    if (noticeId != null) {
      _navigateToNotice(noticeId);
    }
  }

  // Navigate to notice detail
  void _navigateToNotice(String noticeId) {
    // TODO: Implement navigation to notice detail screen
    // Example: Navigator.pushNamed(context, '/notice-detail', arguments: noticeId);
    debugPrint('📄 Navigate to notice: $noticeId');
  }

  // Get device ID (simplified version)
  Future<String> _getDeviceId() async {
    // You might want to use device_info_plus package for real device ID
    return 'android_device_${DateTime.now().millisecondsSinceEpoch}';
  }
}

// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('📩 Background message received: ${message.notification?.title}');
}
```

### 3.2 Update main.dart

Update `student_app/lib/main.dart`:

```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'services/fcm_service.dart';
// ... other imports

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize FCM Service
  await FCMService().initialize();
  
  runApp(const MyApp());
}
```

### 3.3 Update AuthService for Logout

Update `student_app/lib/services/auth_service.dart` to unregister FCM token on logout:

```dart
import 'fcm_service.dart';

class AuthService {
  // ... existing code
  
  Future<void> logout() async {
    // Unregister FCM token
    await FCMService().unregisterToken();
    
    // Clear user session
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
    await _storage.delete(key: 'user_data');
    
    // ... rest of logout logic
  }
}
```

## 4. Testing

### 4.1 Test FCM Token Registration

1. Build and run the Flutter app:
   ```bash
   cd student_app
   flutter clean
   flutter pub get
   flutter run
   ```

2. Check console for FCM token:
   - Should see: `📱 FCM Token: [long token string]`
   - Should see: `✅ FCM token registered successfully`

3. Verify in backend logs that token was registered

### 4.2 Test Push Notifications

1. Login to teacher/admin portal
2. Create a new notice with:
   - Title: "Test Notification"
   - Content: "This is a test push notification"
   - Set "Published" to true
   - Assign to appropriate role/class

3. Check mobile app:
   - Should receive push notification immediately
   - Notification should appear in notification tray
   - Tap notification to navigate to notices

### 4.3 Test Background/Terminated States

1. Test app in foreground: Notification should show as local notification
2. Test app in background: Notification should show in system tray
3. Test app terminated: Notification should show, app should open on tap

## 5. Troubleshooting

### Common Issues

**Issue**: "Default FirebaseApp is not initialized"
- **Solution**: Ensure `Firebase.initializeApp()` is called in `main()` before running the app

**Issue**: No notifications received
- **Solution**: 
  - Check `google-services.json` is in correct location
  - Verify Firebase project settings
  - Check backend logs for notification sending errors
  - Ensure device has internet connection

**Issue**: "MissingPluginException"
- **Solution**: Run `flutter clean && flutter pub get` and rebuild

**Issue**: Token registration fails (401)
- **Solution**: Ensure user is logged in and access token is valid

### Debug Checklist

- [ ] Firebase project created and app registered
- [ ] `google-services.json` downloaded and placed correctly
- [ ] Firebase dependencies added to `pubspec.yaml`
- [ ] `minSdk` set to 21 in `build.gradle.kts`
- [ ] Backend `.env` has valid Firebase credentials
- [ ] Backend server restarted after .env changes
- [ ] Flutter app rebuilt after Firebase setup
- [ ] User is logged in when testing
- [ ] Notice is set to "Published" when creating

## 6. Production Deployment

### Backend
1. Use environment variables (Option B) instead of service account file
2. Store Firebase credentials in secure environment variable storage
3. Never commit `firebase-service-account.json` to repository

### Flutter App
1. Generate release signing key for Android
2. Add SHA-1 fingerprint to Firebase Console
3. Test thoroughly in release mode
4. Configure iOS if deploying to App Store

## 7. API Endpoints Reference

### Register FCM Token
```http
POST /api/v1/fcm/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "fcm_token_string",
  "platform": "android",
  "deviceId": "device_identifier",
  "appVersion": "1.0.0"
}
```

### Unregister FCM Token
```http
POST /api/v1/fcm/unregister
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "fcm_token_string"
}
```

### Get User's Tokens
```http
GET /api/v1/fcm/tokens
Authorization: Bearer <access_token>
```

## 8. Next Steps

1. ✅ Complete Firebase project setup (Section 1)
2. ✅ Configure backend environment variables (Section 1.3)
3. ✅ Add Firebase to Android app (Section 2.1)
4. ✅ Update Flutter dependencies (Section 2.2)
5. ✅ Implement FCM service in Flutter (Section 3)
6. ✅ Test end-to-end notification flow (Section 4)
7. 🎯 Deploy to production

---

## Support

For issues or questions:
- Check Firebase Console for error logs
- Review backend logs in `backend/logs/`
- Check Flutter console for FCM-related logs
- Verify API endpoints are accessible

**Developer**: Anand Kushwaha  
**Contact**: anandanubhab9@gmail.com
