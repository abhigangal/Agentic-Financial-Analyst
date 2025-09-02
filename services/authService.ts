import { User } from '../types';

const USERS_STORAGE_KEY = 'agentic_financial_analyst_users';
const SESSION_STORAGE_KEY = 'agentic_financial_analyst_session';

// This is a mock authentication service that uses localStorage to simulate a database.
// In a real application, this would be replaced with actual API calls to a secure backend.
class AuthService {
  private users: User[] = [];

  constructor() {
    this._loadUsers();
  }

  private _loadUsers() {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        // Initialize with a default premium user for testing
        this.users = [
          { email: 'user@premium.com', role: 'premium' },
          { email: 'user@free.com', role: 'free' },
        ];
        this._saveUsers();
      }
    } catch (e) {
      console.error("Failed to load users from localStorage", e);
      this.users = [];
    }
  }

  private _saveUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.error("Failed to save users to localStorage", e);
    }
  }

  public async login(email: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("User not found. Please sign up first."));
        }
      }, 500);
    });
  }

  public async signup(email: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          reject(new Error("User already exists with this email."));
          return;
        }
        
        // New users get the 'free' role by default
        const newUser: User = {
          email: email.toLowerCase(),
          role: 'free'
        };

        // Special case for the demo premium account
        if (email.toLowerCase() === 'user@premium.com') {
            newUser.role = 'premium';
        }

        this.users.push(newUser);
        this._saveUsers();
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
        resolve(newUser);
      }, 500);
    });
  }

  public async logout(): Promise<void> {
    return new Promise((resolve) => {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        resolve();
    });
  }

  public getCurrentUser(): User | null {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        return JSON.parse(session);
      }
      return null;
    } catch (e) {
      console.error("Failed to get current user from localStorage", e);
      return null;
    }
  }
}

export const authService = new AuthService();
