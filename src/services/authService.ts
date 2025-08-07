import { mockExamService } from './mockExamService';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher';
  department?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  async signIn(email: string, password: string): Promise<AuthUser> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check for admin login
    if (email === 'admin@cit.edu' && password === 'admin123') {
      const user: AuthUser = {
        id: 'admin-001',
        email: 'admin@cit.edu',
        name: 'Administrator',
        role: 'admin'
      };
      this.currentUser = user;
      return user;
    }

    // Check for teacher login
    const teacher = await mockExamService.authenticateTeacher(email, password);
    if (teacher) {
      const user: AuthUser = {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        role: 'teacher',
        department: teacher.department
      };
      this.currentUser = user;
      return user;
    }

    throw new Error('Invalid email or password');
  }

  async signOut(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.currentUser;
  }
}

export const authService = new AuthService(); 