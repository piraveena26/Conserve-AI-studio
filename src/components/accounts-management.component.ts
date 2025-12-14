import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accounts-management',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h1 class="text-2xl font-bold text-slate-800">Accounts Management</h1>
        <p class="text-slate-500 mt-2">Select a section from the sidebar to view details.</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
  ],
})
export class AccountsManagementComponent {
}
