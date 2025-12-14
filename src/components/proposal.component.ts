
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { EnquiryService } from '../services/enquiry.service';

@Component({
  selector: 'app-proposal',
  template: `
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-sky-50 to-blue-100 p-4 rounded-lg shadow-sm">
        <h1 class="text-2xl font-bold text-slate-800">Proposal FollowUp</h1>
      </div>

      <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
        <!-- Toolbar -->
        <div class="flex items-center justify-between">
            <div class="relative w-full max-w-xs">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
              </div>
              <input type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500">
            </div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" /></svg>
                Excel
              </button>
              <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
                Print
              </button>
              <div class="relative">
                <button (click)="showColumnsDropdown.set(!showColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-sky-700 bg-white border border-sky-500 rounded-md hover:bg-sky-50 flex items-center gap-2">
                  Columns to Display <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
                @if(showColumnsDropdown()) {
                  <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10">
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
        <!-- Table -->
        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th class="px-2 py-3"><input type="checkbox" class="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"></th>
                @for(col of allColumns; track col.id) {
                  @if(visibleColumns().has(col.id)) { <th scope="col" class="px-6 py-3">{{ col.name }}</th> }
                }
              </tr>
            </thead>
            <tbody>
              @for (proposal of proposals(); track proposal.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"></td>
                  @if(visibleColumns().has('sno')) { <td class="px-6 py-4">{{ proposal.sno }}</td> }
                  @if(visibleColumns().has('enquiryDate')) { <td class="px-6 py-4">{{ proposal.enquiryDate }}</td> }
                  @if(visibleColumns().has('projectName')) { <td class="px-6 py-4 font-semibold text-slate-800">{{ proposal.projectName }}</td> }
                  @if(visibleColumns().has('clientName')) { <td class="px-6 py-4">{{ proposal.clientName }}</td> }
                  @if(visibleColumns().has('projectType')) { <td class="px-6 py-4">{{ proposal.projectType }}</td> }
                  @if(visibleColumns().has('scope')) { <td class="px-6 py-4">{{ proposal.scope }}</td> }
                  @if(visibleColumns().has('stage')) { <td class="px-6 py-4">{{ proposal.stage }}</td> }
                  @if(visibleColumns().has('revision')) { <td class="px-6 py-4 text-center">{{ proposal.revision }}</td> }
                  @if(visibleColumns().has('quotation')) {
                    <td class="px-6 py-4">
                      @if(proposal.quotations.length > 0) {
                        <div class="flex flex-col space-y-1">
                          @for(quote of proposal.quotations; track quote) {
                            <a href="{{ quote }}" target="_blank" class="text-sky-600 hover:text-sky-800 hover:underline text-xs font-medium flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd" />
                              </svg>
                              <span>{{ quote.split('/').pop() }}</span>
                            </a>
                          }
                        </div>
                      } @else {
                        <span class="text-slate-400">N/A</span>
                      }
                    </td>
                  }
                  @if(visibleColumns().has('proposalValue')) { <td class="px-6 py-4">{{ proposal.proposalValue | currency:'USD':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('vatValue')) { <td class="px-6 py-4">{{ proposal.vatValue | currency:'USD':'symbol':'1.2-2' }}</td> }
                  @if(visibleColumns().has('status')) { 
                    <td class="px-6 py-4">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {{ proposal.enquiryStatus }}
                      </span>
                    </td> 
                  }
                  @if(visibleColumns().has('actions')) {
                    <td class="px-6 py-4">
                      <div class="flex items-center space-x-3">
                        <button class="text-slate-500 hover:text-green-600" title="Edit Proposal">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                        </button>
                        <button class="text-slate-500 hover:text-green-600" title="Proceed">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                      </div>
                    </td>
                  }
                </tr>
              } @empty {
                <tr>
                    <td [attr.colspan]="visibleColumns().size + 1" class="px-6 py-10 text-center text-slate-500">No submitted proposals to display.</td>
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
export class ProposalComponent {
  private readonly enquiryService = inject(EnquiryService);
  proposals = this.enquiryService.proposalEnquiries;
  
  showColumnsDropdown = signal(false);

  allColumns = [
    { id: 'sno', name: 'S.No' },
    { id: 'enquiryDate', name: 'Enquiry Date' },
    { id: 'projectName', name: 'Project Name' },
    { id: 'clientName', name: 'Client Name' },
    { id: 'projectType', name: 'Project Type' },
    { id: 'scope', name: 'Scope' },
    { id: 'stage', name: 'Stage' },
    { id: 'revision', name: 'Revision' },
    { id: 'quotation', name: 'Quotation' },
    { id: 'proposalValue', name: 'Proposal Value' },
    { id: 'vatValue', name: 'VAT Value' },
    { id: 'status', name: 'Status' },
    { id: 'actions', name: 'Actions' }
  ];

  // Default visible columns
  visibleColumns = signal(new Set([
    'sno', 'projectName', 'clientName', 'projectType', 'stage', 'revision', 'proposalValue', 'status', 'actions'
  ]));

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
