import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DaybookService } from '../services/daybook.service';
import { Bank } from '../models/account.model';

interface DisplayTransaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense' | 'Transfer';
  description: string;
  accountName: string;
  mode: string;
  credit: number;
  debit: number;
}

@Component({
  selector: 'app-bank',
  template: `
    @if (viewingBank(); as bank) {
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <button (click)="viewingBank.set(null)" class="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
              Back to Banks
            </button>
            <h2 class="text-2xl font-bold text-slate-800">Transactions for {{ bank.name }}</h2>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-500">
              <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th class="px-6 py-3">ID</th>
                  <th class="px-6 py-3">Date</th>
                  <th class="px-6 py-3">Type</th>
                  <th class="px-6 py-3">Description</th>
                  <th class="px-6 py-3">Account Name</th>
                  <th class="px-6 py-3">Mode</th>
                  <th class="px-6 py-3 text-right">Credit</th>
                  <th class="px-6 py-3 text-right">Debit</th>
                </tr>
              </thead>
              <tbody>
                @for(tx of bankTransactions(); track tx.id) {
                  <tr class="bg-white border-b hover:bg-slate-50">
                    <td class="px-6 py-4 font-mono text-xs text-slate-600">{{ tx.id }}</td>
                    <td class="px-6 py-4">{{ tx.date | date:'mediumDate' }}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            [class]="tx.type === 'Income' ? 'bg-green-100 text-green-800' : (tx.type === 'Expense' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800')">
                        {{ tx.type }}
                      </span>
                    </td>
                    <td class="px-6 py-4 max-w-xs truncate">{{ tx.description }}</td>
                    <td class="px-6 py-4">{{ tx.accountName }}</td>
                    <td class="px-6 py-4">{{ tx.mode }}</td>
                    <td class="px-6 py-4 text-right font-semibold text-green-600">
                      @if(tx.credit > 0) { {{ tx.credit | currency }} }
                    </td>
                    <td class="px-6 py-4 text-right font-semibold text-red-600">
                      @if(tx.debit > 0) { {{ tx.debit | currency }} }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="8" class="text-center p-8 text-slate-500">No transactions found for this bank account.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    } @else {
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-slate-800">Bank Accounts</h2>
          <button (click)="openModal(null)" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
            Add New Bank
          </button>
        </div>

        <!-- Banks Table -->
        <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-500">
              <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" class="px-6 py-3">Bank Name</th>
                  <th scope="col" class="px-6 py-3">Code</th>
                  <th scope="col" class="px-6 py-3">Account Number</th>
                  <th scope="col" class="px-6 py-3">Branch</th>
                  <th scope="col" class="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (bank of banks(); track bank.id) {
                  <tr class="bg-white border-b hover:bg-slate-50">
                    <td class="px-6 py-4 font-medium text-slate-900">{{ bank.name }}</td>
                    <td class="px-6 py-4">{{ bank.code }}</td>
                    <td class="px-6 py-4">{{ bank.accountNumber }}</td>
                    <td class="px-6 py-4">{{ bank.branch }}</td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end space-x-4">
                        <button (click)="viewingBank.set(bank)" class="text-slate-500 hover:text-blue-600" title="View Transactions">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                        </button>
                        <button (click)="openModal(bank)" class="text-slate-500 hover:text-green-600" title="Edit Bank">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                        </button>
                        <button (click)="promptDelete(bank)" class="text-slate-500 hover:text-red-600" title="Delete Bank">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="px-6 py-4 text-center text-slate-500">No banks found.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    <!-- Add/Edit Bank Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/60 z-40" (click)="closeModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="p-8">
            <h3 class="text-2xl font-bold text-slate-800 mb-8">{{ editingBank() ? 'Edit Bank' : 'Add New Bank' }}</h3>
            <form [formGroup]="bankForm" (ngSubmit)="onSubmit()" class="space-y-8">
              <div class="relative border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-slate-600 focus-within:border-slate-600">
                <label for="bankName" class="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-500">Bank Name *</label>
                <input type="text" id="bankName" formControlName="name" class="block w-full border-0 p-0 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm" placeholder="Enter Bank Name">
              </div>
              <div class="relative border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-slate-600 focus-within:border-slate-600">
                <label for="code" class="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-500">Code *</label>
                <input type="text" id="code" formControlName="code" class="block w-full border-0 p-0 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm" placeholder="Enter code">
              </div>
              <div class="relative border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-slate-600 focus-within:border-slate-600">
                <label for="accountNumber" class="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-500">Account Number *</label>
                <input type="text" id="accountNumber" formControlName="accountNumber" class="block w-full border-0 p-0 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm" placeholder="Enter account number">
              </div>
              <div class="relative border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-slate-600 focus-within:border-slate-600">
                <label for="branch" class="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-xs font-medium text-gray-500">Branch *</label>
                <input type="text" id="branch" formControlName="branch" class="block w-full border-0 p-0 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm" placeholder="Enter branch">
              </div>
              <div class="flex justify-end pt-4 space-x-3">
                <button (click)="closeModal()" type="button" class="px-6 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" [disabled]="bankForm.invalid" class="px-6 py-2 text-sm font-medium rounded-md border border-transparent bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400">
                  {{ editingBank() ? 'Update' : 'Create' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (bankToDelete(); as bank) {
      <div class="fixed inset-0 bg-black/60 z-50" (click)="cancelDelete()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="p-6 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-slate-900">Delete Bank Account</h3>
            <p class="mt-2 text-sm text-slate-500">Are you sure you want to delete <strong>{{ bank.name }}</strong>? This action cannot be undone.</p>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-center space-x-3 rounded-b-lg">
            <button (click)="cancelDelete()" type="button" class="px-4 py-2 text-sm font-medium bg-white border rounded-md">Cancel</button>
            <button (click)="confirmDelete()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">Yes, Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
})
export class BankComponent {
  daybookService = inject(DaybookService);
  private fb = inject(FormBuilder);
  
  banks = this.daybookService.banks;
  showModal = signal(false);
  editingBank = signal<Bank | null>(null);
  viewingBank = signal<Bank | null>(null);
  bankToDelete = signal<Bank | null>(null);

  bankForm = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    accountNumber: ['', Validators.required],
    branch: ['', Validators.required]
  });

  bankTransactions = computed<DisplayTransaction[]>(() => {
    const bank = this.viewingBank();
    if (!bank) return [];

    const incomeTx = this.daybookService.incomeEntries()
      .filter(e => e.bank === bank.name)
      .map(e => ({
        id: `inc-${e.id}`,
        date: e.entryDate,
        type: 'Income' as const,
        description: e.description,
        accountName: e.mainAccount,
        mode: e.mode,
        credit: e.amount,
        debit: 0,
      }));

    const expenseTx = this.daybookService.expenseEntries()
      .filter(e => e.bank === bank.name)
      .map(e => ({
        id: `exp-${e.id}`,
        date: e.entryDate,
        type: 'Expense' as const,
        description: e.description,
        accountName: e.mainAccount,
        mode: e.mode,
        credit: 0,
        debit: e.amount,
      }));

    const transferTx = this.daybookService.transferEntries()
      .filter(e => e.bank === bank.name)
      .map(e => ({
        id: `trn-${e.id}`,
        date: e.entryDate,
        type: 'Transfer' as const,
        description: e.type,
        accountName: 'Cash/Bank',
        mode: 'Internal Transfer',
        credit: e.type === 'Cash to Bank' ? e.amount : 0,
        debit: e.type === 'Bank to Cash' ? e.amount : 0,
      }));
    
    const all = [...incomeTx, ...expenseTx, ...transferTx];
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  openModal(bank: Bank | null): void {
    if (bank) {
      this.editingBank.set(bank);
      this.bankForm.setValue({
        name: bank.name,
        code: bank.code,
        accountNumber: bank.accountNumber,
        branch: bank.branch,
      });
    } else {
      this.editingBank.set(null);
      this.bankForm.reset();
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async onSubmit(): Promise<void> {
    if (this.bankForm.invalid) return;

    const formValue = this.bankForm.getRawValue();
    const currentBank = this.editingBank();

    try {
      if (currentBank) {
        await this.daybookService.updateBank({
          id: currentBank.id,
          name: formValue.name!,
          code: formValue.code!,
          accountNumber: formValue.accountNumber!,
          branch: formValue.branch!
        });
      } else {
        await this.daybookService.addBank({
          name: formValue.name!,
          code: formValue.code!,
          accountNumber: formValue.accountNumber!,
          branch: formValue.branch!
        });
      }
    } catch (error) {
      console.error('Failed to save bank', error);
    }
    this.closeModal();
  }

  promptDelete(bank: Bank): void {
    this.bankToDelete.set(bank);
  }

  cancelDelete(): void {
    this.bankToDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const bank = this.bankToDelete();
    if (bank) {
      try {
        await this.daybookService.deleteBank(bank.id);
      } catch(error) {
        console.error('Failed to delete bank', error);
      } finally {
        this.cancelDelete();
      }
    }
  }
}
