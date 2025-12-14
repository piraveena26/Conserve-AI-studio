import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type SystemConfigTab = 'location' | 'timesheet' | 'mail' | 'financial';

@Component({
  selector: 'app-system-configuration',
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800">System Configuration</h2>

      <div class="bg-white border border-slate-200 rounded-lg shadow-sm">
        <!-- Tabs -->
        <div class="border-b border-slate-200">
          <nav class="-mb-px flex space-x-6 px-6" aria-label="Tabs">
            <button (click)="activeTab.set('location')" [class]="getTabClass('location')">
              Location Configuration
            </button>
            <button (click)="activeTab.set('timesheet')" [class]="getTabClass('timesheet')">
              Timesheet Configuration
            </button>
            <button (click)="activeTab.set('mail')" [class]="getTabClass('mail')">
              Mail Configuration
            </button>
            <button (click)="activeTab.set('financial')" [class]="getTabClass('financial')">
              Financial Configuration
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          @switch (activeTab()) {
            @case ('location') {
              <div class="space-y-6 max-w-2xl">
                <h3 class="text-lg font-semibold text-slate-800">Location Settings</h3>
                <div>
                  <label for="defaultCountry" class="block text-sm font-medium text-slate-700">Default Country</label>
                  <select id="defaultCountry" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-white">
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Saudi Arabia</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
                <div>
                  <label for="defaultTimezone" class="block text-sm font-medium text-slate-700">Default Timezone</label>
                  <select id="defaultTimezone" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-white">
                    <option>(GMT-08:00) Pacific Time</option>
                    <option>(GMT-05:00) Eastern Time</option>
                    <option>(GMT+03:00) Arabia Standard Time</option>
                    <option>(GMT+00:00) Greenwich Mean Time</option>
                  </select>
                </div>
                <div class="flex justify-end pt-4">
                  <button class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
              </div>
            }
            @case ('timesheet') {
              <div class="space-y-6 max-w-2xl">
                <h3 class="text-lg font-semibold text-slate-800">Timesheet Settings</h3>
                <div>
                  <label for="workHours" class="block text-sm font-medium text-slate-700">Standard Work Hours per Day</label>
                  <input type="number" id="workHours" value="8" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                </div>
                <div>
                  <label for="submissionFrequency" class="block text-sm font-medium text-slate-700">Submission Frequency</label>
                  <select id="submissionFrequency" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-white">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Bi-weekly</option>
                  </select>
                </div>
                <div class="flex items-center">
                  <input id="enableOvertime" type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500">
                  <label for="enableOvertime" class="ml-2 block text-sm text-slate-900">Enable Overtime Logging</label>
                </div>
                <div class="flex justify-end pt-4">
                  <button class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
              </div>
            }
            @case ('mail') {
              <div class="space-y-6 max-w-2xl">
                <h3 class="text-lg font-semibold text-slate-800">Mail (SMTP) Configuration</h3>
                <div>
                  <label for="smtpServer" class="block text-sm font-medium text-slate-700">SMTP Server</label>
                  <input type="text" id="smtpServer" placeholder="smtp.example.com" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                </div>
                 <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label for="smtpPort" class="block text-sm font-medium text-slate-700">Port</label>
                    <input type="number" id="smtpPort" placeholder="587" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                  </div>
                   <div>
                    <label for="smtpSecurity" class="block text-sm font-medium text-slate-700">Security</label>
                    <select id="smtpSecurity" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-white">
                        <option>None</option>
                        <option>SSL/TLS</option>
                        <option>STARTTLS</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label for="smtpUser" class="block text-sm font-medium text-slate-700">Username</label>
                  <input type="text" id="smtpUser" placeholder="user@example.com" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                </div>
                <div>
                  <label for="smtpPass" class="block text-sm font-medium text-slate-700">Password</label>
                  <input type="password" id="smtpPass" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                </div>
                <div class="flex justify-end pt-4 space-x-3">
                  <button class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Send Test Email</button>
                  <button class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
              </div>
            }
            @case ('financial') {
              <div class="space-y-6 max-w-2xl">
                <h3 class="text-lg font-semibold text-slate-800">Financial Settings</h3>
                <div>
                  <label for="currency" class="block text-sm font-medium text-slate-700">Default Currency</label>
                  <select id="currency" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-white">
                    <option>USD - United States Dollar</option>
                    <option>EUR - Euro</option>
                    <option>SAR - Saudi Riyal</option>
                    <option>GBP - British Pound</option>
                  </select>
                </div>
                <div>
                  <label for="taxRate" class="block text-sm font-medium text-slate-700">Default VAT/Tax Rate (%)</label>
                  <input type="number" id="taxRate" value="15" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                </div>
                <div>
                  <label for="fiscalYear" class="block text-sm font-medium text-slate-700">Fiscal Year Start</label>
                  <select id="fiscalYear" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-white">
                    <option>January</option>
                    <option>April</option>
                    <option>July</option>
                    <option>October</option>
                  </select>
                </div>
                <div class="flex justify-end pt-4">
                  <button class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemConfigurationComponent {
  activeTab = signal<SystemConfigTab>('location');

  setActiveTab(tab: SystemConfigTab): void {
    this.activeTab.set(tab);
  }

  getTabClass(tabName: SystemConfigTab): string {
    const baseClasses = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors';
    if (this.activeTab() === tabName) {
      return `${baseClasses} border-blue-500 text-blue-600`;
    }
    return `${baseClasses} border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`;
  }
}
