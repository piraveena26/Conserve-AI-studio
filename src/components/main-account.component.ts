import { Component, ChangeDetectionStrategy, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainAccount } from '../services/account.service';

@Component({
  selector: 'app-main-account',
  template: `
    <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-slate-500">
          <thead class="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3">ID</th>
              <th scope="col" class="px-6 py-3">Name</th>
              <th scope="col" class="px-6 py-3">Type</th>
              <th scope="col" class="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            @for (account of filteredAccounts(); track account.id) {
              <tr class="bg-white border-b hover:bg-slate-50">
                <td class="px-6 py-4 font-medium text-slate-900">{{ account.id }}</td>
                <td class="px-6 py-4">{{ account.name }}</td>
                <td class="px-6 py-4">{{ account.type }}</td>
                <td class="px-6 py-4 text-right">
                  <button (click)="edit.emit(account)" class="text-slate-500 hover:text-indigo-600" title="Edit Account">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-6 py-10 text-center text-slate-500">No Expense or In-house accounts found.</td>
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
export class MainAccountComponent {
  accounts = input.required<MainAccount[]>();
  edit = output<MainAccount>();

  filteredAccounts = computed(() => 
    this.accounts().filter(acc => acc.type === 'Expense' || acc.type === 'In-house')
  );
}
