import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUsers() {
  console.log('🔐 Creating admin users...')

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

    console.log('✅ Admin users created successfully!')
    console.log('📧 Admin credentials:')
    console.log('   Email: admin@lms.com | Password: admin123')
    console.log('   Email: superadmin@lms.com | Password: superadmin123')
  } catch (error) {
    console.error('❌ Error creating admin users:', error)
    throw error
  }
}

async function main() {
  await createAdminUsers()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })