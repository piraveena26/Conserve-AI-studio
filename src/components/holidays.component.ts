
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HolidayService, Holiday } from '../services/holiday.service';



@Component({
  selector: 'app-holidays',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-800">Holidays</h2>
        <button (click)="openModal(null)" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
          Add Holiday
        </button>
      </div>
      
      <!-- Holidays Table -->
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3">Title</th>
                <th scope="col" class="px-6 py-3">Type</th>
                <th scope="col" class="px-6 py-3">Date</th>
                <th scope="col" class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (holiday of holidayService.holidays(); track holiday.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4 font-medium text-slate-900">{{ holiday.title }}</td>
                  <td class="px-6 py-4">{{ holiday.type }}</td>
                  <td class="px-6 py-4">{{ holiday.date | date:'longDate' }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-4">
                      <button (click)="openModal(holiday)" class="text-slate-500 hover:text-green-600" title="Edit Holiday">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <button (click)="promptDelete(holiday)" class="text-slate-500 hover:text-red-600" title="Delete Holiday">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-slate-500">No holidays found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Holiday Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" (click)="closeModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg" (click)="$event.stopPropagation()">
          <div class="p-6 border-b">
            <h3 class="text-2xl font-bold text-slate-800">{{ editingHoliday() ? 'Edit Holiday' : 'New Holiday' }}</h3>
          </div>
          <form [formGroup]="holidayForm" (ngSubmit)="onSubmit()">
            <div class="p-6">
              <h4 class="text-xl font-semibold text-slate-600 mb-6">Holiday Session</h4>
               @if(errorMessage()) {
                <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                  {{ errorMessage() }}
                </div>
              }
              <div class="space-y-6">
                <div>
                  <label for="holidayTitle" class="block text-sm font-medium text-slate-700 mb-1">Holiday Title*</label>
                  <input type="text" id="holidayTitle" formControlName="title" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3" placeholder="Enter Holiday Title">
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="holidayType" class="block text-sm font-medium text-slate-700 mb-1">Holiday Type*</label>
                    <select id="holidayType" formControlName="type" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3">
                      <option value="" disabled>Select Holiday Type</option>
                      @for(type of holidayTypes; track type) { <option [value]="type">{{ type }}</option> }
                    </select>
                  </div>
                  <div>
                    <label for="date" class="block text-sm font-medium text-slate-700 mb-1">Date*</label>
                    <input type="date" id="date" formControlName="date" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3">
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg space-x-3">
              <button (click)="closeModal()" type="button" class="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancel</button>
              <button type="submit" [disabled]="holidayForm.invalid" class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300">
                {{ editingHoliday() ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

     <!-- Delete Confirmation Modal -->
    @if (holidayToDelete(); as holiday) {
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
              <h3 class="text-lg leading-6 font-medium text-slate-900">Delete Holiday</h3>
              <div class="mt-2">
                <p class="text-sm text-slate-500">
                  Are you sure you want to permanently delete <strong>{{ holiday.title }}</strong>? This action cannot be undone.
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
export class HolidaysComponent {
  holidayService = inject(HolidayService);
  showModal = signal(false);
  editingHoliday = signal<Holiday | null>(null);
  holidayToDelete = signal<Holiday | null>(null);
  errorMessage = signal<string | null>(null);

  holidayTypes: Holiday['type'][] = ['National Holiday', 'Regional Holiday', 'Company Event'];

  holidayForm = new FormGroup({
    title: new FormControl('', Validators.required),
    type: new FormControl<Holiday['type'] | ''>('', Validators.required),
    date: new FormControl('', Validators.required),
  });

  openModal(holiday: Holiday | null): void {
    this.errorMessage.set(null);
    if (holiday) {
      this.editingHoliday.set(holiday);
      this.holidayForm.setValue({
        title: holiday.title,
        type: holiday.type,
        date: holiday.date
      });
    } else {
      this.editingHoliday.set(null);
      this.holidayForm.reset({ title: '', type: '', date: '' });
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingHoliday.set(null);
  }

  onSubmit(): void {
    if (this.holidayForm.invalid) {
      return;
    }

    const formValue = this.holidayForm.getRawValue();
    const currentHoliday = this.editingHoliday();

    // Check for date conflict
    const isDateTaken = this.holidayService.holidays().some(h =>
      h.date === formValue.date && h.id !== currentHoliday?.id
    );

    if (isDateTaken) {
      this.errorMessage.set('A holiday already exists for this date. Please choose another date.');
      return;
    }

    this.errorMessage.set(null);

    const holidayData = {
      title: formValue.title!,
      type: formValue.type as Holiday['type'],
      date: formValue.date!
    };

    if (currentHoliday) {
      this.holidayService.updateHoliday(currentHoliday.id, holidayData);
    } else {
      this.holidayService.createHoliday(holidayData);
    }
    this.closeModal();
  }

  promptDelete(holiday: Holiday): void {
    this.holidayToDelete.set(holiday);
  }

  cancelDelete(): void {
    this.holidayToDelete.set(null);
  }

  confirmDelete(): void {
    const holiday = this.holidayToDelete();
    if (holiday) {
      this.holidayService.deleteHoliday(holiday.id);
      this.cancelDelete();
    }
  }
}
