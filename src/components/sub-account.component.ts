import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubAccount } from './accounts.component';

@Component({
  selector: 'app-sub-account',
  template: `
    <div class="mb-6">
      <label for="accountTypeFilter" class="sr-only">Account Type</label>
      <select #filterSelect (change)="onFilterChange($event)" id="accountTypeFilter" class="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
          <option value="" disabled selected>Account Type</option>
          <option value="All">All</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
          <option value="In-house">In-house</option>
      </select>
    </div>
    <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-slate-500">
          <thead class="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3">ID</th>
              <th scope="col" class="px-6 py-3">Main Account</th>
              <th scope="col" class="px-6 py-3">Name</th>
              <th scope="col" class="px-6 py-3">Type</th>
              <th scope="col" class="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            @for (account of filteredAccounts(); track account.id) {
              <tr class="bg-white border-b hover:bg-slate-50">
                <td class="px-6 py-4 font-medium text-slate-900">{{ account.id }}</td>
                <td class="px-6 py-4">{{ account.mainAccount }}</td>
                <td class="px-6 py-4">{{ account.name }}</td>
                <td class="px-6 py-4">{{ account.type }}</td>
                <td class="px-6 py-4 text-right">
                  <button (click)="edit.emit(account)" class="text-slate-500 hover:text-indigo-600" title="Edit Sub-Account">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-6 py-10 text-center text-slate-500">
                   No sub-accounts found{{ selectedType() !== 'All' && selectedType() !== '' ? ' for the selected type' : '' }}.
                </td>
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
export class SubAccountComponent {
  accounts = input.required<SubAccount[]>();
  edit = output<SubAccount>();
  
  selectedType = signal<'All' | 'Income' | 'Expense' | 'In-house' | ''>('');

  filteredAccounts = computed(() => {
    const type = this.selectedType();
    if (type === 'All' || type === '') {
      return this.accounts();
    }
    return this.accounts().filter(acc => acc.type === type);
  });

  onFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedType.set(selectElement.value as 'All' | 'Income' | 'Expense' | 'In-house');
  }
}
