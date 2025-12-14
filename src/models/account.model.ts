export interface MainAccount {
  id: number;
  name: string;
  type: 'Expense' | 'Income' | 'In-house';
}

export interface SubAccount {
  id: number;
  name: string;
  mainAccountId: number;
}

export interface IncomeEntry {
  id: number;
  entryDate: string;
  mainAccount: string;
  subAccount?: string;
  division: string;
  description: string;
  mode: string;
  amount: number;
  type: 'Credit';
  bank?: string;
}

export interface ExpenseEntry {
  id: number;
  entryDate: string;
  mainAccount: string;
  subAccount?: string;
  division: string;
  description: string;
  mode: string;
  amount: number;
  type: 'Debit';
  bank?: string;
}

export interface TransferEntry {
  id: number;
  entryDate: string;
  amount: number;
  bank: string;
  type: 'Cash to Bank' | 'Bank to Cash';
}

export interface InhouseEntry {
  id: number;
  entryDate: string;
  mainAccount: string;
  subAccount?: string;
  description: string;
  mode: string;
  credit: number;
  debit: number;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
  accountNumber: string;
  branch: string;
}
