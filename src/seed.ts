import { db } from './db/index.js';
import { users } from './db/schema/index.js';
import { hashPassword } from './utils/password.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Admin account details
  const adminEmail = 'admin@projectw.com';
  const adminPassword = 'admin123'; // Change this in production!
  const adminName = 'Admin User';

  try {
    // Check if admin already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (existingAdmin) {
      console.log('⚠️  Admin account already exists:', adminEmail);
      console.log('   Skipping seed...');
      process.exit(0);
    }

    // Hash the password
    const passwordHash = await hashPassword(adminPassword);

    // Create admin user
    const [newAdmin] = await db
      .insert(users)
      .values({
        email: adminEmail,
        passwordHash,
        name: adminName,
      })
      .returning();

    console.log('✅ Admin account created successfully!');
    console.log('   Email:', newAdmin.email);
    console.log('   Name:', newAdmin.name);
    console.log('   Password:', adminPassword);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the admin password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
