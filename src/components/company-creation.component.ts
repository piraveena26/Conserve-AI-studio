
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-company-creation',
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800">Company Creation</h2>
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 md:p-8">
        <form [formGroup]="companyForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="companyName" class="block text-sm font-medium text-slate-700">Company Name</label>
            <input type="text" id="companyName" formControlName="companyName" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
          </div>
          <div>
            <label for="address" class="block text-sm font-medium text-slate-700">Address</label>
            <textarea id="address" formControlName="address" rows="3" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="phone" class="block text-sm font-medium text-slate-700">Phone Number</label>
              <input type="tel" id="phone" formControlName="phone" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" id="email" formControlName="email" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit" [disabled]="companyForm.invalid" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4 disabled:bg-indigo-400">
              Create Company
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CompanyCreationComponent {
  companyForm = new FormGroup({
    companyName: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  onSubmit() {
    if (this.companyForm.valid) {
      console.log('Form Submitted!', this.companyForm.value);
      // Here you would typically send the data to a backend service using Express/SQLite
      this.companyForm.reset();
    }
  }
}
