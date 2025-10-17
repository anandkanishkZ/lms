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
      where: { email: 'teacher@smartschool.com' },
      update: {},
      create: {
        name: 'John Teacher',
        email: 'teacher@smartschool.com',
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
      where: { email: 'student@smartschool.com' },
      update: {},
      create: {
        name: 'Jane Student',
        email: 'student@smartschool.com',
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
      where: { name_section: { name: 'Class 10', section: 'A' } },
      update: {},
      create: {
        name: 'Class 10',
        section: 'A',
        description: 'Class 10 Section A',
        isActive: true,
      },
    })

    const class10B = await prisma.class.upsert({
      where: { name_section: { name: 'Class 10', section: 'B' } },
      update: {},
      create: {
        name: 'Class 10',
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
      { key: 'SCHOOL_EMAIL', value: 'info@smartschool.com', description: 'Official school email' },
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
    console.log('👤 Admin: admin@smartschool.com / admin123')
    console.log('👨‍🏫 Teacher: teacher@smartschool.com / teacher123')
    console.log('👩‍🎓 Student: student@smartschool.com / student123')
    console.log('\n🏫 Sample data:')
    console.log('📚 Classes: Class 10-A, Class 10-B')
    console.log('📖 Subjects: Mathematics, Science, English')
    console.log('📢 Sample notice created')

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