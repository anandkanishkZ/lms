# 🔥 Firebase Setup - Final Step

## ⚠️ IMPORTANT: Download google-services.json

The Firebase Cloud Messaging integration is **COMPLETE** except for one file:

### 📥 Download google-services.json

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: **lms-nepal-aac53**

2. **Navigate to Project Settings**
   - Click the ⚙️ gear icon (top left)
   - Go to **"Project settings"**

3. **Scroll to "Your apps"**
   - Find the **Android app** section
   - If you haven't registered the Android app yet:
     - Click **"Add app"** → Select **Android**
     - **Package name**: `com.nepallms.student`
     - **App nickname**: "Student App" (optional)
     - Click **"Register app"**

4. **Download google-services.json**
   - Click **"Download google-services.json"** button
   - Save the file

5. **Place the file in your project**
   ```
   student_app/android/app/google-services.json
   ```
   
   **EXACT PATH**: 
   ```
   d:\Natraj Technology\Website Client\Pankaj Sharma\lms\student_app\android\app\google-services.json
   ```

### ✅ What's Already Done

- ✅ Firebase dependencies added to `pubspec.yaml`
- ✅ Android build.gradle files updated with Google Services plugin
- ✅ AndroidManifest.xml configured with FCM permissions and service
- ✅ FCM Service created (`lib/services/fcm_service.dart`)
- ✅ Auth Service updated to register/unregister tokens
- ✅ main.dart updated to initialize Firebase
- ✅ Device info plugin added for device identification
- ✅ Backend API endpoints ready (/api/v1/fcm/register, etc.)
- ✅ Backend Firebase Admin SDK configured

### 🚀 Next Steps

1. **Download and place google-services.json** (see above)

2. **Install dependencies**:
   ```bash
   cd student_app
   flutter pub get
   ```

3. **Clean and rebuild**:
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

4. **Test the integration**:
   - Login to the app
   - Check console for: `✅ Firebase initialized successfully`
   - Check console for: `✅ FCM token registered successfully`
   - Create a notice from admin/teacher portal
   - You should receive a push notification! 📱

### 🔍 Verification

**Console logs to look for:**
```
✅ Firebase initialized successfully
✅ FCM Service initialized successfully
📱 FCM Token: [your_token]
✅ FCM token registered successfully
```

**When you receive a notification:**
```
📩 Foreground message received: [title]
🔔 Notification tapped: [data]
```

### 🐛 Troubleshooting

**Error: "Default FirebaseApp is not initialized"**
- Make sure `google-services.json` is in `android/app/` folder
- Run `flutter clean` and rebuild

**Error: "MissingPluginException"**
- Run: `flutter clean && flutter pub get`
- Rebuild the app

**No token registration**
- Check if user is logged in
- Check backend API endpoint is accessible
- Check access token is valid

**Notifications not received**
- Check app has notification permission (Settings → Apps → Student App → Notifications)
- Check backend server is running
- Check Firebase credentials are configured in backend
- Try creating a notice with "Published" = true

### 📱 Testing Checklist

- [ ] `google-services.json` downloaded and placed correctly
- [ ] `flutter pub get` completed without errors
- [ ] App builds successfully
- [ ] Firebase initializes on app launch
- [ ] User can login successfully
- [ ] FCM token is registered with backend
- [ ] Creating a published notice sends push notification
- [ ] Notification appears in notification tray
- [ ] Tapping notification opens the app

---

## 🎯 Summary

**You're 95% done!** Just download the `google-services.json` file and you'll have real-time push notifications working! 🎉

**Package name for Firebase Console**: `com.nepallms.student`

Need help? Check the [FIREBASE_SETUP_GUIDE.md](../FIREBASE_SETUP_GUIDE.md) for detailed instructions.
