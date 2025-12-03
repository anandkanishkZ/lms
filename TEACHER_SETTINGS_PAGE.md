# Teacher Settings Page

## Overview
Fully functional settings page for the teacher portal with profile management and password change functionality.

## Features

### 1. Profile Settings
- **Profile Photo Upload**
  - Upload profile picture (JPG, PNG, GIF, WEBP)
  - Maximum file size: 5MB
  - Image preview
  - Delete existing photo option
  - Automatic old photo cleanup

- **Personal Information**
  - First Name (required)
  - Middle Name (optional)
  - Last Name (required)
  - Email Address (required)
  - Phone Number (optional)

- **Form Features**
  - Real-time validation
  - Reset button to restore original values
  - Save button with loading state
  - Success/Error toast notifications

### 2. Password Settings
- **Change Password Form**
  - Current password validation
  - New password with strength indicator
  - Confirm password with match indicator
  - Toggle password visibility
  - Security tips display

- **Password Requirements**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - Special characters recommended

- **Password Strength Indicator**
  - Weak (red)
  - Medium (yellow)
  - Strong (green)
  - Real-time feedback

### 3. Future Tabs (Coming Soon)
- Notifications Settings
- Security Settings

## Backend Integration

### API Endpoints Used

1. **GET /api/v1/auth/profile**
   - Fetch current teacher profile
   - Returns: User data with profile image

2. **PUT /api/v1/auth/profile**
   - Update profile information
   - Body: firstName, middleName, lastName, email, phone

3. **POST /api/v1/auth/avatar**
   - Upload profile picture
   - Multipart form data with 'avatar' field
   - Returns: Updated user with new profile image URL

4. **DELETE /api/v1/auth/avatar**
   - Delete profile picture
   - Removes profile image from server

5. **POST /api/v1/auth/change-password**
   - Change password
   - Body: currentPassword, newPassword

## File Structure

```
frontend/app/teacher/settings/
├── page.tsx                          # Main settings page with tabs
├── components/
│   ├── ProfileSettings.tsx           # Profile update component
│   └── PasswordSettings.tsx          # Password change component
```

## Usage

### For Teachers:
1. Navigate to Settings from the sidebar
2. Click Profile tab to update personal information
3. Upload/change profile photo
4. Click Password tab to change password
5. Save changes with instant feedback

### For Developers:
- All components are fully typed with TypeScript
- Uses Framer Motion for smooth animations
- Integrated with existing toast notification system
- Follows the same design patterns as other teacher pages

## Security Features

- JWT authentication required
- Current password verification
- Password strength validation
- Secure file upload with type/size validation
- Automatic cleanup of old avatars
- Client-side and server-side validation

## Design Features

- Clean, modern UI with gradient accents
- Responsive layout
- Loading states for all async operations
- Form validation with helpful error messages
- Smooth transitions and animations
- Consistent with teacher portal design

## Testing

1. **Profile Update**
   - Test with valid data
   - Test with invalid email
   - Test with duplicate email
   - Test form reset

2. **Photo Upload**
   - Test with valid image files
   - Test with invalid file types
   - Test with oversized files
   - Test photo deletion

3. **Password Change**
   - Test with correct current password
   - Test with incorrect current password
   - Test with weak passwords
   - Test with mismatched confirmation
   - Test password strength indicator

## Dependencies

- Next.js 13+ (App Router)
- React
- TypeScript
- Framer Motion
- Lucide React Icons
- Axios (via teacherApiService)

## Notes

- Profile image URLs are properly configured in next.config.js
- All API calls go through the centralized teacherApiService
- LocalStorage is updated after successful profile changes
- Toast notifications provide user feedback for all operations
