import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-attendance',
  template: `
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h2 class="text-2xl font-bold text-gray-800">Attendance</h2>
      <p class="text-gray-500 mt-2">View and manage employee attendance records here. (Placeholder)</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceComponent {}