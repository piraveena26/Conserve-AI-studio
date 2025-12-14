import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timesheet-configuration',
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800">Timesheet Configuration</h2>
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
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
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetConfigurationComponent {}
