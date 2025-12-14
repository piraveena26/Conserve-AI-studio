import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DaybookService } from '../services/daybook.service';
import { InhouseEntry, IncomeEntry, ExpenseEntry } from '../models/account.model';

type ReportTab = 'in-house' | 'income' | 'expense' | 'expense-reports';

interface DateSummary {
  date: string;
  totalCredit?: number;
  totalDebit?: number;
  balance?: number;
  totalAmount?: number;
}

@Component({
  selector: 'app-account-reports',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h1 class="text-2xl font-bold text-slate-800">Account Reports</h1>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm">
        <div class="border-b border-slate-200">
            <nav class="flex" aria-label="Tabs">
              <button (click)="setActiveTab('in-house')" [class]="getTabClass('in-house')">
                Inhouse Accounts
              </button>
              <button (click)="setActiveTab('income')" [class]="getTabClass('income')">
                Income Accounts
              </button>
              <button (click)="setActiveTab('expense')" [class]="getTabClass('expense')">
                Expense Accounts
              </button>
              <button (click)="setActiveTab('expense-reports')" [class]="getTabClass('expense-reports')">
                Expense Reports
              </button>
            </nav>
        </div>

        <div class="p-6">
            @switch (activeTab()) {
              @case ('in-house') {
                <div class="space-y-6">
                  <form [formGroup]="inhouseFilterForm" (ngSubmit)="onInhouseFilter()" class="flex items-end space-x-4 p-4 bg-slate-50 rounded-lg border">
                    <div>
                      <label for="month-inhouse" class="block text-sm font-medium text-slate-700">Month</label>
                      <select id="month-inhouse" formControlName="month" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                        <option [ngValue]="null">Select Month</option>
                        @for (month of months; track month.value) { <option [value]="month.value">{{ month.name }}</option> }
                      </select>
                    </div>
                    <div>
                      <label for="fromDate-inhouse" class="block text-sm font-medium text-slate-700">From Date</label>
                      <input type="date" id="fromDate-inhouse" formControlName="fromDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                    </div>
                    <div>
                      <label for="toDate-inhouse" class="block text-sm font-medium text-slate-700">To Date</label>
                      <input type="date" id="toDate-inhouse" formControlName="toDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                    </div>
                    <button type="submit" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">Filter</button>
                    <button type="button" (click)="resetInhouseFilter()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 h-10 py-2 px-4">Reset</button>
                  </form>
                  <div class="space-y-4">
                    @for(summary of inhouseDateSummaries(); track summary.date) {
                      <div class="border border-slate-200 rounded-lg">
                        <div (click)="toggleDetails(summary.date)" class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                          <div class="flex justify-between items-center">
                              <div>
                                <h3 class="font-bold text-lg text-slate-800">{{ summary.date | date:'fullDate' }}</h3>
                              </div>
                              <div class="flex items-center space-x-8 text-right">
                                  <div><p class="text-xs text-slate-500">TOTAL CREDIT</p><p class="font-semibold text-green-600">{{ summary.totalCredit | currency }}</p></div>
                                  <div><p class="text-xs text-slate-500">TOTAL DEBIT</p><p class="font-semibold text-red-600">{{ summary.totalDebit | currency }}</p></div>
                                  <div><p class="text-xs text-slate-500">BALANCE</p><p class="font-bold text-slate-800">{{ summary.balance | currency }}</p></div>
                              </div>
                          </div>
                        </div>
                        @if (selectedDateForDetails() === summary.date) {
                          <div class="p-4 border-t border-slate-200 bg-slate-50">
                            <h4 class="text-md font-semibold text-slate-700 mb-2">Transactions on {{ summary.date | date:'mediumDate' }}</h4>
                            <div class="overflow-x-auto border rounded-lg bg-white">
                              <table class="w-full text-sm text-left text-slate-500">
                                <thead class="text-xs text-slate-700 uppercase bg-slate-100">
                                  <tr><th class="px-4 py-2">ID</th><th class="px-4 py-2">Account</th><th class="px-4 py-2">Sub-Account</th><th class="px-4 py-2">Mode</th><th class="px-4 py-2">Description</th><th class="px-4 py-2">Credit</th><th class="px-4 py-2">Debit</th></tr>
                                </thead>
                                <tbody>
                                  @for(entry of inhouseDetailsForSelectedDate(); track entry.id) {
                                    <tr class="border-b hover:bg-slate-50"><td class="px-4 py-2">{{ entry.id }}</td><td class="px-4 py-2 font-medium text-slate-800">{{ entry.mainAccount }}</td><td class="px-4 py-2">{{ entry.subAccount || 'N/A' }}</td><td class="px-4 py-2">{{ entry.mode }}</td><td class="px-4 py-2 max-w-xs truncate">{{ entry.description }}</td><td class="px-4 py-2 text-green-600">{{ entry.credit | currency }}</td><td class="px-4 py-2 text-red-600">{{ entry.debit | currency }}</td></tr>
                                  }
                                </tbody>
                              </table>
                            </div>
                          </div>
                        }
                      </div>
                    } @empty {
                      <div class="text-center p-8 text-slate-500 bg-slate-50 rounded-lg">No in-house entries found for the selected criteria.</div>
                    }
                  </div>
                </div>
              }
              @case ('income') {
                 <div class="space-y-6">
                    <form [formGroup]="incomeFilterForm" (ngSubmit)="onIncomeFilter()" class="flex items-end space-x-4 p-4 bg-slate-50 rounded-lg border">
                      <div><label for="month-income" class="block text-sm font-medium text-slate-700">Month</label><select id="month-income" formControlName="month" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"><option [ngValue]="null">Select Month</option>@for (month of months; track month.value) { <option [value]="month.value">{{ month.name }}</option> }</select></div>
                      <div><label for="fromDate-income" class="block text-sm font-medium text-slate-700">From Date</label><input type="date" id="fromDate-income" formControlName="fromDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                      <div><label for="toDate-income" class="block text-sm font-medium text-slate-700">To Date</label><input type="date" id="toDate-income" formControlName="toDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                      <button type="submit" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">Filter</button>
                      <button type="button" (click)="resetIncomeFilter()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 h-10 py-2 px-4">Reset</button>
                    </form>
                    <div class="space-y-4">
                      @for(summary of incomeDateSummaries(); track summary.date) {
                        <div class="border border-slate-200 rounded-lg">
                          <div (click)="toggleDetails(summary.date)" class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                              <div class="flex justify-between items-center">
                                <div><h3 class="font-bold text-lg text-slate-800">{{ summary.date | date:'fullDate' }}</h3></div>
                                <div><p class="text-xs text-slate-500">TOTAL CREDIT</p><p class="font-bold text-xl text-green-600">{{ summary.totalAmount | currency }}</p></div>
                              </div>
                          </div>
                          @if (selectedDateForDetails() === summary.date) {
                            <div class="p-4 border-t border-slate-200 bg-slate-50">
                              <h4 class="text-md font-semibold text-slate-700 mb-2">Transactions on {{ summary.date | date:'mediumDate' }}</h4>
                              <div class="overflow-x-auto border rounded-lg bg-white">
                                <table class="w-full text-sm text-left text-slate-500">
                                  <thead class="text-xs text-slate-700 uppercase bg-slate-100"><tr><th class="px-4 py-2">ID</th><th class="px-4 py-2">Account</th><th class="px-4 py-2">Sub-Account</th><th class="px-4 py-2">Mode</th><th class="px-4 py-2">Description</th><th class="px-4 py-2">Credit</th></tr></thead>
                                  <tbody>
                                    @for(entry of incomeDetailsForSelectedDate(); track entry.id) {
                                      <tr class="border-b hover:bg-slate-50"><td class="px-4 py-2">{{ entry.id }}</td><td class="px-4 py-2 font-medium text-slate-800">{{ entry.mainAccount }}</td><td class="px-4 py-2">{{ entry.subAccount || 'N/A' }}</td><td class="px-4 py-2">{{ entry.mode }}</td><td class="px-4 py-2 max-w-xs truncate">{{ entry.description }}</td><td class="px-4 py-2 text-green-600">{{ entry.amount | currency }}</td></tr>
                                    }
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          }
                        </div>
                      } @empty {
                         <div class="text-center p-8 text-slate-500 bg-slate-50 rounded-lg">No income entries found for the selected criteria.</div>
                      }
                    </div>
                  </div>
              }
              @case ('expense') {
                <div class="space-y-6">
                    <form [formGroup]="expenseFilterForm" (ngSubmit)="onExpenseFilter()" class="flex items-end space-x-4 p-4 bg-slate-50 rounded-lg border">
                      <div><label for="month-expense" class="block text-sm font-medium text-slate-700">Month</label><select id="month-expense" formControlName="month" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"><option [ngValue]="null">Select Month</option>@for (month of months; track month.value) { <option [value]="month.value">{{ month.name }}</option> }</select></div>
                      <div><label for="fromDate-expense" class="block text-sm font-medium text-slate-700">From Date</label><input type="date" id="fromDate-expense" formControlName="fromDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                      <div><label for="toDate-expense" class="block text-sm font-medium text-slate-700">To Date</label><input type="date" id="toDate-expense" formControlName="toDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                      <button type="submit" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">Filter</button>
                      <button type="button" (click)="resetExpenseFilter()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 h-10 py-2 px-4">Reset</button>
                    </form>
                    <div class="space-y-4">
                      @for(summary of expenseDateSummaries(); track summary.date) {
                        <div class="border border-slate-200 rounded-lg">
                           <div (click)="toggleDetails(summary.date)" class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                               <div class="flex justify-between items-center">
                                <div><h3 class="font-bold text-lg text-slate-800">{{ summary.date | date:'fullDate' }}</h3></div>
                                <div><p class="text-xs text-slate-500">TOTAL DEBIT</p><p class="font-bold text-xl text-red-600">{{ summary.totalAmount | currency }}</p></div>
                              </div>
                          </div>
                          @if (selectedDateForDetails() === summary.date) {
                            <div class="p-4 border-t border-slate-200 bg-slate-50">
                              <h4 class="text-md font-semibold text-slate-700 mb-2">Transactions on {{ summary.date | date:'mediumDate' }}</h4>
                              <div class="overflow-x-auto border rounded-lg bg-white">
                                <table class="w-full text-sm text-left text-slate-500">
                                  <thead class="text-xs text-slate-700 uppercase bg-slate-100"><tr><th class="px-4 py-2">ID</th><th class="px-4 py-2">Account</th><th class="px-4 py-2">Sub-Account</th><th class="px-4 py-2">Mode</th><th class="px-4 py-2">Description</th><th class="px-4 py-2">Debit</th></tr></thead>
                                  <tbody>
                                    @for(entry of expenseDetailsForSelectedDate(); track entry.id) {
                                      <tr class="border-b hover:bg-slate-50"><td class="px-4 py-2">{{ entry.id }}</td><td class="px-4 py-2 font-medium text-slate-800">{{ entry.mainAccount }}</td><td class="px-4 py-2">{{ entry.subAccount || 'N/A' }}</td><td class="px-4 py-2">{{ entry.mode }}</td><td class="px-4 py-2 max-w-xs truncate">{{ entry.description }}</td><td class="px-4 py-2 text-red-600">{{ entry.amount | currency }}</td></tr>
                                    }
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          }
                        </div>
                      } @empty {
                         <div class="text-center p-8 text-slate-500 bg-slate-50 rounded-lg">No expense entries found for the selected criteria.</div>
                      }
                    </div>
                  </div>
              }
              @case ('expense-reports') {
                <div class="space-y-6">
                  <form [formGroup]="expenseReportFilterForm" (ngSubmit)="onExpenseReportFilter()" class="p-4 bg-white rounded-lg border flex items-end space-x-4">
                      <div class="relative">
                          <label for="startDate" class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-500">Start Date</label>
                          <input type="date" id="startDate" formControlName="startDate" class="form-input block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      </div>
                      <div class="relative">
                          <label for="endDate" class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-500">End Date</label>
                          <input type="date" id="endDate" formControlName="endDate" class="form-input block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      </div>
                      <button type="submit" class="h-11 w-11 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg>
                      </button>
                  </form>

                  <div class="p-4 border border-red-500 rounded-lg text-center">
                    <h3 class="text-lg font-bold text-slate-800">Total Expenses {{ expenseReportFilterForm.value.startDate | date:'yyyy-MM-dd' }} - {{ expenseReportFilterForm.value.endDate | date:'yyyy-MM-dd' }}</h3>
                    <p class="text-xl font-bold text-red-600 mt-1">{{ totalFilteredExpenses() | currency:'SAR ' }}</p>
                  </div>

                  <div class="flex justify-between items-center">
                    <div class="relative">
                        <input #searchInput (input)="expenseReportSearchTerm.set(searchInput.value)" type="text" placeholder="Search..." class="form-input block w-full max-w-sm pl-9 pr-3 py-2 border-slate-300 rounded-full bg-white text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2">
                            <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Excel
                        </button>
                        <button class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2">
                            <svg class="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
                            Print
                        </button>
                        <div class="relative">
                            <button (click)="showExpenseReportColumnsDropdown.set(!showExpenseReportColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2">
                                Columns to Display <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                            </button>
                            @if(showExpenseReportColumnsDropdown()) {
                                <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10">
                                    @for(col of allExpenseReportColumns; track col.id) {
                                    <label class="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                                        <input type="checkbox" [checked]="visibleExpenseReportColumns().has(col.id)" (change)="toggleExpenseReportColumn(col.id)" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500">
                                        <span class="ml-3">{{ col.name }}</span>
                                    </label>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                  </div>

                  <div class="overflow-x-auto border rounded-lg bg-white">
                    <table class="w-full text-sm text-left text-slate-500">
                      <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                          <th class="px-2 py-3"><input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"></th>
                          @if(visibleExpenseReportColumns().has('id')) { <th class="px-6 py-3">ID</th> }
                          @if(visibleExpenseReportColumns().has('date')) { <th class="px-6 py-3">Date</th> }
                          @if(visibleExpenseReportColumns().has('mode')) { <th class="px-6 py-3">Mode</th> }
                          @if(visibleExpenseReportColumns().has('account')) { <th class="px-6 py-3">Account</th> }
                          @if(visibleExpenseReportColumns().has('subAccount')) { <th class="px-6 py-3">Sub Account</th> }
                          @if(visibleExpenseReportColumns().has('division')) { <th class="px-6 py-3">Division</th> }
                          @if(visibleExpenseReportColumns().has('description')) { <th class="px-6 py-3">Description</th> }
                          @if(visibleExpenseReportColumns().has('debit')) { <th class="px-6 py-3">Debit</th> }
                        </tr>
                      </thead>
                      <tbody>
                        @for (entry of filteredExpenseReportEntries(); track entry.id) {
                          <tr class="bg-white border-b hover:bg-slate-50">
                             <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"></td>
                             @if(visibleExpenseReportColumns().has('id')) { <td class="px-6 py-4">{{ entry.id }}</td> }
                             @if(visibleExpenseReportColumns().has('date')) { <td class="px-6 py-4">{{ entry.entryDate | date:'mediumDate' }}</td> }
                             @if(visibleExpenseReportColumns().has('mode')) { <td class="px-6 py-4">{{ entry.mode }}</td> }
                             @if(visibleExpenseReportColumns().has('account')) { <td class="px-6 py-4 font-medium text-slate-800">{{ entry.mainAccount }}</td> }
                             @if(visibleExpenseReportColumns().has('subAccount')) { <td class="px-6 py-4">{{ entry.subAccount || 'N/A' }}</td> }
                             @if(visibleExpenseReportColumns().has('division')) { <td class="px-6 py-4">{{ entry.division }}</td> }
                             @if(visibleExpenseReportColumns().has('description')) { <td class="px-6 py-4 max-w-xs truncate">{{ entry.description }}</td> }
                             @if(visibleExpenseReportColumns().has('debit')) { <td class="px-6 py-4 font-semibold text-red-600">{{ entry.amount | currency }}</td> }
                          </tr>
                        } @empty {
                          <tr>
                            <td [attr.colspan]="visibleExpenseReportColumns().size + 1" class="text-center p-8 text-slate-500">No expense entries found for the selected criteria.</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
})
export class AccountReportsComponent implements OnInit {
  private daybookService = inject(DaybookService);
  private fb = inject(FormBuilder);

  activeTab = signal<ReportTab>('in-house');
  selectedDateForDetails = signal<string | null>(null);

  // --- In-house State ---
  inhouseFilterForm = this.fb.group({ month: [null as number | null], fromDate: [''], toDate: [''] });
  filteredInhouseEntries = signal<InhouseEntry[]>([]);
  inhouseDateSummaries = computed(() => this.summarizeInhouseByDate(this.filteredInhouseEntries()));
  inhouseDetailsForSelectedDate = computed(() => {
    const selectedDate = this.selectedDateForDetails();
    if (!selectedDate || this.activeTab() !== 'in-house') return [];
    return this.filteredInhouseEntries().filter(e => e.entryDate === selectedDate);
  });

  // --- Income State ---
  incomeFilterForm = this.fb.group({ month: [null as number | null], fromDate: [''], toDate: [''] });
  filteredIncomeEntries = signal<IncomeEntry[]>([]);
  incomeDateSummaries = computed(() => this.summarizeIncomeByDate(this.filteredIncomeEntries()));
  incomeDetailsForSelectedDate = computed(() => {
    const selectedDate = this.selectedDateForDetails();
    if (!selectedDate || this.activeTab() !== 'income') return [];
    return this.filteredIncomeEntries().filter(e => e.entryDate === selectedDate);
  });

  // --- Expense State ---
  expenseFilterForm = this.fb.group({ month: [null as number | null], fromDate: [''], toDate: [''] });
  filteredExpenseEntries = signal<ExpenseEntry[]>([]);
  expenseDateSummaries = computed(() => this.summarizeExpenseByDate(this.filteredExpenseEntries()));
  expenseDetailsForSelectedDate = computed(() => {
    const selectedDate = this.selectedDateForDetails();
    if (!selectedDate || this.activeTab() !== 'expense') return [];
    return this.filteredExpenseEntries().filter(e => e.entryDate === selectedDate);
  });

  // --- Expense Reports State ---
    expenseReportFilterForm = this.fb.group({
        startDate: [''],
        endDate: ['']
    });
    
    allExpenseReportEntries = signal<ExpenseEntry[]>([]);
    expenseReportSearchTerm = signal('');

    filteredExpenseReportEntries = computed(() => {
        const entries = this.allExpenseReportEntries();
        const term = this.expenseReportSearchTerm().toLowerCase();

        if (!term) {
            return entries;
        }

        return entries.filter(entry => 
            entry.mainAccount.toLowerCase().includes(term) ||
            (entry.subAccount && entry.subAccount.toLowerCase().includes(term)) ||
            entry.description.toLowerCase().includes(term) ||
            entry.division.toLowerCase().includes(term)
        );
    });
    
    totalFilteredExpenses = computed(() => {
        return this.filteredExpenseReportEntries().reduce((sum, entry) => sum + entry.amount, 0);
    });
    
    showExpenseReportColumnsDropdown = signal(false);
    
    allExpenseReportColumns = [
        { id: 'id', name: 'ID' },
        { id: 'date', name: 'Date' },
        { id: 'mode', name: 'Mode' },
        { id: 'account', name: 'Account' },
        { id: 'subAccount', name: 'Sub Account' },
        { id: 'division', name: 'Division' },
        { id: 'description', name: 'Description' },
        { id: 'debit', name: 'Debit' }
    ];

    visibleExpenseReportColumns = signal(new Set(this.allExpenseReportColumns.map(c => c.id)));
  
  months = [
    { name: 'January', value: 0 }, { name: 'February', value: 1 },
    { name: 'March', value: 2 }, { name: 'April', value: 3 },
    { name: 'May', value: 4 }, { name: 'June', value: 5 },
    { name: 'July', value: 6 }, { name: 'August', value: 7 },
    { name: 'September', value: 8 }, { name: 'October', value: 9 },
    { name: 'November', value: 10 }, { name: 'December', value: 11 },
  ];

  ngOnInit(): void {
    this.resetInhouseFilter();
    this.resetIncomeFilter();
    this.resetExpenseFilter();
    this.resetExpenseReportFilter();

    this.setupMonthListener(this.inhouseFilterForm);
    this.setupMonthListener(this.incomeFilterForm);
    this.setupMonthListener(this.expenseFilterForm);
  }

  // --- Filter Handlers ---
  onInhouseFilter(): void {
    const { fromDate, toDate } = this.inhouseFilterForm.value;
    this.filteredInhouseEntries.set(this.daybookService.inhouseEntries().filter(e => this.isWithinDateRange(e.entryDate, fromDate, toDate)));
  }
  resetInhouseFilter(): void { this.inhouseFilterForm.reset(); this.filteredInhouseEntries.set(this.daybookService.inhouseEntries()); }
  
  onIncomeFilter(): void {
    const { fromDate, toDate } = this.incomeFilterForm.value;
    this.filteredIncomeEntries.set(this.daybookService.incomeEntries().filter(e => this.isWithinDateRange(e.entryDate, fromDate, toDate)));
  }
  resetIncomeFilter(): void { this.incomeFilterForm.reset(); this.filteredIncomeEntries.set(this.daybookService.incomeEntries()); }

  onExpenseFilter(): void {
    const { fromDate, toDate } = this.expenseFilterForm.value;
    this.filteredExpenseEntries.set(this.daybookService.expenseEntries().filter(e => this.isWithinDateRange(e.entryDate, fromDate, toDate)));
  }
  resetExpenseFilter(): void { this.expenseFilterForm.reset(); this.filteredExpenseEntries.set(this.daybookService.expenseEntries()); }

  onExpenseReportFilter(): void {
      const { startDate, endDate } = this.expenseReportFilterForm.value;
      this.allExpenseReportEntries.set(this.daybookService.expenseEntries().filter(e => this.isWithinDateRange(e.entryDate, startDate, endDate)));
  }

  resetExpenseReportFilter(): void {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      this.expenseReportFilterForm.reset({
          startDate: this.formatDateForInput(firstDay),
          endDate: this.formatDateForInput(lastDay)
      });
      
      this.onExpenseReportFilter();
  }

  // --- View State ---
  toggleDetails(date: string) {
    this.selectedDateForDetails.update(current => current === date ? null : date);
  }

  toggleExpenseReportColumn(columnId: string): void {
      this.visibleExpenseReportColumns.update(cols => {
        const newCols = new Set(cols);
        if (newCols.has(columnId)) {
          newCols.delete(columnId);
        } else {
          newCols.add(columnId);
        }
        return newCols;
      });
  }

  // --- Tabs ---
  setActiveTab(tab: ReportTab): void {
    this.activeTab.set(tab);
    this.selectedDateForDetails.set(null);
  }
  
  getTabClass(tabName: ReportTab): string {
    const baseClasses = 'py-4 px-6 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors';
    if (this.activeTab() === tabName) {
      return `${baseClasses} text-blue-600 border-b-2 border-blue-600`;
    }
    return `${baseClasses} border-b-2 border-transparent`;
  }
  
  // --- Private Helpers ---
  private setupMonthListener(form: FormGroup): void {
     form.get('month')?.valueChanges.subscribe(monthValue => {
      if (monthValue !== null && monthValue >= 0) {
        const year = new Date().getFullYear();
        const fromDate = new Date(year, monthValue, 1);
        const toDate = new Date(year, monthValue + 1, 0);
        form.patchValue({ fromDate: this.formatDateForInput(fromDate), toDate: this.formatDateForInput(toDate) }, { emitEvent: false });
      }
    });
  }

  private isWithinDateRange(entryDateStr: string, fromDateStr: string | null | undefined, toDateStr: string | null | undefined): boolean {
    if (!fromDateStr || !toDateStr) return true;
    return entryDateStr >= fromDateStr && entryDateStr <= toDateStr;
  }

  private formatDateForInput(date: Date): string { return date.toISOString().split('T')[0]; }

  private summarizeInhouseByDate(entries: InhouseEntry[]): DateSummary[] {
    const summaryMap = new Map<string, { totalCredit: number; totalDebit: number }>();
    for (const entry of entries) {
      const summary = summaryMap.get(entry.entryDate) ?? { totalCredit: 0, totalDebit: 0 };
      summary.totalCredit += entry.credit;
      summary.totalDebit += entry.debit;
      summaryMap.set(entry.entryDate, summary);
    }
    return Array.from(summaryMap.entries()).map(([date, { totalCredit, totalDebit }]) => ({ date, totalCredit, totalDebit, balance: totalCredit - totalDebit })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private summarizeIncomeByDate(entries: IncomeEntry[]): DateSummary[] {
    const summaryMap = new Map<string, { totalAmount: number }>();
    for (const entry of entries) {
      const summary = summaryMap.get(entry.entryDate) ?? { totalAmount: 0 };
      summary.totalAmount += entry.amount;
      summaryMap.set(entry.entryDate, summary);
    }
    return Array.from(summaryMap.entries()).map(([date, { totalAmount }]) => ({ date, totalAmount })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private summarizeExpenseByDate(entries: ExpenseEntry[]): DateSummary[] {
    const summaryMap = new Map<string, { totalAmount: number }>();
    for (const entry of entries) {
      const summary = summaryMap.get(entry.entryDate) ?? { totalAmount: 0 };
      summary.totalAmount += entry.amount;
      summaryMap.set(entry.entryDate, summary);
    }
    return Array.from(summaryMap.entries()).map(([date, { totalAmount }]) => ({ date, totalAmount })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
