import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { InvoiceService, MilestoneInvoice as TrackedInvoice } from '../services/invoice.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-invoice-tracking',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h1 class="text-2xl font-bold text-slate-800">Invoice Tracking</h1>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div class="flex items-center space-x-4">
            <select #divisionSelect [value]="selectedDivision()" class="w-full md:w-64 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select Division</option>
                @for(division of divisions(); track division) {
                  <option [value]="division">{{ division }}</option>
                }
            </select>
            <select #statusSelect [value]="selectedInvoiceStatus()" class="w-full md:w-64 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select Status</option>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
            </select>
            <button (click)="applyFilters(divisionSelect.value, statusSelect.value)" class="px-6 py-2 text-sm font-medium text-white bg-cyan-400 rounded-md hover:bg-cyan-500">
                Submit
            </button>
        </div>
      </div>


      <!-- Table -->
       <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-4">
        <div class="flex items-center justify-between">
            <div class="relative w-full max-w-xs">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
              </div>
              <input #searchInput (input)="searchTerm.set(searchInput.value)" type="text" placeholder="Search..." class="form-input block w-full pl-10 pr-3 py-2 border-sky-300 rounded-full bg-sky-50/50 focus:border-sky-500 focus:ring-sky-500 placeholder-sky-400">
            </div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" /></svg>
                Excel
              </button>
              <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
                Print
              </button>
              <div class="relative">
                <button (click)="showColumnsDropdown.set(!showColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-sky-700 bg-white border border-sky-400 rounded-md hover:bg-sky-50 flex items-center gap-2">
                  Columns to Display <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
                @if(showColumnsDropdown()) {
                  <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    @for(col of allColumns; track col.id) {
                      <label class="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" [checked]="visibleColumns().has(col.id)" (change)="toggleColumn(col.id)" class="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500">
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
                <th class="px-2 py-3"><input type="checkbox" class="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"></th>
                @for(col of allColumns; track col.id) {
                  @if(visibleColumns().has(col.id)) { <th scope="col" class="px-6 py-3 whitespace-nowrap">{{ col.name }}</th> }
                }
              </tr>
            </thead>
            <tbody>
              @for(invoice of filteredInvoices(); track invoice.projectId + invoice.sno) {
                <tr class="bg-white border-b hover:bg-slate-50">
                   <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"></td>
                  @if(visibleColumns().has('division')) { <td class="px-6 py-4">{{ invoice.division }}</td> }
                  @if(visibleColumns().has('projectId')) { <td class="px-6 py-4">{{ invoice.projectId }}</td> }
                  @if(visibleColumns().has('projectName')) { <td class="px-6 py-4 font-medium text-slate-900">{{ invoice.projectName }}</td> }
                  @if(visibleColumns().has('clientName')) { <td class="px-6 py-4">{{ invoice.clientName }}</td> }
                  @if(visibleColumns().has('poValue')) { <td class="px-6 py-4">{{ invoice.poValue | currency:'SAR ':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('poVat')) { <td class="px-6 py-4">{{ invoice.poVat | currency:'SAR ':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('projectStatus')) { <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-full" [class]="getProjectStatusClass(invoice.projectStatus)">{{ invoice.projectStatus }}</span></td> }
                  @if(visibleColumns().has('yetToInvoiceValue')) { <td class="px-6 py-4">{{ invoice.yetToInvoiceValue | currency:'SAR ':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('yetToInvoiceVat')) { <td class="px-6 py-4">{{ invoice.yetToInvoiceVat | currency:'SAR ':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('status')) { <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-full" [class]="getInvoiceStatusClass(invoice.invoiceStatus)">{{ invoice.invoiceStatus }}</span></td> }
                  @if(visibleColumns().has('invoiceCount')) { 
                    <td class="px-6 py-4">
                      @if(invoice.invoiceStatus === 'NO') { N/A } @else { {{ invoice.invoiceCount }} }
                    </td> 
                  }
                  @if(visibleColumns().has('invoiceMonth')) { 
                    <td class="px-6 py-4">
                      @if(invoice.invoiceStatus === 'NO') { N/A } @else { {{ invoice.invoiceMonth }} }
                    </td> 
                  }
                  @if(visibleColumns().has('invoiceValue')) { <td class="px-6 py-4">{{ invoice.invoiceValue | currency:'SAR ':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('invoiceVat')) { <td class="px-6 py-4">{{ invoice.invoiceVat | currency:'SAR ':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('collectedValue')) { <td class="px-6 py-4">{{ invoice.collectedValue | currency:'SAR ':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('collectedVat')) { <td class="px-6 py-4">{{ invoice.collectedVat | currency:'SAR ':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('outstandingValue')) { <td class="px-6 py-4 font-bold text-orange-600">{{ invoice.outstandingValue | currency:'SAR ':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('outstandingVat')) { <td class="px-6 py-4 font-bold text-orange-600">{{ invoice.outstandingVat | currency:'SAR ':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('actions')) {
                    <td class="px-6 py-4">
                      <div class="flex items-center space-x-3">
                        <button class="text-slate-500 hover:text-blue-600" title="View Details">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                        </button>
                        <button (click)="openUpdateModal(invoice)" class="text-slate-500 hover:text-green-600" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                        </button>
                      </div>
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

    <!-- Update Invoice Tracking Modal -->
    @if (showUpdateModal() && invoiceToUpdate(); as invoice) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="closeUpdateModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg" (click)="$event.stopPropagation()">
          <div class="p-6 border-b">
            <h3 class="text-2xl font-bold text-slate-800">Update Invoice Tracking</h3>
          </div>
          <form [formGroup]="updateInvoiceForm" (ngSubmit)="onUpdateSubmit()">
            <div class="p-8 space-y-8">
              <!-- Invoice Count -->
              <div class="relative">
                <label for="invoiceCount" class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Invoice Count*</label>
                <input type="number" formControlName="invoiceCount" id="invoiceCount" class="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6">
              </div>

              <!-- Invoice Month -->
              <div class="relative">
                <label for="invoiceMonth" class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Invoice Month*</label>
                <input type="month" formControlName="invoiceMonth" id="invoiceMonth" class="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6">
                 <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <!-- Invoice Status -->
              <div class="relative">
                 <label for="invoiceStatus" class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Invoice Status*</label>
                 <select formControlName="invoiceStatus" id="invoiceStatus" class="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6">
                    <option value="NO">No</option>
                    <option value="YES">Yes</option>
                 </select>
              </div>
            </div>
            <div class="flex justify-end p-4 bg-slate-50 border-t rounded-b-lg space-x-3">
              <button type="button" (click)="closeUpdateModal()" class="px-6 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-400 rounded-md shadow-sm hover:bg-amber-50">Cancel</button>
              <button type="submit" [disabled]="updateInvoiceForm.invalid" class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule],
})
export class InvoiceTrackingComponent {
  private invoiceService = inject(InvoiceService);

  // Filters
  selectedDivision = signal('');
  selectedInvoiceStatus = signal('');
  searchTerm = signal('');
  showColumnsDropdown = signal(false);

  // Modal State
  showUpdateModal = signal(false);
  invoiceToUpdate = signal<TrackedInvoice | null>(null);

  updateInvoiceForm = new FormGroup({
    invoiceCount: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    invoiceMonth: new FormControl<string | null>(null, Validators.required),
    invoiceStatus: new FormControl<'YES' | 'NO' | null>(null, Validators.required),
  });

  // Data
  private combinedInvoices = computed<TrackedInvoice[]>(() => {
    return [
      ...this.invoiceService.milestoneInvoices(),
      ...this.invoiceService.monthlyInvoices(),
      ...this.invoiceService.proRataInvoices(),
    ];
  });

  divisions = computed(() => [...new Set(this.combinedInvoices().map(inv => inv.division))]);

  filteredInvoices = computed(() => {
    const division = this.selectedDivision();
    const invoiceStatus = this.selectedInvoiceStatus();
    const term = this.searchTerm().toLowerCase();

    return this.combinedInvoices().filter(inv => {
      if (inv.projectStatus !== 'Commercially Open') {
        return false;
      }
      
      const divisionMatch = !division || inv.division === division;
      const statusMatch = !invoiceStatus || inv.invoiceStatus === invoiceStatus;
      const termMatch = term === '' ||
        inv.projectName.toLowerCase().includes(term) ||
        inv.projectId.toLowerCase().includes(term) ||
        inv.clientName.toLowerCase().includes(term);
      
      return divisionMatch && statusMatch && termMatch;
    });
  });

  // Columns
  allColumns = [
    { id: 'division', name: 'Division' },
    { id: 'projectId', name: 'Project Id' },
    { id: 'projectName', name: 'Project Name' },
    { id: 'clientName', name: 'Client Name' },
    { id: 'poValue', name: 'PO Value' },
    { id: 'poVat', name: 'PO VAT' },
    { id: 'projectStatus', name: 'Project Status' },
    { id: 'yetToInvoiceValue', name: 'Yet To Invoice Value' },
    { id: 'yetToInvoiceVat', name: 'Yet To Invoice VAT' },
    { id: 'status', name: 'Invoice Status' },
    { id: 'invoiceCount', name: 'Invoice Count' },
    { id: 'invoiceMonth', name: 'Invoice Month' },
    { id: 'invoiceValue', name: 'Invoice Value' },
    { id: 'invoiceVat', name: 'Invoice VAT' },
    { id: 'collectedValue', name: 'Collected Value' },
    { id: 'collectedVat', name: 'Collected VAT' },
    { id: 'outstandingValue', name: 'Outstanding Value' },
    { id: 'outstandingVat', name: 'Outstanding VAT' },
    { id: 'actions', name: 'Actions' }
  ];
  visibleColumns = signal(new Set(this.allColumns.map(c => c.id)));

  applyFilters(division: string, status: string): void {
    this.selectedDivision.set(division);
    this.selectedInvoiceStatus.set(status);
  }

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

  openUpdateModal(invoice: TrackedInvoice): void {
    this.invoiceToUpdate.set(invoice);
    this.updateInvoiceForm.patchValue({
      invoiceCount: invoice.invoiceCount,
      invoiceMonth: this.formatMonthForInput(invoice.invoiceMonth),
      invoiceStatus: invoice.invoiceStatus,
    });
    this.showUpdateModal.set(true);
  }

  closeUpdateModal(): void {
    this.showUpdateModal.set(false);
    this.invoiceToUpdate.set(null);
  }

  onUpdateSubmit(): void {
    if (this.updateInvoiceForm.invalid || !this.invoiceToUpdate()) return;
    
    const formValue = this.updateInvoiceForm.getRawValue();
    const originalInvoice = this.invoiceToUpdate()!;

    let updates: Partial<TrackedInvoice>;

    if (formValue.invoiceStatus === 'NO') {
      updates = {
        invoiceStatus: 'NO',
        invoiceCount: 0,
        invoiceMonth: 'N/A',
      };
    } else {
      updates = {
        invoiceStatus: 'YES',
        invoiceCount: formValue.invoiceCount!,
        invoiceMonth: this.formatMonthForDisplay(formValue.invoiceMonth!),
      };
    }

    this.invoiceService.updateInvoiceTracking(originalInvoice.projectId, originalInvoice.sno, updates);
    this.closeUpdateModal();
  }

  private formatMonthForInput(monthYear: string | undefined): string | null {
    if (!monthYear || monthYear === 'N/A') return null;
    try {
      const [monthStr, year] = monthYear.split('-');
      const month = new Date(Date.parse(monthStr + " 1, 2012")).getMonth() + 1;
      return `${year}-${String(month).padStart(2, '0')}`;
    } catch {
      return null;
    }
  }

  private formatMonthForDisplay(yyyymm: string): string {
    const [year, month] = yyyymm.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleString('en-US', { month: 'short' });
    return `${monthName}-${year}`;
  }


  getProjectStatusClass(status: 'Commercially Open' | 'Project Closed'): string {
    switch (status) {
      case 'Commercially Open': return 'bg-green-100 text-green-800';
      case 'Project Closed': return 'bg-slate-100 text-slate-800';
    }
  }

  getInvoiceStatusClass(status: 'YES' | 'NO'): string {
    switch (status) {
      case 'YES': return 'bg-green-100 text-green-800';
      case 'NO': return 'bg-red-100 text-red-800';
    }
  }
}