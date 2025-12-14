import { Injectable, signal, computed } from '@angular/core';
import { MainAccount, SubAccount, IncomeEntry, ExpenseEntry, TransferEntry, InhouseEntry, Bank } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class DaybookService {

  // --- STATE ---
  private _cashInHand = signal(1850);
  private _cashInBank = signal(14300);
  
  private _allMainAccounts = signal<MainAccount[]>([
    { id: 1, name: 'Office Supplies', type: 'Expense' },
    { id: 2, name: 'Salaries', type: 'Expense' },
    { id: 3, name: 'Software Subscriptions', type: 'Expense' },
    { id: 4, name: 'Product Sales', type: 'Income' },
    { id: 5, name: 'Service Revenue', type: 'Income' },
    { id: 6, name: 'Internal Transfers', type: 'In-house' },
    { id: 7, name: 'Asset Depreciation', type: 'In-house' }
  ]);

  private _allSubAccounts = signal<SubAccount[]>([
    { id: 1, name: 'Domestic Sales', mainAccountId: 4 },
    { id: 2, name: 'International Sales', mainAccountId: 4 },
    { id: 3, name: 'Consulting Fees', mainAccountId: 5 },
    { id: 4, name: 'Stationery', mainAccountId: 1 },
    { id: 5, name: 'Computer Peripherals', mainAccountId: 1 },
    { id: 6, name: 'Widget A Sales', mainAccountId: 4 },
    { id: 7, name: 'Paper and Pens', mainAccountId: 1 },
  ]);

  private _incomeEntries = signal<IncomeEntry[]>([
    { id: 1, entryDate: '2025-12-10', mainAccount: 'Product Sales', subAccount: 'Domestic Sales', division: 'ENGINEERING', description: 'Sale of Product A', mode: 'Bank Transfer', amount: 5000, type: 'Credit', bank: 'HDFC Bank' },
    { id: 2, entryDate: '2025-12-11', mainAccount: 'Service Revenue', subAccount: 'Consulting Fees', division: 'BIM', description: 'Consulting services for Project X', mode: 'Cash', amount: 1500, type: 'Credit' }
  ]);
  private _nextIncomeId = signal(3);
  
  private _expenseEntries = signal<ExpenseEntry[]>([
    { id: 1, entryDate: '2025-12-10', mainAccount: 'Office Supplies', subAccount: 'Stationery', division: 'ENGINEERING', description: 'Purchase of pens and notebooks', mode: 'Cash', amount: 150, type: 'Debit' },
    { id: 2, entryDate: '2025-12-12', mainAccount: 'Software Subscriptions', division: 'BIM', description: 'Annual license for CAD software', mode: 'Bank Transfer', amount: 1200, type: 'Debit', bank: 'State Bank of India' }
  ]);
  private _nextExpenseId = signal(3);

  private _transferEntries = signal<TransferEntry[]>([
    { id: 1, entryDate: '2025-12-11', amount: 500, bank: 'HDFC Bank', type: 'Cash to Bank' }
  ]);
  private _nextTransferId = signal(2);

  private _inhouseEntries = signal<InhouseEntry[]>([
    { id: 1, entryDate: '2025-12-12', mainAccount: 'Internal Transfers', description: 'Moving funds for operational use', mode: 'Internal', credit: 1000, debit: 1000 }
  ]);
  private _nextInhouseId = signal(2);

  private _divisions = signal(['ENGINEERING', 'BIM', 'LASER', 'SIMULATION & ANALYSIS']);
  private _modes = signal(['Cash', 'Bank Transfer', 'Cheque']);
  
  private _banks = signal<Bank[]>([
    { id: 1, name: 'HDFC Bank', code: 'HDFC000123', accountNumber: '50100123456789', branch: 'Main Branch' },
    { id: 2, name: 'ICICI Bank', code: 'ICIC000456', accountNumber: '000401567890', branch: 'Corporate' },
    { id: 3, name: 'State Bank of India', code: 'SBIN000789', accountNumber: '20012345678', branch: 'City Center' },
  ]);
  private _nextBankId = signal(4);

  // --- PUBLIC READONLY SIGNALS ---
  public readonly cashInHand = this._cashInHand.asReadonly();
  public readonly cashInBank = this._cashInBank.asReadonly();
  public readonly allMainAccounts = this._allMainAccounts.asReadonly();
  public readonly allSubAccounts = this._allSubAccounts.asReadonly();
  public readonly incomeEntries = this._incomeEntries.asReadonly();
  public readonly expenseEntries = this._expenseEntries.asReadonly();
  public readonly transferEntries = this._transferEntries.asReadonly();
  public readonly inhouseEntries = this._inhouseEntries.asReadonly();
  public readonly divisions = this._divisions.asReadonly();
  public readonly modes = this._modes.asReadonly();
  public readonly banks = this._banks.asReadonly();

  // --- COMPUTED SIGNALS ---
  public readonly totalCash = computed(() => this.cashInHand() + this.cashInBank());
  public readonly incomeMainAccounts = computed(() => this.allMainAccounts().filter(acc => acc.type === 'Income'));
  public readonly expenseMainAccounts = computed(() => this.allMainAccounts().filter(acc => acc.type === 'Expense'));
  public readonly inhouseMainAccounts = computed(() => this.allMainAccounts().filter(acc => acc.type === 'In-house'));
  

  // --- INCOME METHODS ---
  addIncomeEntry(formValue: any): void {
    const newEntry: IncomeEntry = {
      id: this._nextIncomeId(),
      entryDate: formValue.entryDate!,
      mainAccount: formValue.mainAccount!.name,
      subAccount: formValue.subAccount?.name,
      division: formValue.division!,
      description: formValue.description!,
      mode: formValue.mode!,
      amount: formValue.amount!,
      type: 'Credit',
      bank: formValue.bank,
    };
    this._incomeEntries.update(entries => [...entries, newEntry]);
    this._nextIncomeId.update(id => id + 1);
    
    if (newEntry.mode === 'Cash') this._cashInHand.update(v => v + newEntry.amount);
    else this._cashInBank.update(v => v + newEntry.amount);
  }

  updateIncomeEntry(id: number, formValue: any): void {
    const oldEntry = this.incomeEntries().find(e => e.id === id);
    if (!oldEntry) return;

    // Revert old transaction
    if (oldEntry.mode === 'Cash') this._cashInHand.update(v => v - oldEntry.amount);
    else this._cashInBank.update(v => v - oldEntry.amount);

    const updatedEntry: IncomeEntry = {
      ...oldEntry,
      entryDate: formValue.entryDate!,
      mainAccount: formValue.mainAccount!.name,
      subAccount: formValue.subAccount?.name,
      division: formValue.division!,
      description: formValue.description!,
      mode: formValue.mode!,
      amount: formValue.amount!,
      bank: formValue.bank,
    };
    this._incomeEntries.update(entries => entries.map(e => e.id === id ? updatedEntry : e));

    // Apply new transaction
    if (updatedEntry.mode === 'Cash') this._cashInHand.update(v => v + updatedEntry.amount);
    else this._cashInBank.update(v => v + updatedEntry.amount);
  }

  deleteIncomeEntry(id: number): void {
    const entryToDelete = this.incomeEntries().find(e => e.id === id);
    if(entryToDelete) {
      if(entryToDelete.mode === 'Cash') this._cashInHand.update(v => v - entryToDelete.amount);
      else this._cashInBank.update(v => v - entryToDelete.amount);
      this._incomeEntries.update(entries => entries.filter(e => e.id !== id));
    }
  }

  // --- EXPENSE METHODS ---
  addExpenseEntry(formValue: any): void {
    const newEntry: ExpenseEntry = {
      id: this._nextExpenseId(),
      entryDate: formValue.entryDate!,
      mainAccount: formValue.mainAccount!.name,
      subAccount: formValue.subAccount?.name,
      division: formValue.division!,
      description: formValue.description!,
      mode: formValue.mode!,
      amount: formValue.amount!,
      type: 'Debit',
      bank: formValue.bank,
    };
    this._expenseEntries.update(entries => [...entries, newEntry]);
    this._nextExpenseId.update(id => id + 1);

    if (newEntry.mode === 'Cash') this._cashInHand.update(v => v - newEntry.amount);
    else this._cashInBank.update(v => v - newEntry.amount);
  }

  updateExpenseEntry(id: number, formValue: any): void {
    const oldEntry = this.expenseEntries().find(e => e.id === id);
    if (!oldEntry) return;

    if (oldEntry.mode === 'Cash') this._cashInHand.update(v => v + oldEntry.amount);
    else this._cashInBank.update(v => v + oldEntry.amount);

    const updatedEntry: ExpenseEntry = {
      ...oldEntry,
      entryDate: formValue.entryDate!,
      mainAccount: formValue.mainAccount!.name,
      subAccount: formValue.subAccount?.name,
      division: formValue.division!,
      description: formValue.description!,
      mode: formValue.mode!,
      amount: formValue.amount!,
      bank: formValue.bank,
    };
    this._expenseEntries.update(entries => entries.map(e => e.id === id ? updatedEntry : e));

    if (updatedEntry.mode === 'Cash') this._cashInHand.update(v => v - updatedEntry.amount);
    else this._cashInBank.update(v => v - updatedEntry.amount);
  }

  deleteExpenseEntry(id: number): void {
    const entryToDelete = this.expenseEntries().find(e => e.id === id);
    if(entryToDelete) {
      if(entryToDelete.mode === 'Cash') this._cashInHand.update(v => v + entryToDelete.amount);
      else this._cashInBank.update(v => v + entryToDelete.amount);
      this._expenseEntries.update(entries => entries.filter(e => e.id !== id));
    }
  }

  // --- TRANSFER METHODS ---
  addTransferEntry(formValue: any): void {
    const newEntry: TransferEntry = {
      id: this._nextTransferId(),
      entryDate: formValue.entryDate!,
      bank: formValue.bank!,
      amount: formValue.amount!,
      type: formValue.transferType!.type
    };
    this._transferEntries.update(entries => [...entries, newEntry]);
    this._nextTransferId.update(id => id + 1);

    if (newEntry.type === 'Cash to Bank') {
      this._cashInHand.update(v => v - newEntry.amount);
      this._cashInBank.update(v => v + newEntry.amount);
    } else {
      this._cashInHand.update(v => v + newEntry.amount);
      this._cashInBank.update(v => v - newEntry.amount);
    }
  }

  updateTransferEntry(id: number, formValue: any): void {
    const oldEntry = this.transferEntries().find(e => e.id === id);
    if (!oldEntry) return;

    if (oldEntry.type === 'Cash to Bank') {
      this._cashInHand.update(v => v + oldEntry.amount);
      this._cashInBank.update(v => v - oldEntry.amount);
    } else {
      this._cashInHand.update(v => v - oldEntry.amount);
      this._cashInBank.update(v => v + oldEntry.amount);
    }

    const updatedEntry: TransferEntry = {
      ...oldEntry,
      entryDate: formValue.entryDate!,
      bank: formValue.bank!,
      amount: formValue.amount!,
      type: formValue.transferType!.type
    };
    this._transferEntries.update(entries => entries.map(e => e.id === id ? updatedEntry : e));

    if (updatedEntry.type === 'Cash to Bank') {
      this._cashInHand.update(v => v - updatedEntry.amount);
      this._cashInBank.update(v => v + updatedEntry.amount);
    } else {
      this._cashInHand.update(v => v + updatedEntry.amount);
      this._cashInBank.update(v => v - updatedEntry.amount);
    }
  }

  deleteTransferEntry(id: number): void {
    const entryToDelete = this.transferEntries().find(e => e.id === id);
    if(entryToDelete) {
      if (entryToDelete.type === 'Cash to Bank') {
        this._cashInHand.update(v => v + entryToDelete.amount);
        this._cashInBank.update(v => v - entryToDelete.amount);
      } else {
        this._cashInHand.update(v => v - entryToDelete.amount);
        this._cashInBank.update(v => v + entryToDelete.amount);
      }
      this._transferEntries.update(entries => entries.filter(e => e.id !== id));
    }
  }

  // --- IN-HOUSE METHODS ---
  addInhouseEntry(formValue: any): void {
    const newEntry: InhouseEntry = {
      id: this._nextInhouseId(),
      entryDate: formValue.entryDate!,
      mainAccount: formValue.mainAccount!.name,
      subAccount: formValue.subAccount?.name,
      description: formValue.description!,
      mode: formValue.mode!,
      credit: formValue.credit!,
      debit: formValue.debit!
    };
    this._inhouseEntries.update(entries => [...entries, newEntry]);
    this._nextInhouseId.update(id => id + 1);
  }

  updateInhouseEntry(id: number, formValue: any): void {
    const oldEntry = this.inhouseEntries().find(e => e.id === id);
    if (!oldEntry) return;

    const updatedEntry: InhouseEntry = {
      ...oldEntry,
      entryDate: formValue.entryDate!,
      mainAccount: formValue.mainAccount!.name,
      subAccount: formValue.subAccount?.name,
      description: formValue.description!,
      mode: formValue.mode!,
      credit: formValue.credit!,
      debit: formValue.debit!
    };
    this._inhouseEntries.update(entries => entries.map(e => e.id === id ? updatedEntry : e));
  }

  deleteInhouseEntry(id: number): void {
    this._inhouseEntries.update(entries => entries.filter(e => e.id !== id));
  }

  // --- BANK METHODS ---
  addBank(bankData: Omit<Bank, 'id'>): void {
    const newBank: Bank = {
      ...bankData,
      id: this._nextBankId(),
    };
    this._banks.update(banks => [...banks, newBank]);
    this._nextBankId.update(id => id + 1);
  }

  updateBank(updatedBank: Bank): void {
    this._banks.update(banks => 
      banks.map(b => b.id === updatedBank.id ? updatedBank : b)
    );
  }

  deleteBank(bankId: number): void {
    this._banks.update(banks => banks.filter(b => b.id !== bankId));
  }
}
