import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

interface DivisionTaxSetting {
  id: number;
  name: string;
  code: string;
  taxType: 'VAT' | 'GST';
  taxPercentage: number;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-financial-configuration',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Main Header card -->
      <div class="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Set Division VAT/GST</h2>
        <div class="relative w-48">
          <label for="currencyCode" class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-gray-500">Currency Code</label>
          <input id="currencyCode" type="text" value="SAR" readonly class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 text-center font-semibold">
        </div>
      </div>

      <!-- Add/Edit Division Form card -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="taxForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label for="division" class="block text-sm font-medium text-gray-700">Division</label>
              <input type="text" id="division" formControlName="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2.5">
            </div>
            <div>
              <label for="taxType" class="block text-sm font-medium text-gray-700">Tax Type</label>
              <select id="taxType" formControlName="taxType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2.5 bg-white">
                <option value="VAT">VAT</option>
                <option value="GST">GST</option>
              </select>
            </div>
            <div>
              <label for="taxPercentage" class="block text-sm font-medium text-gray-700">Tax Percentage</label>
              <input type="number" id="taxPercentage" formControlName="taxPercentage" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-2.5">
            </div>
            <div class="flex items-center space-x-2">
              <button type="submit" [disabled]="taxForm.invalid" class="w-full text-white bg-sky-500 hover:bg-sky-600 focus:ring-4 focus:ring-sky-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:bg-sky-300">
                {{ editingSetting() ? 'Update' : 'Add' }}
              </button>
              @if(editingSetting()) {
                <button type="button" (click)="cancelEdit()" class="w-full text-slate-700 bg-slate-200 hover:bg-slate-300 font-medium rounded-lg text-sm px-5 py-2.5">
                  Cancel
                </button>
              }
            </div>
          </div>
        </form>
      </div>

      <!-- Table Card -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="relative w-full max-w-xs">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
            </div>
            <input #searchInput (input)="searchTerm.set(searchInput.value)" type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-sky-300 rounded-full bg-sky-50/50 focus:border-sky-500 focus:ring-sky-500 placeholder-sky-400">
          </div>
          <div class="flex space-x-2">
            <button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Excel
            </button>
            <button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200">
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
              Print
            </button>
            <button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-sky-700 bg-white border border-sky-400 rounded-md hover:bg-sky-50">
              Columns to Display
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </div>
        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th class="px-6 py-3">Name</th><th class="px-6 py-3">Code</th><th class="px-6 py-3">Tax Type</th>
                <th class="px-6 py-3">Tax Percentage</th><th class="px-6 py-3">Status</th><th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (setting of filteredSettings(); track setting.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4 font-medium text-slate-900">{{ setting.name }}</td>
                  <td class="px-6 py-4">{{ setting.code }}</td>
                  <td class="px-6 py-4">{{ setting.taxType }}</td>
                  <td class="px-6 py-4">{{ setting.taxPercentage }}%</td>
                  <td class="px-6 py-4">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" [class]="setting.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ setting.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-3">
                      <button (click)="editSetting(setting)" class="p-1.5 text-slate-500 hover:text-green-600 rounded-full hover:bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                      </button>
                      <button (click)="promptDelete(setting)" class="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="text-center p-8">No tax settings found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    @if (settingToDelete(); as setting) {
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
              <h3 class="text-lg leading-6 font-medium text-slate-900">Delete Tax Setting</h3>
              <div class="mt-2">
                <p class="text-sm text-slate-500">
                  Are you sure you want to permanently delete <strong>{{ setting.name }}</strong>? This action cannot be undone.
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
})
export class FinancialConfigurationComponent {
  taxSettings = signal<DivisionTaxSetting[]>([
    { id: 1, name: 'Engineering', code: 'ENG', taxType: 'VAT', taxPercentage: 15, status: 'Active' },
    { id: 2, name: 'Consulting', code: 'CON', taxType: 'GST', taxPercentage: 18, status: 'Active' },
    { id: 3, name: 'Support', code: 'SUP', taxType: 'VAT', taxPercentage: 15, status: 'Inactive' },
  ]);
  
  editingSetting = signal<DivisionTaxSetting | null>(null);
  settingToDelete = signal<DivisionTaxSetting | null>(null);
  searchTerm = signal('');
  private nextId = signal(4);

  taxForm = new FormGroup({
    name: new FormControl('', Validators.required),
    taxType: new FormControl<'VAT' | 'GST'>('VAT', Validators.required),
    taxPercentage: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  filteredSettings = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.taxSettings().filter(s => s.name.toLowerCase().includes(term));
  });

  onSubmit(): void {
    if (this.taxForm.invalid) {
      return;
    }

    const formValue = this.taxForm.getRawValue();
    const currentSetting = this.editingSetting();
    const divisionName = formValue.name!;

    if (currentSetting) {
      // Update
      this.taxSettings.update(settings => settings.map(s => 
        s.id === currentSetting.id ? { ...currentSetting, ...formValue, name: divisionName, code: divisionName.substring(0, 3).toUpperCase() } as DivisionTaxSetting : s
      ));
    } else {
      // Add
      const newSetting: DivisionTaxSetting = {
        id: this.nextId(),
        name: divisionName,
        code: divisionName.substring(0, 3).toUpperCase(),
        taxType: formValue.taxType!,
        taxPercentage: formValue.taxPercentage!,
        status: 'Active'
      };
      this.taxSettings.update(settings => [...settings, newSetting]);
      this.nextId.update(id => id + 1);
    }
    this.cancelEdit();
  }

  editSetting(setting: DivisionTaxSetting): void {
    this.editingSetting.set(setting);
    this.taxForm.setValue({
      name: setting.name,
      taxType: setting.taxType,
      taxPercentage: setting.taxPercentage
    });
  }

  cancelEdit(): void {
    this.editingSetting.set(null);
    this.taxForm.reset({ taxType: 'VAT' });
  }

  promptDelete(setting: DivisionTaxSetting): void {
    this.settingToDelete.set(setting);
  }

  cancelDelete(): void {
    this.settingToDelete.set(null);
  }

  confirmDelete(): void {
    const setting = this.settingToDelete();
    if (setting) {
      this.deleteSetting(setting.id);
      this.cancelDelete();
    }
  }
  
  private deleteSetting(id: number): void {
    this.taxSettings.update(settings => settings.filter(s => s.id !== id));
  }
}
