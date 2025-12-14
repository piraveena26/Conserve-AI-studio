import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accounts-board',
  template: `
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-800">Accounts Board</h2>
      <p class="text-gray-500 mt-2">Dashboard for key account metrics. (Placeholder)</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class AccountsBoardComponent {}