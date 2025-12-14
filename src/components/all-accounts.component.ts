import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainAccount } from './accounts.component';

@Component({
  selector: 'app-all-accounts',
  template: `
    <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-slate-500">
          <thead class="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3">ID</th>
              <th scope="col" class="px-6 py-3">Name</th>
              <th scope="col" class="px-6 py-3">Type</th>
            </tr>
          </thead>
          <tbody>
            @for (account of accounts(); track account.id) {
              <tr class="bg-white border-b hover:bg-slate-50">
                <td class="px-6 py-4 font-medium text-slate-900">{{ account.id }}</td>
                <td class="px-6 py-4">{{ account.name }}</td>
                <td class="px-6 py-4">{{ account.type }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="px-6 py-10 text-center text-slate-500">No accounts found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class AllAccountsComponent {
  accounts = input.required<MainAccount[]>();
}
