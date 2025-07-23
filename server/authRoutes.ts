import { Router } from 'express';
import { loginSchema, registerSchema, type LoginRequest, type RegisterRequest } from '@shared/schema';
import { storage } from './storage';
import { generateToken, hashPassword, comparePassword, authenticateToken, type AuthRequest } from './auth';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body) as RegisterRequest;
    
    // Check if user already exists
    const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user (exclude confirmPassword from the data sent to storage)
    const { confirmPassword, ...userData } = validatedData;
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(newUser.id, newUser.username, newUser.email, newUser.role);

    // Return user data (without password) and token
    const { password, ...userResponse } = newUser;
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token,
    });
  } catch (error: any) {
    if (error.errors) {
      // Zod validation error
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body) as LoginRequest;
    
    // Find user by username
    const user = await storage.getUserByUsername(validatedData.username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is disabled' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.username, user.email, user.role);

    // Return user data (without password) and token
    const { password, ...userResponse } = user;
    res.json({
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error: any) {
    if (error.errors) {
      // Zod validation error
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user endpoint (protected)
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data without password
    const { password, ...userResponse } = user;
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint (client-side token removal is sufficient for JWT)
router.post('/logout', authenticateToken, (req: AuthRequest, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;