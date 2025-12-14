import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: number;
  name: string;
  email: string;
  userGroup: string;
  status: 'Active' | 'Inactive';
  avatar: string;
  employeeId?: string; // Link back to the employee
}

export interface UserGroup {
    id: string;
    name: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _users = signal<User[]>([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', userGroup: 'System Administrators', status: 'Active', avatar: 'https://picsum.photos/id/1005/200/200', employeeId: 'EMP001' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', userGroup: 'HR Managers', status: 'Active', avatar: 'https://picsum.photos/id/1011/200/200', employeeId: 'EMP002' },
    { id: 3, name: 'Susan Wilson', email: 'susan.wilson@example.com', userGroup: 'Team Leads', status: 'Inactive', avatar: 'https://picsum.photos/id/1027/200/200', employeeId: 'EMP003' },
    { id: 4, name: 'External Auditor', email: 'auditor@ext.com', userGroup: 'Guest', status: 'Active', avatar: 'https://picsum.photos/id/1040/200/200' },
    { id: 5, name: 'Temp Contractor', email: 'contractor@temp.com', userGroup: 'Guest', status: 'Inactive', avatar: 'https://picsum.photos/id/1041/200/200' },
  ]);
  
  private readonly _userGroups = signal<UserGroup[]>([
      { id: 'ug1', name: 'System Administrators' },
      { id: 'ug2', name: 'HR Managers' },
      { id: 'ug3', name: 'Team Leads' },
      { id: 'ug4', name: 'Standard Employee' },
      { id: 'ug5', name: 'Guest' },
      { id: 'ug6', name: 'Accounts' },
  ]);

  // Hardcode the current user's ID for simulation purposes.
  // In a real application, this would be set dynamically upon user login.
  private readonly _currentUserId = signal<number>(1); // John Doe is logged in

  private _nextId = signal(7);

  public readonly users = this._users.asReadonly();
  public readonly userGroups = this._userGroups.asReadonly();
  public readonly currentUser = computed(() => this._users().find(u => u.id === this._currentUserId()));

  addUser(user: Omit<User, 'id'>): void {
    const newUser: User = { ...user, id: this._nextId() };
    this._users.update(users => [...users, newUser]);
    this._nextId.update(id => id + 1);
  }

  updateUser(updatedUser: User): void {
    this._users.update(users => 
      users.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
  }

  deleteUser(userId: number): void {
    if (userId === this._currentUserId()) {
      throw new Error('You cannot delete the currently logged-in user.');
    }
    this._users.update(users => users.filter(u => u.id !== userId));
  }
}