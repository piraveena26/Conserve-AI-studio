
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-location-creation',
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800">Location Creation</h2>
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 md:p-8">
        <form [formGroup]="locationForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="company" class="block text-sm font-medium text-slate-700">Company</label>
            <select id="company" formControlName="company" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
              <option value="" disabled>Select a company</option>
              @for(company of companies(); track company.id) {
                <option [value]="company.id">{{ company.name }}</option>
              }
            </select>
          </div>
          <div>
            <label for="locationName" class="block text-sm font-medium text-slate-700">Location Name / Branch Name</label>
            <input type="text" id="locationName" formControlName="locationName" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
          </div>
          <div>
            <label for="address" class="block text-sm font-medium text-slate-700">Address</label>
            <input type="text" id="address" formControlName="address" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label for="city" class="block text-sm font-medium text-slate-700">City</label>
              <input type="text" id="city" formControlName="city" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
            </div>
            <div>
              <label for="state" class="block text-sm font-medium text-slate-700">State / Province</label>
              <input type="text" id="state" formControlName="state" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
            </div>
            <div>
              <label for="country" class="block text-sm font-medium text-slate-700">Country</label>
              <input type="text" id="country" formControlName="country" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit" [disabled]="locationForm.invalid" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4 disabled:bg-indigo-400">
              Create Location
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LocationCreationComponent {
  companies = signal<{id: string, name: string}[]>([
    { id: 'c1', name: 'Innovate Corp' },
    { id: 'c2', name: 'Synergy Solutions' },
    { id: 'c3', name: 'Apex Industries' }
  ]);

  locationForm = new FormGroup({
    company: new FormControl('', Validators.required),
    locationName: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required),
  });

  onSubmit() {
    if (this.locationForm.valid) {
      console.log('Form Submitted!', this.locationForm.value);
      // Here you would typically send the data to a backend service using Express/SQLite
      this.locationForm.reset();
    }
  }
}
