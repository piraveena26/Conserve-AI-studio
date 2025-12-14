import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface MainAccount {
  id: number;
  name: string;
  type: 'Expense' | 'Income' | 'In-house';
}

export interface SubAccount {
  id: number;
  mainAccount: string;
  name: string;
  type: 'Expense' | 'Income' | 'In-house';
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);

  private _mainAccounts = signal<MainAccount[]>([]);
  public readonly mainAccounts = this._mainAccounts.asReadonly();
  
  private _subAccounts = signal<SubAccount[]>([]);
  public readonly subAccounts = this._subAccounts.asReadonly();

  constructor() {
    this.loadMainAccounts();
    this.loadSubAccounts();
  }

  async loadMainAccounts(): Promise<void> {
    try {
      const accounts = await lastValueFrom(this.http.get<MainAccount[]>('/api/accounts/main'));
      this._mainAccounts.set(accounts);
    } catch (error) {
      console.error('Failed to load main accounts', error);
      this._mainAccounts.set([]);
    }
  }

  async addMainAccount(account: Omit<MainAccount, 'id'>): Promise<void> {
    await lastValueFrom(this.http.post<MainAccount>('/api/accounts/main', account));
    await this.loadMainAccounts();
  }

  async updateMainAccount(account: MainAccount): Promise<void> {
    await lastValueFrom(this.http.put<MainAccount>(`/api/accounts/main/${account.id}`, account));
    await this.loadMainAccounts();
  }

  async loadSubAccounts(): Promise<void> {
    try {
      const accounts = await lastValueFrom(this.http.get<SubAccount[]>('/api/accounts/sub'));
      this._subAccounts.set(accounts);
    } catch (error) {
      console.error('Failed to load sub accounts', error);
      this._subAccounts.set([]);
    }
  }

  async addSubAccount(account: Omit<SubAccount, 'id'>): Promise<void> {
    await lastValueFrom(this.http.post<SubAccount>('/api/accounts/sub', account));
    await this.loadSubAccounts();
  }

  async updateSubAccount(account: SubAccount): Promise<void> {
    await lastValueFrom(this.http.put<SubAccount>(`/api/accounts/sub/${account.id}`, account));
    await this.loadSubAccounts();
  }
}
