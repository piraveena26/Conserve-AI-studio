
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRequest, UserRequestService } from '../services/user-request.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-requests',
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800">User Requests</h2>
      
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3">Employee</th>
                <th scope="col" class="px-6 py-3">Email</th>
                <th scope="col" class="px-6 py-3">Date Sent</th>
                <th scope="col" class="px-6 py-3">Expiry Date</th>
                <th scope="col" class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (request of requests(); track request.id) {
                <tr class="bg-white border-b hover:bg-slate-50" [class.opacity-60]="isExpired(request.expiryDate)">
                  <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    <div class="flex items-center">
                      <img class="w-10 h-10 rounded-full" [src]="request.employee.avatar" alt="Avatar">
                      <div class="pl-3">
                        <div class="text-base font-semibold">{{ request.employee.name }}</div>
                      </div>  
                    </div>
                  </td>
                  <td class="px-6 py-4">{{ request.employee.email }}</td>
                  <td class="px-6 py-4">{{ request.dateSent | date: 'medium' }}</td>
                  <td class="px-6 py-4">
                    <span>{{ request.expiryDate | date: 'medium' }}</span>
                    @if (isExpired(request.expiryDate)) {
                      <span class="ml-2 text-xs font-semibold text-red-600">(Expired)</span>
                    }
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-4">
                      <button (click)="approveRequest(request)" 
                              [disabled]="isExpired(request.expiryDate)"
                              class="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed">
                        Approve
                      </button>
                      <button (click)="declineRequest(request.id)" class="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-slate-500">No pending user requests.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class UserRequestsComponent {
  private readonly userRequestService = inject(UserRequestService);
  private readonly userService = inject(UserService);

  requests = this.userRequestService.requests;

  isExpired(expiryDate: Date): boolean {
    return new Date(expiryDate) < new Date();
  }

  approveRequest(request: UserRequest): void {
    if (this.isExpired(request.expiryDate)) {
        console.warn('Cannot approve an expired request.');
        return;
    }

    // Assign to 'Standard Employee' group by default
    const defaultGroup = this.userService.userGroups().find(g => g.name === 'Standard Employee');
    
    this.userService.addUser({
      name: request.employee.name,
      email: request.employee.email,
      userGroup: defaultGroup ? defaultGroup.name : 'Standard Employee',
      status: 'Active',
      avatar: request.employee.avatar,
      employeeId: request.employee.id,
    });

    this.userRequestService.processRequest(request.id);
  }

  declineRequest(requestId: string): void {
    this.userRequestService.processRequest(requestId);
  }
}
