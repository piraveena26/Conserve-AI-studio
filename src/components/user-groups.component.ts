
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

interface Permission {
  id: string;
  name: string;
  module: string;
}

interface UserGroup {
  id: number;
  name:string;
  description: string;
  permissions: string[]; // Array of permission IDs
}

@Component({
  selector: 'app-user-groups',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-800">User Groups</h2>
        <button (click)="openModal(null)" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
          Add User Group
        </button>
      </div>

      <!-- User Groups Table -->
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3">Group Name</th>
                <th scope="col" class="px-6 py-3">Description</th>
                <th scope="col" class="px-6 py-3">Permissions</th>
                <th scope="col" class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (group of userGroups(); track group.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4 font-medium text-slate-900">{{ group.name }}</td>
                  <td class="px-6 py-4 text-slate-600 max-w-sm truncate">{{ group.description }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-semibold text-indigo-800 bg-indigo-100 rounded-full">
                      {{ group.permissions.length }} assigned
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-4">
                      <button (click)="openModal(group)" class="text-slate-500 hover:text-indigo-600" title="Edit User Group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <button (click)="promptDelete(group)" class="text-slate-500 hover:text-red-600" title="Delete User Group">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                 <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-slate-500">No user groups found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if(showModal()) {
       <div class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" (click)="closeModal()"></div>
       <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-semibold text-slate-800">{{ editingGroup() ? 'Edit User Group' : 'Create User Group' }}</h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="p-6 flex-grow overflow-y-auto">
            <form [formGroup]="userGroupForm" class="space-y-6">
              <div>
                <label for="groupName" class="block text-sm font-medium text-slate-700">User Group Name</label>
                <input type="text" id="groupName" formControlName="name" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3">
              </div>
              <div>
                <label for="description" class="block text-sm font-medium text-slate-700">Description</label>
                <textarea id="description" formControlName="description" rows="3" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3"></textarea>
              </div>

              <!-- Permissions Section -->
              <div class="grid grid-cols-2 gap-6">
                <!-- Available Permissions -->
                <div>
                  <h4 class="text-lg font-semibold text-slate-700 mb-2">Available Permissions</h4>
                  <div class="border rounded-md h-96 overflow-y-auto p-2 space-y-1 bg-slate-50">
                    @for(module of availablePermissionsByModule(); track module[0]) {
                      <div>
                        <button type="button" (click)="toggleModule(module[0])" class="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-200 text-left font-semibold text-sm text-slate-700 transition-colors">
                          <span>{{ module[0] }}</span>
                          <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!expandedModules().has(module[0])" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                          </svg>
                        </button>
                        @if(expandedModules().has(module[0])) {
                          <div class="pl-4 py-1">
                            @for(permission of module[1]; track permission.id) {
                              <div (click)="addPermission(permission)" class="flex items-center justify-between p-2 rounded-md hover:bg-indigo-100 cursor-pointer text-sm transition-colors">
                                <span class="text-slate-600">{{ permission.name }}</span>
                                <button type="button" class="text-indigo-500 hover:text-indigo-700" title="Add Permission">
                                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </button>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    } @empty {
                       <div class="text-center text-slate-500 p-8 h-full flex items-center justify-center">All permissions have been assigned.</div>
                    }
                  </div>
                </div>
                <!-- Assigned Permissions -->
                <div>
                  <h4 class="text-lg font-semibold text-slate-700 mb-2">Assigned Permissions</h4>
                  <div class="border rounded-md h-96 overflow-y-auto p-2 space-y-2">
                    <div formArrayName="permissions">
                        @for(permission of assignedPermissionsInForm(); track permission.id) {
                          <div class="flex items-center justify-between p-2 rounded-md bg-white border text-sm">
                              <span class="text-slate-800">{{ permission.name }}</span>
                              <button type="button" (click)="removePermissionById(permission.id)" class="text-red-500 hover:text-red-700" title="Remove Permission">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" /></svg>
                              </button>
                          </div>
                        } @empty {
                          <div class="text-center text-slate-500 p-8 h-full flex items-center justify-center">No permissions assigned.</div>
                        }
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg">
            <button (click)="closeModal()" type="button" class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancel</button>
            <button (click)="onSubmit()" [disabled]="userGroupForm.invalid" type="submit" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
              {{ editingGroup() ? 'Update Group' : 'Create Group' }}
            </button>
          </div>
        </div>
       </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (groupToDelete(); as group) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50" (click)="cancelDelete()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="flex items-start p-6">
             <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100"><svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
             <div class="ml-4 text-left">
                <h3 class="text-lg font-medium text-slate-900">Delete User Group</h3>
                <p class="text-sm text-slate-500 mt-2">Are you sure you want to delete <strong>{{ group.name }}</strong>? This action is permanent.</p>
             </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button (click)="cancelDelete()" class="px-4 py-2 text-sm font-medium bg-white border rounded-md">Cancel</button>
            <button (click)="confirmDelete()" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">Yes, Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class UserGroupsComponent {
  showModal = signal(false);
  editingGroup = signal<UserGroup | null>(null);
  groupToDelete = signal<UserGroup | null>(null);
  expandedModules = signal<Set<string>>(new Set());
  private nextId = signal(4);

  // This signal now drives the UI reactivity for permissions
  assignedPermissionIds = signal<string[]>([]);

  allPermissions = signal<Permission[]>([
    { id: 'employee:read', name: 'View Employees', module: 'Employee Management' },
    { id: 'employee:create', name: 'Add Employees', module: 'Employee Management' },
    { id: 'employee:update', name: 'Edit Employees', module: 'Employee Management' },
    { id: 'employee:delete', name: 'Delete Employees', module: 'Employee Management' },
    { id: 'department:manage', name: 'Manage Departments', module: 'Employee Management' },
    { id: 'designation:manage', name: 'Manage Designations', module: 'Employee Management' },
    { id: 'user:read', name: 'View Users', module: 'User Management' },
    { id: 'user:create', name: 'Add Users', module: 'User Management' },
    { id: 'user:update', name: 'Edit Users', module: 'User Management' },
    { id: 'user:delete', name: 'Delete Users', module: 'User Management' },
    { id: 'usergroup:manage', name: 'Manage User Groups', module: 'User Management' },
    { id: 'company:manage', name: 'Manage Company Details', module: 'System Configuration' },
    { id: 'location:manage', name: 'Manage Locations', module: 'System Configuration' },
  ]);

  userGroups = signal<UserGroup[]>([
    { id: 1, name: 'System Administrators', description: 'Has all permissions to manage the system.', permissions: ['employee:read', 'employee:create', 'employee:update', 'employee:delete', 'user:read', 'user:create', 'user:update', 'user:delete', 'usergroup:manage', 'company:manage', 'location:manage'] },
    { id: 2, name: 'HR Managers', description: 'Can manage employee and user data.', permissions: ['employee:read', 'employee:create', 'employee:update', 'user:read', 'user:create'] },
    { id: 3, name: 'Team Leads', description: 'Can view employee data within their team.', permissions: ['employee:read'] }
  ]);

  userGroupForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    permissions: new FormArray<FormControl<string>>([])
  });

  get permissionsFormArray() {
    return this.userGroupForm.get('permissions') as FormArray;
  }
  
  assignedPermissionsInForm = computed(() => {
    const assignedIds = new Set(this.assignedPermissionIds());
    return this.allPermissions().filter(p => assignedIds.has(p.id));
  });

  availablePermissionsByModule = computed(() => {
    const assignedIds = new Set(this.assignedPermissionIds());
    const available = this.allPermissions().filter(p => !assignedIds.has(p.id));
    
    // Group by module
    const grouped = new Map<string, Permission[]>();
    for(const permission of available) {
      if (!grouped.has(permission.module)) {
        grouped.set(permission.module, []);
      }
      grouped.get(permission.module)!.push(permission);
    }
    return Array.from(grouped.entries());
  });


  openModal(group: UserGroup | null) {
    this.userGroupForm.reset({ name: '', description: ''});
    this.permissionsFormArray.clear();

    if (group) {
      this.editingGroup.set(group);
      this.userGroupForm.patchValue({
        name: group.name,
        description: group.description
      });
      group.permissions.forEach(pId => this.permissionsFormArray.push(new FormControl(pId, { nonNullable: true })));
      this.assignedPermissionIds.set([...group.permissions]);
    } else {
      this.editingGroup.set(null);
      this.assignedPermissionIds.set([]);
    }

    // Expand all modules by default when opening the modal
    const allModuleNames = new Set(this.availablePermissionsByModule().map(m => m[0]));
    this.expandedModules.set(allModuleNames);

    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  toggleModule(moduleName: string) {
    this.expandedModules.update(set => {
      const newSet = new Set(set);
      if (newSet.has(moduleName)) {
        newSet.delete(moduleName);
      } else {
        newSet.add(moduleName);
      }
      return newSet;
    });
  }

  addPermission(permission: Permission) {
    this.permissionsFormArray.push(new FormControl(permission.id, { nonNullable: true }));
    this.assignedPermissionIds.update(ids => [...ids, permission.id]);
  }
  
  removePermissionById(permissionId: string) {
    const index = this.permissionsFormArray.controls.findIndex(control => control.value === permissionId);
    if (index !== -1) {
      this.permissionsFormArray.removeAt(index);
    }
    this.assignedPermissionIds.update(ids => ids.filter(id => id !== permissionId));
  }

  onSubmit() {
    if (this.userGroupForm.invalid) return;

    const formValue = this.userGroupForm.getRawValue();
    const groupData = {
      name: formValue.name!,
      description: formValue.description!,
      permissions: formValue.permissions!
    };

    const currentGroup = this.editingGroup();
    if (currentGroup) {
      // Update existing group
      this.userGroups.update(groups => 
        groups.map(g => g.id === currentGroup.id ? { ...g, ...groupData } : g)
      );
    } else {
      // Create new group
      const newGroup: UserGroup = {
        id: this.nextId(),
        ...groupData
      };
      this.userGroups.update(groups => [...groups, newGroup]);
      this.nextId.update(id => id + 1);
    }
    this.closeModal();
  }

  promptDelete(group: UserGroup) { this.groupToDelete.set(group); }
  cancelDelete() { this.groupToDelete.set(null); }
  confirmDelete() {
    const group = this.groupToDelete();
    if(group) {
      this.userGroups.update(groups => groups.filter(g => g.id !== group.id));
      this.cancelDelete();
    }
  }
}
