import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-location-configuration',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800">Location Configuration</h2>
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div class="h-2 bg-sky-100"></div>
        <div class="p-8">
          <form [formGroup]="locationForm" (ngSubmit)="onSubmit()" class="space-y-12">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              
              <!-- Location Name -->
              <div class="relative">
                <input id="locationName" formControlName="locationName" type="text" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="locationName" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">Location Name*</label>
              </div>

              <!-- Location Code -->
              <div class="relative">
                <input id="locationCode" formControlName="locationCode" type="text" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="locationCode" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">Location Code*</label>
              </div>
              
              <!-- Address -->
              <div class="relative">
                <input id="address" formControlName="address" type="text" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="address" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">Address*</label>
              </div>
              
              <!-- Country -->
              <div class="relative">
                <input id="country" formControlName="country" type="text" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="country" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">Country*</label>
              </div>
              
              <!-- State -->
              <div class="relative">
                <input id="state" formControlName="state" type="text" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="state" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">State*</label>
              </div>
              
              <!-- City -->
              <div class="relative">
                <input id="city" formControlName="city" type="text" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="city" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">City*</label>
              </div>
              
              <!-- Zip Code -->
              <div class="relative">
                <input id="zipCode" formControlName="zipCode" type="text" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="zipCode" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">Zip Code*</label>
              </div>

              <!-- HQ Checkbox -->
              <div class="flex items-center pt-5">
                <input id="hq" formControlName="hq" type="checkbox" class="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500">
                <label for="hq" class="ml-3 block font-medium text-slate-700">HQ</label>
              </div>
            </div>

            <div class="pt-8 border-t border-slate-200 mt-2">
              <div class="flex justify-end">
                <button type="submit" class="px-6 py-2.5 text-sm font-semibold text-white bg-sky-500 rounded-md hover:bg-sky-600 shadow-sm">Update</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationConfigurationComponent {
  locationForm = new FormGroup({
    locationName: new FormControl('Saudi Arabia'),
    locationCode: new FormControl('CONSA'),
    address: new FormControl('Office No. 18, 2nd Floor, Building No. 2885, Jarir Street, Al Malaz District, Riyadh 12836'),
    country: new FormControl('Saudi Arabia'),
    state: new FormControl('Riyadh'),
    city: new FormControl('Al Malaz District'),
    zipCode: new FormControl('12836'),
    hq: new FormControl(false),
  });

  onSubmit() {
    console.log(this.locationForm.value);
  }
}
