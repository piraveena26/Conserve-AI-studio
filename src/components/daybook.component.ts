import { Component, ChangeDetectionStrategy, signal, inject, computed, Signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormControl, FormGroup } from '@angular/forms';
import { DaybookService } from '../services/daybook.service';
import { IncomeEntry, ExpenseEntry, TransferEntry, InhouseEntry, MainAccount, SubAccount } from '../models/account.model';

type DaybookTab = 'income' | 'expense' | 'transfer' | 'in-house';

@Component({
  selector: 'app-daybook',
  template: `
    <div class="space-y-6">
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Cash Card -->
        <div class="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4 border-l-4 border-blue-500">
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25-2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v-3.375c0-.621-.504-1.125-1.125-1.125H4.125C3.504 7.5 3 8.004 3 8.625v3.375" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Total Cash</p>
            <p class="text-2xl font-bold text-slate-800">{{ daybookService.totalCash() | currency }}</p>
          </div>
        </div>

        <!-- Cash in Bank Card -->
        <div class="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4 border-l-4 border-green-500">
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Cash in Bank</p>
            <p class="text-2xl font-bold text-slate-800">{{ daybookService.cashInBank() | currency }}</p>
          </div>
        </div>

        <!-- Cash in Hand Card -->
        <div class="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4 border-l-4 border-yellow-500">
          <div class="p-3 bg-yellow-100 rounded-full">
             <svg class="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.792V5.25A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25v13.5A2.25 2.25 0 005.25 21h9.75M21 12.792A2.25 2.25 0 0118.75 15H15v-4.5a.75.75 0 01.75-.75h3.75a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-.75m-4.5 4.5v.75a.75.75 0 00.75.75h3.75a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75h-.75m-4.5-4.5v-1.5a.75.75 0 01.75-.75h3.75a.75.75 0 01.75.75v1.5a.75.75 0 01-.75-.75h-3.75a.75.75 0 01-.75-.75z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">Cash in Hand</p>
            <p class="text-2xl font-bold text-slate-800">{{ daybookService.cashInHand() | currency }}</p>
          </div>
        </div>
      </div>
      
      <!-- Main Content Area -->
      <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 class="text-2xl font-bold text-slate-800">Day Book</h2>
          <div class="flex items-center space-x-4">
            @switch (activeTab()) {
              @case ('income') {
                <button (click)="openIncomeEntryModal()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
                  New Income Entry
                </button>
              }
              @case ('expense') {
                <button (click)="openExpenseEntryModal()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
                  New Expense Entry
                </button>
              }
              @case ('transfer') {
                <button (click)="openTransferModal()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
                  New Transfer Entry
                </button>
              }
              @case ('in-house') {
                <button (click)="openInHouseEntryModal()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
                  New In-house Entry
                </button>
              }
            }
          </div>
        </div>

        <!-- Tabs -->
        <div>
          <nav class="-mb-px flex" aria-label="Tabs">
            <button (click)="setActiveTab('income')" [class]="getTabClass('income')">Income</button>
            <button (click)="setActiveTab('expense')" [class]="getTabClass('expense')">Expense</button>
            <button (click)="setActiveTab('transfer')" [class]="getTabClass('transfer')">Transfer</button>
            <button (click)="setActiveTab('in-house')" [class]="getTabClass('in-house')">In-house</button>
          </nav>
        </div>
        
        <!-- Tab Content -->
        <div class="pt-4">
          @switch (activeTab()) {
            @case('income') {
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" class="px-6 py-3">ID</th>
                      <th scope="col" class="px-6 py-3">Account Name</th>
                      <th scope="col" class="px-6 py-3">Sub-Account</th>
                      <th scope="col" class="px-6 py-3">Division</th>
                      <th scope="col" class="px-6 py-3">Description</th>
                      <th scope="col" class="px-6 py-3">Mode</th>
                      <th scope="col" class="px-6 py-3">Credit Amount</th>
                      <th scope="col" class="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (entry of daybookService.incomeEntries(); track entry.id) {
                      <tr class="bg-white border-b hover:bg-slate-50">
                        <td class="px-6 py-4">{{ entry.id }}</td>
                        <td class="px-6 py-4 font-medium text-slate-800">{{ entry.mainAccount }}</td>
                        <td class="px-6 py-4">{{ entry.subAccount || 'N/A' }}</td>
                        <td class="px-6 py-4">{{ entry.division }}</td>
                        <td class="px-6 py-4 max-w-xs truncate">{{ entry.description }}</td>
                        <td class="px-6 py-4">{{ entry.mode }}</td>
                        <td class="px-6 py-4 font-semibold text-green-600">{{ entry.amount | currency }}</td>
                        <td class="px-6 py-4 text-right">
                          <div class="flex justify-end space-x-2">
                             <button (click)="editIncomeEntry(entry)" class="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100" title="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                            </button>
                            <button (click)="deleteIncomeEntry(entry.id)" class="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                       <tr><td colspan="8" class="text-center p-8 text-slate-500">No income entries yet.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
            @case('expense') {
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" class="px-6 py-3">ID</th>
                      <th scope="col" class="px-6 py-3">Account Name</th>
                      <th scope="col" class="px-6 py-3">Sub-Account</th>
                      <th scope="col" class="px-6 py-3">Division</th>
                      <th scope="col" class="px-6 py-3">Description</th>
                      <th scope="col" class="px-6 py-3">Mode</th>
                      <th scope="col" class="px-6 py-3">Debit Amount</th>
                      <th scope="col" class="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                     @for (entry of daybookService.expenseEntries(); track entry.id) {
                      <tr class="bg-white border-b hover:bg-slate-50">
                        <td class="px-6 py-4">{{ entry.id }}</td>
                        <td class="px-6 py-4 font-medium text-slate-800">{{ entry.mainAccount }}</td>
                        <td class="px-6 py-4">{{ entry.subAccount || 'N/A' }}</td>
                        <td class="px-6 py-4">{{ entry.division }}</td>
                        <td class="px-6 py-4 max-w-xs truncate">{{ entry.description }}</td>
                        <td class="px-6 py-4">{{ entry.mode }}</td>
                        <td class="px-6 py-4 font-semibold text-red-600">{{ entry.amount | currency }}</td>
                        <td class="px-6 py-4 text-right">
                           <div class="flex justify-end space-x-2">
                             <button (click)="editExpenseEntry(entry)" class="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100" title="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                            </button>
                            <button (click)="deleteExpenseEntry(entry.id)" class="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="8" class="text-center p-8 text-slate-500">No expense entries yet.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
             @case('transfer') {
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" class="px-6 py-3">ID</th>
                      <th scope="col" class="px-6 py-3">Date</th>
                      <th scope="col" class="px-6 py-3">Bank</th>
                      <th scope="col" class="px-6 py-3">Cash to Bank</th>
                      <th scope="col" class="px-6 py-3">Bank to Cash</th>
                      <th scope="col" class="px-6 py-3">Bank to Bank</th>
                      <th scope="col" class="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                     @for (entry of daybookService.transferEntries(); track entry.id) {
                      <tr class="bg-white border-b hover:bg-slate-50">
                        <td class="px-6 py-4">{{ entry.id }}</td>
                        <td class="px-6 py-4">{{ entry.entryDate }}</td>
                        <td class="px-6 py-4 font-medium text-slate-800">{{ entry.bank }}</td>
                        <td class="px-6 py-4 font-semibold text-blue-600">
                          @if(entry.type === 'Cash to Bank') {
                            {{ entry.amount | currency }}
                          }
                        </td>
                        <td class="px-6 py-4 font-semibold text-yellow-800">
                           @if(entry.type === 'Bank to Cash') {
                            {{ entry.amount | currency }}
                          }
                        </td>
                        <td class="px-6 py-4">
                          <!-- Placeholder for Bank to Bank -->
                        </td>
                        <td class="px-6 py-4 text-right">
                           <div class="flex justify-end space-x-2">
                             <button (click)="editTransferEntry(entry)" class="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100" title="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                            </button>
                            <button (click)="deleteTransferEntry(entry.id)" class="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="7" class="text-center p-8 text-slate-500">No transfer entries yet.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
            @case('in-house') {
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" class="px-6 py-3">ID</th>
                      <th scope="col" class="px-6 py-3">Account Name</th>
                      <th scope="col" class="px-6 py-3">Sub-account</th>
                      <th scope="col" class="px-6 py-3">Description</th>
                      <th scope="col" class="px-6 py-3">Mode</th>
                      <th scope="col" class="px-6 py-3">Credit</th>
                      <th scope="col" class="px-6 py-3">Debit</th>
                      <th scope="col" class="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                     @for (entry of daybookService.inhouseEntries(); track entry.id) {
                      <tr class="bg-white border-b hover:bg-slate-50">
                        <td class="px-6 py-4">{{ entry.id }}</td>
                        <td class="px-6 py-4 font-medium text-slate-800">{{ entry.mainAccount }}</td>
                        <td class="px-6 py-4">{{ entry.subAccount || 'N/A' }}</td>
                        <td class="px-6 py-4 max-w-xs truncate">{{ entry.description }}</td>
                        <td class="px-6 py-4">{{ entry.mode }}</td>
                        <td class="px-6 py-4 font-semibold text-green-600">{{ entry.credit | currency }}</td>
                        <td class="px-6 py-4 font-semibold text-red-600">{{ entry.debit | currency }}</td>
                        <td class="px-6 py-4 text-right">
                           <div class="flex justify-end space-x-2">
                             <button (click)="editInHouseEntry(entry)" class="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100" title="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                            </button>
                            <button (click)="deleteInHouseEntry(entry.id)" class="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="8" class="text-center p-8 text-slate-500">No in-house entries yet.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          }
        </div>
      </div>
    </div>

    <!-- New Income Entry Modal -->
    @if (showIncomeEntryModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-40 z-40" (click)="closeIncomeEntryModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl" (click)="$event.stopPropagation()">
          <div class="p-6 border-b">
            <h2 class="text-2xl font-bold text-slate-800">{{ editingIncomeEntry() ? 'Edit' : 'New' }} Income Entry</h2>
          </div>
          <form [formGroup]="incomeEntryForm" (ngSubmit)="onIncomeSubmit()">
            <div class="p-8 space-y-8">
              <div class="relative">
                <label for="entryDate" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Entry Date *</label>
                <input type="date" id="entryDate" formControlName="entryDate" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="relative">
                  <label for="mainAccount" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Main Account *</label>
                  <select id="mainAccount" formControlName="mainAccount" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                    <option [ngValue]="null" disabled>Select an account</option>
                    @for(account of daybookService.incomeMainAccounts(); track account.id) {
                      <option [ngValue]="account">{{ account.name }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                  </div>
                </div>

                @if (availableIncomeSubAccounts().length > 0) {
                  <div class="relative">
                    <label for="subAccount" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Sub Account *</label>
                    <select id="subAccount" formControlName="subAccount" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                      <option [ngValue]="null" disabled>Select a sub account</option>
                       @for(sub of availableIncomeSubAccounts(); track sub.id) {
                        <option [ngValue]="sub">{{ sub.name }}</option>
                      }
                    </select>
                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                  </div>
                }
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div class="relative">
                  <label for="division" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Division *</label>
                  <select id="division" formControlName="division" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                    <option value="" disabled>Select a division</option>
                    @for(div of daybookService.divisions(); track div) {
                      <option [value]="div">{{ div }}</option>
                    }
                  </select>
                   <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                </div>
                <div class="relative">
                  <label for="description" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Description</label>
                  <input type="text" id="description" formControlName="description" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="relative">
                  <label for="mode" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Mode *</label>
                  <select id="mode" formControlName="mode" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                    <option value="" disabled>Select a mode</option>
                     @for(m of daybookService.modes(); track m) {
                      <option [value]="m">{{ m }}</option>
                    }
                  </select>
                   <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                </div>
                <div class="relative">
                  <label for="amount" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Amount *</label>
                  <input type="number" id="amount" formControlName="amount" placeholder="0.00" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                </div>
              </div>
               @if (incomeEntryForm.get('mode')?.value === 'Bank Transfer' || incomeEntryForm.get('mode')?.value === 'Cheque') {
                <div class="relative">
                    <label for="incomeBank" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Bank *</label>
                    <select id="incomeBank" formControlName="bank" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                      <option value="" disabled>Select a bank</option>
                       @for(b of daybookService.banks(); track b.id) {
                        <option [value]="b.name">{{ b.name }}</option>
                      }
                    </select>
                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                      </div>
                  </div>
               }
            </div>
            <div class="flex justify-end p-4 bg-slate-50 border-t rounded-b-lg space-x-3">
              <button (click)="closeIncomeEntryModal()" type="button" class="px-8 py-2 text-sm font-semibold text-yellow-600 bg-white border border-yellow-500 rounded-lg hover:bg-yellow-50">Cancel</button>
              <button type="submit" [disabled]="incomeEntryForm.invalid" class="px-8 py-2 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 disabled:bg-cyan-400">{{ editingIncomeEntry() ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- New Expense Entry Modal -->
    @if (showExpenseEntryModal()) {
       <div class="fixed inset-0 bg-black bg-opacity-40 z-40" (click)="closeExpenseEntryModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl" (click)="$event.stopPropagation()">
          <div class="p-6 border-b">
            <h2 class="text-2xl font-bold text-slate-800">{{ editingExpenseEntry() ? 'Edit' : 'New' }} Expense Entry</h2>
          </div>
          <form [formGroup]="expenseEntryForm" (ngSubmit)="onExpenseSubmit()">
            <div class="p-8 space-y-8">
              <div class="relative">
                <label for="expEntryDate" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Entry Date *</label>
                <input type="date" id="expEntryDate" formControlName="entryDate" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="relative">
                  <label for="expMainAccount" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Main Account *</label>
                  <select id="expMainAccount" formControlName="mainAccount" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                    <option [ngValue]="null" disabled>Select an account</option>
                    @for(account of daybookService.expenseMainAccounts(); track account.id) {
                      <option [ngValue]="account">{{ account.name }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                  </div>
                </div>

                @if (availableExpenseSubAccounts().length > 0) {
                  <div class="relative">
                    <label for="expSubAccount" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Sub Account *</label>
                    <select id="expSubAccount" formControlName="subAccount" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                      <option [ngValue]="null" disabled>Select a sub account</option>
                       @for(sub of availableExpenseSubAccounts(); track sub.id) {
                        <option [ngValue]="sub">{{ sub.name }}</option>
                      }
                    </select>
                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                  </div>
                }
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div class="relative">
                  <label for="expDivision" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Division *</label>
                  <select id="expDivision" formControlName="division" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                    <option value="" disabled>Select a division</option>
                    @for(div of daybookService.divisions(); track div) {
                      <option [value]="div">{{ div }}</option>
                    }
                  </select>
                   <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                </div>
                <div class="relative">
                  <label for="expDescription" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Description</label>
                  <input type="text" id="expDescription" formControlName="description" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="relative">
                  <label for="expMode" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Mode *</label>
                  <select id="expMode" formControlName="mode" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                    <option value="" disabled>Select a mode</option>
                     @for(m of daybookService.modes(); track m) {
                      <option [value]="m">{{ m }}</option>
                    }
                  </select>
                   <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                </div>
                <div class="relative">
                  <label for="expAmount" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Amount *</label>
                  <input type="number" id="expAmount" formControlName="amount" placeholder="0.00" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                </div>
              </div>
              @if (expenseEntryForm.get('mode')?.value === 'Bank Transfer' || expenseEntryForm.get('mode')?.value === 'Cheque') {
                <div class="relative">
                    <label for="expBank" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Bank *</label>
                    <select id="expBank" formControlName="bank" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                      <option value="" disabled>Select a bank</option>
                       @for(b of daybookService.banks(); track b.id) {
                        <option [value]="b.name">{{ b.name }}</option>
                      }
                    </select>
                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                      </div>
                  </div>
              }
            </div>
            <div class="flex justify-end p-4 bg-slate-50 border-t rounded-b-lg space-x-3">
              <button (click)="closeExpenseEntryModal()" type="button" class="px-8 py-2 text-sm font-semibold text-yellow-600 bg-white border border-yellow-500 rounded-lg hover:bg-yellow-50">Cancel</button>
              <button type="submit" [disabled]="expenseEntryForm.invalid" class="px-8 py-2 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 disabled:bg-cyan-400">{{ editingExpenseEntry() ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- New Transfer Entry Modal -->
    @if (showTransferModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-40 z-40" (click)="closeTransferModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg" (click)="$event.stopPropagation()">
          <div class="p-6 border-b">
            <h2 class="text-2xl font-bold text-slate-800">{{ editingTransferEntry() ? 'Edit' : 'New' }} Transfer Entry</h2>
          </div>
          <form [formGroup]="transferEntryForm" (ngSubmit)="onTransferSubmit()">
            <div class="p-8 space-y-8">
              <div class="relative">
                <label for="trnEntryDate" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Entry Date *</label>
                <input type="date" id="trnEntryDate" formControlName="entryDate" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>
                </div>
              </div>

               <div class="relative">
                  <label for="trnType" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Transfer Type *</label>
                  <select id="trnType" formControlName="transferType" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                    <option [ngValue]="null" disabled>Select a type</option>
                    @for(t of transferTypes; track t.type) {
                      <option [ngValue]="t">{{ t.type }}</option>
                    }
                  </select>
                   <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                </div>

                 <div class="relative">
                    <label for="trnBank" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Bank *</label>
                    <select id="trnBank" formControlName="bank" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                      <option value="" disabled>Select a bank</option>
                       @for(b of daybookService.banks(); track b.id) {
                        <option [value]="b.name">{{ b.name }}</option>
                      }
                    </select>
                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                      </div>
                  </div>

                 <div class="relative">
                  <label for="trnAmount" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Amount *</label>
                  <input type="number" id="trnAmount" formControlName="amount" placeholder="0.00" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                </div>

            </div>
             <div class="flex justify-end p-4 bg-slate-50 border-t rounded-b-lg space-x-3">
              <button (click)="closeTransferModal()" type="button" class="px-8 py-2 text-sm font-semibold text-yellow-600 bg-white border border-yellow-500 rounded-lg hover:bg-yellow-50">Cancel</button>
              <button type="submit" [disabled]="transferEntryForm.invalid" class="px-8 py-2 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 disabled:bg-cyan-400">{{ editingTransferEntry() ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- New In-house Entry Modal -->
    @if (showInHouseEntryModal()) {
       <div class="fixed inset-0 bg-black bg-opacity-40 z-40" (click)="closeInHouseEntryModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl" (click)="$event.stopPropagation()">
          <div class="p-6 border-b">
            <h2 class="text-2xl font-bold text-slate-800">{{ editingInHouseEntry() ? 'Edit' : 'New' }} In-house Entry</h2>
          </div>
          <form [formGroup]="inHouseEntryForm" (ngSubmit)="onInHouseSubmit()">
            <div class="p-8 space-y-8">
              <div class="relative">
                <label for="ihEntryDate" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Entry Date *</label>
                <input type="date" id="ihEntryDate" formControlName="entryDate" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="relative">
                  <label for="ihMainAccount" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Main Account *</label>
                  <select id="ihMainAccount" formControlName="mainAccount" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                    <option [ngValue]="null" disabled>Select an account</option>
                    @for(account of daybookService.inhouseMainAccounts(); track account.id) {
                      <option [ngValue]="account">{{ account.name }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                  </div>
                </div>
                @if (availableInHouseSubAccounts().length > 0) {
                  <div class="relative">
                    <label for="ihSubAccount" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Sub Account *</label>
                    <select id="ihSubAccount" formControlName="subAccount" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                      <option [ngValue]="null" disabled>Select a sub account</option>
                       @for(sub of availableInHouseSubAccounts(); track sub.id) {
                        <option [ngValue]="sub">{{ sub.name }}</option>
                      }
                    </select>
                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                  </div>
                }
              </div>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="relative">
                    <label for="ihDescription" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Description</label>
                    <input type="text" id="ihDescription" formControlName="description" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                  </div>
                  <div class="relative">
                    <label for="ihMode" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Mode *</label>
                    <select id="ihMode" formControlName="mode" class="block w-full appearance-none rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                      <option value="" disabled>Select a mode</option>
                       @for(m of daybookService.modes(); track m) {
                        <option [value]="m">{{ m }}</option>
                      }
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                      </div>
                  </div>
               </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="relative">
                    <label for="ihCredit" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Credit *</label>
                    <input type="number" id="ihCredit" formControlName="credit" placeholder="0.00" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                  </div>
                   <div class="relative">
                    <label for="ihDebit" class="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Debit *</label>
                    <input type="number" id="ihDebit" formControlName="debit" placeholder="0.00" class="block w-full rounded-lg border border-slate-300 p-3 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                  </div>
               </div>
            </div>
             <div class="flex justify-end p-4 bg-slate-50 border-t rounded-b-lg space-x-3">
              <button (click)="closeInHouseEntryModal()" type="button" class="px-8 py-2 text-sm font-semibold text-yellow-600 bg-white border border-yellow-500 rounded-lg hover:bg-yellow-50">Cancel</button>
              <button type="submit" [disabled]="inHouseEntryForm.invalid" class="px-8 py-2 text-sm font-semibold text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 disabled:bg-cyan-400">{{ editingInHouseEntry() ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
})
export class DaybookComponent {
  daybookService = inject(DaybookService);
  private fb = inject(FormBuilder);
  
  activeTab = signal<DaybookTab>('income');

  // Modal control signals
  showIncomeEntryModal = signal(false);
  showExpenseEntryModal = signal(false);
  showTransferModal = signal(false);
  showInHouseEntryModal = signal(false);

  // Editing state signals
  editingIncomeEntry = signal<IncomeEntry | null>(null);
  editingExpenseEntry = signal<ExpenseEntry | null>(null);
  editingTransferEntry = signal<TransferEntry | null>(null);
  editingInHouseEntry = signal<InhouseEntry | null>(null);

  // --- Form Groups ---
  incomeEntryForm!: FormGroup;
  expenseEntryForm!: FormGroup;
  transferEntryForm!: FormGroup;
  inHouseEntryForm!: FormGroup;

  // --- Computed Properties for Sub-accounts ---
  availableIncomeSubAccounts = computed(() => {
    const mainAccount = this.incomeEntryForm.get('mainAccount')?.value as MainAccount | null;
    if (!mainAccount) return [];
    return this.daybookService.allSubAccounts().filter(sa => sa.mainAccountId === mainAccount.id);
  });

  availableExpenseSubAccounts = computed(() => {
    const mainAccount = this.expenseEntryForm.get('mainAccount')?.value as MainAccount | null;
    if (!mainAccount) return [];
    return this.daybookService.allSubAccounts().filter(sa => sa.mainAccountId === mainAccount.id);
  });
  
  availableInHouseSubAccounts = computed(() => {
    const mainAccount = this.inHouseEntryForm.get('mainAccount')?.value as MainAccount | null;
    if (!mainAccount) return [];
    return this.daybookService.allSubAccounts().filter(sa => sa.mainAccountId === mainAccount.id);
  });

  transferTypes = [{ type: 'Cash to Bank' }, { type: 'Bank to Cash' }];

  constructor() {
    this.initializeForms();
  }

  // --- Edit methods ---
// FIX: Add missing edit methods called from the template
editIncomeEntry(entry: IncomeEntry): void {
  const mainAccount = this.daybookService.incomeMainAccounts().find(a => a.name === entry.mainAccount);
  const subAccount = mainAccount ? this.daybookService.allSubAccounts().find(sa => sa.name === entry.subAccount && sa.mainAccountId === mainAccount.id) : undefined;
  this.editingIncomeEntry.set(entry);
  this.incomeEntryForm.patchValue({
    entryDate: entry.entryDate,
    mainAccount: mainAccount ?? null,
    subAccount: subAccount ?? null,
    division: entry.division,
    description: entry.description,
    mode: entry.mode,
    amount: entry.amount,
    bank: entry.bank
  });
  this.showIncomeEntryModal.set(true);
}

editExpenseEntry(entry: ExpenseEntry): void {
  const mainAccount = this.daybookService.expenseMainAccounts().find(a => a.name === entry.mainAccount);
  const subAccount = mainAccount ? this.daybookService.allSubAccounts().find(sa => sa.name === entry.subAccount && sa.mainAccountId === mainAccount.id) : undefined;
  this.editingExpenseEntry.set(entry);
  this.expenseEntryForm.patchValue({
    entryDate: entry.entryDate,
    mainAccount: mainAccount ?? null,
    subAccount: subAccount ?? null,
    division: entry.division,
    description: entry.description,
    mode: entry.mode,
    amount: entry.amount,
    bank: entry.bank
  });
  this.showExpenseEntryModal.set(true);
}

editTransferEntry(entry: TransferEntry): void {
  const transferType = this.transferTypes.find(t => t.type === entry.type);
  this.editingTransferEntry.set(entry);
  this.transferEntryForm.patchValue({
    entryDate: entry.entryDate,
    transferType: transferType ?? null,
    bank: entry.bank,
    amount: entry.amount
  });
  this.showTransferModal.set(true);
}

editInHouseEntry(entry: InhouseEntry): void {
  const mainAccount = this.daybookService.inhouseMainAccounts().find(a => a.name === entry.mainAccount);
  const subAccount = mainAccount ? this.daybookService.allSubAccounts().find(sa => sa.name === entry.subAccount && sa.mainAccountId === mainAccount.id) : undefined;
  this.editingInHouseEntry.set(entry);
  this.inHouseEntryForm.patchValue({
    entryDate: entry.entryDate,
    mainAccount: mainAccount ?? null,
    subAccount: subAccount ?? null,
    description: entry.description,
    mode: entry.mode,
    credit: entry.credit,
    debit: entry.debit
  });
  this.showInHouseEntryModal.set(true);
}

  // --- Initialization ---
  private initializeForms(): void {
    const today = new Date().toISOString().split('T')[0];

    // Income Form
    this.incomeEntryForm = this.fb.group({
      entryDate: [today, Validators.required],
      mainAccount: [null as MainAccount | null, Validators.required],
      subAccount: [null as SubAccount | null],
      division: ['', Validators.required],
      description: [''],
      mode: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      bank: ['']
    });

    // Expense Form
    this.expenseEntryForm = this.fb.group({
      entryDate: [today, Validators.required],
      mainAccount: [null as MainAccount | null, Validators.required],
      subAccount: [null as SubAccount | null],
      division: ['', Validators.required],
      description: [''],
      mode: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      bank: ['']
    });

    // Transfer Form
    this.transferEntryForm = this.fb.group({
        entryDate: [today, Validators.required],
        transferType: [null as {type: 'Cash to Bank' | 'Bank to Cash'} | null, Validators.required],
        bank: ['', Validators.required],
        amount: [null, [Validators.required, Validators.min(0.01)]]
    });
    
    // In-house Form
    this.inHouseEntryForm = this.fb.group({
      entryDate: [today, Validators.required],
      mainAccount: [null as MainAccount | null, Validators.required],
      subAccount: [null as SubAccount | null],
      description: [''],
      mode: ['', Validators.required],
      credit: [0, Validators.required],
      debit: [0, Validators.required],
    }, { validators: this.creditDebitValidator });

    this.setupSubAccountValidation(this.incomeEntryForm, this.availableIncomeSubAccounts);
    this.setupSubAccountValidation(this.expenseEntryForm, this.availableExpenseSubAccounts);
    this.setupSubAccountValidation(this.inHouseEntryForm, this.availableInHouseSubAccounts);

    this.setupBankValidation(this.incomeEntryForm);
    this.setupBankValidation(this.expenseEntryForm);
  }

  // --- Form Validation & Logic ---
  private setupSubAccountValidation(form: FormGroup, subAccountsSignal: Signal<SubAccount[]>): void {
    form.get('mainAccount')?.valueChanges.subscribe((mainAccount: MainAccount | null) => {
      const subAccountControl = form.get('subAccount');
      subAccountControl?.reset(null);
      if (mainAccount && subAccountsSignal().length > 0) {
        subAccountControl?.setValidators(Validators.required);
      } else {
        subAccountControl?.clearValidators();
      }
      subAccountControl?.updateValueAndValidity();
    });
  }

  private setupBankValidation(form: FormGroup): void {
    form.get('mode')?.valueChanges.subscribe((mode: string) => {
        const bankControl = form.get('bank');
        if (mode === 'Bank Transfer' || mode === 'Cheque') {
            bankControl?.setValidators(Validators.required);
        } else {
            bankControl?.clearValidators();
            bankControl?.reset('');
        }
        bankControl?.updateValueAndValidity();
    });
  }

  private creditDebitValidator(control: AbstractControl): ValidationErrors | null {
    const credit = control.get('credit')?.value;
    const debit = control.get('debit')?.value;
    return credit !== debit ? { creditDebitMismatch: true } : null;
  };

  // --- Public Methods ---
  setActiveTab(tab: DaybookTab): void {
    this.activeTab.set(tab);
  }

  getTabClass(tabName: DaybookTab): string {
    const baseClasses = 'py-4 px-6 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors';
    if (this.activeTab() === tabName) {
      return `${baseClasses} text-blue-600 border-b-2 border-blue-600`;
    }
    return `${baseClasses} border-b-2 border-transparent`;
  }
  
  // Modal open/close methods
  openIncomeEntryModal() { this.editingIncomeEntry.set(null); this.incomeEntryForm.reset({entryDate: new Date().toISOString().split('T')[0]}); this.showIncomeEntryModal.set(true); }
  closeIncomeEntryModal() { this.showIncomeEntryModal.set(false); }

  openExpenseEntryModal() { this.editingExpenseEntry.set(null); this.expenseEntryForm.reset({entryDate: new Date().toISOString().split('T')[0]}); this.showExpenseEntryModal.set(true); }
  closeExpenseEntryModal() { this.showExpenseEntryModal.set(false); }
  
  openTransferModal() { this.editingTransferEntry.set(null); this.transferEntryForm.reset({entryDate: new Date().toISOString().split('T')[0]}); this.showTransferModal.set(true); }
  closeTransferModal() { this.showTransferModal.set(false); }

  openInHouseEntryModal() { this.editingInHouseEntry.set(null); this.inHouseEntryForm.reset({entryDate: new Date().toISOString().split('T')[0], credit: 0, debit: 0}); this.showInHouseEntryModal.set(true); }
  closeInHouseEntryModal() { this.showInHouseEntryModal.set(false); }

  // Submit handlers
  onIncomeSubmit(): void {
    if (this.incomeEntryForm.invalid) return;
    const editing = this.editingIncomeEntry();
    if (editing) {
      this.daybookService.updateIncomeEntry(editing.id, this.incomeEntryForm.value);
    } else {
      this.daybookService.addIncomeEntry(this.incomeEntryForm.value);
    }
    this.closeIncomeEntryModal();
  }

  onExpenseSubmit(): void {
    if (this.expenseEntryForm.invalid) return;
    const editing = this.editingExpenseEntry();
    if (editing) {
      this.daybookService.updateExpenseEntry(editing.id, this.expenseEntryForm.value);
    } else {
      this.daybookService.addExpenseEntry(this.expenseEntryForm.value);
    }
    this.closeExpenseEntryModal();
  }
  
  onTransferSubmit(): void {
    if (this.transferEntryForm.invalid) return;
    const editing = this.editingTransferEntry();
    if(editing) {
      this.daybookService.updateTransferEntry(editing.id, this.transferEntryForm.value);
    } else {
      this.daybookService.addTransferEntry(this.transferEntryForm.value);
    }
    this.closeTransferModal();
  }

  onInHouseSubmit(): void {
    if (this.inHouseEntryForm.invalid) return;
    const editing = this.editingInHouseEntry();
    if (editing) {
      this.daybookService.updateInhouseEntry(editing.id, this.inHouseEntryForm.value);
    } else {
      this.daybookService.addInhouseEntry(this.inHouseEntryForm.value);
    }
    this.closeInHouseEntryModal();
  }

  // Delete handlers
  deleteIncomeEntry(id: number): void { this.daybookService.deleteIncomeEntry(id); }
  deleteExpenseEntry(id: number): void { this.daybookService.deleteExpenseEntry(id); }
  deleteTransferEntry(id: number): void { this.daybookService.deleteTransferEntry(id); }
  deleteInHouseEntry(id: number): void { this.daybookService.deleteInhouseEntry(id); }
}
