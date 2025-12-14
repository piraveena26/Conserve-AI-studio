import { Component, ChangeDetectionStrategy, input, inject, computed, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { EnquiryService, Enquiry } from '../services/enquiry.service';
import { InvoiceService, MilestoneInvoice } from '../services/invoice.service';
import { FinancialConfigService } from '../services/financial-config.service';

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
                        <table class="w-full text-sm text-left text-slate-500">
                           <thead class="text-xs text-slate-700 uppercase bg-slate-50 whitespace-nowrap"><tr>@for(col of cardDrillDownColumns; track col.id){<th class="px-4 py-3">{{col.name}}</th>}</tr></thead>
                           <tbody>
                             @for(enquiry of cardDrillDownEnquiries(); track enquiry.id){
                               <tr class="border-b hover:bg-slate-50">
                                 <td class="px-4 py-3">{{enquiry.sno}}</td><td class="px-4 py-3">{{enquiry.enquiryDate | date:'dd-MMM-yyyy'}}</td><td class="px-4 py-3">{{enquiry.rfqId}}</td>
                                 <td class="px-4 py-3 font-medium text-slate-800">{{enquiry.projectName}}</td>
                                 <td class="px-4 py-3">{{enquiry.clientName}}</td>
                                 <td class="px-4 py-3">{{enquiry.responsibilities}}</td>
                                 <td class="px-4 py-3">{{enquiry.scope}}</td>
                                 <td class="px-4 py-3">{{enquiry.stage}}</td>
                                 <td class="px-4 py-3">{{enquiry.projectType}}</td>
                                 <td class="px-4 py-3">{{enquiry.enquiryStatus}}</td>
                                 <td class="px-4 py-3">{{enquiry.submissionDeadline | date:'dd-MMM-yyyy'}}</td>
                               </tr>
                             } @empty {
                               <tr><td [attr.colspan]="cardDrillDownColumns.length" class="text-center p-8">No enquiries found for the selected criteria.</td></tr>
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
      @case('reports_proposal_dashboard') { <div>Proposal Dashboard Placeholder</div> }
      @case('reports_project_dashboard') { <div>Project Dashboard Placeholder</div> }
      @case('reports_invoice_tracker') { <div>Invoice Tracker Placeholder</div> }
      @case('reports_po_tracker') { <div>PO Tracker Placeholder</div> }
      @case('reports_payment_follow_up') { <div>Payment Follow-up Placeholder</div> }
      @case('reports_consolidated') { <div>Consolidated Report Placeholder</div> }
      @case('reports_payment_tracker') { <div>Payment Tracker Placeholder</div> }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, DecimalPipe, CurrencyPipe],
})
export class ReportsManagementComponent {
  reportType = input.required<string>();

  private enquiryService = inject(EnquiryService);
  private invoiceService = inject(InvoiceService);
  private financialConfigService = inject(FinancialConfigService);

  viewState = signal<'dashboard' | 'tableDrillDown' | 'cardDrillDown'>('dashboard');

  // --- Dashboard State ---
  totalEnquiry = computed(() => this.enquiryService.enquiries().length);
  tenderEnquiry = computed(() => this.enquiryService.enquiries().filter(e => e.stage === 'Tender').length);
  jobInHandEnquiry = computed(() => this.enquiryService.enquiries().filter(e => e.stage === 'Job in Hand').length);
  droppedEnquiry = computed(() => this.enquiryService.enquiries().filter(e => e.stage === 'Dropped').length);

  enquiryReport = computed(() => {
    const divisions = this.financialConfigService.divisions();
    const enquiries = this.enquiryService.enquiries();
    const currentMonth = new Date().getMonth();

    return divisions.map(div => {
      const divEnquiries = enquiries.filter(e => e.division === div);
      const isCurrentMonth = (dateStr: string) => new Date(dateStr).getMonth() === currentMonth;
      
      return {
        division: div,
        totalTender: divEnquiries.filter(e => e.stage === 'Tender').length,
        totalJobInHand: divEnquiries.filter(e => e.stage === 'Job in Hand').length,
        monthlyTender: divEnquiries.filter(e => e.stage === 'Tender' && isCurrentMonth(e.enquiryDate)).length,
        monthlyJobInHand: divEnquiries.filter(e => e.stage === 'Job in Hand' && isCurrentMonth(e.enquiryDate)).length,
        notSubmittedTender: divEnquiries.filter(e => e.stage === 'Tender' && e.enquiryStatus === 'Not Submitted').length,
        notSubmittedJobInHand: divEnquiries.filter(e => e.stage === 'Job in Hand' && e.enquiryStatus === 'Not Submitted').length,
      };
    });
  });

  // --- Table Drill Down State ---
  tableDrillDownFilter = signal<{division: string, type: string, typeLabel: string} | null>(null);
  tableDrillDownEnquiries = signal<Enquiry[]>([]);
  tableFromDateInput = signal<string>('');
  tableToDateInput = signal<string>('');
  showTableDrillDownColumnsDropdown = signal(false);

  tableDrillDownAllColumns = [
      { id: 'sno', name: 'S.No' },
      { id: 'enquiryDate', name: 'Enq Date' },
      { id: 'rfqId', name: 'RFQ ID' },
      { id: 'projectName', name: 'Project Name' },
      { id: 'clientName', name: 'Client Name' },
      { id: 'responsibilities', name: 'Responsibility' },
      { id: 'scope', name: 'Scope' },
      { id: 'stage', name: 'Stage' },
      { id: 'projectType', name: 'Project Type' },
      { id: 'enquiryStatus', name: 'Enq Status' },
      { id: 'submissionDeadline', name: 'Sub Date' },
  ];
  
  // --- Card Drill Down State ---
  cardDrillDownFilter = signal<{ type: string, label: string } | null>(null);
  cardDrillDownEnquiries = signal<Enquiry[]>([]);
  cardFromDateInput = signal<string>('');
  cardToDateInput = signal<string>('');

  cardDrillDownColumns = [
    { id: 'sno', name: 'S.No' },
    { id: 'enquiryDate', name: 'Enq Date' },
    { id: 'rfqId', name: 'RFQ ID' },
    { id: 'projectName', name: 'Project Name' },
    { id: 'clientName', name: 'Client Name' },
    { id: 'responsibilities', name: 'Responsibility' },
    { id: 'scope', name: 'Scope' },
    { id: 'stage', name: 'Stage' },
    { id: 'projectType', name: 'Project Type' },
    { id: 'enquiryStatus', name: 'Enq Status' },
    { id: 'submissionDeadline', name: 'Sub Date' },
  ];

  // --- Shared Column State ---
  showColumnsDropdown = signal(false);
  allColumns = [
    { id: 'sno', name: 'Sno' }, { id: 'enquiryDate', name: 'Enquiry Date' },
    { id: 'division', name: 'Division' }, { id: 'rfqId', name: 'Rfq Id' },
    { id: 'projectName', name: 'Project Name' }, { id: 'clientName', name: 'Client Name' },
    { id: 'projectType', name: 'Project Type'},
    { id: 'scope', name: 'Scope'},
    { id: 'stage', name: 'Stage'},
    { id: 'responsibilities', name: 'Responsible'},
    { id: 'enquiryStatus', name: 'Status' }, 
    { id: 'submissionDeadline', name: 'Submitted Date' },
    { id: 'actions', name: 'Actions' }
  ];
  visibleColumns = signal(new Set(this.allColumns.map(c => c.id)));


  // --- Methods ---
  goBackToDashboard() {
    this.viewState.set('dashboard');
    this.tableDrillDownFilter.set(null);
    this.cardDrillDownFilter.set(null);
  }

  showTableDrillDown(division: string, type: string, typeLabel: string) {
    this.tableDrillDownFilter.set({ division, type, typeLabel });
    this.applyTableDateFilter(); // Initial filter
    this.viewState.set('tableDrillDown');
  }
  
  showCardDrillDown(type: string, label: string) {
    this.cardDrillDownFilter.set({ type, label });
    this.applyCardDateFilter(); // Initial filter
    this.viewState.set('cardDrillDown');
  }

  applyTableDateFilter() {
    const from = this.tableFromDateInput();
    const to = this.tableToDateInput();
    const filter = this.tableDrillDownFilter();
    if (!filter) return;

    let filtered = this.enquiryService.enquiries().filter(e => e.division === filter.division);

    if (from && to) {
      filtered = filtered.filter(e => e.enquiryDate >= from && e.enquiryDate <= to);
    }
    
    // Additional logic based on `type`
    const isCurrentMonth = (dateStr: string) => new Date(dateStr).getMonth() === new Date().getMonth();
    switch(filter.type) {
        case 'totalTender': filtered = filtered.filter(e => e.stage === 'Tender'); break;
        case 'totalJobInHand': filtered = filtered.filter(e => e.stage === 'Job in Hand'); break;
        case 'monthlyTender': filtered = filtered.filter(e => e.stage === 'Tender' && isCurrentMonth(e.enquiryDate)); break;
        case 'monthlyJobInHand': filtered = filtered.filter(e => e.stage === 'Job in Hand' && isCurrentMonth(e.enquiryDate)); break;
        case 'notSubmittedTender': filtered = filtered.filter(e => e.stage === 'Tender' && e.enquiryStatus === 'Not Submitted'); break;
        case 'notSubmittedJobInHand': filtered = filtered.filter(e => e.stage === 'Job in Hand' && e.enquiryStatus === 'Not Submitted'); break;
    }
    
    this.tableDrillDownEnquiries.set(filtered);
  }

  applyCardDateFilter() {
    const from = this.cardFromDateInput();
    const to = this.cardToDateInput();
    const filter = this.cardDrillDownFilter();
    if (!filter) return;

    let allEnquiries = this.enquiryService.enquiries();
    let filtered: Enquiry[] = [];

    switch(filter.type) {
      case 'total': filtered = allEnquiries; break;
      case 'tender': filtered = allEnquiries.filter(e => e.stage === 'Tender'); break;
      case 'jobInHand': filtered = allEnquiries.filter(e => e.stage === 'Job in Hand'); break;
      case 'dropped': filtered = allEnquiries.filter(e => e.stage === 'Dropped'); break;
    }
    
    if (from && to) {
      filtered = filtered.filter(e => e.enquiryDate >= from && e.enquiryDate <= to);
    }

    this.cardDrillDownEnquiries.set(filtered);
  }
}
