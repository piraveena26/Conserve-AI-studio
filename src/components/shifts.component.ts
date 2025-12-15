
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Shift, ShiftService } from '../services/employee.service';

@Component({
  selector: 'app-shifts',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-800">Shifts</h2>
        <button (click)="openModal(null)" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
          Add Shift
        </button>
      </div>
      
      <!-- Shifts Table -->
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3 w-24">ID</th>
                <th scope="col" class="px-6 py-3">Shift Name</th>
                <th scope="col" class="px-6 py-3">Start Time</th>
                <th scope="col" class="px-6 py-3">End Time</th>
                <th scope="col" class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (shift of shifts(); track shift.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4 font-medium text-slate-900">{{ shift.id }}</td>
                  <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{{ shift.name }}</td>
                  <td class="px-6 py-4">{{ shift.startTime }}</td>
                  <td class="px-6 py-4">{{ shift.endTime }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-4">
                      <button (click)="openViewModal(shift)" class="text-slate-500 hover:text-blue-600" title="View Assigned Employees">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <button (click)="openModal(shift)" class="text-slate-500 hover:text-green-600" title="Edit Shift">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <button (click)="promptDelete(shift)" class="text-slate-500 hover:text-red-600" title="Delete Shift">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-slate-500">No shifts found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Shift Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" (click)="closeModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-semibold text-slate-800">{{ editingShift() ? 'Edit Shift' : 'Add New Shift' }}</h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form [formGroup]="shiftForm" (ngSubmit)="onSubmit()">
            <div class="p-6 space-y-4">
              <div>
                <label for="shiftName" class="block text-sm font-medium text-slate-700">Shift Name</label>
                <input type="text" id="shiftName" formControlName="name" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="startTime" class="block text-sm font-medium text-slate-700">Start Time</label>
                  <input type="time" id="startTime" formControlName="startTime" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3">
                </div>
                <div>
                  <label for="endTime" class="block text-sm font-medium text-slate-700">End Time</label>
                  <input type="time" id="endTime" formControlName="endTime" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3">
                </div>
              </div>
            </div>
            <div class="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg">
              <button (click)="closeModal()" type="button" class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm">Cancel</button>
              <button type="submit" [disabled]="shiftForm.invalid" class="ml-3 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                {{ editingShift() ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- View Assigned Employees Modal -->
    @if (shiftToView(); as shift) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="closeViewModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="p-6 border-b">
            <h3 class="text-xl font-semibold text-slate-800">Employees in "{{ shift.name }}"</h3>
          </div>
          <div class="p-6 max-h-80 overflow-y-auto">
            @if(shift.assignedEmployees.length > 0) {
              <ul class="space-y-2">
                @for(employee of shift.assignedEmployees; track employee) {
                  <li class="p-2 bg-slate-100 rounded-md text-sm text-slate-800">{{ employee }}</li>
                }
              </ul>
            } @else {
              <p class="text-slate-500 text-center">No employees assigned to this shift.</p>
            }
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end rounded-b-lg">
            <button (click)="closeViewModal()" type="button" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
              Close
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (shiftToDelete(); as shift) {
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
              <h3 class="text-lg leading-6 font-medium text-slate-900">Delete Shift</h3>
              <div class="mt-2">
                <p class="text-sm text-slate-500">
                  Are you sure you want to permanently delete <strong>{{ shift.name }}</strong>? This action cannot be undone.
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
  imports: [CommonModule, ReactiveFormsModule],
})
export class ShiftsComponent {
  private shiftService = inject(ShiftService);

  showModal = signal(false);
  editingShift = signal<Shift | null>(null);
  shiftToDelete = signal<Shift | null>(null);
  shiftToView = signal<Shift | null>(null);

  shifts = this.shiftService.shifts;

  shiftForm = new FormGroup({
    name: new FormControl('', Validators.required),
    startTime: new FormControl('', Validators.required),
    endTime: new FormControl('', Validators.required),
  });

  openModal(shift: Shift | null): void {
    if (shift) {
      this.editingShift.set(shift);
      this.shiftForm.setValue({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime
      });
    } else {
      this.editingShift.set(null);
      this.shiftForm.reset();
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingShift.set(null);
  }

  onSubmit(): void {
    if (this.shiftForm.invalid || !this.shiftForm.value.name || !this.shiftForm.value.startTime || !this.shiftForm.value.endTime) {
      return;
    }

    const formValue = this.shiftForm.getRawValue();
    const currentShift = this.editingShift();

    if (currentShift) {
      this.shiftService.updateShift({ id: currentShift.id, ...formValue });
    } else {
      this.shiftService.addShift(formValue);
    }
    this.closeModal();
  }

  promptDelete(shift: Shift): void {
    this.shiftToDelete.set(shift);
  }

  cancelDelete(): void {
    this.shiftToDelete.set(null);
  }

  confirmDelete(): void {
    const shift = this.shiftToDelete();
    if (shift) {
      this.shiftService.deleteShift(shift.id);
      this.cancelDelete();
    }
  }

  openViewModal(shift: Shift): void {
    this.shiftToView.set(shift);
  }

  closeViewModal(): void {
    this.shiftToView.set(null);
  }
}
