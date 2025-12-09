# Free Education Nepal - Student Mobile App

A Flutter mobile application for students to access the Free Education Nepal Learning Management System (LMS).

## Features

- **Authentication**
  - Student login and registration
  - JWT token-based authentication
  - Automatic token refresh
  - Secure local storage using SharedPreferences

- **Dashboard**
  - Welcome screen with user information
  - Quick stats (enrolled modules, completed modules, exams, average score)
  - Recent activity tracking

- **Modules**
  - Browse available modules
  - View module details
  - Track lesson progress
  - Access video lessons and PDF materials

- **Exams**
  - View upcoming exams
  - Take online exams
  - View exam results and scores

- **Profile**
  - View and edit profile information
  - Change password
  - Logout functionality

## Tech Stack

- **Flutter** - Cross-platform mobile framework
- **Provider** - State management
- **HTTP** - API communication
- **SharedPreferences** - Local storage
- **Cached Network Image** - Image caching
- **YouTube Player Flutter** - Video playback
- **Flutter PDFView** - PDF viewing
- **Flutter HTML** - HTML content rendering

## Project Structure

```
lib/
├── config/
│   └── api_config.dart          # API endpoints and configuration
├── models/
│   ├── user.dart                # User and AuthResponse models
│   ├── module.dart              # Module and Lesson models
│   └── exam.dart                # Exam and Question models
├── services/
│   └── auth_service.dart        # Authentication service
├── providers/
│   └── auth_provider.dart       # Authentication state management
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart    # Login page
│   │   └── register_screen.dart # Registration page
│   ├── dashboard/
│   │   └── dashboard_screen.dart # Main dashboard
│   ├── modules/
│   │   └── modules_screen.dart   # Modules list
│   ├── exams/
│   │   └── exams_screen.dart     # Exams list
│   └── profile/
│       └── profile_screen.dart   # Profile management
├── widgets/                      # Reusable widgets
├── utils/                        # Utility functions
└── main.dart                     # App entry point
```

## Setup Instructions

### Prerequisites

- Flutter SDK (3.0 or higher)
- Dart SDK (3.0 or higher)
- Android Studio / Xcode (for mobile development)
- VS Code with Flutter extensions (recommended)

### Installation

1. **Install dependencies**
   ```bash
   flutter pub get
   ```

2. **Configure API endpoints**
   
   Open `lib/config/api_config.dart` and update the base URLs:
   ```dart
   static const String baseUrl = 'https://server.freeeducationinnepal.com/api/v1';
   static const String devBaseUrl = 'http://localhost:5005/api/v1';
   ```

3. **Run the app**
   
   For development:
   ```bash
   flutter run
   ```
   
   Choose your device:
   - [1]: Windows (windows)
   - [2]: Chrome (chrome)
   - [3]: Edge (edge)

### Build APK for Production

```bash
# Build release APK
flutter build apk --release

# Build split APKs by ABI (smaller size)
flutter build apk --split-per-abi --release

# Output location:
# build/app/outputs/flutter-apk/app-release.apk
```

## API Integration

The app connects to the Free Education Nepal LMS backend API:

- **Base URL**: `https://server.freeeducationinnepal.com/api/v1`
- **Authentication**: JWT Bearer tokens
- **Token Storage**: Local SharedPreferences

### Available Endpoints

#### Authentication
- `POST /auth/register` - Register new student
- `POST /auth/login` - Student login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile
- `PUT /auth/profile` - Update profile
- `PUT /auth/change-password` - Change password

#### Modules
- `GET /modules` - List all modules
- `GET /modules/:id` - Get module details
- `POST /modules/:id/enroll` - Enroll in module

#### Lessons
- `GET /modules/:moduleId/lessons` - Get module lessons
- `GET /lessons/:id` - Get lesson details
- `POST /lessons/:id/complete` - Mark lesson as complete

#### Exams
- `GET /exams` - List all exams
- `GET /exams/:id` - Get exam details
- `POST /exams/:id/submit` - Submit exam answers

## Testing Credentials

For testing purposes, you can use:

- **Email**: `student@lms.com`
- **Password**: `student123`

## Development

### Adding New Screens

1. Create screen file in appropriate folder under `lib/screens/`
2. Import required providers
3. Add navigation in relevant screens

### Adding New Services

1. Create service file in `lib/services/`
2. Add API endpoints in `lib/config/api_config.dart`
3. Create corresponding models if needed

### State Management

The app uses Provider for state management. To add new providers:

1. Create provider file in `lib/providers/`
2. Extend `ChangeNotifier`
3. Register in `main.dart` MultiProvider

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Check if backend server is running
   - Verify API base URL in `api_config.dart`
   - Check network connectivity

2. **Build Errors**
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

3. **Token Expired**
   - Token automatically refreshes on API calls
   - Manual logout and login if persistent

4. **Package Conflicts**
   ```bash
   flutter pub upgrade --major-versions
   ```

## Contact

- **Website**: https://lms.freeeducationinnepal.com
- **API Docs**: https://server.freeeducationinnepal.com/api/docs

## Version History

- **1.0.0** (Current)
  - Initial release
  - Authentication system
  - Dashboard with stats
  - Module browsing
  - Exam functionality
  - Profile management
