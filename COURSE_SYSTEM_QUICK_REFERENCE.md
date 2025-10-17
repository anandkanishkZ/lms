# 📋 COURSE SYSTEM - QUICK REFERENCE GUIDE

## For Quick Decision Making & Reference

**Date:** October 17, 2025  
**Purpose:** Fast lookup for key decisions and specifications

---

## 🎯 QUICK ANSWERS

### **Q: What's the main structure?**
**A:** Course → Modules → Lessons → Content

### **Q: How long to build?**
**A:** 3 months (MVP: 2 months)

### **Q: How much will it cost?**
**A:** $30K-$50K dev + $200-$500/month infrastructure

### **Q: What technologies?**
**A:** Same stack (Next.js, Express, PostgreSQL, Prisma)

### **Q: Can we start small?**
**A:** Yes! MVP with core features first

### **Q: Will it work on mobile?**
**A:** Yes, fully responsive design

---

## 📊 DATABASE SUMMARY

### **New Tables:**
| Table | Purpose | Key Fields |
|-------|---------|------------|
| courses | Main course info | title, slug, instructor, status |
| modules | Course sections | title, order, courseId |
| lessons | Learning units | title, contentType, moduleId |
| lesson_attachments | Files | fileUrl, lessonId |
| enrollments | Student registration | studentId, courseId, progress |
| module_progress | Module completion | status, progress%, moduleId |
| lesson_progress | Lesson completion | status, timeSpent, lessonId |
| lesson_notes | Student notes | content, timestamp, lessonId |
| discussions | Q&A forum | content, lessonId, authorId |
| discussion_likes | Engagement | discussionId, userId |
| course_reviews | Ratings | rating, review, courseId |
| course_certificates | Completion docs | certificateNo, pdfUrl, studentId |

**Total: 12 new tables**

---

## 🎨 COLOR SCHEME

| Element | Color | Hex |
|---------|-------|-----|
| Primary | Blue | #2563eb |
| Success | Green | #10b981 |
| Warning | Orange | #f59e0b |
| Error | Red | #ef4444 |
| Locked | Gray | #6b7280 |

---

## 📱 KEY PAGES

### **Student Portal:**
```
/student/courses                    → Browse courses
/student/courses/[slug]             → Course details
/student/courses/my-courses         → My enrolled courses
/student/courses/my-courses/[id]    → Course player
```

### **Teacher Portal:**
```
/teacher/courses                    → My courses
/teacher/courses/create             → Create course
/teacher/courses/[id]/edit          → Edit course
/teacher/courses/[id]/students      → View students
```

### **Admin Portal:**
```
/admin/courses                      → All courses
/admin/courses/pending              → Pending approval
/admin/courses/[id]/view            → View course
```

---

## 🔑 KEY FEATURES CHECKLIST

### **MVP (Must Have):**
- [x] Course CRUD
- [x] Module system
- [x] Lesson types (Video, PDF, Text)
- [x] Student enrollment
- [x] Progress tracking
- [x] Course catalog
- [x] Course player
- [x] Mark complete
- [x] Teacher dashboard
- [x] My courses page

### **Phase 2 (Should Have):**
- [ ] Search & filters
- [ ] Prerequisites
- [ ] Quiz integration
- [ ] Attachments
- [ ] Course reviews
- [ ] Certificates
- [ ] Notes
- [ ] Analytics

### **Phase 3 (Nice to Have):**
- [ ] Discussions
- [ ] Course preview
- [ ] Bookmarks
- [ ] Recommendations
- [ ] Gamification
- [ ] Social sharing

---

## 🚀 API ENDPOINTS SUMMARY

### **Course APIs:**
```
GET    /api/v1/courses              # List courses
GET    /api/v1/courses/:slug        # Get course
POST   /api/v1/courses              # Create (teacher)
PUT    /api/v1/courses/:id          # Update (teacher)
DELETE /api/v1/courses/:id          # Delete (teacher/admin)
POST   /api/v1/courses/:id/enroll   # Enroll (student)
```

### **Module APIs:**
```
POST   /api/v1/courses/:id/modules  # Create module
PUT    /api/v1/modules/:id          # Update module
DELETE /api/v1/modules/:id          # Delete module
```

### **Lesson APIs:**
```
POST   /api/v1/modules/:id/lessons  # Create lesson
PUT    /api/v1/lessons/:id          # Update lesson
DELETE /api/v1/lessons/:id          # Delete lesson
POST   /api/v1/lessons/:id/complete # Mark complete
```

### **Progress APIs:**
```
GET    /api/v1/progress/courses/:id # Course progress
PUT    /api/v1/progress/lessons/:id # Update progress
GET    /api/v1/progress/dashboard   # Student dashboard
```

---

## 💾 FILE STORAGE

### **Recommended Structure:**
```
uploads/
├── courses/
│   ├── thumbnails/
│   │   └── course-123.jpg
│   ├── lessons/
│   │   ├── pdf/
│   │   │   └── lesson-456.pdf
│   │   └── attachments/
│   │       └── attachment-789.zip
│   └── certificates/
│       └── cert-abc.pdf
```

### **Storage Options:**
| Option | Pros | Cons | Cost |
|--------|------|------|------|
| Local Server | Free, full control | Limited space, no CDN | $0 |
| AWS S3 | Scalable, reliable | Pay per GB | ~$100/mo |
| Google Cloud | Easy integration | Setup complexity | ~$80/mo |
| Cloudinary | Media-optimized | Video limits | ~$50/mo |

**Recommendation:** Start local, migrate to cloud if needed

---

## 🎬 VIDEO HOSTING

### **Options:**
| Platform | Pros | Cons | Cost |
|----------|------|------|------|
| YouTube | Free, unlimited | Ads, branding | $0 |
| Vimeo | No ads, professional | Limited free | $7-$75/mo |
| Self-hosted | Full control | Bandwidth cost | Variable |
| Bunny CDN | Fast, affordable | Setup required | ~$1/TB |

**Recommendation:** YouTube for MVP, Vimeo for premium

---

## 🔐 PERMISSIONS MATRIX

| Action | Student | Teacher | Admin |
|--------|---------|---------|-------|
| Browse courses | ✅ | ✅ | ✅ |
| Enroll in course | ✅ | ❌ | ✅ |
| Create course | ❌ | ✅ | ✅ |
| Edit own course | ❌ | ✅ | ✅ |
| Edit any course | ❌ | ❌ | ✅ |
| Delete course | ❌ | ✅ Own | ✅ |
| View progress | ✅ Own | ✅ Students | ✅ All |
| Approve course | ❌ | ❌ | ✅ |
| Feature course | ❌ | ❌ | ✅ |
| Generate certificate | ✅ Own | ❌ | ✅ |

---

## ⏱️ TIMELINE

### **3-Month Plan:**
| Phase | Duration | Tasks |
|-------|----------|-------|
| Sprint 1 | 2 weeks | Database + Basic APIs |
| Sprint 2 | 2 weeks | Student portal |
| Sprint 3 | 2 weeks | Teacher portal |
| Sprint 4 | 2 weeks | Advanced features |
| Sprint 5 | 2 weeks | Interactions |
| Sprint 6 | 2 weeks | Admin + Analytics |
| Sprint 7 | 2 weeks | Testing + Polish |

### **2-Month MVP:**
| Phase | Duration | Tasks |
|-------|----------|-------|
| Week 1-2 | 2 weeks | Database + Core APIs |
| Week 3-4 | 2 weeks | Student features |
| Week 5-6 | 2 weeks | Teacher features |
| Week 7-8 | 2 weeks | Testing + Launch |

---

## 📈 SUCCESS METRICS

### **Week 1:**
- [ ] Database migrated successfully
- [ ] Basic APIs working
- [ ] Can create a course

### **Month 1:**
- [ ] Students can enroll
- [ ] Video playback works
- [ ] Progress tracking functional

### **Month 2:**
- [ ] Teachers can create courses
- [ ] 10+ test courses created
- [ ] 50+ test enrollments

### **Month 3:**
- [ ] All features complete
- [ ] 100+ real courses
- [ ] 500+ enrollments
- [ ] Ready for production

---

## 🚨 CRITICAL DECISIONS NEEDED

### **Before Starting:**

1. **Video Hosting?**
   - [ ] YouTube (Free)
   - [ ] Vimeo (Paid)
   - [ ] Self-hosted
   - [ ] Decide: __________

2. **File Storage?**
   - [ ] Local Server
   - [ ] AWS S3
   - [ ] Google Cloud
   - [ ] Decide: __________

3. **Course Access?**
   - [ ] Free for all
   - [ ] Class-restricted
   - [ ] Paid courses
   - [ ] Decide: __________

4. **Approval Process?**
   - [ ] Auto-publish
   - [ ] Admin approval required
   - [ ] Decide: __________

5. **Timeline?**
   - [ ] 3 months (Full)
   - [ ] 2 months (MVP)
   - [ ] Custom: __________

---

## 🛠️ TECH STACK

### **No Changes Needed:**
- ✅ Next.js 15
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Express.js
- ✅ PostgreSQL
- ✅ Prisma ORM

### **Additional Packages:**
```json
{
  "react-player": "^2.13.0",        // Video player
  "react-pdf": "^7.5.1",            // PDF viewer
  "react-quill": "^2.0.0",          // Rich text editor
  "recharts": "^2.10.0",            // Analytics charts
  "date-fns": "^2.30.0"             // Date formatting
}
```

---

## 💡 BEST PRACTICES

### **DO:**
✅ Use Prisma for all database queries  
✅ Validate all inputs with Zod  
✅ Implement proper error handling  
✅ Add loading states everywhere  
✅ Make it mobile-responsive  
✅ Test on real devices  
✅ Use TypeScript strictly  
✅ Keep components small  
✅ Comment complex logic  
✅ Use consistent naming  

### **DON'T:**
❌ Store videos in database  
❌ Allow direct file access  
❌ Skip input validation  
❌ Forget error boundaries  
❌ Ignore accessibility  
❌ Use any type  
❌ Write duplicate code  
❌ Skip testing  
❌ Forget to backup database  
❌ Deploy without testing  

---

## 📞 ESCALATION POINTS

### **If You Encounter:**

**Database Issues:**
- Review migration files
- Check Prisma schema
- Verify relationships
- Backup before changes

**Performance Problems:**
- Add database indexes
- Implement pagination
- Use caching (Redis)
- Optimize queries

**Video Issues:**
- Check embed restrictions
- Verify API keys
- Test different formats
- Consider CDN

**File Upload Issues:**
- Check file size limits
- Verify MIME types
- Check storage space
- Review Multer config

---

## 🎯 DEFINITION OF DONE

### **Feature is Complete When:**
- [ ] Code written and reviewed
- [ ] Database updated
- [ ] API tested (Postman/Insomnia)
- [ ] Frontend implemented
- [ ] Mobile responsive
- [ ] Error handling added
- [ ] Loading states added
- [ ] TypeScript types defined
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] QA tested
- [ ] Approved by stakeholder

---

## 📚 REFERENCE LINKS

### **Documentation:**
- Prisma: https://prisma.io/docs
- Next.js: https://nextjs.org/docs
- React Player: https://github.com/cookpete/react-player
- Zod: https://zod.dev

### **Inspiration:**
- Udemy: https://udemy.com
- Coursera: https://coursera.org
- Canvas LMS: https://canvas.instructure.com

---

## 🎉 QUICK START COMMANDS

### **Database:**
```bash
# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### **Development:**
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

### **Testing:**
```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## ✅ PRE-APPROVAL CHECKLIST

Before we proceed, confirm:

- [ ] I understand the system architecture
- [ ] I approve the database design
- [ ] I understand the timeline (3 months)
- [ ] I understand the cost estimates
- [ ] I've answered critical decisions
- [ ] I approve the feature list
- [ ] I approve the UI/UX approach
- [ ] I'm ready to start development

**Sign-off Date:** __________  
**Approved By:** __________

---

## 📞 CONTACT & SUPPORT

**Questions?** Ask anytime!  
**Issues?** Document and report  
**Updates?** Weekly status meetings  
**Changes?** Submit change request  

---

*Quick Reference Guide*  
*Version 1.0*  
*Created: October 17, 2025*
