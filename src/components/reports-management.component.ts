import { Component, ChangeDetectionStrategy, input, inject, computed, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { EnquiryService, Enquiry } from '../services/enquiry.service';
import { InvoiceService, MilestoneInvoice } from '../services/invoice.service';

// Copied from projects.component.ts to make it available here
// In a real app, this would be in a shared service.
interface Project {
  id: number;
  division: string;
  rfqId: string;
  oldProject: string;
  projectId: string;
  projectName:string;
  client: string;
  scope: string;
  poStatus: 'YES' | 'NO';
  openStatus?: 'YES' | 'NO';
  expiryDate?: string;
  totalPO: number; // Value
  totalVAT: number; // VAT Value
  monthOfAward: string;
  projectStatus: 'Commercially Open' | 'Commercially Closed' | 'Awarded' | 'On Hold';
  startDate: string;
  endDate: string;
  estimatedTime: string;
  projectType: 'Project' | 'Deviation' | 'DEPUTATION';

  // New fields
  responsibility?: string;
  paymentTerms?: string;
  poLink?: string;
  poRefNo?: string;
  invoiceDues?: number;
  logoUrl?: string;
  paymentDues?: number;
  contactDetails?: ContactDetails;
  finalQuotation?: string;
  assignees?: string[]; // employee names
  communicationRefNo?: string;
  communicationLink?: string;
  paymentResponsibility?: string; // employee name
  
  // Fields for detail view from image
  progress?: number;
  enquiryDate?: string;
  paymentDueDays?: number;
  communications?: Communication[];
  // FIX: Add missing properties to the Project interface
  invoiceValue?: number;
  invoicedVat?: number;
  collectedValue?: number;
  collectedVat?: number;
  yetToInvoiceValue?: number;
  yetToInvoiceVat?: number;
  outstandingValue?: number;
  outstandingVat?: number;
  dueDate?: string;
}

interface ContactDetails {
  person: string;
  designation: string;
  email: string;
  phone: string;
}

interface Communication {
  id: number;
  sno: number;
  refNo: string;
  link: string;
}

interface Payment {
  id: number;
  invoiceNo: string;
  projectId: string;
  projectName: string;
  clientName: string;
  division: string;
  invoiceDate: string; // YYYY-MM-DD
  invoiceValue: number;
  invoiceVatValue: number;
  receivedValue: number;
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque';
  receivedDate: string; // YYYY-MM-DD
  receivedVatValue: number;
  remarks: string;
}


@Component({
  selector: 'app-reports-management',
  template: `
    @switch (reportType()) {
      @case ('reports_enquiry_dashboard') {
        @switch(viewState()) {
          @case ('dashboard') {
            <div class="space-y-6">
              <!-- Stat Cards -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button (click)="showCardDrillDown('total', 'Total Enquiry')" class="text-left bg-blue-100 border border-blue-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                  <div class="p-3 bg-blue-500 text-white rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-blue-800">Total Enquiry</p>
                    <p class="text-3xl font-bold text-blue-900">{{ totalEnquiry() }}</p>
                  </div>
                </button>
                <button (click)="showCardDrillDown('tender', 'Tender Enquiry')" class="text-left bg-teal-100 border border-teal-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-200">
                  <div class="p-3 bg-teal-500 text-white rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-teal-800">Tender Enquiry</p>
                    <p class="text-3xl font-bold text-teal-900">{{ tenderEnquiry() }}</p>
                  </div>
                </button>
                <button (click)="showCardDrillDown('jobInHand', 'Job in Hand Enquiry')" class="text-left bg-amber-100 border border-amber-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg hover:border-amber-300 transition-all duration-200">
                  <div class="p-3 bg-amber-500 text-white rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-amber-800">Job in Hand Enquiry</p>
                    <p class="text-3xl font-bold text-amber-900">{{ jobInHandEnquiry() }}</p>
                  </div>
                </button>
                <button (click)="showCardDrillDown('dropped', 'Dropped Enquiry')" class="text-left bg-rose-100 border border-rose-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg hover:border-rose-300 transition-all duration-200">
                  <div class="p-3 bg-rose-500 text-white rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-rose-800">Dropped Enquiry</p>
                    <p class="text-3xl font-bold text-rose-900">{{ droppedEnquiry() }}</p>
                  </div>
                </button>
              </div>

              <!-- Enquiry Report Table -->
              <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-slate-800 mb-4">Enquiry Report</h2>
                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                  <table class="w-full text-sm text-left text-slate-500">
                    <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                      <tr>
                        <th scope="col" class="px-6 py-3">Division</th>
                        <th scope="col" class="px-6 py-3 text-center">Total Tender</th>
                        <th scope="col" class="px-6 py-3 text-center">Total Job in Hand</th>
                        <th scope="col" class="px-6 py-3 text-center">Monthly Tender</th>
                        <th scope="col" class="px-6 py-3 text-center">Monthly Job in Hand</th>
                        <th scope="col" class="px-6 py-3 text-center">Not Submitted Tender</th>
                        <th scope="col" class="px-6 py-3 text-center">Not Submitted Job in Hand</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of enquiryReport(); track row.division) {
                        <tr class="bg-white border-b hover:bg-slate-50">
                          <td class="px-6 py-4 font-medium text-slate-900">{{ row.division }}</td>
                          <td class="px-6 py-4 text-center"><button (click)="showTableDrillDown(row.division, 'totalTender', 'Total Tender')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{ row.totalTender }}</button></td>
                          <td class="px-6 py-4 text-center"><button (click)="showTableDrillDown(row.division, 'totalJobInHand', 'Total Job in Hand')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{ row.totalJobInHand }}</button></td>
                          <td class="px-6 py-4 text-center"><button (click)="showTableDrillDown(row.division, 'monthlyTender', 'Monthly Tender')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{ row.monthlyTender }}</button></td>
                          <td class="px-6 py-4 text-center"><button (click)="showTableDrillDown(row.division, 'monthlyJobInHand', 'Monthly Job in Hand')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{ row.monthlyJobInHand }}</button></td>
                          <td class="px-6 py-4 text-center"><button (click)="showTableDrillDown(row.division, 'notSubmittedTender', 'Not Submitted Tender')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{ row.notSubmittedTender }}</button></td>
                          <td class="px-6 py-4 text-center"><button (click)="showTableDrillDown(row.division, 'notSubmittedJobInHand', 'Not Submitted Job in Hand')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{ row.notSubmittedJobInHand }}</button></td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="7" class="px-6 py-10 text-center text-slate-500">No enquiry data available to generate a report.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }
          @case ('tableDrillDown') {
            @if (tableDrillDownFilter(); as filter) {
              <div class="space-y-6">
                <!-- Header and Filters -->
                <div class="bg-sky-100 p-4 rounded-lg shadow-sm border border-sky-200">
                    <div class="flex justify-between items-center">
                        <button (click)="goBackToDashboard()" class="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            Back to Dashboard
                        </button>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2 p-2 rounded-lg bg-blue-100 border border-blue-300 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                <span class="text-sm font-medium text-blue-800">Division: <span class="font-bold">{{ filter.division }}</span></span>
                            </div>
                            <div class="flex items-center gap-2 p-2 rounded-lg bg-purple-100 border border-purple-300 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span class="text-sm font-medium text-purple-800">Type: <span class="font-bold">{{ filter.typeLabel }}</span></span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center space-x-2">
                        <div class="relative flex-grow"><input type="date" (input)="tableFromDateInput.set($any($event.target).value)" [value]="tableFromDateInput()" placeholder="From Date" class="form-input w-full rounded-md border-slate-300 shadow-sm pr-10"><div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div></div>
                        <div class="relative flex-grow"><input type="date" (input)="tableToDateInput.set($any($event.target).value)" [value]="tableToDateInput()" placeholder="To Date" class="form-input w-full rounded-md border-slate-300 shadow-sm pr-10"><div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div></div>
                        <button (click)="applyTableDateFilter()" class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-500 hover:bg-blue-50 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg></button>
                    </div>
                </div>
                <!-- Drill-down Table -->
                <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                     <div class="flex items-center justify-between mb-4">
                        <div class="relative w-full max-w-xs"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg></div><input type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-full bg-slate-50 shadow-sm"></div>
                        <div class="flex items-center gap-2"><button class="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50">Excel</button><button class="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50">Print</button><button (click)="showTableDrillDownColumnsDropdown.set(!showTableDrillDownColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-400 rounded-md hover:bg-cyan-50">Columns to Display</button></div>
                    </div>
                    <div class="overflow-x-auto border border-slate-200 rounded-lg">
                        <table class="w-full text-sm text-left text-slate-500">
                            <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap">
                                <tr>
                                    <th class="p-2"><input type="checkbox" class="rounded border-slate-300"></th>
                                    @for(col of tableDrillDownAllColumns; track col.id) { <th class="px-4 py-3">{{ col.name }}</th> }
                                </tr>
                            </thead>
                            <tbody>
                                @for(enquiry of tableDrillDownEnquiries(); track enquiry.id) {
                                    <tr class="border-b hover:bg-slate-50">
                                        <td class="p-2"><input type="checkbox" class="rounded border-slate-300"></td>
                                        <td class="px-4 py-3">{{ enquiry.sno }}</td>
                                        <td class="px-4 py-3">{{ enquiry.enquiryDate | date:'dd-MMM-yyyy' }}</td>
                                        <td class="px-4 py-3">{{ enquiry.rfqId }}</td>
                                        <td class="px-4 py-3 font-medium text-slate-800">{{ enquiry.projectName }}</td>
                                        <td class="px-4 py-3">{{ enquiry.clientName }}</td>
                                        <td class="px-4 py-3">{{ enquiry.responsibilities }}</td>
                                        <td class="px-4 py-3">{{ enquiry.scope }}</td>
                                        <td class="px-4 py-3">{{ enquiry.stage }}</td>
                                        <td class="px-4 py-3">{{ enquiry.projectType }}</td>
                                        <td class="px-4 py-3">{{ enquiry.enquiryStatus }}</td>
                                        <td class="px-4 py-3">{{ enquiry.submissionDeadline | date:'dd-MMM-yyyy' }}</td>
                                    </tr>
                                } @empty {
                                    <tr><td colspan="12" class="text-center p-8">No enquiries found for the selected criteria.</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
              </div>
            }
          }
          @case('cardDrillDown') {
            @if(cardDrillDownFilter(); as filter) {
               <div class="space-y-6">
                 <div class="bg-sky-100 p-4 rounded-lg shadow-sm border border-sky-200">
                   <div class="flex justify-between items-center">
                     <button (click)="goBackToDashboard()" class="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                       Back to Dashboard
                     </button>
                     <h2 class="text-xl font-bold text-slate-800">{{ filter.label }} Report</h2>
                   </div>
                   <div class="mt-4 flex items-center space-x-2">
                     <div class="relative flex-grow"><input type="date" (input)="cardFromDateInput.set($any($event.target).value)" [value]="cardFromDateInput()" placeholder="From Date" class="form-input w-full rounded-md border-slate-300 shadow-sm pr-10"></div>
                     <div class="relative flex-grow"><input type="date" (input)="cardToDateInput.set($any($event.target).value)" [value]="cardToDateInput()" placeholder="To Date" class="form-input w-full rounded-md border-slate-300 shadow-sm pr-10"></div>
                     <button (click)="applyCardDateFilter()" class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-500 hover:bg-blue-50 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg></button>
                   </div>
                 </div>
                 <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                   <div class="overflow-x-auto">
                     @if (filter.type === 'total') {
                        <table class="w-full text-sm text-left text-slate-500">
                           <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap"><tr>@for(col of totalEnquiryColumns; track col.id){<th class="px-4 py-3">{{col.name}}</th>}</tr></thead>
                           <tbody>
                             @for(enquiry of cardDrillDownEnquiries(); track enquiry.id){
                               <tr class="border-b hover:bg-slate-50">
                                 <td class="px-4 py-3">{{enquiry.sno}}</td><td class="px-4 py-3">{{enquiry.enquiryDate | date:'dd-MMM-yyyy'}}</td><td class="px-4 py-3">{{enquiry.rfqId}}</td>
                                 <td class="px-4 py-3 font-medium text-slate-800">{{enquiry.projectName}}</td><td class="px-4 py-3">{{enquiry.projectLocation}}</td><td class="px-4 py-3">{{enquiry.stage}}</td>
                                 <td class="px-4 py-3">{{enquiry.division}}</td><td class="px-4 py-3">{{enquiry.projectType}}</td><td class="px-4 py-3">{{enquiry.scope}}</td>
                                 <td class="px-4 py-3">{{enquiry.clientName}}</td><td class="px-4 py-3">{{enquiry.responsibilities}}</td><td class="px-4 py-3">{{enquiry.enquiryStatus}}</td>
                                 <td class="px-4 py-3 max-w-xs truncate">{{enquiry.notes || 'N/A'}}</td><td class="px-4 py-3">{{enquiry.submissionDeadline | date:'dd-MMM-yyyy'}}</td>
                               </tr>
                             } @empty {<tr><td [attr.colspan]="totalEnquiryColumns.length" class="text-center p-8">No enquiries found.</td></tr>}
                           </tbody>
                        </table>
                     } @else {
                        <table class="w-full text-sm text-left text-slate-500">
                           <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap"><tr>@for(col of otherEnquiryColumns; track col.id){<th class="px-4 py-3">{{col.name}}</th>}</tr></thead>
                           <tbody>
                              @for(enquiry of cardDrillDownEnquiries(); track enquiry.id){
                               <tr class="border-b hover:bg-slate-50">
                                 <td class="px-4 py-3">{{enquiry.sno}}</td><td class="px-4 py-3">{{enquiry.enquiryDate | date:'dd-MMM-yyyy'}}</td><td class="px-4 py-3">{{enquiry.division}}</td>
                                 <td class="px-4 py-3 font-medium text-slate-800">{{enquiry.projectName}}</td><td class="px-4 py-3">{{enquiry.clientName}}</td><td class="px-4 py-3">{{enquiry.responsibilities}}</td>
                                 <td class="px-4 py-3">{{enquiry.scope}}</td><td class="px-4 py-3">{{enquiry.stage}}</td><td class="px-4 py-3">{{enquiry.enquiryStatus}}</td>
                                 <td class="px-4 py-3">{{enquiry.submissionDeadline | date:'dd-MMM-yyyy'}}</td>
                               </tr>
                             } @empty {<tr><td [attr.colspan]="otherEnquiryColumns.length" class="text-center p-8">No enquiries found for this stage.</td></tr>}
                           </tbody>
                        </table>
                     }
                   </div>
                 </div>
               </div>
            }
          }
        }
      }
      @case ('reports_proposal_dashboard') {
        @switch(viewState()) {
          @case('dashboard') {
            <div class="space-y-6">
                <!-- Stat Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <button (click)="showProposalCardDrillDown('total', 'Total Proposal')" class="text-left bg-blue-100 border border-blue-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg transition-shadow"><div class="p-3 bg-blue-500 text-white rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div><div><p class="text-sm font-medium text-blue-800">Total Proposal</p><p class="text-3xl font-bold text-blue-900">{{ totalProposals() }}</p></div></button>
                  <button (click)="showProposalCardDrillDown('tender', 'Tender')" class="text-left bg-teal-100 border border-teal-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg transition-shadow"><div class="p-3 bg-teal-500 text-white rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div><div><p class="text-sm font-medium text-teal-800">Tender</p><p class="text-3xl font-bold text-teal-900">{{ tenderProposals() }}</p></div></button>
                  <button (click)="showProposalCardDrillDown('jobInHand', 'Job in Hand')" class="text-left bg-amber-100 border border-amber-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg transition-shadow"><div class="p-3 bg-amber-500 text-white rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div><div><p class="text-sm font-medium text-amber-800">Job in Hand</p><p class="text-3xl font-bold text-amber-900">{{ jobInHandEnquiry() }}</p></div></button>
                  <button (click)="showProposalCardDrillDown('awarded', 'Awarded')" class="text-left bg-emerald-100 border border-emerald-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg transition-shadow"><div class="p-3 bg-emerald-500 text-white rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg></div><div><p class="text-sm font-medium text-emerald-800">Awarded</p><p class="text-3xl font-bold text-emerald-900">{{ awardedProposals() }}</p></div></button>
                  <button (click)="showProposalCardDrillDown('lost', 'Lost')" class="text-left bg-rose-100 border border-rose-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg transition-shadow"><div class="p-3 bg-rose-500 text-white rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div><p class="text-sm font-medium text-rose-800">Lost</p><p class="text-3xl font-bold text-rose-900">{{ lostProposals() }}</p></div></button>
                </div>

                <!-- Proposal Report Table -->
                <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                  <h2 class="text-xl font-bold text-slate-800 mb-4">Proposal Report</h2>
                  <div class="overflow-x-auto border border-slate-200 rounded-lg">
                    <table class="w-full text-sm text-left text-slate-500">
                      <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                          <th class="px-6 py-3">Division</th>
                          <th class="px-6 py-3 text-center">Total Tender</th>
                          <th class="px-6 py-3 text-center">Total Job in Hand</th>
                          <th class="px-6 py-3 text-center">Follow up Tender</th>
                          <th class="px-6 py-3 text-center">Follow up Job in Hand</th>
                          <th class="px-6 py-3 text-center">Awarded Total</th>
                          <th class="px-6 py-3 text-center">Awarded This Month</th>
                          <th class="px-6 py-3 text-center">Lost Total</th>
                          <th class="px-6 py-3 text-center">Lost This Month</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for(row of proposalReport(); track row.division) {
                          <tr class="bg-white border-b hover:bg-slate-50">
                            <td class="px-6 py-4 font-medium text-slate-900">{{ row.division }}</td>
                            <td class="px-6 py-4 text-center"><button (click)="showProposalTableDrillDown(row.division, 'totalTender', 'Total Tender')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.totalTender}}</button></td>
                            <td class="px-6 py-4 text-center"><button (click)="showProposalTableDrillDown(row.division, 'totalJobInHand', 'Total Job in Hand')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.totalJobInHand}}</button></td>
                            <td class="px-6 py-4 text-center"><button (click)="showProposalTableDrillDown(row.division, 'followUpTender', 'Follow Up Tender')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.followUpTender}}</button></td>
                            <td class="px-6 py-4 text-center"><button (click)="showProposalTableDrillDown(row.division, 'followUpJobInHand', 'Follow Up Job in Hand')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.followUpJobInHand}}</button></td>
                            <td class="px-6 py-4 text-center"><button (click)="showProposalTableDrillDown(row.division, 'awardedTotal', 'Awarded Total')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.awardedTotal}}</button></td>
                            <td class="px-6 py-4 text-center"><button (click)="showProposalTableDrillDown(row.division, 'awardedThisMonth', 'Awarded This Month')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.awardedThisMonth}}</button></td>
                            <td class="px-6 py-4 text-center"><button (click)="showProposalTableDrillDown(row.division, 'lostTotal', 'Lost Total')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.lostTotal}}</button></td>
                            <td class="px-6 py-4 text-center"><button (click)="showProposalTableDrillDown(row.division, 'lostThisMonth', 'Lost This Month')" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.lostThisMonth}}</button></td>
                          </tr>
                        } @empty {
                           <tr><td colspan="9" class="px-6 py-10 text-center text-slate-500">No proposal data available.</td></tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
          }
          @case('proposalTableDrillDown') {
            @if(proposalTableDrillDownFilter(); as filter) {
               <div class="space-y-6">
                <div class="bg-sky-100 p-4 rounded-lg shadow-sm border border-sky-200">
                    <div class="flex justify-between items-center">
                        <button (click)="goBackToDashboard()" class="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            Back to Dashboard
                        </button>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2 p-2 rounded-lg bg-blue-100 border border-blue-300 shadow-sm">
                                <span class="text-sm font-medium text-blue-800">Division: <span class="font-bold">{{ filter.division }}</span></span>
                            </div>
                            <div class="flex items-center gap-2 p-2 rounded-lg bg-purple-100 border border-purple-300 shadow-sm">
                                <span class="text-sm font-medium text-purple-800">Type: <span class="font-bold">{{ filter.typeLabel }}</span></span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center space-x-2">
                        <div class="relative flex-grow"><input type="date" (input)="proposalFromDateInput.set($any($event.target).value)" [value]="proposalFromDateInput()" placeholder="From Date" class="form-input w-full rounded-md border-slate-300 shadow-sm pr-10"></div>
                        <div class="relative flex-grow"><input type="date" (input)="proposalToDateInput.set($any($event.target).value)" [value]="proposalToDateInput()" placeholder="To Date" class="form-input w-full rounded-md border-slate-300 shadow-sm pr-10"></div>
                        <button (click)="applyProposalDateFilter()" class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-500 hover:bg-blue-50 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg></button>
                    </div>
                </div>
                <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                  <div class="overflow-x-auto border border-slate-200 rounded-lg">
                    <table class="w-full text-sm text-left text-slate-500">
                      <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap">
                        <tr>
                          @for(col of proposalDrillDownColumns; track col.id){<th class="px-4 py-3">{{col.name}}</th>}
                        </tr>
                      </thead>
                      <tbody>
                        @for(enquiry of proposalDrillDownEnquiries(); track enquiry.id){
                          <tr class="border-b hover:bg-slate-50">
                            <td class="px-4 py-3">{{enquiry.sno}}</td>
                            <td class="px-4 py-3">{{enquiry.enquiryDate | date:'dd-MMM-yyyy'}}</td>
                            <td class="px-4 py-3">{{enquiry.rfqId}}</td>
                            <td class="px-4 py-3 font-medium text-slate-800">{{enquiry.projectName}}</td>
                            <td class="px-4 py-3">{{enquiry.projectType}}</td>
                            <td class="px-4 py-3">{{enquiry.clientName}}</td>
                            <td class="px-4 py-3">{{enquiry.scope}}</td>
                            <td class="px-4 py-3">{{enquiry.responsibilities}}</td>
                            <td class="px-4 py-3">{{enquiry.submissionDeadline | date:'dd-MMM-yyyy'}}</td>
                            <td class="px-4 py-3">{{enquiry.stage}}</td>
                            <td class="px-4 py-3">{{enquiry.enquiryStatus}}</td>
                            <td class="px-4 py-3">{{enquiry.projectStatus || 'N/A'}}</td>
                            <td class="px-4 py-3 text-right">{{enquiry.proposalValue || 0 | number}}</td>
                            <td class="px-4 py-3 text-right">{{enquiry.vatValue || 0 | number}}</td>
                            <td class="px-4 py-3 text-center">{{enquiry.revision}}</td>
                          </tr>
                        } @empty {
                          <tr><td [attr.colspan]="proposalDrillDownColumns.length" class="text-center p-8">No proposals found for this category.</td></tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
          }
           @case('proposalCardDrillDown') {
            @if(proposalCardDrillDownFilter(); as filter) {
               <div class="space-y-6">
                 <div class="bg-sky-100 p-4 rounded-lg shadow-sm border border-sky-200">
                   <div class="flex justify-between items-center">
                     <button (click)="goBackToDashboard()" class="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                       Back to Dashboard
                     </button>
                     <h2 class="text-xl font-bold text-slate-800">{{ filter.label }} Report</h2>
                   </div>
                   <div class="mt-4 flex items-center space-x-2">
                     <div class="relative flex-grow"><input type="date" (input)="proposalCardFromDateInput.set($any($event.target).value)" [value]="proposalCardFromDateInput()" placeholder="From Date" class="form-input w-full rounded-md border-slate-300 shadow-sm pr-10"></div>
                     <div class="relative flex-grow"><input type="date" (input)="proposalCardToDateInput.set($any($event.target).value)" [value]="proposalCardToDateInput()" placeholder="To Date" class="form-input w-full rounded-md border-slate-300 shadow-sm pr-10"></div>
                     <button (click)="applyProposalCardDateFilter()" class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-500 hover:bg-blue-50 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg></button>
                   </div>
                 </div>
                 <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                   <div class="overflow-x-auto">
                      <table class="w-full text-sm text-left text-slate-500">
                         <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap"><tr>@for(col of proposalCardDrillDownColumns; track col.id){<th class="px-4 py-3">{{col.name}}</th>}</tr></thead>
                         <tbody>
                           @for(enquiry of proposalCardDrillDownEnquiries(); track enquiry.id){
                             <tr class="border-b hover:bg-slate-50">
                               <td class="px-4 py-3">{{enquiry.sno}}</td>
                               <td class="px-4 py-3">{{enquiry.enquiryDate | date:'dd-MMM-yyyy'}}</td>
                               <td class="px-4 py-3">{{enquiry.rfqId}}</td>
                               <td class="px-4 py-3 font-medium text-slate-800">{{enquiry.projectName}}</td>
                               <td class="px-4 py-3">{{enquiry.projectType}}</td>
                               <td class="px-4 py-3">{{enquiry.enquiryStatus}}</td>
                               <td class="px-4 py-3">{{enquiry.submissionDeadline | date:'dd-MMM-yyyy'}}</td>
                               <td class="px-4 py-3">{{enquiry.projectLocation}}</td>
                               <td class="px-4 py-3">{{enquiry.stage}}</td>
                               <td class="px-4 py-3">{{enquiry.division}}</td>
                               <td class="px-4 py-3">{{enquiry.scope}}</td>
                               <td class="px-4 py-3">{{enquiry.clientName}}</td>
                               <td class="px-4 py-3">{{enquiry.responsibilities}}</td>
                               <td class="px-4 py-3 max-w-xs truncate">{{enquiry.notes || 'N/A'}}</td>
                             </tr>
                           } @empty {<tr><td [attr.colspan]="proposalCardDrillDownColumns.length" class="text-center p-8">No proposals found.</td></tr>}
                         </tbody>
                      </table>
                   </div>
                 </div>
               </div>
            }
          }
        }
      }
      @case ('reports_project_dashboard') {
        @switch(viewState()) {
          @case('dashboard') {
             <div class="space-y-6">
              <!-- Stat Cards -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button (click)="showProjectDrillDown('awarded', 'Awarded Projects')" class="text-left bg-blue-100 border border-blue-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg transition-shadow">
                  <div class="p-3 bg-blue-500 text-white rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg></div>
                  <div><p class="text-sm font-medium text-blue-800">Awarded Projects</p><p class="text-3xl font-bold text-blue-900">{{ awardedProjectsCount() }}</p></div>
                </button>
                <button (click)="showProjectDrillDown('running', 'Running Projects')" class="text-left bg-teal-100 border border-teal-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg transition-shadow">
                  <div class="p-3 bg-teal-500 text-white rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                  <div><p class="text-sm font-medium text-teal-800">Running Projects</p><p class="text-3xl font-bold text-teal-900">{{ runningProjectsCount() }}</p></div>
                </button>
                <button (click)="showProjectDrillDown('onHold', 'On Hold Projects')" class="text-left bg-amber-100 border border-amber-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg transition-shadow">
                  <div class="p-3 bg-amber-500 text-white rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                  <div><p class="text-sm font-medium text-amber-800">On Hold Projects</p><p class="text-3xl font-bold text-amber-900">{{ onHoldProjectsCount() }}</p></div>
                </button>
                 <button (click)="showProjectDrillDown('closed', 'Closed Projects')" class="text-left bg-slate-100 border border-slate-200 rounded-lg p-6 flex items-center shadow-sm hover:shadow-lg transition-shadow">
                  <div class="p-3 bg-slate-500 text-white rounded-full mr-4"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                  <div><p class="text-sm font-medium text-slate-800">Closed Projects</p><p class="text-3xl font-bold text-slate-900">{{ closedProjectsCount() }}</p></div>
                </button>
              </div>

              <!-- Project Report Table -->
              <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-bold text-slate-800 mb-4">Project Report</h2>
                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                  <table class="w-full text-sm text-left text-slate-500">
                    <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                      <tr>
                        <th class="px-6 py-3">Division</th>
                        <th class="px-6 py-3 text-center">Total Awarded</th>
                        <th class="px-6 py-3 text-center">Awarded</th>
                        <th class="px-6 py-3 text-center">Running</th>
                        <th class="px-6 py-3 text-center">On Hold</th>
                        <th class="px-6 py-3 text-center">Closed</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for(row of projectReport(); track row.division) {
                        <tr class="bg-white border-b hover:bg-slate-50">
                          <td class="px-6 py-4 font-medium text-slate-900">{{ row.division }}</td>
                          <td class="px-6 py-4 text-center"><button (click)="showProjectDrillDown('totalAwarded', 'Total Awarded Projects', row.division)" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.totalAwarded}}</button></td>
                          <td class="px-6 py-4 text-center"><button (click)="showProjectDrillDown('awarded', 'Awarded Projects', row.division)" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.awarded}}</button></td>
                          <td class="px-6 py-4 text-center"><button (click)="showProjectDrillDown('running', 'Running Projects', row.division)" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.running}}</button></td>
                          <td class="px-6 py-4 text-center"><button (click)="showProjectDrillDown('onHold', 'On Hold Projects', row.division)" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.onHold}}</button></td>
                          <td class="px-6 py-4 text-center"><button (click)="showProjectDrillDown('closed', 'Closed Projects', row.division)" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">{{row.closed}}</button></td>
                        </tr>
                      } @empty {
                         <tr><td colspan="6" class="px-6 py-10 text-center text-slate-500">No project data available.</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }
          @case('projectDrillDown') {
            @if(projectDrillDownFilter(); as filter) {
              <div class="space-y-6">
                <div class="bg-sky-100 p-4 rounded-lg shadow-sm border border-sky-200">
                    <div class="flex justify-between items-center">
                        <button (click)="goBackToDashboard()" class="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            Back to Dashboard
                        </button>
                        <h2 class="text-xl font-bold text-slate-800">{{ filter.label }} @if(filter.division) { in {{filter.division}} }</h2>
                    </div>
                    <div class="mt-4 flex items-center space-x-2">
                        <div class="relative flex-grow"><input type="date" (input)="projectFromDateInput.set($any($event.target).value)" [value]="projectFromDateInput()" placeholder="From Date" class="form-input w-full rounded-md border-slate-300 shadow-sm pr-10"></div>
                        <div class="relative flex-grow"><input type="date" (input)="projectToDateInput.set($any($event.target).value)" [value]="projectToDateInput()" placeholder="To Date" class="form-input w-full rounded-md border-slate-300 shadow-sm pr-10"></div>
                        <button (click)="applyProjectDateFilter()" class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-500 hover:bg-blue-50 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg></button>
                    </div>
                </div>
                <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                  <div class="overflow-x-auto border border-slate-200 rounded-lg">
                    <table class="w-full text-sm text-left text-slate-500">
                      <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap">
                        <tr>
                           @for(col of projectDrillDownColumns; track col.id){<th class="px-4 py-3">{{col.name}}</th>}
                        </tr>
                      </thead>
                      <tbody>
                        @for(project of projectDrillDownData(); track project.id) {
                           <tr class="border-b hover:bg-slate-50">
                            <td class="px-4 py-3">{{project.id}}</td>
                            <td class="px-4 py-3">{{project.division}}</td>
                            <td class="px-4 py-3">{{project.projectId}}</td>
                            <td class="px-4 py-3 font-medium text-slate-800">{{project.projectName}}</td>
                            <td class="px-4 py-3">{{project.client}}</td>
                            <td class="px-4 py-3">{{project.scope}}</td>
                            <td class="px-4 py-3 text-right">{{project.totalPO | number}}</td>
                            <td class="px-4 py-3 text-right">{{project.totalVAT | number}}</td>
                            <td class="px-4 py-3">{{project.monthOfAward | date:'MMM yyyy'}}</td>
                             <td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full" [class]="getProjectStatusClass(project.projectStatus)">{{ project.projectStatus }}</span></td>
                          </tr>
                        } @empty {
                           <tr><td [attr.colspan]="projectDrillDownColumns.length" class="text-center p-8">No projects found for this category.</td></tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
          }
        }
      }
      @case ('reports_invoice_tracker') { 
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-slate-800">Invoice Tracker</h1>
            <div class="flex items-center space-x-2">
              <button class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-white border border-green-600 rounded-md hover:bg-green-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" /></svg>
                <span>Excel</span>
              </button>
              <button class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-600 rounded-md hover:bg-blue-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
                <span>Print</span>
              </button>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div class="relative"><label for="it-department" class="absolute -top-2.5 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">Department</label><select #itDept (change)="trackerDepartment.set(itDept.value)" class="form-select w-full rounded-md border-slate-300 shadow-sm py-2 px-3"><option value="All">All Departments</option>@for(d of trackerDepartments(); track d){<option [value]="d">{{d}}</option>}</select></div>
              <div class="relative"><label for="it-month" class="absolute -top-2.5 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">Month</label><select #itMonth (change)="trackerMonth.set(itMonth.value)" class="form-select w-full rounded-md border-slate-300 shadow-sm py-2 px-3"><option value="All">All Months</option>@for(m of trackerMonths; track m.value){<option [value]="m.value">{{m.name}}</option>}</select></div>
              <div class="relative"><label for="it-from-date" class="absolute -top-2.5 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">From Date</label><input #itFrom type="date" (input)="trackerFromDate.set(itFrom.value)" class="form-input w-full rounded-md border-slate-300 shadow-sm py-1.5 px-3"></div>
              <div class="relative"><label for="it-to-date" class="absolute -top-2.5 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">To Date</label><input #itTo type="date" (input)="trackerToDate.set(itTo.value)" class="form-input w-full rounded-md border-slate-300 shadow-sm py-1.5 px-3"></div>
              <div class="relative"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg></div><input #itSearch (input)="trackerSearchTerm.set(itSearch.value)" type="search" placeholder="Search" class="form-input w-full rounded-full border-slate-300 py-2 pl-10 pr-4"></div>
            </div>
          </div>
          
          <!-- Summary Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-lg shadow-sm border"><p class="text-sm font-medium text-slate-500">Total</p><p class="text-3xl font-bold text-slate-800">{{ trackerSummary().total }}</p></div>
            <div class="bg-white p-4 rounded-lg shadow-sm border"><p class="text-sm font-medium text-slate-500">Prepared</p><p class="text-3xl font-bold text-green-600">{{ trackerSummary().prepared }}</p></div>
            <div class="bg-white p-4 rounded-lg shadow-sm border"><p class="text-sm font-medium text-slate-500">Submitted</p><p class="text-3xl font-bold text-blue-600">{{ trackerSummary().submitted }}</p></div>
            <div class="bg-white p-4 rounded-lg shadow-sm border"><p class="text-sm font-medium text-slate-500">Not Submitted</p><p class="text-3xl font-bold text-yellow-600">{{ trackerSummary().notSubmitted }}</p></div>
          </div>
           <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
             <div class="bg-white p-4 rounded-lg shadow-sm border"><p class="text-sm font-medium text-slate-500">Not Prepared</p><p class="text-3xl font-bold text-red-600">{{ trackerSummary().notPrepared }}</p></div>
             <div class="bg-white p-4 rounded-lg shadow-sm border"><p class="text-sm font-medium text-slate-500">Prepared</p><p class="text-sm font-bold text-slate-800">Value: {{ trackerSummary().preparedValue | currency:'SAR ' }}</p><p class="text-xs text-slate-500">VAT: {{ trackerSummary().preparedVat | currency:'SAR ' }}</p></div>
             <div class="bg-white p-4 rounded-lg shadow-sm border"><p class="text-sm font-medium text-slate-500">Submitted</p><p class="text-sm font-bold text-slate-800">Value: {{ trackerSummary().submittedValue | currency:'SAR ' }}</p><p class="text-xs text-slate-500">VAT: {{ trackerSummary().submittedVat | currency:'SAR ' }}</p></div>
             <div class="bg-white p-4 rounded-lg shadow-sm border"><p class="text-sm font-medium text-slate-500">Not Submitted</p><p class="text-sm font-bold text-slate-800">Value: {{ trackerSummary().notSubmittedValue | currency:'SAR ' }}</p><p class="text-xs text-slate-500">VAT: {{ trackerSummary().notSubmittedVat | currency:'SAR ' }}</p></div>
          </div>

          <!-- Data Tables -->
          <div class="space-y-6">
            @for(group of trackerGroupedInvoices(); track group.division) {
              <div class="bg-white rounded-lg shadow-sm">
                <div class="bg-yellow-300 p-2 text-center font-bold text-slate-800 rounded-t-lg">{{ group.division }}</div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm text-left text-slate-500">
                    <thead class="text-xs text-slate-700 uppercase bg-slate-100 whitespace-nowrap">
                      <tr>
                        <th class="px-4 py-3">S.No</th><th class="px-4 py-3">Project Type</th><th class="px-4 py-3">Project Name</th>
                        <th class="px-4 py-3">Client</th><th class="px-4 py-3">No of Invoice Count</th><th class="px-4 py-3">Date of Preparation</th>
                        <th class="px-4 py-3">Prepared Status</th><th class="px-4 py-3">Date of Submission</th><th class="px-4 py-3">Submitted Status</th>
                        <th class="px-4 py-3">Receiving Copy</th><th class="px-4 py-3">Invoice Value</th><th class="px-4 py-3">Invoice VAT</th><th class="px-4 py-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for(invoice of group.invoices; track invoice.sno) {
                        <tr class="border-t border-slate-200">
                          <td class="px-4 py-2">{{ invoice.sno }}</td><td class="px-4 py-2">{{ invoice.projectType }}</td>
                          <td class="px-4 py-2 font-semibold text-slate-800">{{ invoice.projectName }}</td><td class="px-4 py-2">{{ invoice.clientName }}</td>
                          <td class="px-4 py-2 text-center">{{ invoice.invoiceCount }}</td><td class="px-4 py-2">{{ invoice.dateOfPreparation | date:'mediumDate' }}</td>
                          <td class="px-4 py-2"><span class="px-2 py-1 rounded-md text-xs font-semibold" [class]="invoice.preparedStatus === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">{{ invoice.preparedStatus }}</span></td>
                          <td class="px-4 py-2">{{ invoice.dateOfSubmission | date:'mediumDate' }}</td>
                          <td class="px-4 py-2"><span class="px-2 py-1 rounded-md text-xs font-semibold" [class]="invoice.submittedStatus === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">{{ invoice.submittedStatus }}</span></td>
                          <td class="px-4 py-2">{{ invoice.receivingCopy }}</td>
                          <td class="px-4 py-2 text-right">{{ invoice.invoiceValue | currency: 'SAR ' }}</td>
                          <td class="px-4 py-2 text-right">{{ invoice.invoiceVat | currency: 'SAR ' }}</td>
                          <td class="px-4 py-2"><input type="text" class="form-input w-full border-slate-300 rounded-md p-1 text-sm" [value]="invoice.remarks"></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            } @empty {
              <div class="text-center p-8 bg-white rounded-lg shadow-sm text-slate-500">No invoices match the current filters.</div>
            }
          </div>
        </div>
      }
      @case ('reports_po_tracker') {
        <div class="space-y-6 bg-gradient-to-b from-sky-50 via-sky-50 to-white p-1 -m-4 sm:-m-6 lg:-m-8 rounded-t-lg">
          <!-- Header and Filters -->
          <div class="p-4 sm:p-6 lg:p-8">
            <h2 class="text-3xl font-bold text-slate-900">PO Tracker</h2>
            <div class="mt-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/80 p-4">
              <div class="flex items-end gap-4">
                <div class="relative flex-1">
                  <label for="po-division" class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">Division</label>
                  <select id="po-division" (change)="poTrackerDivision.set($any($event.target).value)" [value]="poTrackerDivision()" class="form-select w-full rounded-md border-slate-300 shadow-sm py-2 px-3">
                    @for(division of poTrackerDivisions(); track division) {
                      <option [value]="division">{{ division === 'all' ? 'All Divisions' : division }}</option>
                    }
                  </select>
                </div>
                <div class="relative flex-1">
                  <label for="po-start-date" class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">Start Date</label>
                  <input type="date" id="po-start-date" (input)="poTrackerStartDate.set($any($event.target).value)" [value]="poTrackerStartDate()" class="form-input w-full rounded-md border-slate-300 shadow-sm py-2 px-3">
                </div>
                <div class="relative flex-1">
                  <label for="po-end-date" class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">End Date</label>
                  <input type="date" id="po-end-date" (input)="poTrackerEndDate.set($any($event.target).value)" [value]="poTrackerEndDate()" class="form-input w-full rounded-md border-slate-300 shadow-sm py-2 px-3">
                </div>
                <div>
                  <button class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-sm border border-blue-200">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Table Section -->
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="bg-white rounded-xl shadow-lg border border-slate-200/80 p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="relative w-full max-w-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg></div>
                  <input #poSearch (input)="poTrackerSearchTerm.set(poSearch.value)" type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-full bg-slate-50 shadow-sm text-sm">
                </div>
                <div class="flex items-center gap-2">
                  <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 flex items-center gap-2"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg><span>Excel</span></button>
                  <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center gap-2"><svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd"></path></svg><span>Print</span></button>
                  <div class="relative">
                    <button (click)="showPoTrackerColumnsDropdown.set(!showPoTrackerColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-300 rounded-md hover:bg-cyan-50">Columns to Display</button>
                    @if(showPoTrackerColumnsDropdown()) {
                      <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                        @for(col of poTrackerAllColumns; track col.id) {
                          <label class="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                            <input type="checkbox" [checked]="poTrackerVisibleColumns().has(col.id)" (change)="togglePoTrackerColumn(col.id)" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"><span class="ml-3">{{ col.name }}</span>
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
                      @for(col of poTrackerAllColumns; track col.id) {
                        @if(poTrackerVisibleColumns().has(col.id)) {
                          <th scope="col" class="px-6 py-3">
                            <div class="flex items-center">
                              <span>{{ col.name }}</span>
                              @if(col.sortable) { <svg class="h-4 w-4 ml-1.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg> }
                            </div>
                          </th>
                        }
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for(project of filteredPoTrackerProjects(); track project.id) {
                      <tr class="bg-white border-b hover:bg-slate-50">
                        @if(poTrackerVisibleColumns().has('id')) { <td class="px-6 py-4">{{ project.id }}</td> }
                        @if(poTrackerVisibleColumns().has('clientName')) { <td class="px-6 py-4 font-medium text-slate-900">{{ project.client }}</td> }
                        @if(poTrackerVisibleColumns().has('division')) { <td class="px-6 py-4">{{ project.division }}</td> }
                        @if(poTrackerVisibleColumns().has('projectId')) { <td class="px-6 py-4">{{ project.projectId }}</td> }
                        @if(poTrackerVisibleColumns().has('projectName')) { <td class="px-6 py-4">{{ project.projectName }}</td> }
                        @if(poTrackerVisibleColumns().has('scope')) { <td class="px-6 py-4">{{ project.scope }}</td> }
                        @if(poTrackerVisibleColumns().has('responsibility')) { <td class="px-6 py-4">{{ project.responsibility || 'N/A' }}</td> }
                        @if(poTrackerVisibleColumns().has('totalPO')) { <td class="px-6 py-4 text-right">{{ project.totalPO | number }}</td> }
                        @if(poTrackerVisibleColumns().has('totalVAT')) { <td class="px-6 py-4 text-right">{{ project.totalVAT | number }}</td> }
                        @if(poTrackerVisibleColumns().has('monthOfAward')) { <td class="px-6 py-4">{{ project.monthOfAward | date:'MMM yyyy' }}</td> }
                        @if(poTrackerVisibleColumns().has('projectStatus')) { <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full" [class]="getProjectStatusClass(project.projectStatus)">{{ project.projectStatus }}</span></td> }
                        @if(poTrackerVisibleColumns().has('poStatus')) { <td class="px-6 py-4">{{ project.poStatus }}</td> }
                        @if(poTrackerVisibleColumns().has('openStatus')) { <td class="px-6 py-4">{{ project.openStatus || 'N/A' }}</td> }
                        @if(poTrackerVisibleColumns().has('expiryDate')) { <td class="px-6 py-4">{{ project.expiryDate || 'N/A' }}</td> }
                      </tr>
                    } @empty {
                      <tr><td [attr.colspan]="poTrackerVisibleColumns().size" class="text-center p-8 text-slate-500">No projects found.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      }
      @case ('reports_payment_follow_up') {
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-slate-800">Payment Follow-up Tracker</h2>

          <!-- Filters and Table container -->
          <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4">
            <!-- Top bar with filters, search, and actions -->
            <div class="flex items-center justify-between">
              <!-- Division filter -->
              <div class="flex items-center gap-2">
                <label for="pft-division" class="text-sm font-medium text-slate-700">Division:</label>
                <select id="pft-division" (change)="paymentFollowUpDivision.set($any($event.target).value)" [value]="paymentFollowUpDivision()" class="form-select rounded-md border-slate-300 shadow-sm py-2 px-3 text-sm">
                  @for(division of paymentFollowUpDivisions(); track division) {
                    <option [value]="division">{{ division }}</option>
                  }
                </select>
              </div>
              
              <!-- Search and actions -->
              <div class="flex items-center gap-4">
                <div class="relative w-full max-w-xs">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg></div>
                  <input #pftSearch (input)="paymentFollowUpSearchTerm.set(pftSearch.value)" type="text" placeholder="Search..." class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-full bg-slate-50 shadow-sm text-sm">
                </div>
                <div class="flex items-center gap-2">
                  <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 flex items-center gap-2"><span>Excel</span></button>
                  <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center gap-2"><span>Print</span></button>
                </div>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto border border-slate-200 rounded-lg">
              <table class="w-full text-sm text-left text-slate-500">
                <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap">
                  <tr>
                    <th class="px-6 py-3">ID</th>
                    <th class="px-6 py-3">Division</th>
                    <th class="px-6 py-3 text-right">Outstanding Value</th>
                    <th class="px-6 py-3 text-right">Outstanding VAT</th>
                    <th class="px-6 py-3 text-right">Due Value</th>
                    <th class="px-6 py-3">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for(project of filteredPaymentFollowUpProjects(); track project.id) {
                    <tr class="bg-white border-b hover:bg-slate-50">
                      <td class="px-6 py-4">{{ project.id }}</td>
                      <td class="px-6 py-4">{{ project.division }}</td>
                      <td class="px-6 py-4 text-right font-semibold text-orange-600">{{ project.outstandingValue | number }}</td>
                      <td class="px-6 py-4 text-right font-semibold text-orange-600">{{ project.outstandingVat | number }}</td>
                      <td class="px-6 py-4 text-right font-semibold text-slate-800">{{ project.invoiceValue | number }}</td>
                      <td class="px-6 py-4">{{ project.dueDate | date:'mediumDate' }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="text-center p-8 text-slate-500">No commercially open projects with payment follow-ups found.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
      @case ('reports_consolidated') { 
        <div class="space-y-6 bg-gradient-to-b from-sky-50 via-sky-50 to-white p-1 -m-4 sm:-m-6 lg:-m-8 rounded-t-lg">
           <!-- Header and Filters -->
          <div class="p-4 sm:p-6 lg:p-8">
            <h2 class="text-3xl font-bold text-slate-900">Consolidated Report</h2>
            <div class="mt-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/80 p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <!-- Division -->
                <div class="relative"><label for="cr-division" class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">Division</label><select id="cr-division" (change)="consolidatedDivision.set($any($event.target).value)" [value]="consolidatedDivision()" class="form-select w-full rounded-md border-slate-300 shadow-sm py-2 px-3"><option value="all">All Divisions</option>@for(d of consolidatedDivisions(); track d){<option [value]="d">{{d}}</option>}</select></div>
                <!-- Project Type -->
                <div class="relative"><label for="cr-project-type" class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">Project Type</label><select id="cr-project-type" (change)="consolidatedProjectType.set($any($event.target).value)" [value]="consolidatedProjectType()" class="form-select w-full rounded-md border-slate-300 shadow-sm py-2 px-3"><option value="all">All Types</option>@for(pt of consolidatedProjectTypes(); track pt){<option [value]="pt">{{pt}}</option>}</select></div>
                <!-- Status (Multi-select) -->
                <div class="relative"><label class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">Status</label><button (click)="showConsolidatedStatusDropdown.set(!showConsolidatedStatusDropdown())" class="form-select w-full rounded-md border-slate-300 shadow-sm py-2 px-3 text-left flex justify-between items-center"><span>{{ consolidatedStatusText() }}</span><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button>
                  @if(showConsolidatedStatusDropdown()){
                    <div class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
                      @for(status of consolidatedStatuses(); track status){
                        <label class="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"><input type="checkbox" [checked]="consolidatedSelectedStatuses().includes(status)" (change)="toggleConsolidatedStatus(status)" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"><span class="ml-3">{{status}}</span></label>
                      }
                    </div>
                  }
                </div>
                 <!-- From Date -->
                <div class="relative"><label for="cr-from-date" class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">From Date</label><input type="date" id="cr-from-date" (input)="consolidatedFromDateInput.set($any($event.target).value)" [value]="consolidatedFromDateInput()" class="form-input w-full rounded-md border-slate-300 shadow-sm py-2 px-3"></div>
                <!-- To Date -->
                <div class="relative"><label for="cr-to-date" class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">To Date</label><input type="date" id="cr-to-date" (input)="consolidatedToDateInput.set($any($event.target).value)" [value]="consolidatedToDateInput()" class="form-input w-full rounded-md border-slate-300 shadow-sm py-2 px-3"></div>
                <!-- Filter Button -->
                <div class="col-start-4"><button (click)="applyConsolidatedFilters()" class="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-sm border border-blue-200"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg></button></div>
              </div>
            </div>
          </div>
          
           <!-- Summary Totals -->
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="bg-white rounded-xl shadow-lg border border-slate-200/80 p-6">
              <h3 class="text-xl font-bold text-slate-800 mb-4">Summary Totals</h3>
              @if(consolidatedSummary(); as summary) {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div class="p-4 rounded-lg bg-blue-50 border border-blue-200"><p class="text-sm font-medium text-slate-600">Total PO Value</p><p class="text-2xl font-bold text-blue-800">SAR {{summary.totalPO | number:'1.2-2'}}</p><p class="text-xs text-slate-500">VAT: SAR {{summary.totalPOVat | number:'1.2-2'}}</p></div>
                  <div class="p-4 rounded-lg bg-green-50 border border-green-200"><p class="text-sm font-medium text-slate-600">Total Invoiced</p><p class="text-2xl font-bold text-green-800">SAR {{summary.totalInvoiced | number:'1.2-2'}}</p><p class="text-xs text-slate-500">VAT: SAR {{summary.totalInvoicedVat | number:'1.2-2'}}</p></div>
                  <div class="p-4 rounded-lg bg-purple-50 border border-purple-200"><p class="text-sm font-medium text-slate-600">Total Collected</p><p class="text-2xl font-bold text-purple-800">SAR {{summary.totalCollected | number:'1.2-2'}}</p><p class="text-xs text-slate-500">VAT: SAR {{summary.totalCollectedVat | number:'1.2-2'}}</p></div>
                  <div class="p-4 rounded-lg bg-amber-50 border border-amber-200"><p class="text-sm font-medium text-slate-600">Yet to Invoice</p><p class="text-2xl font-bold text-amber-800">SAR {{summary.totalYetToInvoice | number:'1.2-2'}}</p><p class="text-xs text-slate-500">VAT: SAR {{summary.totalYetToInvoiceVat | number:'1.2-2'}}</p></div>
                  <div class="p-4 rounded-lg bg-rose-50 border border-rose-200"><p class="text-sm font-medium text-slate-600">Total Outstanding</p><p class="text-2xl font-bold text-rose-800">SAR {{summary.totalOutstanding | number:'1.2-2'}}</p><p class="text-xs text-slate-500">VAT: SAR {{summary.totalOutstandingVat | number:'1.2-2'}}</p></div>
                </div>
              }
            </div>
          </div>
          
           <!-- Table Section -->
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="bg-white rounded-xl shadow-lg border border-slate-200/80 p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="relative w-full max-w-sm"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg></div><input #crSearch (input)="consolidatedSearchTerm.set(crSearch.value)" type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-full bg-slate-50 shadow-sm text-sm"></div>
                <div class="flex items-center gap-2">
                  <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 flex items-center gap-2">Excel</button>
                  <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center gap-2">Print</button>
                  <div class="relative"><button (click)="showConsolidatedColumnsDropdown.set(!showConsolidatedColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-300 rounded-md hover:bg-cyan-50">Columns to Display</button>
                    @if(showConsolidatedColumnsDropdown()){
                      <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                        @for(col of consolidatedAllColumns; track col.id){<label class="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"><input type="checkbox" [checked]="consolidatedVisibleColumns().has(col.id)" (change)="toggleConsolidatedColumn(col.id)" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"><span class="ml-3">{{col.name}}</span></label>}
                      </div>
                    }
                  </div>
                </div>
              </div>
              <div class="overflow-x-auto border border-slate-200 rounded-lg">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap">
                    <tr><th class="p-2"><input type="checkbox" class="rounded border-slate-300"></th>@for(col of consolidatedAllColumns; track col.id){ @if(consolidatedVisibleColumns().has(col.id)){<th class="px-4 py-3">{{col.name}}</th>} }</tr>
                  </thead>
                  <tbody>
                    @for(p of filteredConsolidatedProjects(); track p.id){
                      <tr class="border-b hover:bg-slate-50">
                        <td class="p-2"><input type="checkbox" class="rounded border-slate-300"></td>
                        @if(consolidatedVisibleColumns().has('id')){ <td class="px-4 py-3">{{p.id}}</td> }
                        @if(consolidatedVisibleColumns().has('division')){ <td class="px-4 py-3">{{p.division}}</td> }
                        @if(consolidatedVisibleColumns().has('subDivision')){ <td class="px-4 py-3">{{p.projectType}}</td> }
                        @if(consolidatedVisibleColumns().has('projectId')){ <td class="px-4 py-3">{{p.projectId}}</td> }
                        @if(consolidatedVisibleColumns().has('projectName')){ <td class="px-4 py-3 font-medium text-slate-800">{{p.projectName}}</td> }
                        @if(consolidatedVisibleColumns().has('clientName')){ <td class="px-4 py-3">{{p.client}}</td> }
                        @if(consolidatedVisibleColumns().has('scope')){ <td class="px-4 py-3">{{p.scope}}</td> }
                        @if(consolidatedVisibleColumns().has('responsibility')){ <td class="px-4 py-3">{{p.responsibility}}</td> }
                        @if(consolidatedVisibleColumns().has('monthOfAward')){ <td class="px-4 py-3">{{p.monthOfAward | date:'MMM yyyy'}}</td> }
                        @if(consolidatedVisibleColumns().has('poValue')){ <td class="px-4 py-3 text-right">{{p.totalPO | number}}</td> }
                        @if(consolidatedVisibleColumns().has('poVat')){ <td class="px-4 py-3 text-right">{{p.totalVAT | number}}</td> }
                        @if(consolidatedVisibleColumns().has('invoiceValue')){ <td class="px-4 py-3 text-right">{{p.invoiceValue | number}}</td> }
                        @if(consolidatedVisibleColumns().has('invoicedVat')){ <td class="px-4 py-3 text-right">{{p.invoicedVat | number}}</td> }
                        @if(consolidatedVisibleColumns().has('collectedValue')){ <td class="px-4 py-3 text-right">{{p.collectedValue | number}}</td> }
                        @if(consolidatedVisibleColumns().has('collectedVat')){ <td class="px-4 py-3 text-right">{{p.collectedVat | number}}</td> }
                        @if(consolidatedVisibleColumns().has('yetToInvoiceValue')){ <td class="px-4 py-3 text-right">{{p.yetToInvoiceValue | number}}</td> }
                        @if(consolidatedVisibleColumns().has('yetToInvoiceVat')){ <td class="px-4 py-3 text-right">{{p.yetToInvoiceVat | number}}</td> }
                        @if(consolidatedVisibleColumns().has('outstandingValue')){ <td class="px-4 py-3 text-right">{{p.outstandingValue | number}}</td> }
                        @if(consolidatedVisibleColumns().has('outstandingVat')){ <td class="px-4 py-3 text-right">{{p.outstandingVat | number}}</td> }
                        @if(consolidatedVisibleColumns().has('projectStatus')){ <td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full" [class]="getProjectStatusClass(p.projectStatus)">{{ p.projectStatus }}</span></td> }
                      </tr>
                    } @empty {<tr><td [attr.colspan]="consolidatedVisibleColumns().size+1" class="text-center p-8">No projects found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
       }
      @case ('reports_payment_tracker') { 
        <div class="space-y-6 bg-gradient-to-b from-sky-100 via-blue-50 to-white p-1 -m-4 sm:-m-6 lg:-m-8 rounded-t-lg">
          <div class="p-4 sm:p-6 lg:p-8">
            <h2 class="text-3xl font-bold text-slate-900">Payment Tracker</h2>
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-6">
                <p class="text-sm font-medium text-blue-800">Date Range</p>
                <p class="text-2xl font-bold text-blue-900 mt-2">{{ paymentTrackerDateRangeDisplay() }}</p>
              </div>
              <div class="bg-green-50 border border-green-200 rounded-xl shadow-sm p-6">
                <p class="text-sm font-medium text-green-800">Total Income</p>
                <p class="text-2xl font-bold text-green-900 mt-2">SAR {{ paymentTrackerTotalIncome() | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>
          
          <div class="px-4 sm:px-6 lg:p-8">
            <div class="bg-white rounded-xl shadow-lg border border-slate-200/80 p-6">
              <div class="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div class="flex items-end gap-2">
                  <div class="relative"><label for="pt-from-date" class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">From Date</label><input type="date" id="pt-from-date" (input)="paymentTrackerFromDateInput.set($any($event.target).value)" [value]="paymentTrackerFromDateInput()" placeholder="From Date" class="form-input w-full rounded-md border-slate-300 shadow-sm py-2 px-3 text-sm"></div>
                  <div class="relative"><label for="pt-to-date" class="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-slate-500">To Date</label><input type="date" id="pt-to-date" (input)="paymentTrackerToDateInput.set($any($event.target).value)" [value]="paymentTrackerToDateInput()" placeholder="To Date" class="form-input w-full rounded-md border-slate-300 shadow-sm py-2 px-3 text-sm"></div>
                  <button (click)="applyPaymentTrackerDateFilter()" class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-sm border border-blue-200"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg></button>
                </div>
                <div class="relative"><select (change)="applyPaymentTrackerMonthFilter($any($event.target).value)" [value]="paymentTrackerSelectedMonth()" class="form-select rounded-md border-slate-300 shadow-sm py-2 px-3 text-sm"><option value="all">Select Month</option>@for(month of paymentTrackerMonths(); track month.value){<option [value]="month.value">{{month.name}}</option>}</select></div>
              </div>
              <div class="flex items-center justify-between mb-4">
                <div class="relative w-full max-w-sm"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg></div><input #ptSearch (input)="paymentTrackerSearchTerm.set(ptSearch.value)" type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-full bg-slate-50 shadow-sm text-sm"></div>
                <div class="flex items-center gap-2">
                  <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 flex items-center gap-2"><span>Excel</span></button>
                  <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center gap-2"><span>Print</span></button>
                  <div class="relative">
                    <button (click)="showPaymentTrackerColumnsDropdown.set(!showPaymentTrackerColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-300 rounded-md hover:bg-cyan-50">Columns to Display</button>
                    @if(showPaymentTrackerColumnsDropdown()){
                       <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                        @for(col of paymentTrackerAllColumns; track col.id){<label class="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"><input type="checkbox" [checked]="paymentTrackerVisibleColumns().has(col.id)" (change)="togglePaymentTrackerColumn(col.id)" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"><span class="ml-3">{{col.name}}</span></label>}
                      </div>
                    }
                  </div>
                </div>
              </div>

               <div class="overflow-x-auto border border-slate-200 rounded-lg">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap">
                    <tr>@for(col of paymentTrackerAllColumns; track col.id){ @if(paymentTrackerVisibleColumns().has(col.id)){ <th class="px-6 py-3">{{col.name}}</th>}}</tr>
                  </thead>
                  <tbody>
                    @for(p of filteredPaymentTrackerPayments(); track p.id){
                      <tr class="border-b hover:bg-slate-50">
                        @if(paymentTrackerVisibleColumns().has('id')) {<td class="px-6 py-4">{{p.id}}</td>}
                        @if(paymentTrackerVisibleColumns().has('invoiceNo')) {<td class="px-6 py-4">{{p.invoiceNo}}</td>}
                        @if(paymentTrackerVisibleColumns().has('projectId')) {<td class="px-6 py-4">{{p.projectId}}</td>}
                        @if(paymentTrackerVisibleColumns().has('projectName')) {<td class="px-6 py-4 font-medium text-slate-800">{{p.projectName}}</td>}
                        @if(paymentTrackerVisibleColumns().has('clientName')) {<td class="px-6 py-4">{{p.clientName}}</td>}
                        @if(paymentTrackerVisibleColumns().has('division')) {<td class="px-6 py-4">{{p.division}}</td>}
                        @if(paymentTrackerVisibleColumns().has('invoiceDate')) {<td class="px-6 py-4">{{p.invoiceDate | date:'mediumDate'}}</td>}
                        @if(paymentTrackerVisibleColumns().has('invoiceValue')) {<td class="px-6 py-4 text-right">{{p.invoiceValue | number}}</td>}
                        @if(paymentTrackerVisibleColumns().has('invoiceVatValue')) {<td class="px-6 py-4 text-right">{{p.invoiceVatValue | number}}</td>}
                        @if(paymentTrackerVisibleColumns().has('receivedValue')) {<td class="px-6 py-4 text-right text-green-600 font-semibold">{{p.receivedValue | number}}</td>}
                        @if(paymentTrackerVisibleColumns().has('paymentMode')) {<td class="px-6 py-4">{{p.paymentMode}}</td>}
                        @if(paymentTrackerVisibleColumns().has('receivedDate')) {<td class="px-6 py-4">{{p.receivedDate | date:'mediumDate'}}</td>}
                        @if(paymentTrackerVisibleColumns().has('receivedVatValue')) {<td class="px-6 py-4 text-right">{{p.receivedVatValue | number}}</td>}
                        @if(paymentTrackerVisibleColumns().has('remarks')) {<td class="px-6 py-4">{{p.remarks}}</td>}
                      </tr>
                    } @empty {
                      <tr><td [attr.colspan]="paymentTrackerVisibleColumns().size" class="text-center p-8 text-slate-500">No payments found for the selected period.</td></tr>
                    }
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
       }
      @default { <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6"><h2 class="text-2xl font-bold text-slate-800">Reports Management</h2><p class="text-slate-500 mt-2">Please select a report from the sidebar.</p></div> }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, DecimalPipe, CurrencyPipe],
})
export class ReportsManagementComponent {
  reportType = input.required<string>();

  private enquiryService = inject(EnquiryService);
  private invoiceService = inject(InvoiceService);
  private enquiries = this.enquiryService.enquiries;

  // --- View State ---
  viewState = signal<'dashboard' | 'tableDrillDown' | 'cardDrillDown' | 'proposalTableDrillDown' | 'proposalCardDrillDown' | 'projectDrillDown'>('dashboard');

  // --- Dashboard Computations ---
  totalEnquiry = computed(() => this.enquiries().length);
  tenderEnquiry = computed(() => this.enquiries().filter(e => e.stage === 'Tender').length);
  jobInHandEnquiry = computed(() => this.enquiries().filter(e => e.stage === 'Job in Hand').length);
  droppedEnquiry = computed(() => this.enquiries().filter(e => e.stage === 'Dropped').length);

  enquiryReport = computed(() => {
    const divisions = [...new Set(this.enquiries().map(e => e.division))];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return divisions.map(division => {
      const divisionEnquiries = this.enquiries().filter(e => e.division === division);
      
      const isCurrentMonth = (dateStr: string) => {
        const enquiryDate = new Date(dateStr);
        return enquiryDate.getFullYear() === currentYear && enquiryDate.getMonth() === currentMonth;
      };

      const tenderEnquiries = divisionEnquiries.filter(e => e.stage === 'Tender');
      const jobInHandEnquiries = divisionEnquiries.filter(e => e.stage === 'Job in Hand');

      return {
        division,
        totalTender: tenderEnquiries.length,
        totalJobInHand: jobInHandEnquiries.length,
        monthlyTender: tenderEnquiries.filter(e => isCurrentMonth(e.enquiryDate)).length,
        monthlyJobInHand: jobInHandEnquiries.filter(e => isCurrentMonth(e.enquiryDate)).length,
        notSubmittedTender: tenderEnquiries.filter(e => e.enquiryStatus === 'Not Submitted').length,
        notSubmittedJobInHand: jobInHandEnquiries.filter(e => e.enquiryStatus === 'Not Submitted').length,
      };
    });
  });

  // --- Table Drill Down State & Logic ---
  tableDrillDownFilter = signal<{ division: string; type: string; typeLabel: string } | null>(null);
  tableFromDate = signal('');
  tableToDate = signal('');
  tableFromDateInput = signal('');
  tableToDateInput = signal('');
  showTableDrillDownColumnsDropdown = signal(false);

  tableDrillDownAllColumns = [
    { id: 'sno', name: 'S.no' }, { id: 'enquiryDate', name: 'Enquiry Date' },
    { id: 'rfqId', name: 'RFQ ID' }, { id: 'projectName', name: 'Project Name' },
    { id: 'clientName', name: 'Client Name' }, { id: 'responsibilities', name: 'Responsibilities' },
    { id: 'scope', name: 'Scope' }, { id: 'stage', name: 'Stage' },
    { id: 'projectType', name: 'Project Type' }, { id: 'enquiryStatus', name: 'Enquiry Status' },
    { id: 'submissionDeadline', name: 'Submission Deadline' },
  ];

  tableDrillDownEnquiries = computed(() => {
    const filter = this.tableDrillDownFilter();
    if (!filter) return [];
    
    const from = this.tableFromDate();
    const to = this.tableToDate();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const isCurrentMonth = (dateStr: string) => {
      const enquiryDate = new Date(dateStr);
      return enquiryDate.getFullYear() === currentYear && enquiryDate.getMonth() === currentMonth;
    };

    let enquiries: Enquiry[] = this.enquiries().filter(e => e.division === filter.division);

    switch (filter.type) {
      case 'totalTender': enquiries = enquiries.filter(e => e.stage === 'Tender'); break;
      case 'totalJobInHand': enquiries = enquiries.filter(e => e.stage === 'Job in Hand'); break;
      case 'monthlyTender': enquiries = enquiries.filter(e => e.stage === 'Tender' && isCurrentMonth(e.enquiryDate)); break;
      case 'monthlyJobInHand': enquiries = enquiries.filter(e => e.stage === 'Job in Hand' && isCurrentMonth(e.enquiryDate)); break;
      case 'notSubmittedTender': enquiries = enquiries.filter(e => e.stage === 'Tender' && e.enquiryStatus === 'Not Submitted'); break;
      case 'notSubmittedJobInHand': enquiries = enquiries.filter(e => e.stage === 'Job in Hand' && e.enquiryStatus === 'Not Submitted'); break;
    }

    if (from) enquiries = enquiries.filter(e => e.enquiryDate >= from);
    if (to) enquiries = enquiries.filter(e => e.enquiryDate <= to);
    return enquiries;
  });
  
  // --- Card Drill Down State & Logic ---
  cardDrillDownFilter = signal<{ type: 'total' | 'tender' | 'jobInHand' | 'dropped', label: string } | null>(null);
  cardFromDate = signal('');
  cardToDate = signal('');
  cardFromDateInput = signal('');
  cardToDateInput = signal('');

  totalEnquiryColumns = [ { id: 'id', name: 'ID' }, { id: 'enquiryDate', name: 'Enquiry Date' }, { id: 'rfqId', name: 'RFQ ID' }, { id: 'projectName', name: 'Project Name' }, { id: 'projectLocation', name: 'Project Location' }, { id: 'stage', name: 'Stage' }, { id: 'division', name: 'Division' }, { id: 'projectType', name: 'Project Type' }, { id: 'scope', name: 'Scope of Work' }, { id: 'clientName', name: 'Client Name' }, { id: 'responsibility', name: 'Responsibility' }, { id: 'enquiryStatus', name: 'Enquiry Status' }, { id: 'notes', name: 'Notes' }, { id: 'submissionDeadline', name: 'Submission Deadline' }];
  otherEnquiryColumns = [ { id: 'id', name: 'ID' }, { id: 'enquiryDate', name: 'Enquiry Date' }, { id: 'division', name: 'Division' }, { id: 'projectName', name: 'Project Name' }, { id: 'clientName', name: 'Client Name' }, { id: 'responsibility', name: 'Responsibility' }, { id: 'scope', name: 'Scope' }, { id: 'stage', name: 'Stage' }, { id: 'enquiryStatus', name: 'Enquiry Status' }, { id: 'submissionDeadline', name: 'Submission Deadline' }];

  cardDrillDownEnquiries = computed(() => {
    const filter = this.cardDrillDownFilter();
    if (!filter) return [];

    const from = this.cardFromDate();
    const to = this.cardToDate();
    let enquiries: Enquiry[] = this.enquiries();

    switch (filter.type) {
      case 'tender': enquiries = enquiries.filter(e => e.stage === 'Tender'); break;
      case 'jobInHand': enquiries = enquiries.filter(e => e.stage === 'Job in Hand'); break;
      case 'dropped': enquiries = enquiries.filter(e => e.stage === 'Dropped'); break;
    }

    if (from) enquiries = enquiries.filter(e => e.enquiryDate >= from);
    if (to) enquiries = enquiries.filter(e => e.enquiryDate <= to);
    return enquiries;
  });
  
  // --- Proposal Dashboard State & Logic ---
  totalProposals = computed(() => this.enquiries().filter(e => e.enquiryStatus !== 'Not Submitted').length);
  tenderProposals = computed(() => this.enquiries().filter(e => e.stage === 'Tender' && e.enquiryStatus === 'Submitted').length);
  awardedProposals = computed(() => this.enquiries().filter(e => e.stage === 'Job in Hand').length);
  lostProposals = computed(() => this.enquiries().filter(e => e.stage === 'Dropped').length);

  proposalReport = computed(() => {
    const divisions = [...new Set(this.enquiries().map(e => e.division))];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const isCurrentMonth = (dateStr: string) => {
        const enquiryDate = new Date(dateStr);
        return enquiryDate.getFullYear() === currentYear && enquiryDate.getMonth() === currentMonth;
    };
    
    return divisions.map(division => {
        const divisionEnquiries = this.enquiries().filter(e => e.division === division);
        return {
          division,
          totalTender: divisionEnquiries.filter(e => e.stage === 'Tender').length,
          totalJobInHand: divisionEnquiries.filter(e => e.stage === 'Job in Hand').length,
          followUpTender: divisionEnquiries.filter(e => e.stage === 'Tender' && e.enquiryStatus === 'Not Submitted').length,
          followUpJobInHand: divisionEnquiries.filter(e => e.stage === 'Job in Hand' && e.enquiryStatus === 'Not Submitted').length,
          awardedTotal: divisionEnquiries.filter(e => e.stage === 'Job in Hand').length,
          awardedThisMonth: divisionEnquiries.filter(e => e.stage === 'Job in Hand' && isCurrentMonth(e.enquiryDate)).length,
          lostTotal: divisionEnquiries.filter(e => e.stage === 'Dropped').length,
          lostThisMonth: divisionEnquiries.filter(e => e.stage === 'Dropped' && isCurrentMonth(e.enquiryDate)).length,
        };
    });
  });
  
  proposalTableDrillDownFilter = signal<{ division: string; type: string; typeLabel: string } | null>(null);
  proposalFromDate = signal('');
  proposalToDate = signal('');
  proposalFromDateInput = signal('');
  proposalToDateInput = signal('');
  
  proposalDrillDownColumns = [
    {id: 'sno', name: 'ID'}, {id: 'enquiryDate', name: 'Enquiry Date'}, {id: 'rfqId', name: 'RFQ ID'},
    {id: 'projectName', name: 'Project Name'}, {id: 'projectType', name: 'Project Type'}, {id: 'clientName', name: 'Client Name'},
    {id: 'scope', name: 'Scope'}, {id: 'responsiblePerson', name: 'Responsible Person'}, {id: 'submittedDate', name: 'Submitted Date'},
    {id: 'stage', name: 'Stage'}, {id: 'enquiryStatus', name: 'Enquiry Status'}, {id: 'projectStatus', name: 'Project Status'},
    {id: 'proposalValue', name: 'Proposal Value'}, {id: 'vatValue', name: 'VAT Value'}, {id: 'revision', name: 'Revision'}
  ];

  proposalDrillDownEnquiries = computed(() => {
      const filter = this.proposalTableDrillDownFilter();
      if (!filter) return [];

      const from = this.proposalFromDate();
      const to = this.proposalToDate();
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const isCurrentMonth = (dateStr: string) => {
          const enquiryDate = new Date(dateStr);
          return enquiryDate.getFullYear() === currentYear && enquiryDate.getMonth() === currentMonth;
      };

      let enquiries = this.enquiries().filter(e => e.division === filter.division);

      switch (filter.type) {
          case 'totalTender': enquiries = enquiries.filter(e => e.stage === 'Tender'); break;
          case 'totalJobInHand': enquiries = enquiries.filter(e => e.stage === 'Job in Hand'); break;
          case 'followUpTender': enquiries = enquiries.filter(e => e.stage === 'Tender' && e.enquiryStatus === 'Not Submitted'); break;
          case 'followUpJobInHand': enquiries = enquiries.filter(e => e.stage === 'Job in Hand' && e.enquiryStatus === 'Not Submitted'); break;
          case 'awardedTotal': enquiries = enquiries.filter(e => e.stage === 'Job in Hand'); break;
          case 'awardedThisMonth': enquiries = enquiries.filter(e => e.stage === 'Job in Hand' && isCurrentMonth(e.enquiryDate)); break;
          case 'lostTotal': enquiries = enquiries.filter(e => e.stage === 'Dropped'); break;
          case 'lostThisMonth': enquiries = enquiries.filter(e => e.stage === 'Dropped' && isCurrentMonth(e.enquiryDate)); break;
      }

      if (from) enquiries = enquiries.filter(e => e.enquiryDate >= from);
      if (to) enquiries = enquiries.filter(e => e.enquiryDate <= to);
      
      return enquiries;
  });
  
  // --- Proposal Card Drill Down State & Logic ---
  proposalCardDrillDownFilter = signal<{ type: string, label: string } | null>(null);
  proposalCardFromDate = signal('');
  proposalCardToDate = signal('');
  proposalCardFromDateInput = signal('');
  proposalCardToDateInput = signal('');

  proposalCardDrillDownColumns = [
    { id: 'id', name: 'ID' }, { id: 'enquiryDate', name: 'Enquiry Date' }, { id: 'rfqId', name: 'RFQ ID' },
    { id: 'projectName', name: 'Project Name' }, { id: 'projectType', name: 'Project Type' }, { id: 'enquiryStatus', name: 'Inquiry Status' },
    { id: 'submissionDeadline', name: 'Submission Deadline' }, { id: 'projectLocation', name: 'Project Location' }, { id: 'stage', name: 'Stage' },
    { id: 'division', name: 'Division' }, { id: 'scope', name: 'Scope of Work' }, { id: 'clientName', name: 'Client Name' },
    { id: 'responsibility', name: 'Responsibility' }, { id: 'notes', name: 'Notes' }
  ];

  proposalCardDrillDownEnquiries = computed(() => {
    const filter = this.proposalCardDrillDownFilter();
    if (!filter) return [];

    const from = this.proposalCardFromDate();
    const to = this.proposalCardToDate();
    let enquiries: Enquiry[] = this.enquiries();

    switch (filter.type) {
      case 'total': enquiries = enquiries.filter(e => e.enquiryStatus !== 'Not Submitted'); break;
      case 'tender': enquiries = enquiries.filter(e => e.stage === 'Tender' && e.enquiryStatus === 'Submitted'); break;
      case 'jobInHand': case 'awarded': enquiries = enquiries.filter(e => e.stage === 'Job in Hand'); break;
      case 'lost': enquiries = enquiries.filter(e => e.stage === 'Dropped'); break;
    }

    if (from) enquiries = enquiries.filter(e => e.enquiryDate >= from);
    if (to) enquiries = enquiries.filter(e => e.enquiryDate <= to);
    return enquiries;
  });

  // --- Project Dashboard Logic ---
  private _projects = signal<Project[]>([
    { 
      id: 1, division: 'ENGINEERING', rfqId: 'CONSA-ENG-CCC-LLC-12-2025-1376_00', oldProject: 'ETS - Laser Scanning', projectId: 'CONSA-ENG-DEP-0212', 
      projectName: 'Call Center Create', client: 'Leo-Leon-company', scope: 'Design', poStatus: 'YES', openStatus: 'YES',
      totalPO: 60000, totalVAT: 9000, monthOfAward: '2025-10', projectStatus: 'Commercially Open', 
      startDate: '2025-12-26', endDate: '2026-01-26', estimatedTime: '31 days', projectType: 'DEPUTATION',
      responsibility: 'Karthikeyan Elumalai', invoiceValue: 50000, invoicedVat: 7500, collectedValue: 20000, collectedVat: 3000, outstandingValue: 30000, outstandingVat: 4500, yetToInvoiceValue: 10000, yetToInvoiceVat: 1500, dueDate: '2026-02-28' 
    },
    { id: 2, division: 'BIM', rfqId: 'BIM/SA/CO-ARCH-10-2025', oldProject: 'Architectural BIM', projectId: 'P-1520', projectName: 'Architectural BIM', client: 'EG - Elenora', scope: 'LOD 300 Modeling', poStatus: 'YES', openStatus: 'YES', totalPO: 250000, totalVAT: 37500, monthOfAward: '2025-11', projectStatus: 'Commercially Closed', startDate: '2025-11-01', endDate: '2026-05-01', estimatedTime: '181 days', projectType: 'Project', responsibility: 'John Doe', invoiceValue: 250000, invoicedVat: 37500, collectedValue: 250000, collectedVat: 37500, outstandingValue: 0, outstandingVat: 0, yetToInvoiceValue: 0, yetToInvoiceVat: 0 },
    { id: 3, division: 'LASER', rfqId: 'LAS/SA/CO-SCAN-10-2025', oldProject: '3D Laser Scanning of Plant', projectId: 'P-1410', projectName: '3D Laser Scanning of Plant', client: 'PetroCorp', scope: 'On-site Laser Scan', poStatus: 'YES', openStatus: 'NO', expiryDate: '2025-01-01', totalPO: 85000, totalVAT: 12750, monthOfAward: '2024-08', projectStatus: 'Commercially Closed', startDate: '2024-09-01', endDate: '2024-12-15', estimatedTime: '105 days', projectType: 'Project', responsibility: 'Jane Smith', invoiceValue: 85000, invoicedVat: 12750, collectedValue: 85000, collectedVat: 12750, outstandingValue: 0, outstandingVat: 0, yetToInvoiceValue: 0, yetToInvoiceVat: 0 },
    { id: 4, division: 'BIM', rfqId: 'BIM/SA/CO-MEP-11-2025', oldProject: 'MEP Coordination', projectId: 'P-1601', projectName: 'MEP Coordination for Tower', client: 'ConstructCo', scope: 'Clash Detection', poStatus: 'YES', openStatus: 'YES', totalPO: 180000, totalVAT: 27000, monthOfAward: '2025-11', projectStatus: 'Commercially Open', startDate: '2025-11-15', endDate: '2026-04-15', estimatedTime: '151 days', projectType: 'Project', responsibility: 'Susan Wilson', invoiceValue: 100000, invoicedVat: 15000, collectedValue: 10000, collectedVat: 1500, outstandingValue: 90000, outstandingVat: 13500, yetToInvoiceValue: 80000, yetToInvoiceVat: 12000, dueDate: '2026-05-31' },
    { id: 5, division: 'SIMULATION & ANALYSIS', rfqId: 'SIM/SA/GC-EQ-11-2025', oldProject: 'FEA Analysis', projectId: 'P-1700', projectName: 'FEA for Support Structure', client: 'EngiCorp', scope: 'Finite Element Analysis', poStatus: 'YES', openStatus: 'YES', totalPO: 45000, totalVAT: 6750, monthOfAward: '2025-11', projectStatus: 'Awarded', startDate: '2025-12-01', endDate: '2026-01-31', estimatedTime: '61 days', projectType: 'Project', responsibility: 'Michael Chen', invoiceValue: 0, invoicedVat: 0, collectedValue: 0, collectedVat: 0, outstandingValue: 0, outstandingVat: 0, yetToInvoiceValue: 45000, yetToInvoiceVat: 6750 },
    { id: 6, division: 'ENGINEERING', rfqId: 'ENG/SA/CO-HLD-12-2025', oldProject: 'Bridge Design', projectId: 'P-1800', projectName: 'Suspension Bridge Design', client: 'Govt. Authority', scope: 'Full Structural Design', poStatus: 'YES', openStatus: 'YES', totalPO: 1200000, totalVAT: 180000, monthOfAward: '2025-12', projectStatus: 'On Hold', startDate: '2026-01-01', endDate: '2027-12-31', estimatedTime: '730 days', projectType: 'Project', responsibility: 'Karthikeyan Elumalai', invoiceValue: 100000, invoicedVat: 15000, collectedValue: 50000, collectedVat: 7500, outstandingValue: 50000, outstandingVat: 7500, yetToInvoiceValue: 1100000, yetToInvoiceVat: 165000 },
  ]);

  awardedProjectsCount = computed(() => this._projects().filter(p => p.projectStatus === 'Awarded').length);
  runningProjectsCount = computed(() => this._projects().filter(p => p.projectStatus === 'Commercially Open').length);
  onHoldProjectsCount = computed(() => this._projects().filter(p => p.projectStatus === 'On Hold').length);
  closedProjectsCount = computed(() => this._projects().filter(p => p.projectStatus === 'Commercially Closed').length);
  
  projectReport = computed(() => {
    const divisions = [...new Set(this._projects().map(p => p.division))];
    return divisions.map(division => {
      const divisionProjects = this._projects().filter(p => p.division === division);
      return {
        division,
        totalAwarded: divisionProjects.filter(p => ['Awarded', 'Commercially Open', 'Commercially Closed'].includes(p.projectStatus)).length,
        awarded: divisionProjects.filter(p => p.projectStatus === 'Awarded').length,
        running: divisionProjects.filter(p => p.projectStatus === 'Commercially Open').length,
        onHold: divisionProjects.filter(p => p.projectStatus === 'On Hold').length,
        closed: divisionProjects.filter(p => p.projectStatus === 'Commercially Closed').length,
      };
    });
  });

  projectDrillDownFilter = signal<{ type: string, label: string, division?: string } | null>(null);
  projectFromDate = signal('');
  projectToDate = signal('');
  projectFromDateInput = signal('');
  projectToDateInput = signal('');

  projectDrillDownColumns = [
    { id: 'id', name: 'ID'}, { id: 'division', name: 'Division'}, { id: 'projectId', name: 'Project ID'},
    { id: 'projectName', name: 'Project Name'}, { id: 'client', name: 'Client'}, { id: 'scope', name: 'Scope'},
    { id: 'totalPO', name: 'Total PO'}, { id: 'totalVAT', name: 'Total VAT'},
    { id: 'monthOfAward', name: 'Month of Award'}, { id: 'status', name: 'Status of the Project'}
  ];

  projectDrillDownData = computed(() => {
    const filter = this.projectDrillDownFilter();
    if (!filter) return [];

    let projects = this._projects();

    if (filter.division) {
      projects = projects.filter(p => p.division === filter.division);
    }
    
    switch (filter.type) {
      case 'awarded': projects = projects.filter(p => p.projectStatus === 'Awarded'); break;
      case 'running': projects = projects.filter(p => p.projectStatus === 'Commercially Open'); break;
      case 'onHold': projects = projects.filter(p => p.projectStatus === 'On Hold'); break;
      case 'closed': projects = projects.filter(p => p.projectStatus === 'Commercially Closed'); break;
      case 'totalAwarded': projects = projects.filter(p => ['Awarded', 'Commercially Open', 'Commercially Closed'].includes(p.projectStatus)); break;
    }

    const from = this.projectFromDate();
    const to = this.projectToDate();
    if (from) projects = projects.filter(p => p.startDate >= from);
    if (to) projects = projects.filter(p => p.startDate <= to);
    
    return projects;
  });

  // --- PO Tracker Logic ---
  poTrackerDivision = signal('all');
  poTrackerStartDate = signal('');
  poTrackerEndDate = signal('');
  poTrackerSearchTerm = signal('');
  showPoTrackerColumnsDropdown = signal(false);

  poTrackerAllColumns = [
      { id: 'id', name: 'S.No', sortable: false },
      { id: 'clientName', name: 'Client Name', sortable: false },
      { id: 'division', name: 'Division', sortable: false },
      { id: 'projectId', name: 'Project ID', sortable: true },
      { id: 'projectName', name: 'Project Name', sortable: false },
      { id: 'scope', name: 'Scope', sortable: false },
      { id: 'responsibility', name: 'Responsibility', sortable: false },
      { id: 'totalPO', name: 'Total PO Value', sortable: false },
      { id: 'totalVAT', name: 'Total PO VAT', sortable: false },
      { id: 'monthOfAward', name: 'Month Of Award', sortable: false },
      { id: 'projectStatus', name: 'Status Of The Projects', sortable: false },
      { id: 'poStatus', name: 'PO Status', sortable: false },
      { id: 'openStatus', name: 'Open Status', sortable: false },
      { id: 'expiryDate', name: 'Expiry Date', sortable: false },
  ];
  poTrackerVisibleColumns = signal(new Set(this.poTrackerAllColumns.map(c => c.id)));

  poTrackerDivisions = computed(() => ['all', ...new Set(this._projects().map(p => p.division))]);

  filteredPoTrackerProjects = computed(() => {
      const division = this.poTrackerDivision();
      const startDate = this.poTrackerStartDate();
      const endDate = this.poTrackerEndDate();
      const term = this.poTrackerSearchTerm().toLowerCase();

      return this._projects().filter(p => {
          const divisionMatch = division === 'all' || p.division === division;
          const dateMatch = (!startDate || p.startDate >= startDate) && (!endDate || p.startDate <= endDate);
          const termMatch = !term ||
              p.client.toLowerCase().includes(term) ||
              p.division.toLowerCase().includes(term) ||
              p.projectId.toLowerCase().includes(term) ||
              p.projectName.toLowerCase().includes(term) ||
              p.scope.toLowerCase().includes(term) ||
              (p.responsibility && p.responsibility.toLowerCase().includes(term));
          
          return divisionMatch && dateMatch && termMatch;
      });
  });

  togglePoTrackerColumn(columnId: string): void {
      this.poTrackerVisibleColumns.update(cols => {
          const newCols = new Set(cols);
          if (newCols.has(columnId)) {
              newCols.delete(columnId);
          } else {
              newCols.add(columnId);
          }
          return newCols;
      });
  }

  // --- Payment Follow-up Tracker Logic ---
  paymentFollowUpDivision = signal('All Divisions');
  paymentFollowUpSearchTerm = signal('');

  paymentFollowUpDivisions = computed(() => ['All Divisions', ...new Set(this._projects().map(p => p.division))]);

  filteredPaymentFollowUpProjects = computed(() => {
    const division = this.paymentFollowUpDivision();
    const term = this.paymentFollowUpSearchTerm().toLowerCase();

    return this._projects().filter(p => {
      if (p.projectStatus !== 'Commercially Open') {
        return false;
      }
      
      const divisionMatch = division === 'All Divisions' || p.division === division;

      const termMatch = !term ||
          p.id.toString().includes(term) ||
          p.division.toLowerCase().includes(term) ||
          p.projectName.toLowerCase().includes(term) ||
          p.client.toLowerCase().includes(term);

      return divisionMatch && termMatch;
    });
  });
  
  // --- Consolidated Report Logic ---
  consolidatedDivision = signal('all');
  consolidatedProjectType = signal('all');
  consolidatedSelectedStatuses = signal<string[]>([]);
  consolidatedFromDate = signal('');
  consolidatedToDate = signal('');
  consolidatedFromDateInput = signal('');
  consolidatedToDateInput = signal('');
  consolidatedSearchTerm = signal('');
  showConsolidatedStatusDropdown = signal(false);
  showConsolidatedColumnsDropdown = signal(false);

  consolidatedDivisions = computed(() => [...new Set(this._projects().map(p => p.division))]);
  consolidatedProjectTypes = computed(() => [...new Set(this._projects().map(p => p.projectType))]);
  consolidatedStatuses = computed(() => [...new Set(this._projects().map(p => p.projectStatus))]);

  consolidatedStatusText = computed(() => {
    const selected = this.consolidatedSelectedStatuses();
    if (selected.length === 0) return 'Select Status';
    if (selected.length === 1) return selected[0];
    return `${selected.length} statuses selected`;
  });

  filteredConsolidatedProjects = computed(() => {
    const division = this.consolidatedDivision();
    const projectType = this.consolidatedProjectType();
    const statuses = this.consolidatedSelectedStatuses();
    const fromDate = this.consolidatedFromDate();
    const toDate = this.consolidatedToDate();
    const term = this.consolidatedSearchTerm().toLowerCase();

    return this._projects().filter(p => {
      const divisionMatch = division === 'all' || p.division === division;
      const projectTypeMatch = projectType === 'all' || p.projectType === projectType;
      const statusMatch = statuses.length === 0 || statuses.includes(p.projectStatus);
      const dateMatch = (!fromDate || p.startDate >= fromDate) && (!toDate || p.startDate <= toDate);
      const termMatch = !term || Object.values(p).some(val => String(val).toLowerCase().includes(term));
      return divisionMatch && projectTypeMatch && statusMatch && dateMatch && termMatch;
    });
  });

  consolidatedSummary = computed(() => {
    return this.filteredConsolidatedProjects().reduce((acc, p) => {
      acc.totalPO += p.totalPO || 0;
      acc.totalPOVat += p.totalVAT || 0;
      acc.totalInvoiced += p.invoiceValue || 0;
      acc.totalInvoicedVat += p.invoicedVat || 0;
      acc.totalCollected += p.collectedValue || 0;
      acc.totalCollectedVat += p.collectedVat || 0;
      acc.totalYetToInvoice += p.yetToInvoiceValue || 0;
      acc.totalYetToInvoiceVat += p.yetToInvoiceVat || 0;
      acc.totalOutstanding += p.outstandingValue || 0;
      acc.totalOutstandingVat += p.outstandingVat || 0;
      return acc;
    }, {
      totalPO: 0, totalPOVat: 0,
      totalInvoiced: 0, totalInvoicedVat: 0,
      totalCollected: 0, totalCollectedVat: 0,
      totalYetToInvoice: 0, totalYetToInvoiceVat: 0,
      totalOutstanding: 0, totalOutstandingVat: 0,
    });
  });
  
  consolidatedAllColumns = [
    { id: 'id', name: 'S.No'}, { id: 'division', name: 'Division'}, { id: 'subDivision', name: 'Sub Division'},
    { id: 'projectId', name: 'Project ID'}, { id: 'projectName', name: 'Project Name'}, { id: 'clientName', name: 'Client Name'},
    { id: 'scope', name: 'Scope'}, { id: 'responsibility', name: 'Responsibility'}, { id: 'monthOfAward', name: 'Month of Award'},
    { id: 'poValue', name: 'PO Value'}, { id: 'poVat', name: 'PO VAT'}, { id: 'invoiceValue', name: 'Invoiced Value'},
    { id: 'invoicedVat', name: 'Invoiced VAT'}, { id: 'collectedValue', name: 'Collected Value'}, { id: 'collectedVat', name: 'Collected VAT'},
    { id: 'yetToInvoiceValue', name: 'Yet to Invoice Value'}, { id: 'yetToInvoiceVat', name: 'Yet to Invoice VAT'},
    { id: 'outstandingValue', name: 'Outstanding Value'}, { id: 'outstandingVat', name: 'Outstanding VAT'},
    { id: 'projectStatus', name: 'Project Status'}
  ];
  consolidatedVisibleColumns = signal(new Set(this.consolidatedAllColumns.map(c => c.id)));

  toggleConsolidatedStatus(status: string) {
    this.consolidatedSelectedStatuses.update(selected => {
      const newSelected = new Set(selected);
      if (newSelected.has(status)) {
        newSelected.delete(status);
      } else {
        newSelected.add(status);
      }
      return Array.from(newSelected);
    });
  }

  toggleConsolidatedColumn(id: string) {
    this.consolidatedVisibleColumns.update(cols => {
      const newCols = new Set(cols);
      if (newCols.has(id)) newCols.delete(id); else newCols.add(id);
      return newCols;
    });
  }

  applyConsolidatedFilters() {
    this.consolidatedFromDate.set(this.consolidatedFromDateInput());
    this.consolidatedToDate.set(this.consolidatedToDateInput());
  }

  // --- Payment Tracker Logic ---
  private _payments = signal<Payment[]>([
    { id: 1, invoiceNo: 'INV-001', projectId: 'CONSA-ENG-DEP-0212', projectName: 'Call Center Create', clientName: 'Leo-Leon-company', division: 'ENGINEERING', invoiceDate: '2025-12-05', invoiceValue: 30000, invoiceVatValue: 4500, receivedValue: 34500, paymentMode: 'Bank Transfer', receivedDate: '2025-12-10', receivedVatValue: 4500, remarks: 'Partial payment received' },
    { id: 2, invoiceNo: 'INV-002', projectId: 'P-1601', projectName: 'MEP Coordination for Tower', clientName: 'ConstructCo', division: 'BIM', invoiceDate: '2025-12-08', invoiceValue: 50000, invoiceVatValue: 7500, receivedValue: 57500, paymentMode: 'Cheque', receivedDate: '2025-12-15', receivedVatValue: 7500, remarks: 'Full payment for milestone 1' },
    { id: 3, invoiceNo: 'INV-003', projectId: 'P-1410', projectName: '3D Laser Scanning of Plant', clientName: 'PetroCorp', division: 'LASER', invoiceDate: '2025-11-20', invoiceValue: 85000, invoiceVatValue: 12750, receivedValue: 0, paymentMode: 'Bank Transfer', receivedDate: '2025-12-20', receivedVatValue: 0, remarks: 'Payment due' },
  ]);

  paymentTrackerFromDate = signal('2025-12-01');
  paymentTrackerToDate = signal('2025-12-31');
  paymentTrackerFromDateInput = signal('2025-12-01');
  paymentTrackerToDateInput = signal('2025-12-31');
  paymentTrackerSelectedMonth = signal('11'); // 11 for December
  paymentTrackerSearchTerm = signal('');
  showPaymentTrackerColumnsDropdown = signal(false);
  
  paymentTrackerMonths = computed(() => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames.map((name, index) => ({ name: `${name} 2025`, value: index.toString() }));
  });
  
  filteredPaymentTrackerPayments = computed(() => {
    const from = this.paymentTrackerFromDate();
    const to = this.paymentTrackerToDate();
    const term = this.paymentTrackerSearchTerm().toLowerCase();
    
    return this._payments().filter(p => {
      const dateMatch = (!from || p.receivedDate >= from) && (!to || p.receivedDate <= to);
      const termMatch = !term || Object.values(p).some(val => String(val).toLowerCase().includes(term));
      return dateMatch && termMatch;
    });
  });

  paymentTrackerDateRangeDisplay = computed(() => {
    const from = this.paymentTrackerFromDate();
    const to = this.paymentTrackerToDate();
    if(!from || !to) return 'N/A';
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return `${fromDate.toLocaleDateString('en-US')} - ${toDate.toLocaleDateString('en-US')}`;
  });

  paymentTrackerTotalIncome = computed(() => {
    return this.filteredPaymentTrackerPayments().reduce((sum, p) => sum + p.receivedValue, 0);
  });
  
  paymentTrackerAllColumns = [
      { id: 'id', name: 'S.No' }, { id: 'invoiceNo', name: 'Invoice No' },
      { id: 'projectId', name: 'Project ID' }, { id: 'projectName', name: 'Project Name' },
      { id: 'clientName', name: 'Client Name' }, { id: 'division', name: 'Division' },
      { id: 'invoiceDate', name: 'Invoice Date' }, { id: 'invoiceValue', name: 'Invoice Value' },
      { id: 'invoiceVatValue', name: 'Invoice VAT' }, { id: 'receivedValue', name: 'Received Value' },
      { id: 'paymentMode', name: 'Payment Mode' }, { id: 'receivedDate', name: 'Received Date' },
      { id: 'receivedVatValue', name: 'Received VAT' }, { id: 'remarks', name: 'Remarks' },
  ];
  paymentTrackerVisibleColumns = signal(new Set(this.paymentTrackerAllColumns.map(c => c.id)));
  
  applyPaymentTrackerDateFilter() {
    this.paymentTrackerFromDate.set(this.paymentTrackerFromDateInput());
    this.paymentTrackerToDate.set(this.paymentTrackerToDateInput());
    this.paymentTrackerSelectedMonth.set('all'); // Deselect month
  }

  applyPaymentTrackerMonthFilter(monthValue: string) {
    this.paymentTrackerSelectedMonth.set(monthValue);
    if(monthValue === 'all') {
      this.paymentTrackerFromDate.set('');
      this.paymentTrackerToDate.set('');
      this.paymentTrackerFromDateInput.set('');
      this.paymentTrackerToDateInput.set('');
      return;
    }
    const year = 2025;
    const month = parseInt(monthValue, 10);
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const from = startDate.toISOString().split('T')[0];
    const to = endDate.toISOString().split('T')[0];
    this.paymentTrackerFromDate.set(from);
    this.paymentTrackerToDate.set(to);
    this.paymentTrackerFromDateInput.set(from);
    this.paymentTrackerToDateInput.set(to);
  }

  togglePaymentTrackerColumn(id: string) {
    this.paymentTrackerVisibleColumns.update(cols => {
      const newCols = new Set(cols);
      if (newCols.has(id)) newCols.delete(id); else newCols.add(id);
      return newCols;
    });
  }

  // --- Invoice Tracker Logic ---
  trackerDepartment = signal('All');
  trackerMonth = signal('All');
  trackerFromDate = signal('');
  trackerToDate = signal('');
  trackerSearchTerm = signal('');

  trackerMonths = [
    { name: 'January', value: '1' }, { name: 'February', value: '2' }, { name: 'March', value: '3' },
    { name: 'April', value: '4' }, { name: 'May', value: '5' }, { name: 'June', value: '6' },
    { name: 'July', value: '7' }, { name: 'August', value: '8' }, { name: 'September', value: '9' },
    { name: 'October', value: '10' }, { name: 'November', value: '11' }, { name: 'December', value: '12' },
  ];
  
  private allTrackableInvoices = computed(() => 
    [...this.invoiceService.milestoneInvoices(), ...this.invoiceService.monthlyInvoices(), ...this.invoiceService.proRataInvoices()]
    .filter(inv => inv.invoiceStatus === 'YES')
  );

  trackerDepartments = computed(() => ['All', ...new Set(this.allTrackableInvoices().map(inv => inv.division))]);
  
  trackerFilteredInvoices = computed(() => {
    const division = this.trackerDepartment();
    const month = this.trackerMonth();
    const from = this.trackerFromDate();
    const to = this.trackerToDate();
    const term = this.trackerSearchTerm().toLowerCase();
    
    return this.allTrackableInvoices().filter(inv => {
      const divisionMatch = division === 'All' || inv.division === division;
      
      const prepDate = inv.dateOfPreparation ? new Date(inv.dateOfPreparation) : null;
      
      const monthMatch = month === 'All' || (prepDate ? prepDate.getMonth() + 1 === parseInt(month) : false);
      
      const dateMatch = (!from || (inv.dateOfPreparation && inv.dateOfPreparation >= from)) && 
                        (!to || (inv.dateOfPreparation && inv.dateOfPreparation <= to));
      
      const termMatch = !term ||
        inv.projectName.toLowerCase().includes(term) ||
        inv.clientName.toLowerCase().includes(term) ||
        inv.projectId.toLowerCase().includes(term);

      return divisionMatch && monthMatch && dateMatch && termMatch;
    });
  });

  trackerSummary = computed(() => {
    const filtered = this.trackerFilteredInvoices();
    
    const prepared = filtered.filter(i => i.preparedStatus === 'Yes');
    const submitted = filtered.filter(i => i.submittedStatus === 'Yes');
    const notPrepared = filtered.filter(i => i.preparedStatus === 'No');
    const notSubmitted = filtered.filter(i => i.submittedStatus === 'No');
    
    const sumValues = (invoices: MilestoneInvoice[]) => invoices.reduce((acc, i) => {
      acc.value += i.invoiceValue;
      acc.vat += i.invoiceVat;
      return acc;
    }, { value: 0, vat: 0 });

    const preparedTotals = sumValues(prepared);
    const submittedTotals = sumValues(submitted);
    const notSubmittedTotals = sumValues(notSubmitted);

    return {
      total: filtered.length,
      prepared: prepared.length,
      submitted: submitted.length,
      notSubmitted: notSubmitted.length,
      notPrepared: notPrepared.length,
      preparedValue: preparedTotals.value,
      preparedVat: preparedTotals.vat,
      submittedValue: submittedTotals.value,
      submittedVat: submittedTotals.vat,
      notSubmittedValue: notSubmittedTotals.value,
      notSubmittedVat: notSubmittedTotals.vat,
    };
  });

  trackerGroupedInvoices = computed(() => {
    const invoices = this.trackerFilteredInvoices();
    const map = new Map<string, MilestoneInvoice[]>();
    for (const invoice of invoices) {
      if (!map.has(invoice.division)) {
        map.set(invoice.division, []);
      }
      map.get(invoice.division)!.push(invoice);
    }
    return Array.from(map.entries()).map(([division, invoices]) => ({ division, invoices }));
  });


  // --- View Control Methods ---
  goBackToDashboard() {
    this.viewState.set('dashboard');
    this.tableDrillDownFilter.set(null);
    this.cardDrillDownFilter.set(null);
    this.proposalTableDrillDownFilter.set(null);
    this.proposalCardDrillDownFilter.set(null);
    this.projectDrillDownFilter.set(null);
  }

  showTableDrillDown(division: string, type: string, typeLabel: string) {
    this.tableDrillDownFilter.set({ division, type, typeLabel });
    this.tableFromDate.set(''); this.tableToDate.set('');
    this.tableFromDateInput.set(''); this.tableToDateInput.set('');
    this.viewState.set('tableDrillDown');
  }

  showCardDrillDown(type: 'total' | 'tender' | 'jobInHand' | 'dropped', label: string) {
    this.cardDrillDownFilter.set({ type, label });
    this.cardFromDate.set(''); this.cardToDate.set('');
    this.cardFromDateInput.set(''); this.cardToDateInput.set('');
    this.viewState.set('cardDrillDown');
  }

  showProposalTableDrillDown(division: string, type: string, typeLabel: string) {
    this.proposalTableDrillDownFilter.set({ division, type, typeLabel });
    this.proposalFromDate.set(''); this.proposalToDate.set('');
    this.proposalFromDateInput.set(''); this.proposalToDateInput.set('');
    this.viewState.set('proposalTableDrillDown');
  }
  
  showProposalCardDrillDown(type: string, label: string) {
    this.proposalCardDrillDownFilter.set({ type, label });
    this.proposalCardFromDate.set('');
    this.proposalCardToDate.set('');
    this.proposalCardFromDateInput.set('');
    this.proposalCardToDateInput.set('');
    this.viewState.set('proposalCardDrillDown');
  }
  
  showProjectDrillDown(type: string, label: string, division?: string) {
    this.projectDrillDownFilter.set({ type, label, division });
    this.projectFromDate.set(''); this.projectToDate.set('');
    this.projectFromDateInput.set(''); this.projectToDateInput.set('');
    this.viewState.set('projectDrillDown');
  }

  applyTableDateFilter() {
    this.tableFromDate.set(this.tableFromDateInput());
    this.tableToDate.set(this.tableToDateInput());
  }

  applyCardDateFilter() {
    this.cardFromDate.set(this.cardFromDateInput());
    this.cardToDate.set(this.cardToDateInput());
  }

  applyProposalDateFilter() {
    this.proposalFromDate.set(this.proposalFromDateInput());
    this.proposalToDate.set(this.proposalToDateInput());
  }

  applyProposalCardDateFilter() {
    this.proposalCardFromDate.set(this.proposalCardFromDateInput());
    this.proposalCardToDate.set(this.proposalCardToDateInput());
  }
  
  applyProjectDateFilter() {
    this.projectFromDate.set(this.projectFromDateInput());
    this.projectToDate.set(this.projectToDateInput());
  }

  getProjectStatusClass(status: Project['projectStatus']): string {
    switch(status) {
      case 'Commercially Open': return 'bg-green-100 text-green-800';
      case 'Commercially Closed': return 'bg-slate-100 text-slate-800';
      case 'Awarded': return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}
