import { storage } from './storage';
import { hashPassword } from './auth';

async function createTestUser() {
  try {
    const hashedPassword = await hashPassword('admin123');
    
    const testUser = await storage.createUser({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });
    
    console.log('Test user created successfully:', testUser);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();