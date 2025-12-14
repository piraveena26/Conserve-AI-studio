import { Component, ChangeDetectionStrategy, signal, input, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

interface SummaryStats {
  totalInvoiced: number;
  vatInvoiced: number;
  totalReceived: number;
  vatReceived: number;
  totalPending: number;
  vatPending: number;
  totalDue: number;
  vatDue: number;
}

interface ProjectDetails {
  id: string;
  name: string;
  scope: string;
  division: string;
  clientName: string;
  logoUrl?: string;
}

interface TransactionRow {
  projectId: string;
  sno: number;
  poNo: string;
  invoiceNo: string;
  invoicePreparedDate: string;
  invoiceSubmittedDate: string;
  invoiceValue: number;
  invoiceVatValue: number;
  receivedValue: number;
  receivedVatValue: number;
  receivedDate: string;
  paymentMonth: string;
  remarks: string;
}

@Component({
  selector: 'app-statement-of-account-details',
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        @if (viewMode() === 'client') {
          <h1 class="text-2xl font-bold text-slate-800">Statement Of Accounts</h1>
          <div class="flex items-center space-x-4">
            <div class="relative pt-2">
              <label for="project-filter" class="absolute top-0 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-500">Filter by Project</label>
              <select id="project-filter" (change)="onProjectChange($event)" [value]="selectedProjectId()" class="form-select w-56 rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option value="All">All Projects</option>
                @for(project of clientProjects(); track project.id) {
                  <option [value]="project.id">{{ project.name }}</option>
                }
              </select>
            </div>
            <button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Excel
            </button>
            <button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
              Print
            </button>
            <div class="w-24 h-12 bg-white flex items-center justify-center rounded-md border border-slate-200">
              @if(projectInfo()?.logoUrl) {
                <img [src]="projectInfo()!.logoUrl" [alt]="projectInfo()?.clientName + ' logo'" class="h-10 object-contain">
              } @else {
                <span class="text-xs text-slate-400">Logo</span>
              }
            </div>
          </div>
        } @else {
          <h1 class="text-2xl font-bold text-slate-800">Statements Of Accounts</h1>
          <div class="flex items-center space-x-4">
            <button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Excel
            </button>
            <button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
              Print
            </button>
          </div>
        }
      </div>
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @if(summaryStats(); as stats) {
          <div class="bg-sky-50 p-4 rounded-lg border border-sky-200 shadow-sm">
            <p class="text-sm text-slate-600">Total Invoiced</p>
            <p class="text-2xl font-bold text-slate-800 mt-1">{{ stats.totalInvoiced | currency:'SAR ' }}</p>
            <p class="text-xs text-slate-500">+ VAT {{ stats.vatInvoiced | currency:'SAR ' }}</p>
          </div>
          <div class="bg-sky-50 p-4 rounded-lg border border-sky-200 shadow-sm">
            <p class="text-sm text-slate-600">Total Received</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ stats.totalReceived | currency:'SAR ' }}</p>
            <p class="text-xs text-slate-500">+ VAT {{ stats.vatReceived | currency:'SAR ' }}</p>
          </div>
          <div class="bg-sky-50 p-4 rounded-lg border border-sky-200 shadow-sm">
            <p class="text-sm text-slate-600">Total Pending</p>
            <p class="text-2xl font-bold text-amber-500 mt-1">{{ stats.totalPending | currency:'SAR ' }}</p>
            <p class="text-xs text-slate-500">+ VAT {{ stats.vatPending | currency:'SAR ' }}</p>
          </div>
          <div class="bg-sky-50 p-4 rounded-lg border border-sky-200 shadow-sm">
            <p class="text-sm text-slate-600">Total Due</p>
            <p class="text-2xl font-bold text-red-600 mt-1">{{ stats.totalDue | currency:'SAR ' }}</p>
            <p class="text-xs text-slate-500">+ VAT {{ stats.vatDue | currency:'SAR ' }}</p>
          </div>
        }
      </div>

      <!-- Project Info -->
      @if (viewMode() === 'project') {
        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex justify-between items-start">
          @if (projectInfo(); as info) {
            <div>
              <p class="text-sm font-medium text-slate-600">Project Name: <span class="font-bold text-slate-800">{{ info.name }}</span></p>
              <p class="text-sm font-medium text-slate-600 mt-1">Scope: <span class="font-bold text-slate-800">{{ info.scope }}</span></p>
              <p class="text-sm font-medium text-slate-600 mt-1">Project ID: <span class="font-bold text-slate-800">{{ info.id }}</span></p>
              <p class="text-sm font-medium text-slate-600 mt-1">Division: <span class="font-bold text-slate-800">{{ info.division }}</span></p>
            </div>
            <div class="w-24 h-24 bg-black text-white flex flex-col items-center justify-center border-2 border-black">
              <span class="text-5xl font-black tracking-tighter -mb-2">4</span>
              <span class="text-xs font-bold tracking-wider">DIMENSION</span>
            </div>
          }
        </div>
      }

      <!-- Transactions Table -->
       <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div class="flex justify-between items-center mb-4">
          <div class="relative w-full max-w-xs">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
            </div>
            <input type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md shadow-sm bg-slate-50">
          </div>
          <div class="flex items-center space-x-2">
            <button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Excel
            </button>
            <button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
              Print
            </button>
            <div class="relative">
              <button (click)="showColumnsDropdown.set(!showColumnsDropdown())" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-400 rounded-md hover:bg-cyan-50">
                Columns to Display <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              </button>
              @if(showColumnsDropdown()) {
                <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  @for(col of allColumns; track col.id) {
                    <label class="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" [checked]="visibleColumns().has(col.id)" (change)="toggleColumn(col.id)" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500">
                      <span class="ml-3">{{ col.name }}</span>
                    </label>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap">
              <tr>
                @for(col of allColumns; track col.id) {
                  @if(visibleColumns().has(col.id)) { <th scope="col" class="px-4 py-3">{{ col.name }}</th> }
                }
              </tr>
            </thead>
            <tbody>
              @for(row of transactions(); track row.sno) {
                <!-- This will not render as transactions is empty, but is here for future data -->
              } @empty {
                <tr>
                  <td [attr.colspan]="visibleColumns().size" class="text-center p-8 text-slate-500">
                    No transactions to display.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, DatePipe],
})
export class StatementOfAccountDetailsComponent implements OnInit {
  projectId = input.required<string>();
  viewMode = input.required<'project' | 'client'>();
  
  private allProjects = signal<ProjectDetails[]>([
    {
      id: 'SUS-PRO-0193',
      name: 'RX - Training Center',
      scope: 'LEED DB+C Design & Construction',
      division: 'SUSTAINABILITY',
      clientName: 'PetroCorp',
      logoUrl: 'https://picsum.photos/seed/client3/200/200'
    },
    {
      id: 'SUS-PRO-0144',
      name: 'Nesma NIT Riyadh Office',
      scope: 'LEED v4 BD+C:CS',
      division: 'SUSTAINABILITY',
      clientName: 'PetroCorp', // Same client
      logoUrl: 'https://picsum.photos/seed/client3/200/200'
    },
    {
      id: 'ENG-PRO-007',
      name: 'Main Engineering Hub',
      scope: 'Structural Analysis',
      division: 'ENGINEERING',
      clientName: 'ConstructCo', // Different client
      logoUrl: 'https://picsum.photos/seed/client4/200/200'
    }
  ]);
  
  selectedProjectId = signal<string>('');

  ngOnInit() {
    this.selectedProjectId.set(this.viewMode() === 'project' ? this.projectId() : 'All');
  }
  
  private initialProject = computed(() => this.allProjects().find(p => p.id === this.projectId()));
  private clientName = computed(() => this.initialProject()?.clientName);

  clientProjects = computed(() => {
    const client = this.clientName();
    if (!client) return [];
    return this.allProjects().filter(p => p.clientName === client);
  });

  projectInfo = computed(() => {
    if (this.viewMode() === 'project') {
      return this.allProjects().find(p => p.id === this.projectId()) ?? null;
    }
    
    // Logic for 'client' mode
    const selectedId = this.selectedProjectId();
    if (selectedId === 'All') {
      return this.clientProjects()[0] ?? null;
    }
    return this.clientProjects().find(p => p.id === selectedId) ?? null;
  });

  summaryStats = computed(() => {
    const selectedId = this.selectedProjectId();
    let relevantTransactions: TransactionRow[];

    if (this.viewMode() === 'project') {
        relevantTransactions = this.transactions().filter(t => t.projectId === this.projectId());
    } else { // 'client' mode
        if (selectedId === 'All') {
            const clientProjectIds = new Set(this.clientProjects().map(p => p.id));
            relevantTransactions = this.transactions().filter(t => clientProjectIds.has(t.projectId));
        } else {
            relevantTransactions = this.transactions().filter(t => t.projectId === selectedId);
        }
    }

    const totals = relevantTransactions.reduce((acc, transaction) => {
      acc.totalInvoiced += transaction.invoiceValue;
      acc.vatInvoiced += transaction.invoiceVatValue;
      acc.totalReceived += transaction.receivedValue;
      acc.vatReceived += transaction.receivedVatValue;
      return acc;
    }, {
      totalInvoiced: 0,
      vatInvoiced: 0,
      totalReceived: 0,
      vatReceived: 0,
    });

    const totalPending = totals.totalInvoiced - totals.totalReceived;
    const vatPending = totals.vatInvoiced - totals.vatReceived;

    return {
        totalInvoiced: totals.totalInvoiced,
        vatInvoiced: totals.vatInvoiced,
        totalReceived: totals.totalReceived,
        vatReceived: totals.vatReceived,
        totalPending: totalPending,
        vatPending: vatPending,
        totalDue: 0, // As per image and lack of data
        vatDue: 0,
    };
  });
  
  onProjectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedProjectId.set(selectElement.value);
  }

  transactions = signal<TransactionRow[]>([]);

  allColumns = [
    { id: 'sno', name: 'Sno' },
    { id: 'poNo', name: 'Po No' },
    { id: 'invoiceNo', name: 'Invoice No' },
    { id: 'invoicePreparedDate', name: 'Invoice Prepared Date' },
    { id: 'invoiceSubmittedDate', name: 'Invoice Submitted Date' },
    { id: 'invoiceValue', name: 'Invoice Value' },
    { id: 'invoiceVatValue', name: 'Invoice Vat Value' },
    { id: 'receivedValue', name: 'Received Value' },
    { id: 'receivedVatValue', name: 'Received Vat Value' },
    { id: 'receivedDate', name: 'Received Date' },
    { id: 'paymentMonth', name: 'Payment Month' },
    { id: 'remarks', name: 'Remarks' },
    { id: 'actions', name: 'Actions' },
  ];
  
  visibleColumns = signal(new Set(this.allColumns.map(c => c.id)));
  showColumnsDropdown = signal(false);

  toggleColumn(columnId: string): void {
    this.visibleColumns.update(cols => {
      const newCols = new Set(cols);
      if (newCols.has(columnId)) {
        newCols.delete(columnId);
      } else {
        newCols.add(columnId);
      }
      return newCols;
    });
  }
}
