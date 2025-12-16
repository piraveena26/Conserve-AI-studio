
import { Component, ChangeDetectionStrategy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { EmployeeService } from '../services/employee.service';
import { LeaveService, LeaveRequest } from '../services/leave.service';



@Component({
  selector: 'app-leave',
  template: `
    <div class="space-y-6 w-full">
      <h1 class="text-3xl font-bold text-slate-800">Leave Management</h1>

      <!-- Tabs -->
      <div class="border-b border-slate-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button (click)="setActiveTab('applied_leave')" [class]="getTabClass('applied_leave')">Applied Leave</button>
          <button (click)="setActiveTab('all_leave_requests')" [class]="getTabClass('all_leave_requests')">All Leave Requests</button>
          <button (click)="setActiveTab('my_leave')" [class]="getTabClass('my_leave')">My Leave</button>
          <button (click)="setActiveTab('all_leave')" [class]="getTabClass('all_leave')">All Leave</button>
        </nav>
      </div>

      <!-- Tab Content -->
      @switch (activeTab()) {
        @case ('applied_leave') {
          <div class="space-y-4">
            <div class="flex justify-end">
              <button (click)="openLeaveModal(null)" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
                New Leave Request
              </button>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" class="px-6 py-3">ID</th>
                      <th scope="col" class="px-6 py-3">Leave Type</th>
                      <th scope="col" class="px-6 py-3">Leave Date</th>
                      <th scope="col" class="px-6 py-3">Reason</th>
                      <th scope="col" class="px-6 py-3">Status</th>
                      <th scope="col" class="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for(request of myRequests(); track request.id) {
                      <tr class="bg-white border-b hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-900">{{ request.id }}</td>
                        <td class="px-6 py-4 font-medium text-slate-900">{{ request.leaveType }}</td>
                        <td class="px-6 py-4">
                          @if(request.leaveRange === 'One Day') {
                            {{ request.date | date:'mediumDate' }}
                          } @else {
                            {{ request.fromDate | date:'mediumDate' }} - {{ request.toDate | date:'mediumDate' }}
                          }
                        </td>
                        <td class="px-6 py-4 max-w-sm truncate">{{ request.reason || 'N/A' }}</td>
                        <td class="px-6 py-4">
                           <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" [class]="getStatusClass(request.status)">
                              {{ request.status }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <div class="flex items-center justify-end space-x-4">
                             <button (click)="openLeaveModal(request)" class="text-slate-500 hover:text-green-600" title="Edit Leave Request">
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                             </button>
                             <button (click)="promptDelete(request)" class="text-slate-500 hover:text-red-600" title="Delete Leave Request">
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                             </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                       <tr>
                         <td colspan="6" class="text-center py-10 text-slate-500">No leave requests have been applied.</td>
                       </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
        @case ('all_leave_requests') {
           <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" class="px-6 py-3">Employee</th>
                      <th scope="col" class="px-6 py-3">Leave Type</th>
                      <th scope="col" class="px-6 py-3">Dates</th>
                      <th scope="col" class="px-6 py-3">Reason</th>
                      <th scope="col" class="px-6 py-3">Status</th>
                      <th scope="col" class="px-6 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for(request of teamRequests(); track request.id) {
                       <tr class="bg-white border-b hover:bg-slate-50">
                          <td class="px-6 py-4">
                            <div class="flex items-center">
                              <img class="w-10 h-10 rounded-full" [src]="request.employeeAvatar" [alt]="request.employeeName">
                              <div class="pl-3">
                                <div class="text-base font-semibold text-slate-800">{{ request.employeeName }}</div>
                              </div>  
                            </div>
                          </td>
                          <td class="px-6 py-4">{{ request.leaveType }}</td>
                          <td class="px-6 py-4">
                            @if(request.leaveRange === 'One Day') {
                              {{ request.date | date:'mediumDate' }}
                            } @else {
                              {{ request.fromDate | date:'mediumDate' }} - {{ request.toDate | date:'mediumDate' }}
                            }
                          </td>
                           <td class="px-6 py-4 max-w-xs truncate">{{ request.reason || 'N/A' }}</td>
                           <td class="px-6 py-4"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" [class]="getStatusClass(request.status)">{{ request.status }}</span></td>
                           <td class="px-6 py-4 text-center">
                            @if(request.status === 'Pending') {
                              <div class="flex items-center justify-center space-x-2">
                                <button (click)="updateRequestStatus(request.id, 'Approved')" class="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Approve</button>
                                <button (click)="updateRequestStatus(request.id, 'Rejected')" class="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Reject</button>
                              </div>
                            } @else {
                              <span class="text-xs text-slate-400">Handled</span>
                            }
                           </td>
                       </tr>
                    } @empty {
                      <tr><td colspan="6" class="text-center py-10 text-slate-500">No leave requests from your team.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
           </div>
        }
        @case ('my_leave') {
            <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" class="px-6 py-3">Leave Type</th>
                      <th scope="col" class="px-6 py-3">Dates</th>
                      <th scope="col" class="px-6 py-3">Reason</th>
                      <th scope="col" class="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for(request of myRequests(); track request.id) {
                      <tr class="bg-white border-b hover:bg-slate-50">
                        <td class="px-6 py-4">{{ request.leaveType }}</td>
                        <td class="px-6 py-4">
                          @if(request.leaveRange === 'One Day') {
                            {{ request.date | date:'mediumDate' }}
                          } @else {
                            {{ request.fromDate | date:'mediumDate' }} - {{ request.toDate | date:'mediumDate' }}
                          }
                        </td>
                        <td class="px-6 py-4 max-w-sm truncate">{{ request.reason || 'N/A' }}</td>
                        <td class="px-6 py-4">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" [class]="getStatusClass(request.status)">{{ request.status }}</span>
                        </td>
                      </tr>
                    } @empty {
                       <tr><td colspan="4" class="text-center py-10 text-slate-500">You have not applied for any leave.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
        }
        @case ('all_leave') {
           <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" class="px-6 py-3">Employee</th>
                      <th scope="col" class="px-6 py-3">Leave Type</th>
                      <th scope="col" class="px-6 py-3">Dates</th>
                      <th scope="col" class="px-6 py-3">Reason</th>
                      <th scope="col" class="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for(request of allLeaveRequests(); track request.id) {
                       <tr class="bg-white border-b hover:bg-slate-50">
                          <td class="px-6 py-4">
                            <div class="flex items-center">
                              <img class="w-10 h-10 rounded-full" [src]="request.employeeAvatar" [alt]="request.employeeName">
                              <div class="pl-3">
                                <div class="text-base font-semibold text-slate-800">{{ request.employeeName }}</div>
                              </div>  
                            </div>
                          </td>
                          <td class="px-6 py-4">{{ request.leaveType }}</td>
                          <td class="px-6 py-4">
                            @if(request.leaveRange === 'One Day') {
                              {{ request.date | date:'mediumDate' }}
                            } @else {
                              {{ request.fromDate | date:'mediumDate' }} - {{ request.toDate | date:'mediumDate' }}
                            }
                          </td>
                           <td class="px-6 py-4 max-w-xs truncate">{{ request.reason || 'N/A' }}</td>
                           <td class="px-6 py-4"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" [class]="getStatusClass(request.status)">{{ request.status }}</span></td>
                       </tr>
                    } @empty {
                      <tr><td colspan="5" class="text-center py-10 text-slate-500">No leave requests found in the system.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
           </div>
        }
      }
    </div>

    <!-- Add/Edit Leave Request Modal -->
    @if(showLeaveModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" (click)="closeLeaveModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-xl" (click)="$event.stopPropagation()">
          <div class="p-6 border-b">
            <h3 class="text-2xl font-bold text-slate-800">{{ editingLeaveRequest() ? 'Edit' : 'New' }} Leave Request</h3>
          </div>
          <div class="p-6">
            <form [formGroup]="leaveRequestForm" (ngSubmit)="onSubmitLeave()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="leaveType" class="block text-sm font-medium text-slate-700 mb-1">Leave Type *</label>
                  <select id="leaveType" formControlName="leaveType" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3" [class.border-red-500]="isInvalid('leaveType')">
                    <option value="" disabled>Select Leave Type</option>
                    @for(type of leaveTypes; track type) { <option [value]="type">{{ type }}</option> }
                  </select>
                  @if (isInvalid('leaveType')) {
                    <p class="text-sm text-red-600 mt-1">Leave Type is required.</p>
                  }
                </div>
                <div>
                  <label for="leaveRange" class="block text-sm font-medium text-slate-700 mb-1">Leave Range *</label>
                  <select id="leaveRange" formControlName="leaveRange" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3">
                    @for(range of leaveRanges; track range) { <option [value]="range">{{ range }}</option> }
                  </select>
                </div>
              </div>

              @if (isOneDayLeave()) {
                <div>
                  <label for="date" class="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input type="date" id="date" formControlName="date" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3" [class.border-red-500]="isInvalid('date')">
                   @if (isInvalid('date')) {
                    <p class="text-sm text-red-600 mt-1">Date is required.</p>
                  }
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="fromDate" class="block text-sm font-medium text-slate-700 mb-1">From Date *</label>
                    <input type="date" id="fromDate" formControlName="fromDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3" [class.border-red-500]="isInvalid('fromDate')">
                     @if (isInvalid('fromDate')) {
                      <p class="text-sm text-red-600 mt-1">From Date is required.</p>
                    }
                  </div>
                  <div>
                    <label for="toDate" class="block text-sm font-medium text-slate-700 mb-1">To Date *</label>
                    <input type="date" id="toDate" formControlName="toDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3" [class.border-red-500]="isInvalid('toDate')">
                     @if (isInvalid('toDate')) {
                      <p class="text-sm text-red-600 mt-1">To Date is required.</p>
                    }
                  </div>
                </div>
              }

              <div>
                <label for="reason" class="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea id="reason" formControlName="reason" rows="4" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3"></textarea>
              </div>
            </form>
          </div>
          <div class="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg space-x-3">
            <button (click)="closeLeaveModal()" type="button" class="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancel</button>
            <button (click)="onSubmitLeave()" [disabled]="leaveRequestForm.invalid" type="submit" class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300">
              {{ editingLeaveRequest() ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (leaveRequestToDelete(); as request) {
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
              <h3 class="text-lg leading-6 font-medium text-slate-900">Delete Leave Request</h3>
              <div class="mt-2">
                <p class="text-sm text-slate-500">
                  Are you sure you want to delete this leave request? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
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
  imports: [CommonModule, ReactiveFormsModule]
})
export class LeaveComponent {
  private readonly userService = inject(UserService);
  private readonly employeeService = inject(EmployeeService);
  private readonly leaveService = inject(LeaveService);

  activeTab = signal<'applied_leave' | 'all_leave_requests' | 'my_leave' | 'all_leave'>('applied_leave');
  showLeaveModal = signal(false);
  editingLeaveRequest = signal<LeaveRequest | null>(null);
  leaveRequestToDelete = signal<LeaveRequest | null>(null);

  allLeaveRequests = this.leaveService.leaveRequests;

  currentUser = this.userService.currentUser;
  allEmployees = this.employeeService.employees;

  // Requests submitted by the current user
  myRequests = computed(() => {
    const currentUserId = this.currentUser()?.employeeId;
    if (!currentUserId) return [];
    return this.allLeaveRequests().filter(r => r.employeeId === currentUserId);
  });

  // Requests from employees who report to the current user
  teamRequests = computed(() => {
    const currentUserId = this.currentUser()?.employeeId;
    if (!currentUserId) return [];
    const subordinateIds = this.allEmployees()
      .filter(emp => emp.reportingTo === currentUserId)
      .map(emp => emp.id);
    return this.allLeaveRequests().filter(r => subordinateIds.includes(r.employeeId));
  });


  leaveTypes = ['Sick Leave', 'Vacation', 'Personal Leave', 'Maternity/Paternity Leave', 'Unpaid Leave'];
  leaveRanges: Array<'One Day' | 'More Than a Day'> = ['More Than a Day', 'One Day'];

  leaveRequestForm = new FormGroup({
    leaveType: new FormControl('', Validators.required),
    leaveRange: new FormControl<'One Day' | 'More Than a Day'>('More Than a Day', Validators.required),
    date: new FormControl(''),
    fromDate: new FormControl(''),
    toDate: new FormControl(''),
    reason: new FormControl(''),
  });

  isOneDayLeave = computed(() => this.leaveRequestForm.get('leaveRange')?.value === 'One Day');

  constructor() {
    effect(() => {
      const oneDay = this.isOneDayLeave();
      const dateControl = this.leaveRequestForm.get('date');
      const fromDateControl = this.leaveRequestForm.get('fromDate');
      const toDateControl = this.leaveRequestForm.get('toDate');

      if (oneDay) {
        dateControl?.setValidators(Validators.required);
        fromDateControl?.clearValidators();
        toDateControl?.clearValidators();
        fromDateControl?.setValue('');
        toDateControl?.setValue('');
      } else {
        dateControl?.clearValidators();
        dateControl?.setValue('');
        fromDateControl?.setValidators(Validators.required);
        toDateControl?.setValidators(Validators.required);
      }
      dateControl?.updateValueAndValidity({ emitEvent: false });
      fromDateControl?.updateValueAndValidity({ emitEvent: false });
      toDateControl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  getTabClass(tabName: string) {
    const base = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm';
    return this.activeTab() === tabName
      ? `${base} border-indigo-500 text-indigo-600`
      : `${base} border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`;
  }

  setActiveTab(tab: 'applied_leave' | 'all_leave_requests' | 'my_leave' | 'all_leave') {
    this.activeTab.set(tab);
  }

  openLeaveModal(request: LeaveRequest | null) {
    this.editingLeaveRequest.set(request);
    if (request) {
      this.leaveRequestForm.reset({
        leaveType: request.leaveType,
        leaveRange: request.leaveRange,
        date: request.date || '',
        fromDate: request.fromDate || '',
        toDate: request.toDate || '',
        reason: request.reason || ''
      });
    } else {
      this.leaveRequestForm.reset({
        leaveType: '',
        leaveRange: 'More Than a Day',
        date: '',
        fromDate: '',
        toDate: '',
        reason: ''
      });
    }
    this.showLeaveModal.set(true);
  }

  closeLeaveModal() {
    this.showLeaveModal.set(false);
    this.editingLeaveRequest.set(null);
  }

  isInvalid(controlName: string): boolean {
    const control = this.leaveRequestForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmitLeave() {
    if (this.leaveRequestForm.invalid) {
      this.leaveRequestForm.markAllAsTouched();
      return;
    }

    const formValue = this.leaveRequestForm.getRawValue();
    const editingReq = this.editingLeaveRequest();
    const currentUser = this.currentUser();

    if (editingReq) {
      const updatedData = {
        leaveType: formValue.leaveType!,
        leaveRange: formValue.leaveRange!,
        date: formValue.date || undefined,
        fromDate: formValue.fromDate || undefined,
        toDate: formValue.toDate || undefined,
        reason: formValue.reason!,
      };
      this.leaveService.updateLeaveRequest(editingReq.id, updatedData);
    } else if (currentUser?.employeeId) {
      const newRequest = {
        employeeId: currentUser.employeeId,
        employeeName: currentUser.name,
        employeeAvatar: currentUser.avatar,
        leaveType: formValue.leaveType!,
        leaveRange: formValue.leaveRange!,
        date: formValue.date || undefined,
        fromDate: formValue.fromDate || undefined,
        toDate: formValue.toDate || undefined,
        reason: formValue.reason!,
        status: 'Pending' as const,
      };
      this.leaveService.createLeaveRequest(newRequest);
    }
    this.closeLeaveModal();
  }

  promptDelete(request: LeaveRequest): void {
    this.leaveRequestToDelete.set(request);
  }

  cancelDelete(): void {
    this.leaveRequestToDelete.set(null);
  }

  confirmDelete(): void {
    const request = this.leaveRequestToDelete();
    if (request) {
      this.leaveService.deleteLeaveRequest(request.id);
      this.cancelDelete();
    }
  }

  updateRequestStatus(requestId: number, status: 'Approved' | 'Rejected'): void {
    this.leaveService.updateLeaveStatus(requestId, status);
  }

  getStatusClass(status: 'Pending' | 'Approved' | 'Rejected'): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
    }
  }
}
