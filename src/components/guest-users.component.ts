
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { User, UserService, UserGroup } from '../services/user.service';


@Component({
  selector: 'app-guest-users',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-800">Guest Users</h2>
        <button (click)="openAddModal()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
          Add Guest User
        </button>
      </div>
      
      <!-- Guest Users Table -->
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3">Name</th>
                <th scope="col" class="px-6 py-3">User Group</th>
                <th scope="col" class="px-6 py-3">Status</th>
                <th scope="col" class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of guestUsers(); track user.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    <div class="flex items-center">
                      <img class="w-10 h-10 rounded-full" [src]="user.avatar" alt="Avatar">
                      <div class="pl-3">
                        <div class="text-base font-semibold">{{ user.name }}</div>
                        <div class="font-normal text-slate-500">{{ user.email }}</div>
                      </div>  
                    </div>
                  </td>
                  <td class="px-6 py-4">{{ user.userGroup }}</td>
                  <td class="px-6 py-4">
                    <span 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                      [class]="user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-4">
                      <button (click)="openEditModal(user)" class="text-slate-500 hover:text-green-600" title="Edit Guest User">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <button (click)="promptDelete(user)" class="text-slate-500 hover:text-red-600" title="Delete Guest User">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-slate-500">No guest users found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" (click)="closeModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-semibold text-slate-800">{{ userToEdit() ? 'Edit Guest User' : 'Add Guest User' }}</h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form [formGroup]="guestUserForm" (ngSubmit)="onSubmit()">
            <div class="p-6 space-y-6">
               <div>
                  <label for="name" class="block text-sm font-medium text-slate-700">Full Name</label>
                  <input type="text" id="name" formControlName="name" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3" placeholder="Enter full name">
                </div>
              <div>
                <label for="add-email" class="block text-sm font-medium text-slate-700">Email</label>
                <input type="email" id="add-email" formControlName="email" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3" placeholder="Enter email address">
              </div>

              @if (!userToEdit()) {
                <div>
                  <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
                  <input type="password" id="password" formControlName="password" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3" placeholder="Enter a secure password">
                </div>
              }

              <div class="grid grid-cols-1" [class.md:grid-cols-2]="userToEdit()" [class.gap-6]="userToEdit()">
                <div>
                  <label for="userGroup" class="block text-sm font-medium text-slate-700">User Group</label>
                  <select id="userGroup" formControlName="userGroupId" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
                    <option value="" disabled>Select a user group</option>
                    @for(group of userGroups(); track group.id) {
                      <option [value]="group.id">{{ group.name }}</option>
                    }
                  </select>
                </div>
                @if (userToEdit()) {
                  <div>
                    <label for="status" class="block text-sm font-medium text-slate-700">Status</label>
                    <select id="status" formControlName="status" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
                      @for(status of statuses; track status) {
                        <option [value]="status">{{ status }}</option>
                      }
                    </select>
                  </div>
                }
              </div>
            </div>
            <div class="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg">
              <button (click)="closeModal()" type="button" class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancel</button>
              <button type="submit" [disabled]="guestUserForm.invalid" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                {{ userToEdit() ? 'Update User' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (userToDelete(); as user) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="cancelDelete()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-start p-6">
            <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <h3 class="text-lg leading-6 font-medium text-slate-900">Delete Guest User</h3>
              <div class="mt-2">
                <p class="text-sm text-slate-500">
                  Are you sure you want to permanently delete <strong>{{ user.name }}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
           @if(deleteError()) {
            <div class="px-6 pb-4">
                <div class="bg-red-50 border border-red-200 text-sm text-red-800 rounded-md p-3" role="alert">
                    <span class="font-bold">Operation Failed:</span> {{ deleteError() }}
                </div>
            </div>
          }
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button (click)="cancelDelete()" type="button" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
              Cancel
            </button>
            <button (click)="confirmDelete()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class GuestUsersComponent {
  private readonly userService = inject(UserService);

  showModal = signal(false);
  userToEdit = signal<User | null>(null);
  userToDelete = signal<User | null>(null);
  deleteError = signal<string | null>(null);
  
  guestUsers = computed(() => this.userService.users().filter(u => !u.employeeId));
  userGroups = this.userService.userGroups;
  statuses: User['status'][] = ['Active', 'Inactive'];

  guestUserForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    userGroupId: new FormControl('', Validators.required),
    status: new FormControl<User['status']>('Active'),
  });

  // --- Modal Management ---
  openAddModal(): void {
    this.userToEdit.set(null);
    this.guestUserForm.reset({ name: '', email: '', password: '', userGroupId: '', status: 'Active' });
    this.guestUserForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.guestUserForm.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.userToEdit.set(user);
    const userGroup = this.userGroups().find(ug => ug.name === user.userGroup);
    this.guestUserForm.reset({
      name: user.name,
      email: user.email,
      password: '',
      userGroupId: userGroup?.id || '',
      status: user.status
    });
    this.guestUserForm.get('password')?.clearValidators();
    this.guestUserForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.guestUserForm.invalid) return;

    const formValue = this.guestUserForm.getRawValue();
    const selectedGroup = this.userGroups().find(g => g.id === formValue.userGroupId);
    
    if (!selectedGroup) {
        console.error("Selected user group not found");
        return;
    }

    if (this.userToEdit()) { // EDIT MODE
      const currentUser = this.userToEdit()!;
      const updatedUser: User = { 
        ...currentUser,
        name: formValue.name!,
        email: formValue.email!,
        userGroup: selectedGroup.name,
        status: formValue.status!,
     };
      this.userService.updateUser(updatedUser);
    } else { // ADD MODE
      this.userService.addUser({
        name: formValue.name!,
        email: formValue.email!,
        userGroup: selectedGroup.name,
        status: 'Active',
        avatar: `https://picsum.photos/seed/${formValue.email}/200/200`, // Generate a consistent avatar
        // No employeeId for guest users
      });
    }
    this.closeModal();
  }

  // --- Delete Logic ---
  promptDelete(user: User): void {
    this.userToDelete.set(user);
    this.deleteError.set(null);
  }

  cancelDelete(): void {
    this.userToDelete.set(null);
    this.deleteError.set(null);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (user) {
      try {
        this.userService.deleteUser(user.id);
        this.cancelDelete();
      } catch (error: any) {
        this.deleteError.set(error.message);
      }
    }
  }
}
