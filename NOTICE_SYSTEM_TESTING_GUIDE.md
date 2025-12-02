# Notice System - Testing Guide

## 🧪 Complete Testing Checklist

### Prerequisites
- ✅ Database migration applied: `npx prisma migrate dev`
- ✅ Prisma client generated: `npx prisma generate`
- ✅ Dependencies installed: `npm install express-validator express-rate-limit`
- ✅ Backend server running
- ✅ Frontend dev server running

---

## 🔧 Backend API Testing

### 1. **Notice CRUD Operations**

#### Create Notice (POST /api/v1/notices)
```bash
# Test validation
curl -X POST http://localhost:3001/api/v1/notices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notice",
    "content": "This is a test notice",
    "category": "GENERAL",
    "priority": "MEDIUM",
    "targetRole": "STUDENT"
  }'

# Expected: Success with 201 status
# Test rate limiting: Make 21 requests in 15 minutes
# Expected: 429 Too Many Requests after 20 requests
```

#### Get All Notices (GET /api/v1/notices)
```bash
# Test filters
curl -X GET "http://localhost:3001/api/v1/notices?category=EXAM&priority=HIGH&unreadOnly=true" \
  -H "Authorization: Bearer <token>"

# Expected: Filtered list of notices
```

#### Get Single Notice (GET /api/v1/notices/:id)
```bash
curl -X GET http://localhost:3001/api/v1/notices/<notice-id> \
  -H "Authorization: Bearer <token>"

# Expected: Notice details
```

#### Update Notice (PUT /api/v1/notices/:id)
```bash
curl -X PUT http://localhost:3001/api/v1/notices/<notice-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "priority": "HIGH"
  }'

# Expected: Updated notice
# Test authorization: Try updating another user's notice
# Expected: 403 Forbidden
```

#### Delete Notice (DELETE /api/v1/notices/:id)
```bash
curl -X DELETE http://localhost:3001/api/v1/notices/<notice-id> \
  -H "Authorization: Bearer <token>"

# Expected: Soft delete (isActive = false)
# Verify: GET request should not return deleted notice
```

---

### 2. **Mark as Read Operations**

#### Mark Single Notice as Read (POST /api/v1/notices/:id/read)
```bash
curl -X POST http://localhost:3001/api/v1/notices/<notice-id>/read \
  -H "Authorization: Bearer <token>"

# Expected: Success message
# Verify: Notice should show as read in GET request
```

#### Bulk Mark as Read (POST /api/v1/notices/bulk/mark-read)
```bash
curl -X POST http://localhost:3001/api/v1/notices/bulk/mark-read \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "noticeIds": ["id1", "id2", "id3"]
  }'

# Expected: Success message with count
```

#### Mark All as Read (POST /api/v1/notices/bulk/mark-all-read)
```bash
curl -X POST http://localhost:3001/api/v1/notices/bulk/mark-all-read \
  -H "Authorization: Bearer <token>"

# Expected: Success message with count of marked notices
```

---

### 3. **Notification Preferences**

#### Get Preferences (GET /api/v1/notices/preferences)
```bash
curl -X GET http://localhost:3001/api/v1/notices/preferences \
  -H "Authorization: Bearer <token>"

# Expected: User's notification preferences
# If no preferences exist, should create default preferences
```

#### Update Preferences (PUT /api/v1/notices/preferences)
```bash
curl -X PUT http://localhost:3001/api/v1/notices/preferences \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emailEnabled": true,
    "inAppEnabled": true,
    "pushEnabled": false,
    "examNotifications": true,
    "eventNotifications": true,
    "generalNotifications": true,
    "urgentOnly": false,
    "quietHoursEnabled": true,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00"
  }'

# Expected: Updated preferences
# Test validation: Send invalid time format
# Expected: 400 Bad Request with validation errors
```

---

### 4. **Statistics**

#### Get Notification Stats (GET /api/v1/notices/stats)
```bash
curl -X GET http://localhost:3001/api/v1/notices/stats \
  -H "Authorization: Bearer <token>"

# Expected: { total, read, unread } counts
```

#### Get Unread Count (GET /api/v1/notices/unread/count)
```bash
curl -X GET http://localhost:3001/api/v1/notices/unread/count \
  -H "Authorization: Bearer <token>"

# Expected: { count: number }
```

---

### 5. **Bulk Delete (Admin/Creator Only)**

#### Bulk Delete Notices (POST /api/v1/notices/bulk/delete)
```bash
curl -X POST http://localhost:3001/api/v1/notices/bulk/delete \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "noticeIds": ["id1", "id2"]
  }'

# Expected: Success message with count
# Test authorization: Try as student
# Expected: 403 Forbidden
```

---

### 6. **Validation Testing**

#### Test Invalid Data
```bash
# Missing required fields
curl -X POST http://localhost:3001/api/v1/notices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 Bad Request with validation errors

# Invalid category
curl -X POST http://localhost:3001/api/v1/notices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "content": "Test",
    "category": "INVALID",
    "priority": "MEDIUM"
  }'

# Expected: 400 Bad Request - Invalid category

# XSS attempt
curl -X POST http://localhost:3001/api/v1/notices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<script>alert('XSS')</script>",
    "content": "Test",
    "category": "GENERAL",
    "priority": "MEDIUM"
  }'

# Expected: Sanitized output (script tags removed)
```

---

### 7. **Rate Limiting Testing**

```bash
# Create 21 notices rapidly
for i in {1..21}; do
  curl -X POST http://localhost:3001/api/v1/notices \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Test $i\",
      \"content\": \"Test\",
      \"category\": \"GENERAL\",
      \"priority\": \"MEDIUM\"
    }"
done

# Expected: First 20 succeed, 21st gets 429 Too Many Requests
```

---

## 🎨 Frontend Testing

### 1. **NoticeBoard Component**

#### Basic Functionality
- [ ] Notices load on component mount
- [ ] Loading skeleton appears while fetching
- [ ] Empty state shows when no notices
- [ ] Unread count badge displays correctly
- [ ] Notice cards render with correct data

#### Filtering
- [ ] Search by title/content works
- [ ] Category filter works (EXAM, EVENT, HOLIDAY, GENERAL)
- [ ] Priority filter works (URGENT, HIGH, MEDIUM, LOW)
- [ ] Unread only toggle works
- [ ] Pinned only toggle works
- [ ] Active filter count badge updates
- [ ] Clear all filters button works
- [ ] Multiple filters work together

#### Actions
- [ ] Mark as read button works (individual notice)
- [ ] Mark all as read button appears when unread > 0
- [ ] Mark all as read updates all notices
- [ ] Delete notice works (with permissions)
- [ ] View notice opens modal
- [ ] Edit notice navigates to edit page

#### Optimistic UI
- [ ] Mark as read updates immediately
- [ ] Delete removes card immediately
- [ ] Mark all as read updates all immediately
- [ ] Rollback happens on error
- [ ] Error toast appears on failure

#### Error Handling
- [ ] Error boundary catches render errors
- [ ] Network errors show toast
- [ ] Authentication errors handled gracefully
- [ ] Invalid notice ID handled

---

### 2. **NoticeDetailModal**

- [ ] Modal opens with correct notice data
- [ ] Title, content, category, priority display correctly
- [ ] Date formatting is correct
- [ ] Mark as read button works
- [ ] Close button closes modal
- [ ] Click outside closes modal
- [ ] Attachments display (if any)
- [ ] Action URL link works

---

### 3. **NotificationPreferences Component**

#### Display
- [ ] Loads current preferences
- [ ] Loading state shows spinner
- [ ] Error state has retry button
- [ ] All toggles reflect current state
- [ ] Quiet hours time inputs show correct values

#### Functionality
- [ ] Email toggle works
- [ ] In-app toggle works
- [ ] Push toggle works
- [ ] Exam notifications toggle works
- [ ] Event notifications toggle works
- [ ] General notifications toggle works
- [ ] Urgent only toggle works
- [ ] Quiet hours toggle works
- [ ] Quiet hours time inputs work

#### Save Behavior
- [ ] Save button appears when changes made
- [ ] Save button disabled while saving
- [ ] Success toast on save
- [ ] Error toast on failure
- [ ] "Unsaved changes" banner appears
- [ ] Changes persist after save

---

### 4. **Create/Edit Notice Form**

- [ ] Form loads with correct initial data (edit mode)
- [ ] Title validation works
- [ ] Content validation works
- [ ] Category selection works
- [ ] Priority selection works
- [ ] Target role/class/batch selection works
- [ ] Is pinned toggle works
- [ ] Expiry date picker works
- [ ] Schedule date picker works
- [ ] Action URL input works
- [ ] Submit button disabled during save
- [ ] Validation errors display
- [ ] Success redirect after create
- [ ] Success redirect after update

---

## 🔐 Authorization Testing

### Student Role
- [ ] Can view notices targeted to them
- [ ] Can mark notices as read
- [ ] Cannot create notices
- [ ] Cannot edit notices
- [ ] Cannot delete notices
- [ ] Cannot access bulk delete
- [ ] Can manage own preferences

### Teacher Role
- [ ] Can view all notices
- [ ] Can create notices for own classes/modules
- [ ] Can edit own notices
- [ ] Can delete own notices
- [ ] Cannot delete other teachers' notices
- [ ] Cannot access bulk delete
- [ ] Can manage own preferences

### Admin Role
- [ ] Can view all notices
- [ ] Can create notices (global)
- [ ] Can edit all notices
- [ ] Can delete all notices
- [ ] Can access bulk delete
- [ ] Can manage own preferences
- [ ] Rate limits bypassed

---

## 🐛 Error Scenarios to Test

1. **Network Failures**
   - Disconnect internet during fetch
   - Expected: Error toast + retry option

2. **Token Expiry**
   - Use expired token
   - Expected: Redirect to login

3. **Invalid Notice ID**
   - Try to view/edit non-existent notice
   - Expected: 404 error + friendly message

4. **Concurrent Updates**
   - Edit same notice from two tabs
   - Expected: Last save wins + warning

5. **Large Content**
   - Create notice with 10,000 characters
   - Expected: Validation error (max limit)

6. **Special Characters**
   - Title/content with emojis, unicode
   - Expected: Renders correctly

7. **Date Edge Cases**
   - Schedule for past date
   - Expected: Validation error
   - Expiry before schedule
   - Expected: Validation error

8. **Preferences Edge Cases**
   - Quiet end before start
   - Expected: Still works (overnight)
   - All notifications disabled
   - Expected: Warning shown

---

## 📊 Performance Testing

1. **Load Testing**
   - Create 100 notices
   - Check page load time
   - Expected: < 3 seconds

2. **Filter Performance**
   - Apply multiple filters on 100 notices
   - Expected: Instant filtering

3. **Bulk Operations**
   - Mark 50 notices as read
   - Expected: < 2 seconds

4. **Database Indexes**
   - Check query execution time
   - Expected: < 100ms for filtered queries

---

## ✅ Acceptance Criteria

### Must Have
- ✅ All CRUD operations work
- ✅ Validation prevents invalid data
- ✅ Rate limiting protects API
- ✅ Authorization enforced correctly
- ✅ Optimistic UI with rollback
- ✅ Error boundaries catch errors
- ✅ Mark all as read works
- ✅ Preferences can be managed
- ✅ Filtering works correctly
- ✅ Mobile responsive

### Nice to Have
- Socket.IO for real-time (skipped for now)
- Email notifications (future)
- Push notifications (future)
- Scheduled notices (field exists)

---

## 🚀 Production Readiness Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] No accessibility violations
- [ ] Mobile responsive
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Empty states implemented
- [ ] Success/error toasts working
- [ ] Database indexes applied
- [ ] Rate limiting configured
- [ ] Validation comprehensive
- [ ] Authorization secure
- [ ] Optimistic UI smooth
- [ ] No XSS vulnerabilities
- [ ] No SQL injection vulnerabilities
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Logging implemented
- [ ] Monitoring configured

---

## 📝 Test Results Template

```
# Notice System Test Results
Date: _____________
Tester: _____________

## Backend API
- [ ] CRUD Operations: PASS / FAIL
- [ ] Validation: PASS / FAIL
- [ ] Rate Limiting: PASS / FAIL
- [ ] Authorization: PASS / FAIL
- [ ] Bulk Operations: PASS / FAIL
- [ ] Preferences: PASS / FAIL
- [ ] Statistics: PASS / FAIL

## Frontend
- [ ] NoticeBoard: PASS / FAIL
- [ ] Filters: PASS / FAIL
- [ ] Optimistic UI: PASS / FAIL
- [ ] Error Handling: PASS / FAIL
- [ ] Preferences Page: PASS / FAIL
- [ ] Create/Edit Form: PASS / FAIL

## Security
- [ ] XSS Protection: PASS / FAIL
- [ ] CSRF Protection: PASS / FAIL
- [ ] Authorization: PASS / FAIL
- [ ] Rate Limiting: PASS / FAIL

## Performance
- [ ] Load Time: _____ms (Expected: < 3000ms)
- [ ] Filter Time: _____ms (Expected: < 100ms)
- [ ] Bulk Op Time: _____ms (Expected: < 2000ms)

## Issues Found
1. _______________
2. _______________
3. _______________

## Overall Status: PASS / FAIL
```

---

## 🎯 Quick Smoke Test (5 minutes)

Run these tests to verify basic functionality:

1. **Create a notice** - Should save successfully
2. **View notice list** - Should display with filters
3. **Mark as read** - Should update immediately
4. **Mark all as read** - Should update all
5. **Update preferences** - Should save successfully
6. **Delete notice** - Should remove from list
7. **Apply filters** - Should filter correctly
8. **Trigger rate limit** - Should get 429 after 20 creates

If all pass, system is working! 🎉
