import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-timesheet-management',
  template: `
    <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
      <h2 class="text-2xl font-bold text-slate-800">Timesheet Management</h2>
      <p class="text-slate-500 mt-2">Oversee and manage all employee timesheet submissions. (Placeholder)</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetManagementComponent {}
