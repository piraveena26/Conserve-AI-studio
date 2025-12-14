import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { MainAccount, SubAccount, IncomeEntry, ExpenseEntry, TransferEntry, InhouseEntry, Bank } from '../models/account.model';
import { FinancialConfigService } from './financial-config.service';

@Injectable({
  providedIn: 'root'
})
export class DaybookService {
  private http = inject(HttpClient);
  private financialConfigService = inject(FinancialConfigService);

  // --- STATE ---
  private _cashInHand = signal(0);
  private _cashInBank = signal(0);
  
  private _allMainAccounts = signal<MainAccount[]>([]);
  private _allSubAccounts = signal<SubAccount[]>([]);
  private _incomeEntries = signal<IncomeEntry[]>([]);
  private _expenseEntries = signal<ExpenseEntry[]>([]);
  private _transferEntries = signal<TransferEntry[]>([]);
  private _inhouseEntries = signal<InhouseEntry[]>([]);
  private _modes = signal<string[]>([]);
  private _banks = signal<Bank[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    try {
      // Use Promise.all to fetch data in parallel
      const [
        summary,
        mainAccounts,
        subAccounts,
        income,
        expense,
        transfer,
        inhouse,
        modes,
        banks
      ] = await Promise.all([
        lastValueFrom(this.http.get<{ cashInHand: number, cashInBank: number }>('/api/daybook/summary')),
        lastValueFrom(this.http.get<MainAccount[]>('/api/accounts/main')),
        lastValueFrom(this.http.get<SubAccount[]>('/api/accounts/sub')),
        lastValueFrom(this.http.get<IncomeEntry[]>('/api/daybook/income')),
        lastValueFrom(this.http.get<ExpenseEntry[]>('/api/daybook/expense')),
        lastValueFrom(this.http.get<TransferEntry[]>('/api/daybook/transfer')),
        lastValueFrom(this.http.get<InhouseEntry[]>('/api/daybook/inhouse')),
        lastValueFrom(this.http.get<string[]>('/api/daybook/modes')),
        lastValueFrom(this.http.get<Bank[]>('/api/banks'))
      ]);
      
      this._cashInHand.set(summary.cashInHand);
      this._cashInBank.set(summary.cashInBank);
      this._allMainAccounts.set(mainAccounts);
      this._allSubAccounts.set(subAccounts);
      this._incomeEntries.set(income);
      this._expenseEntries.set(expense);
      this._transferEntries.set(transfer);
      this._inhouseEntries.set(inhouse);
      this._modes.set(modes);
      this._banks.set(banks);

    } catch (error) {
      console.error("Failed to load initial daybook data", error);
    }
  }

  // --- PUBLIC READONLY SIGNALS ---
  public readonly cashInHand = this._cashInHand.asReadonly();
  public readonly cashInBank = this._cashInBank.asReadonly();
  public readonly allMainAccounts = this._allMainAccounts.asReadonly();
  public readonly allSubAccounts = this._allSubAccounts.asReadonly();
  public readonly incomeEntries = this._incomeEntries.asReadonly();
  public readonly expenseEntries = this._expenseEntries.asReadonly();
  public readonly transferEntries = this._transferEntries.asReadonly();
  public readonly inhouseEntries = this._inhouseEntries.asReadonly();
  public readonly divisions = this.financialConfigService.divisions;
  public readonly modes = this._modes.asReadonly();
  public readonly banks = this._banks.asReadonly();

  // --- COMPUTED SIGNALS ---
  public readonly totalCash = computed(() => this.cashInHand() + this.cashInBank());
  public readonly incomeMainAccounts = computed(() => this.allMainAccounts().filter(acc => acc.type === 'Income'));
  public readonly expenseMainAccounts = computed(() => this.allMainAccounts().filter(acc => acc.type === 'Expense'));
  public readonly inhouseMainAccounts = computed(() => this.allMainAccounts().filter(acc => acc.type === 'In-house'));
  

  // --- INCOME METHODS ---
  async addIncomeEntry(formValue: any): Promise<void> {
    const newEntry = { ...formValue, mainAccount: formValue.mainAccount?.name, subAccount: formValue.subAccount?.name };
    await lastValueFrom(this.http.post('/api/daybook/income', newEntry));
    await this.loadInitialData(); // A simple way to refresh all data
  }

  async updateIncomeEntry(id: number, formValue: any): Promise<void> {
    const updatedEntry = { ...formValue, mainAccount: formValue.mainAccount?.name, subAccount: formValue.subAccount?.name };
    await lastValueFrom(this.http.put(`/api/daybook/income/${id}`, updatedEntry));
    await this.loadInitialData();
  }

  async deleteIncomeEntry(id: number): Promise<void> {
    await lastValueFrom(this.http.delete(`/api/daybook/income/${id}`));
    await this.loadInitialData();
  }

  // --- EXPENSE METHODS ---
  async addExpenseEntry(formValue: any): Promise<void> {
    const newEntry = { ...formValue, mainAccount: formValue.mainAccount?.name, subAccount: formValue.subAccount?.name };
    await lastValueFrom(this.http.post('/api/daybook/expense', newEntry));
    await this.loadInitialData();
  }

  async updateExpenseEntry(id: number, formValue: any): Promise<void> {
    const updatedEntry = { ...formValue, mainAccount: formValue.mainAccount?.name, subAccount: formValue.subAccount?.name };
    await lastValueFrom(this.http.put(`/api/daybook/expense/${id}`, updatedEntry));
    await this.loadInitialData();
  }

  async deleteExpenseEntry(id: number): Promise<void> {
    await lastValueFrom(this.http.delete(`/api/daybook/expense/${id}`));
    await this.loadInitialData();
  }

  // --- TRANSFER METHODS ---
  async addTransferEntry(formValue: any): Promise<void> {
    const newEntry = { ...formValue, transferType: formValue.transferType?.type };
    await lastValueFrom(this.http.post('/api/daybook/transfer', newEntry));
    await this.loadInitialData();
  }

  async updateTransferEntry(id: number, formValue: any): Promise<void> {
    const updatedEntry = { ...formValue, transferType: formValue.transferType?.type };
    await lastValueFrom(this.http.put(`/api/daybook/transfer/${id}`, updatedEntry));
    await this.loadInitialData();
  }

  async deleteTransferEntry(id: number): Promise<void> {
    await lastValueFrom(this.http.delete(`/api/daybook/transfer/${id}`));
    await this.loadInitialData();
  }

  // --- IN-HOUSE METHODS ---
  async addInhouseEntry(formValue: any): Promise<void> {
    const newEntry = { ...formValue, mainAccount: formValue.mainAccount?.name, subAccount: formValue.subAccount?.name };
    await lastValueFrom(this.http.post('/api/daybook/inhouse', newEntry));
    await this.loadInitialData();
  }

  async updateInhouseEntry(id: number, formValue: any): Promise<void> {
    const updatedEntry = { ...formValue, mainAccount: formValue.mainAccount?.name, subAccount: formValue.subAccount?.name };
    await lastValueFrom(this.http.put(`/api/daybook/inhouse/${id}`, updatedEntry));
    await this.loadInitialData();
  }

  async deleteInhouseEntry(id: number): Promise<void> {
    await lastValueFrom(this.http.delete(`/api/daybook/inhouse/${id}`));
    await this.loadInitialData();
  }

  // --- BANK METHODS ---
  async addBank(bankData: Omit<Bank, 'id'>): Promise<void> {
    await lastValueFrom(this.http.post<Bank>('/api/banks', bankData));
    await this.loadInitialData();
  }

  async updateBank(updatedBank: Bank): Promise<void> {
    await lastValueFrom(this.http.put<Bank>(`/api/banks/${updatedBank.id}`, updatedBank));
    await this.loadInitialData();
  }

  async deleteBank(bankId: number): Promise<void> {
    await lastValueFrom(this.http.delete(`/api/banks/${bankId}`));
    await this.loadInitialData();
  }
}
