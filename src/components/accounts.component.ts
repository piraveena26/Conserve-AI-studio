import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainAccountComponent } from './main-account.component';
import { AllAccountsComponent } from './all-accounts.component';
import { SubAccountComponent } from './sub-account.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AccountService, MainAccount, SubAccount } from '../services/account.service';

// FIX: Re-export types to solve circular dependency with child components.
export type { MainAccount, SubAccount } from '../services/account.service';

type AccountTab = 'main' | 'all' | 'sub';

@Component({
  selector: 'app-accounts',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-800">Accounts</h1>
        <div>
          @if (activeTab() === 'main' || activeTab() === 'all') {
            <button (click)="openAddMainAccountModal()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
              Add Main Account
            </button>
          }
          @if (activeTab() === 'sub') {
            <button (click)="openAddSubAccountModal()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
              Add Sub-account
            </button>
          }
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm">
        <div class="border-b border-slate-200">
            <nav class="flex" aria-label="Tabs">
              <button (click)="setActiveTab('all')" [class]="getTabClass('all')">
                All accounts
              </button>
              <button (click)="setActiveTab('main')" [class]="getTabClass('main')">
                Main account
              </button>
              <button (click)="setActiveTab('sub')" [class]="getTabClass('sub')">
                Sub account
              </button>
            </nav>
        </div>

        <div class="p-6">
            @switch (activeTab()) {
              @case ('main') {
                <app-main-account [accounts]="mainAccounts()" (edit)="handleEditMainAccount($event)"></app-main-account>
              }
              @case ('all') {
                <app-all-accounts [accounts]="mainAccounts()"></app-all-accounts>
              }
              @case ('sub') {
                <app-sub-account [accounts]="subAccounts()" (edit)="handleEditSubAccount($event)"></app-sub-account>
              }
            }
        </div>
      </div>
    </div>

    <!-- Add/Edit Main Account Modal -->
    @if (showAddMainAccountModal()) {
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40" (click)="closeAddMainAccountModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg" (click)="$event.stopPropagation()">
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900">{{ editingMainAccount() ? 'Edit Account' : 'Add New Account' }}</h2>
            <h3 class="text-lg text-gray-500 mt-4 mb-8">{{ editingMainAccount() ? 'Edit-Account' : 'Add-Account' }}</h3>
            
            <form [formGroup]="addMainAccountForm" (ngSubmit)="onAddMainAccountSubmit()" class="space-y-8">
              <div>
                <label for="accountName" class="block text-sm font-medium text-gray-700">Account Name *</label>
                <input type="text" id="accountName" formControlName="accountName" 
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                      [class.border-red-300]="addMainAccountForm.get('accountName')?.invalid && addMainAccountForm.get('accountName')?.touched">
              </div>

              <div>
                <label for="accountType" class="block text-sm font-medium text-gray-700">Type *</label>
                <select id="accountType" formControlName="type" 
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                        [class.border-red-300]="addMainAccountForm.get('type')?.invalid && addMainAccountForm.get('type')?.touched">
                  <option value="" disabled>Select type</option>
                  @for (type of accountTypes; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
              </div>
              
              <div class="flex justify-end space-x-4 pt-4">
                <button (click)="closeAddMainAccountModal()" type="button" 
                        class="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Cancel
                </button>
                <button type="submit" 
                        class="px-6 py-2 text-sm font-medium text-white bg-cyan-500 border border-transparent rounded-md shadow-sm hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-300"
                        [disabled]="addMainAccountForm.invalid">
                  {{ editingMainAccount() ? 'Update' : 'Create' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Add/Edit Sub Account Modal -->
    @if (showAddSubAccountModal()) {
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40" (click)="closeAddSubAccountModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg" (click)="$event.stopPropagation()">
          <div class="p-8">
            <h2 class="text-2xl font-bold text-gray-900">{{ editingSubAccount() ? 'Edit Sub Account' : 'Add New Sub Account' }}</h2>
            <h3 class="text-lg text-gray-500 mt-4 mb-8">{{ editingSubAccount() ? 'Edit Sub Account' : 'Add Sub Account' }}</h3>
            
            <form [formGroup]="addSubAccountForm" (ngSubmit)="onAddSubAccountSubmit()" class="space-y-8">
              <div>
                <label for="subAccountType" class="block text-sm font-medium text-gray-700">Account Type *</label>
                <select id="subAccountType" formControlName="accountType" 
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
                  <option value="" disabled>Select type</option>
                  @for (type of accountTypes; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
              </div>
              
              <div>
                <label for="mainAccount" class="block text-sm font-medium text-gray-700">Main Account *</label>
                <select id="mainAccount" formControlName="mainAccount" 
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 disabled:bg-slate-50 disabled:cursor-not-allowed">
                  <option value="" disabled>Select main account</option>
                  @for (account of filteredMainAccounts(); track account.name) {
                    <option [value]="account.name">{{ account.name }}</option>
                  }
                </select>
              </div>

              <div>
                <label for="subAccountName" class="block text-sm font-medium text-gray-700">Sub Account Name *</label>
                <input type="text" id="subAccountName" formControlName="subAccountName" 
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
              </div>
              
              <div class="flex justify-end space-x-4 pt-4">
                <button (click)="closeAddSubAccountModal()" type="button" 
                        class="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Cancel
                </button>
                <button type="submit" 
                        class="px-6 py-2 text-sm font-medium text-white bg-cyan-500 border border-transparent rounded-md shadow-sm hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-300"
                        [disabled]="addSubAccountForm.invalid">
                   {{ editingSubAccount() ? 'Update' : 'Create' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MainAccountComponent,
    AllAccountsComponent,
    SubAccountComponent,
    ReactiveFormsModule,
  ],
})
export class AccountsComponent {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  activeTab = signal<AccountTab>('all');
  showAddMainAccountModal = signal(false);
  showAddSubAccountModal = signal(false);
  editingMainAccount = signal<MainAccount | null>(null);
  editingSubAccount = signal<SubAccount | null>(null);
  selectedSubAccountType = signal<string | null | undefined>(null);

  accountTypes: Array<MainAccount['type']> = ['Expense', 'Income', 'In-house'];
  
  mainAccounts = this.accountService.mainAccounts;
  subAccounts = this.accountService.subAccounts;
  
  addMainAccountForm = this.fb.group({
    accountName: ['', Validators.required],
    type: ['', Validators.required]
  });

  addSubAccountForm = this.fb.group({
    accountType: ['', Validators.required],
    mainAccount: [{value: '', disabled: true}, Validators.required],
    subAccountName: ['', Validators.required]
  });

  filteredMainAccounts = computed(() => {
    const selectedType = this.selectedSubAccountType();
    if (!selectedType) {
        return [];
    }
    return this.mainAccounts().filter(acc => acc.type === selectedType);
  });

  constructor() {
    this.addMainAccountForm.get('type')?.setValue('');
    this.addSubAccountForm.get('accountType')?.valueChanges.subscribe(type => {
      this.selectedSubAccountType.set(type);
      const mainAccountControl = this.addSubAccountForm.get('mainAccount');
      if (!this.editingSubAccount()) {
        mainAccountControl?.reset('');
      }
      
      if (type) {
        mainAccountControl?.enable();
      } else {
        mainAccountControl?.disable();
      }
    });
  }

  setActiveTab(tab: AccountTab): void {
    this.activeTab.set(tab);
  }

  getTabClass(tabName: AccountTab): string {
    const baseClasses = 'flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center transition-colors';
    if (this.activeTab() === tabName) {
      return `${baseClasses} border-blue-500 text-blue-600`;
    }
    return `${baseClasses} border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`;
  }
  
  openAddMainAccountModal(): void {
    this.editingMainAccount.set(null);
    this.addMainAccountForm.reset({ type: '' });
    this.showAddMainAccountModal.set(true);
  }

  closeAddMainAccountModal(): void {
    this.showAddMainAccountModal.set(false);
    this.editingMainAccount.set(null);
  }

  async onAddMainAccountSubmit(): Promise<void> {
    if (this.addMainAccountForm.invalid) return;

    const formValue = this.addMainAccountForm.getRawValue();
    const editing = this.editingMainAccount();

    try {
      if (editing) {
        await this.accountService.updateMainAccount({
          id: editing.id,
          name: formValue.accountName!,
          type: formValue.type! as MainAccount['type']
        });
      } else {
        await this.accountService.addMainAccount({
          name: formValue.accountName!,
          type: formValue.type! as MainAccount['type'],
        });
      }
    } catch (error) {
      console.error('Failed to save main account', error);
    }
    this.closeAddMainAccountModal();
  }
  
  openAddSubAccountModal(): void {
    this.editingSubAccount.set(null);
    this.selectedSubAccountType.set(null);
    this.addSubAccountForm.reset({ accountType: '', mainAccount: '' });
    this.addSubAccountForm.get('mainAccount')?.disable();
    this.showAddSubAccountModal.set(true);
  }

  closeAddSubAccountModal(): void {
    this.showAddSubAccountModal.set(false);
    this.editingSubAccount.set(null);
    this.selectedSubAccountType.set(null);
  }

  async onAddSubAccountSubmit(): Promise<void> {
    if (this.addSubAccountForm.invalid) return;
    
    const formValue = this.addSubAccountForm.getRawValue();
    const editing = this.editingSubAccount();
    
    try {
        if (editing) {
          await this.accountService.updateSubAccount({
            id: editing.id,
            type: formValue.accountType! as SubAccount['type'],
            mainAccount: formValue.mainAccount!,
            name: formValue.subAccountName!,
          });
        } else {
          await this.accountService.addSubAccount({
            type: formValue.accountType! as SubAccount['type'],
            mainAccount: formValue.mainAccount!,
            name: formValue.subAccountName!,
          });
        }
    } catch (error) {
        console.error('Failed to save sub account', error);
    }
    
    this.closeAddSubAccountModal();
  }

  handleEditMainAccount(account: MainAccount): void {
    this.editingMainAccount.set(account);
    this.addMainAccountForm.setValue({
      accountName: account.name,
      type: account.type,
    });
    this.showAddMainAccountModal.set(true);
  }

  handleEditSubAccount(account: SubAccount): void {
    this.editingSubAccount.set(account);
    this.selectedSubAccountType.set(account.type);
    this.addSubAccountForm.get('mainAccount')?.enable();
    this.addSubAccountForm.setValue({
      accountType: account.type,
      mainAccount: account.mainAccount,
      subAccountName: account.name,
    });
    this.showAddSubAccountModal.set(true);
  }
}
