// FIX: Import 'inject' from '@angular/core' to resolve 'Cannot find name 'inject'' error.
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

interface Client {
  id: number;
  name: string;
}

interface StatementTransaction {
  date: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
}

interface ClientSummary {
  id: number;
  name: string;
  totalBilled: number;
  totalReceived: number;
  balanceDue: number;
}

@Component({
  selector: 'app-statement-of-accounts',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h1 class="text-2xl font-bold text-slate-800">Statement of Accounts</h1>
      </div>
      
      <!-- Generate Statement Section -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-slate-700 border-b pb-2">Generate Client Statement</h2>
          <form [formGroup]="statementForm" (ngSubmit)="generateStatement()" class="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div class="md:col-span-1">
              <label for="client" class="block text-sm font-medium text-slate-700">Client</label>
              <select id="client" formControlName="client" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                <option [ngValue]="null" disabled>Select Client</option>
                @for(client of clients(); track client.id) {
                  <option [ngValue]="client">{{ client.name }}</option>
                }
              </select>
            </div>
              <div>
              <label for="startDate" class="block text-sm font-medium text-slate-700">Start Date</label>
              <input type="date" id="startDate" formControlName="startDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
            </div>
            <div>
              <label for="endDate" class="block text-sm font-medium text-slate-700">End Date</label>
              <input type="date" id="endDate" formControlName="endDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
            </div>
            <button type="submit" [disabled]="statementForm.invalid" class="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4 disabled:bg-indigo-400">
              Generate Statement
            </button>
          </form>

          @if (statementData(); as data) {
            <div class="space-y-6">
              <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-sm font-medium text-blue-800">Total Billed</p>
                  <p class="text-2xl font-bold text-blue-900">{{ data.totalBilled | currency:'SAR' }}</p>
                </div>
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p class="text-sm font-medium text-green-800">Total Received</p>
                  <p class="text-2xl font-bold text-green-900">{{ data.totalReceived | currency:'SAR' }}</p>
                </div>
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p class="text-sm font-medium text-red-800">Balance Due</p>
                  <p class="text-2xl font-bold text-red-900">{{ data.balanceDue | currency:'SAR' }}</p>
                </div>
              </div>

              <!-- Transactions Table -->
              <div class="border border-slate-200 rounded-lg overflow-hidden">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-100">
                    <tr>
                      <th class="px-6 py-3 w-1/12">S.No</th>
                      <th class="px-6 py-3 w-2/12">Date</th>
                      <th class="px-6 py-3 w-4/12">Particulars</th>
                      <th class="px-6 py-3 w-2/12 text-right">Debit</th>
                      <th class="px-6 py-3 w-2/12 text-right">Credit</th>
                      <th class="px-6 py-3 w-2/12 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for(tx of data.transactions; track $index) {
                      <tr class="border-b hover:bg-slate-50">
                        <td class="px-6 py-4">{{ $index + 1 }}</td>
                        <td class="px-6 py-4">{{ tx.date | date:'mediumDate' }}</td>
                        <td class="px-6 py-4 font-medium text-slate-800">{{ tx.particulars }}</td>
                        <td class="px-6 py-4 text-right">{{ tx.debit > 0 ? (tx.debit | currency) : '' }}</td>
                        <td class="px-6 py-4 text-right text-green-600">{{ tx.credit > 0 ? (tx.credit | currency) : '' }}</td>
                        <td class="px-6 py-4 text-right font-semibold" [class.text-red-600]="tx.balance < 0">{{ tx.balance | currency }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          } @else {
              <div class="text-center p-8 text-slate-500 bg-slate-50 rounded-lg">
              Please select a client and date range to generate a statement.
            </div>
          }
        </div>
      </div>
      
      <!-- All Clients Section -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="space-y-4">
          <div class="flex justify-between items-center border-b pb-2">
            <h2 class="text-xl font-semibold text-slate-700">All Clients</h2>
            <div class="relative w-full max-w-xs">
              <input type="text" placeholder="Search clients..." class="form-input block w-full pl-9 pr-3 py-2 border-slate-300 rounded-md">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto border border-slate-200 rounded-lg">
            <table class="w-full text-sm text-left text-slate-500">
              <thead class="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th class="px-6 py-3">Client Name</th>
                  <th class="px-6 py-3 text-right">Total Billed</th>
                  <th class="px-6 py-3 text-right">Total Received</th>
                  <th class="px-6 py-3 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody>
                @for(account of allClientsSummary(); track account.id) {
                    <tr class="border-b hover:bg-slate-50">
                      <td class="px-6 py-4 font-medium text-slate-800">{{ account.name }}</td>
                      <td class="px-6 py-4 text-right font-semibold text-blue-700">{{ account.totalBilled | currency }}</td>
                      <td class="px-6 py-4 text-right font-semibold text-green-700">{{ account.totalReceived | currency }}</td>
                      <td class="px-6 py-4 text-right font-bold" [class.text-red-600]="account.balanceDue > 0" [class.text-slate-800]="account.balanceDue <= 0">{{ account.balanceDue | currency }}</td>
                    </tr>
                } @empty {
                    <tr><td colspan="4" class="text-center p-8 text-slate-500">No client accounts found.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe]
})
export class StatementOfAccountsComponent {
  private fb = inject(FormBuilder);

  // --- Statement of Accounts Section State ---
  clients = signal<Client[]>([
    { id: 1, name: 'Innovate Corp' },
    { id: 2, name: 'Synergy Solutions' },
    { id: 3, name: 'Apex Industries' },
  ]);

  statementForm = this.fb.group({
    client: [null as Client | null, Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  statementData = signal<{
    transactions: StatementTransaction[],
    totalBilled: number,
    totalReceived: number,
    balanceDue: number
  } | null>(null);

  // --- All Clients Section State ---
  allClientsSummary = signal<ClientSummary[]>([
    { id: 1, name: 'Innovate Corp', totalBilled: 24500, totalReceived: 12500, balanceDue: 12000 },
    { id: 2, name: 'Synergy Solutions', totalBilled: 50000, totalReceived: 50000, balanceDue: 0 },
    { id: 3, name: 'Apex Industries', totalBilled: 15000, totalReceived: 10000, balanceDue: 5000 },
    { id: 4, name: 'Legacy Systems Ltd.', totalBilled: 150000, totalReceived: 150000, balanceDue: 0 },
    { id: 5, name: 'Vintage Tech Inc.', totalBilled: 75000, totalReceived: 60000, balanceDue: 15000 },
  ]);
  
  generateStatement(): void {
    if (this.statementForm.invalid) return;
    
    // Mock data generation
    const transactions: StatementTransaction[] = [
      { date: '2025-11-05', particulars: 'Invoice #INV-001 for Project Alpha', debit: 5000, credit: 0, balance: 0 },
      { date: '2025-11-15', particulars: 'Invoice #INV-002 for Project Alpha', debit: 7500, credit: 0, balance: 0 },
      { date: '2025-11-25', particulars: 'Payment Received via Bank Transfer', debit: 0, credit: 5000, balance: 0 },
      { date: '2025-12-05', particulars: 'Invoice #INV-003 for Project Beta', debit: 12000, credit: 0, balance: 0 },
      { date: '2025-12-20', particulars: 'Payment Received via Cheque', debit: 0, credit: 7500, balance: 0 },
    ];

    let runningBalance = 0;
    const processedTransactions = transactions.map(tx => {
      runningBalance = runningBalance + tx.debit - tx.credit;
      return { ...tx, balance: runningBalance };
    });

    const totalBilled = processedTransactions.reduce((sum, tx) => sum + tx.debit, 0);
    const totalReceived = processedTransactions.reduce((sum, tx) => sum + tx.credit, 0);

    this.statementData.set({
      transactions: processedTransactions,
      totalBilled,
      totalReceived,
      balanceDue: totalBilled - totalReceived,
    });
  }
}