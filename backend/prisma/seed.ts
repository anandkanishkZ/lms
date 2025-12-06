import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  try {
    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@lms.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@lms.com',
        phone: '+1234567890',
        role: 'ADMIN',
        password: adminPassword,
        verified: true,
        isActive: true,
      },
    })

    // Create additional admin user
    const superAdminPassword = await bcrypt.hash('superadmin123', 12)
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@lms.com' },
      update: {},
      create: {
        name: 'Super Admin',
        email: 'superadmin@lms.com',
        phone: '+1234567889',
        role: 'ADMIN',
        password: superAdminPassword,
        verified: true,
        isActive: true,
      },
    })

    // Create sample teacher
    const teacherPassword = await bcrypt.hash('teacher123', 12)
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@lms.com' },
      update: {},
      create: {
        name: 'John Teacher',
        email: 'teacher@lms.com',
        phone: '+1234567891',
        role: 'TEACHER',
        password: teacherPassword,
        verified: true,
        isActive: true,
      },
    })

    // Create sample student
    const studentPassword = await bcrypt.hash('student123', 12)
    const student = await prisma.user.upsert({
      where: { email: 'student@lms.com' },
      update: {},
      create: {
        name: 'Jane Student',
        email: 'student@lms.com',
        phone: '+1234567892',
        symbolNo: 'STU001',
        role: 'STUDENT',
        password: studentPassword,
        verified: true,
        isActive: true,
      },
    })

    // Create sample classes
    const class10A = await prisma.class.upsert({
      where: { name_section: { name: 'Class 10-A', section: 'A' } },
      update: {},
      create: {
        name: 'Class 10-A',
        section: 'A',
        description: 'Class 10 Section A',
        isActive: true,
      },
    })

    const class10B = await prisma.class.upsert({
      where: { name_section: { name: 'Class 10-B', section: 'B' } },
      update: {},
      create: {
        name: 'Class 10-B',
        section: 'B',
        description: 'Class 10 Section B',
        isActive: true,
      },
    })

    // Create sample subjects
    const mathematics = await prisma.subject.upsert({
      where: { name: 'Mathematics' },
      update: {},
      create: {
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Advanced Mathematics',
        color: '#3B82F6',
        isActive: true,
      },
    })

    const science = await prisma.subject.upsert({
      where: { name: 'Science' },
      update: {},
      create: {
        name: 'Science',
        code: 'SCI101',
        description: 'General Science',
        color: '#10B981',
        isActive: true,
      },
    })

    const english = await prisma.subject.upsert({
      where: { name: 'English' },
      update: {},
      create: {
        name: 'English',
        code: 'ENG101',
        description: 'English Language and Literature',
        color: '#F59E0B',
        isActive: true,
      },
    })

    // Assign teacher to classes and subjects
    await prisma.teacherClass.upsert({
      where: { teacherId_classId_subjectId: { teacherId: teacher.id, classId: class10A.id, subjectId: mathematics.id } },
      update: {},
      create: {
        teacherId: teacher.id,
        classId: class10A.id,
        subjectId: mathematics.id,
        isActive: true,
      },
    })

    await prisma.teacherClass.upsert({
      where: { teacherId_classId_subjectId: { teacherId: teacher.id, classId: class10B.id, subjectId: mathematics.id } },
      update: {},
      create: {
        teacherId: teacher.id,
        classId: class10B.id,
        subjectId: mathematics.id,
        isActive: true,
      },
    })

    // Assign student to class
    await prisma.studentClass.upsert({
      where: { studentId_classId: { studentId: student.id, classId: class10A.id } },
      update: {},
      create: {
        studentId: student.id,
        classId: class10A.id,
        isActive: true,
      },
    })

    // Create sample modules
    const mathModule = await prisma.module.upsert({
      where: { slug: 'advanced-mathematics' },
      update: {},
      create: {
        title: 'Advanced Mathematics',
        slug: 'advanced-mathematics',
        description: 'Comprehensive course covering advanced mathematical concepts including calculus, algebra, and geometry.',
        subjectId: mathematics.id,
        classId: class10A.id,
        teacherId: teacher.id,
        level: 'INTERMEDIATE',
        duration: 600, // 10 hours in minutes
        status: 'PUBLISHED',
        isFeatured: true,
        isPublic: true,
        publishedAt: new Date(),
      },
    })

    const scienceModule = await prisma.module.upsert({
      where: { slug: 'physics-fundamentals' },
      update: {},
      create: {
        title: 'Physics Fundamentals',
        slug: 'physics-fundamentals',
        description: 'Learn the basic principles of physics including mechanics, thermodynamics, and electromagnetism.',
        subjectId: science.id,
        classId: class10A.id,
        teacherId: teacher.id,
        level: 'BEGINNER',
        duration: 480, // 8 hours in minutes
        status: 'PUBLISHED',
        isFeatured: true,
        isPublic: true,
        publishedAt: new Date(),
      },
    })

    const englishModule = await prisma.module.upsert({
      where: { slug: 'english-literature' },
      update: {},
      create: {
        title: 'English Literature',
        slug: 'english-literature',
        description: 'Explore classic and modern literature with comprehensive analysis and discussions.',
        subjectId: english.id,
        classId: class10A.id,
        teacherId: teacher.id,
        level: 'INTERMEDIATE',
        duration: 540, // 9 hours in minutes
        status: 'PUBLISHED',
        isFeatured: false,
        isPublic: true,
        publishedAt: new Date(),
      },
    })

    // Create sample topics for math module
    const mathTopic1 = await prisma.topic.create({
      data: {
        title: 'Introduction to Calculus',
        description: 'Learn the basics of differential and integral calculus',
        moduleId: mathModule.id,
        orderIndex: 1,
        duration: 120,
        isActive: true,
      },
    })

    const mathTopic2 = await prisma.topic.create({
      data: {
        title: 'Linear Algebra',
        description: 'Matrices, vectors, and linear transformations',
        moduleId: mathModule.id,
        orderIndex: 2,
        duration: 150,
        isActive: true,
      },
    })

    const mathTopic3 = await prisma.topic.create({
      data: {
        title: 'Geometry and Trigonometry',
        description: 'Advanced geometric concepts and trigonometric functions',
        moduleId: mathModule.id,
        orderIndex: 3,
        duration: 130,
        isActive: true,
      },
    })

    // Create sample lessons for first topic
    await prisma.lesson.create({
      data: {
        title: 'What is Calculus?',
        description: 'Introduction to the fundamental concepts of calculus',
        topicId: mathTopic1.id,
        orderIndex: 1,
        duration: 30,
        type: 'VIDEO',
        content: 'Introduction to calculus concepts...',
        isPublished: true,
      },
    })

    await prisma.lesson.create({
      data: {
        title: 'Derivatives',
        description: 'Understanding derivatives and their applications',
        topicId: mathTopic1.id,
        orderIndex: 2,
        duration: 45,
        type: 'VIDEO',
        content: 'Derivatives are fundamental to calculus...',
        isPublished: true,
      },
    })

    await prisma.lesson.create({
      data: {
        title: 'Integrals',
        description: 'Introduction to integration',
        topicId: mathTopic1.id,
        orderIndex: 3,
        duration: 45,
        type: 'VIDEO',
        content: 'Integration is the reverse of differentiation...',
        isPublished: true,
      },
    })

    // Enroll student in modules (enrolledBy is required)
    await prisma.moduleEnrollment.create({
      data: {
        studentId: student.id,
        moduleId: mathModule.id,
        enrolledBy: admin.id,
        progress: 25,
        isActive: true,
      },
    })

    await prisma.moduleEnrollment.create({
      data: {
        studentId: student.id,
        moduleId: scienceModule.id,
        enrolledBy: admin.id,
        progress: 0,
        isActive: true,
      },
    })

    await prisma.moduleEnrollment.create({
      data: {
        studentId: student.id,
        moduleId: englishModule.id,
        enrolledBy: admin.id,
        progress: 60,
        isActive: true,
      },
    })

    // Update module totals
    await prisma.module.update({
      where: { id: mathModule.id },
      data: {
        totalTopics: 3,
        totalLessons: 3,
        enrollmentCount: 1,
      },
    })

    // Create sample notice
    await prisma.notice.create({
      data: {
        title: 'Welcome to Smart School Management System',
        content: 'Welcome to our new school management platform. This system will help streamline all academic activities.',
        category: 'GENERAL',
        priority: 'MEDIUM',
        publishedBy: admin.id,
        isPublished: true,
        publishedAt: new Date(),
      },
    })

    // Create system settings
    const defaultSettings = [
      { key: 'SCHOOL_NAME', value: 'Smart School', description: 'Name of the school' },
      { key: 'SCHOOL_EMAIL', value: 'info@freeeducationinnepal.com.np', description: 'Official school email' },
      { key: 'SCHOOL_PHONE', value: '+1234567890', description: 'Official school phone' },
      { key: 'SCHOOL_ADDRESS', value: '123 Education Street, Learning City', description: 'School address' },
      { key: 'ACADEMIC_YEAR', value: '2024-25', description: 'Current academic year' },
      { key: 'TIMEZONE', value: 'America/New_York', description: 'School timezone' },
    ]

    for (const setting of defaultSettings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      })
    }

    console.log('✅ Seed completed successfully!')
    console.log('\n📋 Default accounts created:')
    console.log('👤 Admin: admin@lms.com / admin123')
    console.log('👨‍🏫 Teacher: teacher@lms.com / teacher123')
    console.log('👩‍🎓 Student: student@lms.com / student123')
    console.log('\n🏫 Sample data:')
    console.log('📚 Classes: Class 10-A, Class 10-B')
    console.log('📖 Subjects: Mathematics, Science, English')
    console.log('� Modules: Advanced Mathematics, Physics Fundamentals, English Literature')
    console.log('📝 Topics: 3 topics with sample lessons created')
    console.log('�📢 Sample notice created')
    console.log('\n🔗 Module URLs:')
    console.log('   /modules/advanced-mathematics')
    console.log('   /modules/physics-fundamentals')
    console.log('   /modules/english-literature')

  } catch (error) {
    console.error('❌ Error during seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })