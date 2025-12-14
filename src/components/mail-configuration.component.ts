import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MailConfigService, MailConfiguration } from '../services/mail-config.service';

@Component({
  selector: 'app-mail-configuration',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-800">Mail Configuration</h2>
        <button class="p-2 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200" title="Edit Configuration">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
        </button>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div class="h-2 bg-sky-100"></div>
        <div class="p-8">
          <form [formGroup]="mailForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              
              <!-- E-mail -->
              <div class="relative">
                <input id="email" formControlName="email" type="email" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="email" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">E-mail</label>
              </div>

              <!-- Host -->
              <div class="relative">
                <input id="host" formControlName="host" type="text" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="host" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">Host</label>
              </div>
              
              <!-- Port -->
              <div class="relative">
                <input id="port" formControlName="port" type="number" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="port" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">Port</label>
              </div>

              <!-- Host User -->
              <div class="relative">
                <input id="hostUser" formControlName="hostUser" type="text" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="hostUser" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">Host User</label>
              </div>
              
              <!-- Host Password -->
              <div class="relative">
                <input id="hostPassword" formControlName="hostPassword" type="password" class="w-full rounded-lg border-slate-300 shadow-sm p-4 focus:border-sky-500 focus:ring-sky-500">
                <label for="hostPassword" class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-slate-500">Host Password</label>
              </div>

              <!-- Use SSL -->
              <div class="relative border border-slate-300 rounded-lg p-4 flex items-center justify-between">
                <label for="useSsl" class="font-medium text-slate-700 text-sm">Use SSL</label>
                <div class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="useSsl" formControlName="useSsl" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-700"></div>
                </div>
              </div>
            </div>

            <div class="pt-12 border-t border-slate-200 mt-12">
              <div class="flex justify-end space-x-3">
                <button type="button" class="px-6 py-2.5 text-sm font-semibold text-amber-600 bg-white border border-amber-500 rounded-md hover:bg-amber-50 shadow-sm">Cancel</button>
                <button type="submit" class="px-6 py-2.5 text-sm font-semibold text-white bg-cyan-500 rounded-md hover:bg-cyan-600 shadow-sm">Update</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MailConfigurationComponent {
  private mailConfigService = inject(MailConfigService);
  
  config = this.mailConfigService.config;

  mailForm = new FormGroup({
    email: new FormControl(''),
    host: new FormControl(''),
    port: new FormControl<number | null>(null),
    hostUser: new FormControl(''),
    hostPassword: new FormControl(''),
    useSsl: new FormControl(false)
  });

  constructor() {
    effect(() => {
      const configData = this.config();
      if (configData) {
        this.mailForm.patchValue({
          ...configData,
          // Don't patch password for security, it should be a write-only field
          hostPassword: '' 
        });
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.mailForm.invalid) return;

    try {
      await this.mailConfigService.updateConfig(this.mailForm.getRawValue() as MailConfiguration);
      // Maybe show a success message
      console.log('Mail configuration updated successfully.');
    } catch (error) {
      console.error('Failed to update mail configuration:', error);
      // Maybe show an error message
    }
  }
}
