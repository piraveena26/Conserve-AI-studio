import { Component, ChangeDetectionStrategy, input, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { InvoiceService, ProjectInvoiceDetails } from '../services/invoice.service';

@Component({
  selector: 'app-invoice-details',
  template: `
  <div class="space-y-6 bg-slate-50">
    @if (projectDetails(); as project) {
      <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <h1 class="text-2xl font-bold text-slate-800">Invoices Details</h1>
        <button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" /></svg>
          Generate Invoice
        </button>
      </div>

      <div class="text-center">
        <h2 class="text-lg font-bold text-slate-700">{{project.projectType}} Projects</h2>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 rounded-lg bg-blue-500 text-white shadow-lg"><p class="text-sm">Total Invoiced Value</p><p class="text-2xl font-bold">{{ project.totalInvoicedValue | currency:'SAR ' }}</p></div>
        <div class="p-4 rounded-lg bg-green-500 text-white shadow-lg"><p class="text-sm">Total Received Value</p><p class="text-2xl font-bold">{{ project.totalReceivedValue | currency:'SAR ' }}</p></div>
        <div class="p-4 rounded-lg bg-red-500 text-white shadow-lg"><p class="text-sm">Total Outstanding Value</p><p class="text-2xl font-bold">{{ project.totalOutstandingValue | currency:'SAR ' }}</p></div>
        <div class="p-4 rounded-lg bg-blue-500/90 text-white shadow-lg"><p class="text-sm">Total Invoiced VAT Value</p><p class="text-2xl font-bold">{{ project.totalInvoicedVatValue | currency:'SAR ' }}</p></div>
        <div class="p-4 rounded-lg bg-green-500/90 text-white shadow-lg"><p class="text-sm">Total Received VAT Value</p><p class="text-2xl font-bold">{{ project.totalReceivedVatValue | currency:'SAR ' }}</p></div>
        <div class="p-4 rounded-lg bg-red-500/90 text-white shadow-lg"><p class="text-sm">Total Outstanding VAT Value</p><p class="text-2xl font-bold">{{ project.totalOutstandingVatValue | currency:'SAR ' }}</p></div>
      </div>

      <!-- Generated Invoices -->
      <div class="bg-blue-50/50 p-4 rounded-lg shadow-sm border border-blue-200 space-y-4">
        <h3 class="text-lg font-bold text-slate-700">List of Generated Invoices</h3>
        <div class="flex items-center justify-between">
            <div class="relative w-full max-w-xs">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
              </div>
              <input type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md">
            </div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-100 flex items-center gap-2">Excel</button>
              <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-100 flex items-center gap-2">Print</button>
              <button class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-400 rounded-md hover:bg-cyan-50 flex items-center gap-2">Columns to Display</button>
            </div>
        </div>
        <div class="overflow-x-auto border border-slate-200 rounded-lg bg-white">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th class="px-6 py-3">Sno</th><th class="px-6 py-3">Invoice Id</th><th class="px-6 py-3">Po Ref</th><th class="px-6 py-3">Invoice Link</th><th class="px-6 py-3">Invoice Prepared Date</th><th class="px-6 py-3">Payment Percent</th><th class="px-6 py-3">Invoiced Value</th><th class="px-6 py-3">Invoiced Vat Value</th><th class="px-6 py-3">Last Updated</th><th class="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (invoice of project.generatedInvoices; track invoice.sno) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4">{{ invoice.sno }}</td>
                  <td class="px-6 py-4">{{ invoice.invoiceId }}</td>
                  <td class="px-6 py-4">{{ invoice.poRef }}</td>
                  <td class="px-6 py-4"><a [href]="invoice.invoiceLink" target="_blank" class="text-blue-600 hover:underline">Link</a></td>
                  <td class="px-6 py-4">{{ invoice.invoicePreparedDate | date: 'mediumDate' }}</td>
                  <td class="px-6 py-4">{{ invoice.paymentPercent }}%</td>
                  <td class="px-6 py-4">{{ invoice.invoicedValue | currency:'SAR ' }}</td>
                  <td class="px-6 py-4">{{ invoice.invoicedVatValue | currency:'SAR ' }}</td>
                  <td class="px-6 py-4">{{ invoice.lastUpdated | date: 'mediumDate' }}</td>
                  <td class="px-6 py-4"><button class="text-slate-500 hover:text-blue-600 p-1">Actions</button></td>
                </tr>
              } @empty {
                <tr><td colspan="10" class="text-center py-10 text-slate-500">No generated invoices found.</td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-end pt-2 text-sm text-slate-600 gap-4"><p>Items per page: <select class="form-select text-sm p-1 border-slate-300 rounded-md"><option>10</option></select></p><p>0 of 0</p><div class="flex items-center gap-1"><button disabled class="p-2 text-slate-300"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg></button><button disabled class="p-2 text-slate-300"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg></button></div></div>
      </div>

      <!-- Submitted Invoices -->
      <div class="bg-blue-50/50 p-4 rounded-lg shadow-sm border border-blue-200 space-y-4">
        <h3 class="text-lg font-bold text-slate-700">List of Submitted Invoices</h3>
        <div class="flex items-center justify-between">
            <div class="relative w-full max-w-xs"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg></div><input type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md"></div>
            <div class="flex items-center gap-2"><button class="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-100 flex items-center gap-2">Excel</button><button class="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-100 flex items-center gap-2">Print</button><button class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-400 rounded-md hover:bg-cyan-50 flex items-center gap-2">Columns to Display</button></div>
        </div>
        <div class="overflow-x-auto border border-slate-200 rounded-lg bg-white">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50"><tr><th class="px-6 py-3">Sno</th><th class="px-6 py-3">Invoice Id</th><th class="px-6 py-3">Po Ref</th><th class="px-6 py-3">Invoice Prepared Date</th><th class="px-6 py-3">Invoice Submitted Date</th><th class="px-6 py-3">Invoice Value</th><th class="px-6 py-3">Invoice Vat Value</th><th class="px-6 py-3">Payment Percent</th><th class="px-6 py-3">Payment Mode</th><th class="px-6 py-3">Remarks</th><th class="px-6 py-3">Actions</th></tr></thead>
            <tbody>
              @for (invoice of project.submittedInvoices; track invoice.sno) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4">{{ invoice.sno }}</td>
                  <td class="px-6 py-4">{{ invoice.invoiceId }}</td>
                  <td class="px-6 py-4">{{ invoice.poRef }}</td>
                  <td class="px-6 py-4">{{ invoice.invoicePreparedDate | date: 'mediumDate' }}</td>
                  <td class="px-6 py-4">{{ invoice.invoiceSubmittedDate | date: 'mediumDate' }}</td>
                  <td class="px-6 py-4">{{ invoice.invoiceValue | currency:'SAR ' }}</td>
                  <td class="px-6 py-4">{{ invoice.invoiceVatValue | currency:'SAR ' }}</td>
                  <td class="px-6 py-4">{{ invoice.paymentPercent }}%</td>
                  <td class="px-6 py-4">{{ invoice.paymentMode }}</td>
                  <td class="px-6 py-4">{{ invoice.remarks }}</td>
                  <td class="px-6 py-4"><button class="text-slate-500 hover:text-blue-600 p-1">Actions</button></td>
                </tr>
              } @empty { 
                <tr><td colspan="11" class="text-center py-10 text-slate-500">No submitted invoices found.</td></tr> 
              }
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-end pt-2 text-sm text-slate-600 gap-4"><p>Items per page: <select class="form-select text-sm p-1 border-slate-300 rounded-md"><option>10</option></select></p><p>0 of 0</p><div class="flex items-center gap-1"><button disabled class="p-2 text-slate-300"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg></button><button disabled class="p-2 text-slate-300"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg></button></div></div>
      </div>

      <!-- Completed Invoices -->
      <div class="bg-blue-50/50 p-4 rounded-lg shadow-sm border border-blue-200 space-y-4">
        <h3 class="text-lg font-bold text-slate-700">List of Completed Invoices</h3>
        <div class="flex items-center justify-between">
          <div class="relative w-full max-w-xs"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg></div><input type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md"></div>
          <div class="flex items-center gap-2"><button class="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-100 flex items-center gap-2">Excel</button><button class="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-100 flex items-center gap-2">Print</button><button class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-400 rounded-md hover:bg-cyan-50 flex items-center gap-2">Columns to Display</button></div>
        </div>
        <div class="overflow-x-auto border border-slate-200 rounded-lg bg-white">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50"><tr><th class="px-6 py-3">Sno</th><th class="px-6 py-3">Invoice Id</th><th class="px-6 py-3">Po Ref</th><th class="px-6 py-3">Invoice Submitted Date</th><th class="px-6 py-3">Invoiced Value</th><th class="px-6 py-3">Invoiced Vat Value</th><th class="px-6 py-3">Payment Percent</th><th class="px-6 py-3">Payment Received Date</th><th class="px-6 py-3">Received Value</th><th class="px-6 py-3">Received Vat Value</th><th class="px-6 py-3">Payment Mode</th><th class="px-6 py-3">Bank</th><th class="px-6 py-3">Remarks</th><th class="px-6 py-3">Actions</th></tr></thead>
            <tbody>
              @for (invoice of project.completedInvoices; track invoice.sno) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4">{{ invoice.sno }}</td>
                  <td class="px-6 py-4">{{ invoice.invoiceId }}</td>
                  <td class="px-6 py-4">{{ invoice.poRef }}</td>
                  <td class="px-6 py-4">{{ invoice.invoiceSubmittedDate | date: 'mediumDate' }}</td>
                  <td class="px-6 py-4">{{ invoice.invoicedValue | currency:'SAR ' }}</td>
                  <td class="px-6 py-4">{{ invoice.invoicedVatValue | currency:'SAR ' }}</td>
                  <td class="px-6 py-4">{{ invoice.paymentPercent }}%</td>
                  <td class="px-6 py-4">{{ invoice.paymentReceivedDate | date: 'mediumDate' }}</td>
                  <td class="px-6 py-4">{{ invoice.receivedValue | currency:'SAR ' }}</td>
                  <td class="px-6 py-4">{{ invoice.receivedVatValue | currency:'SAR ' }}</td>
                  <td class="px-6 py-4">{{ invoice.paymentMode }}</td>
                  <td class="px-6 py-4">{{ invoice.bank }}</td>
                  <td class="px-6 py-4">{{ invoice.remarks }}</td>
                  <td class="px-6 py-4"><button class="text-slate-500 hover:text-blue-600 p-1">Actions</button></td>
                </tr>
              } @empty { 
                <tr><td colspan="14" class="text-center py-10 text-slate-500">No completed invoices found.</td></tr> 
              }
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-end pt-2 text-sm text-slate-600 gap-4"><p>Items per page: <select class="form-select text-sm p-1 border-slate-300 rounded-md"><option>10</option></select></p><p>0 of 0</p><div class="flex items-center gap-1"><button disabled class="p-2 text-slate-300"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg></button><button disabled class="p-2 text-slate-300"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg></button></div></div>
      </div>

    } @else {
      <div class="text-center p-10 bg-white rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold text-slate-700">Project Not Found</h2>
        <p class="text-slate-500 mt-2">Could not load the details for the selected project.</p>
      </div>
    }
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, DatePipe],
})
export class InvoiceDetailsComponent {
  projectId = input.required<string>();
  private invoiceService = inject(InvoiceService);

  projectDetails = computed(() => {
    const id = this.projectId();
    return this.invoiceService.getProjectInvoiceDetailsById(id);
  });
}