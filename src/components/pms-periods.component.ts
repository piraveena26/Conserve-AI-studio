import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { PeriodService, Period as PmsPeriod } from '../services/period.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-pms-periods',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-800">PMS Periods</h1>
        <button (click)="openModal(null)" class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
          <span>New Period</span>
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <!-- Toolbar -->
        <div class="flex items-center justify-between">
          <div class="relative w-full max-w-xs">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
            </div>
            <input #searchInput (input)="searchTerm.set(searchInput.value)" type="text" placeholder="Search periods..." class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md">
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50 flex items-center gap-2">Excel</button>
            <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 flex items-center gap-2">Print</button>
            <div class="relative">
              <button (click)="showColumnsDropdown.set(!showColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-400 rounded-md hover:bg-cyan-50 flex items-center gap-2">
                Columns to Display <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              </button>
              @if(showColumnsDropdown()) {
                <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10">
                  @for(col of allColumns; track col.id) {
                    <label class="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" [checked]="visibleColumns().has(col.id)" (change)="toggleColumn(col.id)" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500">
                      <span class="ml-3">{{ col.name }}</span>
                    </label>
                  }
                </div>
              }
            </div>
          </div>
        </div>
        <!-- Table -->
        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                @for(col of allColumns; track col.id) {
                  @if(visibleColumns().has(col.id)) { <th scope="col" class="px-6 py-3" [class.text-right]="col.id === 'actions'">{{ col.name }}</th> }
                }
              </tr>
            </thead>
            <tbody>
              @for(period of filteredPeriods(); track period.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  @if(visibleColumns().has('id')) { <td class="px-6 py-4">{{ period.id }}</td> }
                  @if(visibleColumns().has('name')) { <td class="px-6 py-4 font-medium text-slate-900">{{ period.name }}</td> }
                  @if(visibleColumns().has('startDate')) { <td class="px-6 py-4">{{ period.startDate | date:'mediumDate' }}</td> }
                  @if(visibleColumns().has('endDate')) { <td class="px-6 py-4">{{ period.endDate | date:'mediumDate' }}</td> }
                  @if(visibleColumns().has('actions')) {
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end space-x-4">
                        <button (click)="openModal(period)" class="text-slate-500 hover:text-green-600" title="Edit Period">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                        </button>
                        <button (click)="promptDelete(period)" class="text-slate-500 hover:text-red-600" title="Delete Period">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        </button>
                      </div>
                    </td>
                  }
                </tr>
              } @empty {
                <tr><td [attr.colspan]="visibleColumns().size" class="text-center p-8 text-slate-500">No periods found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/60 z-40" (click)="closeModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg" (click)="$event.stopPropagation()">
          <form [formGroup]="periodForm" (ngSubmit)="onSubmit()">
            <div class="p-6 border-b">
              <h3 class="text-xl font-semibold text-slate-800">{{ editingPeriod() ? 'Edit Period' : 'Add New Period' }}</h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label for="periodName" class="block text-sm font-medium text-slate-700">Title</label>
                <input type="text" id="periodName" formControlName="name" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="startDate" class="block text-sm font-medium text-slate-700">Start Date</label>
                  <input type="date" id="startDate" formControlName="startDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                </div>
                <div>
                  <label for="endDate" class="block text-sm font-medium text-slate-700">End Date</label>
                  <input type="date" id="endDate" formControlName="endDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                </div>
              </div>
            </div>
            <div class="flex justify-end p-4 bg-slate-50 rounded-b-lg space-x-3">
              <button (click)="closeModal()" type="button" class="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-md">Cancel</button>
              <button type="submit" [disabled]="periodForm.invalid" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                {{ editingPeriod() ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (periodToDelete(); as period) {
      <div class="fixed inset-0 bg-black/60 z-50" (click)="cancelDelete()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-slate-900">Delete Period</h3>
            <p class="mt-2 text-sm text-slate-500">Are you sure you want to delete <strong>{{ period.name }}</strong>? This action cannot be undone.</p>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-center space-x-3 rounded-b-lg">
            <button (click)="cancelDelete()" type="button" class="px-4 py-2 text-sm font-medium bg-white border rounded-md">Cancel</button>
            <button (click)="confirmDelete()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">Yes, Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
})
export class PmsPeriodsComponent {
  private periodService = inject(PeriodService);

  showModal = signal(false);
  editingPeriod = signal<PmsPeriod | null>(null);
  periodToDelete = signal<PmsPeriod | null>(null);
  searchTerm = signal('');
  showColumnsDropdown = signal(false);

  // Expose service's periods signal
  periods = this.periodService.periods;

  periodForm = new FormGroup({
    name: new FormControl('', Validators.required),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
  });

  allColumns = [
    { id: 'id', name: 'ID' },
    { id: 'name', name: 'Name' },
    { id: 'startDate', name: 'Start Date' },
    { id: 'endDate', name: 'End Date' },
    { id: 'actions', name: 'Actions' },
  ];
  visibleColumns = signal(new Set(this.allColumns.map(c => c.id)));

  filteredPeriods = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.periods();
    return this.periods().filter(p => p.name.toLowerCase().includes(term));
  });

  openModal(period: PmsPeriod | null): void {
    if (period) {
      this.editingPeriod.set(period);
      this.periodForm.setValue({
        name: period.name,
        startDate: period.startDate, // Backend now ensures YYYY-MM-DD
        endDate: period.endDate,
      });
    } else {
      this.editingPeriod.set(null);
      this.periodForm.reset();
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.periodForm.invalid) {
      return;
    }

    const formValue = this.periodForm.getRawValue();
    const currentPeriod = this.editingPeriod();

    if (currentPeriod) {
      this.periodService.updatePeriod({
        ...currentPeriod,
        name: formValue.name!,
        startDate: formValue.startDate!,
        endDate: formValue.endDate!
      });
    } else {
      this.periodService.addPeriod({
        name: formValue.name!,
        startDate: formValue.startDate!,
        endDate: formValue.endDate!
      });
    }
    this.closeModal();
  }

  promptDelete(period: PmsPeriod): void {
    this.periodToDelete.set(period);
  }

  cancelDelete(): void {
    this.periodToDelete.set(null);
  }

  confirmDelete(): void {
    const period = this.periodToDelete();
    if (period) {
      this.periodService.deletePeriod(period.id);
      this.cancelDelete();
    }
  }

  toggleColumn(columnId: string): void {
    this.visibleColumns.update(cols => {
      const newCols = new Set(cols);
      if (newCols.has(columnId)) {
        newCols.delete(columnId);
      } else {
        newCols.add(columnId);
      }
      return newCols;
    });
  }
}
