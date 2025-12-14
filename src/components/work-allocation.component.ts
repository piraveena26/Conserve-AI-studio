import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-work-allocation',
  template: `
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h2 class="text-2xl font-bold text-gray-800">Work Allocation</h2>
      <p class="text-gray-500 mt-2">Allocate work and manage employee schedules here. (Placeholder)</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkAllocationComponent {}