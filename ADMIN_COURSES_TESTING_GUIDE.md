# Quick Testing Guide - Admin Courses CRUD

**Last Updated**: Current Session  
**Status**: ✅ Ready for Testing  
**Testing Time**: 15 minutes

---

## 🚀 Quick Start Testing

### Prerequisites
```bash
# 1. Start Backend (Terminal 1)
cd backend
npm run dev

# 2. Start Frontend (Terminal 2)
cd frontend
npm run dev

# 3. Open Browser
# Navigate to: http://localhost:3000/admin
```

---

## 📋 Test Scenarios

### ✅ Test 1: Access Courses Page (2 min)
**Goal**: Verify navigation and page loads

1. Log in as admin
2. Click "Courses" in left sidebar
3. **Expected**:
   - Page loads at `/admin/courses`
   - See grid of course cards
   - See "Create Course" button (top right)
   - See search box and filters
   - See pagination if > 12 courses

**Pass Criteria**: ✅ Page loads without errors, courses visible

---

### ✅ Test 2: Search & Filter (3 min)
**Goal**: Verify search and filtering works

1. On courses page, type in search box: "Math"
2. **Expected**: Only courses with "Math" in title/description show
3. Clear search, select "Mathematics" from Category filter
4. **Expected**: Only Mathematics courses show
5. Select "Beginner" from Level filter
6. **Expected**: Only beginner-level courses show

**Pass Criteria**: ✅ Filters update course list correctly

---

### ✅ Test 3: View Course Detail (2 min)
**Goal**: Verify detail page loads with all data

1. Click any course card from listing
2. **Expected**:
   - Navigate to `/admin/courses/[id]`
   - See course title, description, thumbnail
   - See instructor info (name, avatar)
   - See stats: enrolled count, views, rating
   - See action buttons: Back, Manage Enrollments, Edit, Delete
   - See topics list (if course has topics)
   - See lessons under each topic

**Pass Criteria**: ✅ All course data displays correctly

---

### ✅ Test 4: Create New Course (5 min)
**Goal**: Verify course creation form works

1. Click "Create Course" button (on listing page)
2. **Expected**: Navigate to `/admin/courses/create`
3. Fill in form:
   ```
   Title: "Test Course - React Basics"
   Description: "Learn React fundamentals"
   Thumbnail URL: "https://picsum.photos/800/400"
   Subject: "Computer Science"
   Class: "Class 10"
   Teacher: "John Doe"
   Duration: 40 (hours)
   Level: "Beginner"
   Status: "DRAFT"
   Price: 99.99
   Tags: Type "react" press Enter, type "javascript" press Enter
   ```
4. Click "Save as Draft"
5. **Expected**:
   - Success toast: "Course saved as draft successfully"
   - Redirect to course detail page
   - Course shows with DRAFT status

**Pass Criteria**: ✅ Course created and saved to database

---

### ✅ Test 5: Create & Publish Course (3 min)
**Goal**: Verify publishing workflow

1. Click "Create Course" again
2. Fill in form (use different title)
3. Change Status to "PUBLISHED"
4. Click "Create Course" (not "Save as Draft")
5. **Expected**:
   - Success toast: "Course created successfully"
   - Redirect to detail page
   - Course shows with PUBLISHED status
6. Click "Back to Courses"
7. **Expected**: New course appears in listing

**Pass Criteria**: ✅ Published course visible in listing

---

## 🐛 Edge Case Testing

### Test 6: Form Validation (2 min)
1. Go to `/admin/courses/create`
2. Click "Create Course" without filling anything
3. **Expected**: Error toast "Please enter a course title"
4. Fill only title, click "Create Course"
5. **Expected**: Error toast "Please enter a course description"
6. Fill title + description, click "Create Course"
7. **Expected**: Error toast "Please select a subject"

**Pass Criteria**: ✅ All required fields validated

---

### Test 7: Invalid Course ID (1 min)
1. Navigate to `/admin/courses/invalid-id-12345`
2. **Expected**: "Course not found" message appears

**Pass Criteria**: ✅ Handles non-existent course gracefully

---

### Test 8: Navigation Flow (2 min)
1. Start at `/admin/courses` (listing)
2. Click course → go to detail page
3. Click "Back to Courses" → return to listing
4. Click "Create Course" → go to form page
5. Click "Back to Courses" → return to listing
6. Click course → detail page
7. Refresh page → stays on same page

**Pass Criteria**: ✅ All navigation works correctly

---

## 📊 Test Results Template

Copy this table and mark your results:

| Test | Status | Time | Notes |
|------|--------|------|-------|
| 1. Access Courses Page | ⬜ | ___ min | |
| 2. Search & Filter | ⬜ | ___ min | |
| 3. View Course Detail | ⬜ | ___ min | |
| 4. Create New Course | ⬜ | ___ min | |
| 5. Create & Publish | ⬜ | ___ min | |
| 6. Form Validation | ⬜ | ___ min | |
| 7. Invalid Course ID | ⬜ | ___ min | |
| 8. Navigation Flow | ⬜ | ___ min | |
| **TOTAL** | **__/8** | **___ min** | |

**Legend**: ✅ = Pass | ❌ = Fail | ⏭️ = Skipped

---

## 🔍 What to Check

### Visual Checks
- ✅ Layout looks professional
- ✅ Cards have proper spacing
- ✅ Buttons have icons and labels
- ✅ Forms are well-aligned
- ✅ Loading spinners appear during data fetch
- ✅ No console errors

### Functional Checks
- ✅ Search updates results
- ✅ Filters work correctly
- ✅ Pagination changes pages
- ✅ Course detail loads correct data
- ✅ Form validation works
- ✅ Course creation saves to DB
- ✅ Toast notifications appear
- ✅ Navigation works smoothly

### Data Checks
- ✅ Course title displays correctly
- ✅ Instructor name shows (or "Unknown")
- ✅ Stats show numbers (not undefined)
- ✅ Topics and lessons render
- ✅ Tags appear as badges
- ✅ Status badge shows correct color

---

## 🚨 Common Issues & Fixes

### Issue: "Cannot connect to backend"
**Fix**: 
```bash
# Check if backend is running on port 5000
cd backend
npm run dev

# Verify API URL in frontend/.env:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Issue: "Courses not loading"
**Fix**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Check if `/api/modules` request succeeds
5. If 401 error → log in again
6. If 500 error → check backend logs

### Issue: "Form submission fails"
**Fix**:
1. Check console for errors
2. Verify all required fields filled
3. Check Network tab for API response
4. Verify backend is running
5. Check if you're logged in as admin

### Issue: "TypeScript errors"
**Fix**:
```bash
cd frontend
npm run type-check
# If errors, check imports and component props
```

---

## 📱 Responsive Testing (Optional)

If you have extra time, test on different screen sizes:

### Desktop (1920x1080)
- Grid shows 3-4 columns
- All buttons visible
- Sidebar always visible

### Tablet (768x1024)
- Grid shows 2 columns
- Sidebar may collapse
- Forms still readable

### Mobile (375x667)
- Grid shows 1 column
- Sidebar becomes hamburger menu
- Forms stack vertically

---

## ✅ Success Criteria

**Test is SUCCESSFUL if**:
- ✅ All 8 tests pass
- ✅ No console errors
- ✅ All pages load in < 2 seconds
- ✅ Forms validate correctly
- ✅ Data saves to database
- ✅ Navigation works smoothly
- ✅ UI looks professional

**Test FAILS if**:
- ❌ Pages don't load
- ❌ Errors in console
- ❌ Forms don't validate
- ❌ Data doesn't save
- ❌ Navigation broken
- ❌ UI looks broken

---

## 📸 Screenshot Checklist

Take screenshots of these for documentation:

1. **Courses Listing Page** - Full grid view
2. **Search Results** - After typing "Math"
3. **Course Detail Page** - Full course view
4. **Create Form - Empty** - Before filling
5. **Create Form - Filled** - Ready to submit
6. **Create Form - Validation** - Show error message
7. **Course Created Success** - Toast notification
8. **New Course in List** - After creation

---

## 🎯 Next Testing Phase

After these tests pass, move to:

1. **Edit Course** (when edit page is created)
2. **Delete Course** (when confirmation modal is added)
3. **Topic Management** (when topic pages are created)
4. **Lesson Management** (when lesson pages are created)
5. **Enrollment Management**

---

## 📞 Report Issues

If you find bugs, create issue with:

```markdown
**Issue**: [Brief description]
**Page**: [URL where issue occurs]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen]
**Actual**: [What actually happens]
**Console Errors**: [Copy any errors]
**Screenshot**: [Attach if possible]
```

---

## ⏱️ Estimated Testing Time

| Phase | Time |
|-------|------|
| Setup | 2 min |
| Core Tests (1-5) | 10 min |
| Edge Cases (6-8) | 5 min |
| Documentation | 3 min |
| **TOTAL** | **~20 min** |

---

## 🎉 Testing Complete!

Once all tests pass:
1. ✅ Mark all tests as passed
2. ✅ Take screenshots
3. ✅ Document any issues found
4. ✅ Report to team
5. ✅ Move to next feature

---

*Happy Testing! 🚀*  
*Questions? Check ADMIN_COURSES_CRUD_COMPLETE.md for details*
