import { Component, ChangeDetectionStrategy, computed, inject, signal, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { InvoiceService } from '../services/invoice.service';

@Component({
  selector: 'app-milestone-invoice',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h1 class="text-2xl font-bold text-slate-800">MileStone Invoice</h1>
      </div>
      
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <p class="text-sm font-medium text-slate-500">Total Invoice Value</p>
          <p class="mt-2 text-3xl font-bold text-blue-600">{{ totalInvoiceValue() | currency:'SAR ':'symbol':'1.2-2' }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <p class="text-sm font-medium text-slate-500">Total Collected Value</p>
          <p class="mt-2 text-3xl font-bold text-green-600">{{ totalCollectedValue() | currency:'SAR ':'symbol':'1.2-2' }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <p class="text-sm font-medium text-slate-500">Total Outstanding Value</p>
          <p class="mt-2 text-3xl font-bold text-orange-500">{{ totalOutstandingValue() | currency:'SAR ':'symbol':'1.2-2' }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="division" class="block text-sm font-medium text-slate-700 mb-1">Select Division</label>
              <select #divisionSelect (change)="selectedDivision.set(divisionSelect.value)" id="division" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                @for(division of divisions(); track division) {
                  <option [value]="division">{{ division }}</option>
                }
              </select>
            </div>
             <div>
              <label for="status" class="block text-sm font-medium text-slate-700 mb-1">Select Status</label>
              <select #statusSelect (change)="selectedStatus.set(statusSelect.value)" id="status" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                @for(status of statuses(); track status) {
                  <option [value]="status">{{ status }}</option>
                }
              </select>
            </div>
        </div>
      </div>

      <!-- Table -->
       <div class="bg-blue-50/50 p-4 rounded-lg shadow-sm border border-blue-200 space-y-4">
        <div class="flex items-center justify-between">
            <div class="relative w-full max-w-xs">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
              </div>
              <input #searchInput (input)="searchTerm.set(searchInput.value)" type="text" placeholder="Search..." class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md">
            </div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-100 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" /></svg>
                Excel
              </button>
              <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
                Print
              </button>
              <div class="relative">
                <button (click)="showColumnsDropdown.set(!showColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-400 rounded-md hover:bg-cyan-50 flex items-center gap-2">
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
        <div class="overflow-x-auto border border-slate-200 rounded-lg bg-white">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th class="px-2 py-3"><input type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"></th>
                @for(col of allColumns; track col.id) {
                  @if(visibleColumns().has(col.id)) { <th scope="col" class="px-6 py-3 whitespace-nowrap">{{ col.name }}</th> }
                }
              </tr>
            </thead>
            <tbody>
              @for(invoice of filteredInvoices(); track invoice.sno) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"></td>
                  @if(visibleColumns().has('sno')) { <td class="px-6 py-4">{{ invoice.sno }}</td> }
                  @if(visibleColumns().has('division')) { <td class="px-6 py-4">{{ invoice.division }}</td> }
                  @if(visibleColumns().has('projectId')) { <td class="px-6 py-4">{{ invoice.projectId }}</td> }
                  @if(visibleColumns().has('projectName')) { <td class="px-6 py-4 font-medium text-slate-900">{{ invoice.projectName }}</td> }
                  @if(visibleColumns().has('clientName')) { <td class="px-6 py-4">{{ invoice.clientName }}</td> }
                  @if(visibleColumns().has('scope')) { <td class="px-6 py-4">{{ invoice.scope }}</td> }
                  @if(visibleColumns().has('poValue')) { <td class="px-6 py-4">{{ invoice.poValue | currency:'':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('poVat')) { <td class="px-6 py-4">{{ invoice.poVat | currency:'':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('yetToInvoiceValue')) { <td class="px-6 py-4">{{ invoice.yetToInvoiceValue | currency:'':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('yetToInvoiceVat')) { <td class="px-6 py-4">{{ invoice.yetToInvoiceVat | currency:'':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('invoiceValue')) { <td class="px-6 py-4">{{ invoice.invoiceValue | currency:'':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('invoiceVat')) { <td class="px-6 py-4">{{ invoice.invoiceVat | currency:'':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('collectedValue')) { <td class="px-6 py-4">{{ invoice.collectedValue | currency:'':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('collectedVat')) { <td class="px-6 py-4">{{ invoice.collectedVat | currency:'':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('outstandingValue')) { <td class="px-6 py-4">{{ invoice.outstandingValue | currency:'':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('outstandingVat')) { <td class="px-6 py-4">{{ invoice.outstandingVat | currency:'':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('actions')) {
                    <td class="px-6 py-4">
                      <button (click)="viewDetails.emit(invoice.projectId)" class="text-slate-500 hover:text-blue-600" title="View Details">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  }
                </tr>
              } @empty {
                <tr>
                  <td [attr.colspan]="visibleColumns().size + 1" class="text-center py-10 text-slate-500">
                    No invoices found for the selected criteria.
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
  imports: [CommonModule, CurrencyPipe],
})
export class MilestoneInvoiceComponent {
  private invoiceService = inject(InvoiceService);
  viewDetails = output<string>();

  // Filters
  selectedDivision = signal('All Divisions');
  selectedStatus = signal('All Status');
  searchTerm = signal('');
  showColumnsDropdown = signal(false);

  // Data
  private allInvoices = this.invoiceService.milestoneInvoices;
  
  divisions = computed(() => ['All Divisions', ...new Set(this.allInvoices().map(inv => inv.division))]);
  statuses = signal(['All Status', 'Commercially Open', 'Project Closed']);

  filteredInvoices = computed(() => {
    const division = this.selectedDivision();
    const status = this.selectedStatus();
    const term = this.searchTerm().toLowerCase();
    
    return this.allInvoices().filter(inv => {
      const divisionMatch = division === 'All Divisions' || inv.division === division;
      const statusMatch = status === 'All Status' || inv.projectStatus === status;
      const termMatch = term === '' ||
        inv.projectName.toLowerCase().includes(term) ||
        inv.projectId.toLowerCase().includes(term) ||
        inv.clientName.toLowerCase().includes(term);
      
      return divisionMatch && statusMatch && termMatch;
    });
  });

  // Stat Cards
  totalInvoiceValue = computed(() => this.filteredInvoices().reduce((sum, inv) => sum + inv.invoiceValue, 0));
  totalCollectedValue = computed(() => this.filteredInvoices().reduce((sum, inv) => sum + inv.collectedValue, 0));
  totalOutstandingValue = computed(() => this.totalInvoiceValue() - this.totalCollectedValue());

  // Columns
  allColumns = [
    { id: 'sno', name: 'Sno' },
    { id: 'division', name: 'Division' },
    { id: 'projectId', name: 'Project Id' },
    { id: 'projectName', name: 'Project Name' },
    { id: 'clientName', name: 'Client Name' },
    { id: 'scope', name: 'Scope' },
    { id: 'poValue', name: 'PO value' },
    { id: 'poVat', name: 'PO VAT' },
    { id: 'yetToInvoiceValue', name: 'Yet To Invoice Value' },
    { id: 'yetToInvoiceVat', name: 'Yet To Invoice Vat' },
    { id: 'invoiceValue', name: 'Invoice value' },
    { id: 'invoiceVat', name: 'Invoice VAT' },
    { id: 'collectedValue', name: 'Collected value' },
    { id: 'collectedVat', name: 'Collected VAT' },
    { id: 'outstandingValue', name: 'Outstanding Value' },
    { id: 'outstandingVat', name: 'Outstanding Vat' },
    { id: 'actions', name: 'Actions' }
  ];
  visibleColumns = signal(new Set(this.allColumns.map(c => c.id)));

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