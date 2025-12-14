import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';

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
}


@Component({
  selector: 'app-projects',
  template: `
    @if (viewingProject(); as project) {
      <div class="space-y-6">
        <!-- Back Button -->
        <button (click)="closeProjectView()" class="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg group">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Projects
        </button>

        <!-- Main Header -->
        <div class="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 bg-slate-100 flex items-center justify-center rounded-lg border border-slate-200">
                @if(project.logoUrl) {
                  <img [src]="project.logoUrl" alt="Project Logo" class="w-full h-full object-contain rounded-lg">
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                }
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                  <h1 class="text-2xl font-bold text-slate-800">{{ project.projectName }}</h1>
                  <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full" [class]="getStatusClass(project.projectStatus)">
                    {{ project.projectStatus }}
                  </span>
                </div>
                <p class="mt-1 text-sm font-medium text-slate-500">{{ project.projectId }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="openEditModal(project)" class="p-2 rounded-full bg-green-50 hover:bg-green-100 text-green-600" title="Edit Project">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
              </button>
              <button (click)="promptDelete(project)" class="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600" title="Delete Project">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <!-- Stat Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 bg-white rounded-lg border border-green-200 shadow-sm flex items-center gap-4">
                <div class="p-3 bg-green-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                <div><p class="text-xs font-medium text-slate-500">START DATE</p><p class="font-bold text-slate-800">{{ project.startDate | date:'mediumDate' }}</p></div>
              </div>
              <div class="p-4 bg-white rounded-lg border border-orange-200 shadow-sm flex items-center gap-4">
                 <div class="p-3 bg-orange-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <div><p class="text-xs font-medium text-slate-500">END DATE</p><p class="font-bold text-slate-800">{{ project.endDate | date:'mediumDate' }}</p></div>
              </div>
               <div class="p-4 bg-white rounded-lg border border-purple-200 shadow-sm flex items-center gap-4">
                <div class="p-3 bg-purple-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                <div><p class="text-xs font-medium text-slate-500">ESTIMATED TIME</p><p class="font-bold text-slate-800">{{ project.estimatedTime }}</p></div>
              </div>
            </div>

            <!-- Purchase Order -->
            <div class="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex justify-between items-center bg-gradient-to-r from-purple-50 via-white to-white">
              <div>
                <p class="text-xs font-bold text-purple-600">PURCHASE ORDER</p>
                <p class="text-2xl font-bold text-slate-800">{{ project.poRefNo }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button class="p-2.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg></button>
                <button class="p-2.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                <button class="p-2.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
              </div>
            </div>

            <!-- Main Info Tabs -->
            <div class="bg-white rounded-lg shadow-sm border border-slate-200">
              <div class="border-b border-slate-200"><nav class="-mb-px flex space-x-6 px-6"><button (click)="activeInfoTab.set('info')" [class]="getInfoTabClass('info')">Info</button><button (click)="activeInfoTab.set('tasks')" [class]="getInfoTabClass('tasks')">Tasks</button><button (click)="activeInfoTab.set('communication')" [class]="getInfoTabClass('communication')">Communication Details</button><button (click)="activeInfoTab.set('invoice')" [class]="getInfoTabClass('invoice')">Invoice Details</button></nav></div>
              
              @switch (activeInfoTab()) {
                @case ('info') {
                  <div class="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4 bg-slate-50/50">
                    <!-- Project Info -->
                    <div class="bg-white p-4 rounded-lg border border-slate-200"><h4 class="font-bold text-slate-800 mb-1 flex items-center gap-2"><div class="p-1.5 bg-blue-100 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>Project Information</h4><p class="text-xs text-slate-500 mb-4">Core project details</p><dl class="space-y-3 text-sm"><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500">Project Name</dt><dd class="font-semibold text-slate-800 text-right">{{ project.projectName }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500">Project ID</dt><dd class="font-semibold text-slate-800 text-right">{{ project.projectId }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500">Project Type</dt><dd class="font-semibold text-slate-800 text-right">{{ project.projectType }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500">RFQ ID</dt><dd class="font-semibold text-slate-800 text-right">{{ project.rfqId }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500">Division</dt><dd class="font-semibold text-slate-800 text-right">{{ project.division }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500">Enquiry Date</dt><dd class="font-semibold text-slate-800 text-right">{{ project.enquiryDate | date:'mediumDate' }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500">Client</dt><dd class="font-semibold text-slate-800 text-right">{{ project.client }}</dd></div><div class="flex justify-between items-center"><dt class="text-slate-500">Scope</dt><dd class="font-semibold text-slate-800 text-right">{{ project.scope }}</dd></div></dl></div>
                    <!-- Contact Details -->
                    <div class="bg-white p-4 rounded-lg border border-slate-200"><div class="flex justify-between items-start"><h4 class="font-bold text-slate-800 mb-1 flex items-center gap-2"><div class="p-1.5 bg-green-100 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>Contact Details</h4><span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">1 Contact</span></div><p class="text-xs text-slate-500 mb-4">Client contact information</p>@if(project.contactDetails; as contact){<div class="border border-green-200 rounded-lg p-3 space-y-3"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700">{{ getInitials(contact.person) }}</div><div><p class="font-bold text-slate-800">{{ contact.person }}</p><p class="text-xs text-slate-500">Contact #1</p></div></div><div class="p-3 bg-slate-50 rounded-md flex items-center gap-3"><div class="p-1.5 bg-slate-200 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div><div><p class="text-xs text-slate-500">DESIGNATION</p><p class="font-semibold text-slate-700">{{ contact.designation }}</p></div></div><div class="p-3 bg-slate-50 rounded-md flex items-center gap-3"><div class="p-1.5 bg-slate-200 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div><div><p class="text-xs text-slate-500">PHONE</p><p class="font-semibold text-slate-700">{{ contact.phone }}</p></div></div><div class="p-3 bg-slate-50 rounded-md flex items-center gap-3"><div class="p-1.5 bg-slate-200 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div><div><p class="text-xs text-slate-500">EMAIL</p><p class="font-semibold text-slate-700">{{ contact.email }}</p></div></div></div>}</div>
                    <!-- Financial Details -->
                    <div class="bg-white p-4 rounded-lg border border-slate-200"><h4 class="font-bold text-slate-800 mb-1 flex items-center gap-2"><div class="p-1.5 bg-purple-100 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>Financial Details</h4><p class="text-xs text-slate-500 mb-4">Payment and value information</p><dl class="space-y-3 text-sm"><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500 flex items-center gap-2"><div class="p-1 bg-purple-200 rounded-sm"></div>Payment Terms</dt><dd class="font-semibold text-slate-800 text-right">{{ project.paymentTerms }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500 flex items-center gap-2"><div class="p-1 bg-purple-200 rounded-sm"></div>PO Value</dt><dd class="font-semibold text-purple-700 text-right">{{ project.totalPO | currency:'SAR ':'symbol':'1.0-0' }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500 flex items-center gap-2"><div class="p-1 bg-purple-200 rounded-sm"></div>Number of Dues</dt><dd class="font-semibold text-slate-800 text-right">{{ project.paymentDues }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500 flex items-center gap-2"><div class="p-1 bg-purple-200 rounded-sm"></div>VAT Value</dt><dd class="font-semibold text-purple-700 text-right">{{ project.totalVAT | currency:'SAR ':'symbol':'1.0-0' }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500 flex items-center gap-2"><div class="p-1 bg-purple-200 rounded-sm"></div>Status</dt><dd class="font-semibold text-slate-800 text-right">{{ project.projectStatus }}</dd></div><div class="flex justify-between items-center border-b pb-2"><dt class="text-slate-500 flex items-center gap-2"><div class="p-1 bg-purple-200 rounded-sm"></div>Final Quotation</dt><dd class="font-semibold text-blue-600 text-right hover:underline"><a [href]="project.finalQuotation" target="_blank">PDF File</a></dd></div><div class="flex justify-between items-center"><dt class="text-slate-500 flex items-center gap-2"><div class="p-1 bg-purple-200 rounded-sm"></div>Payment Due Days</dt><dd class="font-semibold text-slate-800 text-right">{{ project.paymentDueDays }}</dd></div></dl></div>
                  </div>
                }
                @case ('communication') {
                   <div class="p-6 bg-slate-50/50 rounded-b-lg">
                    <!-- Toolbar -->
                    <div class="flex items-center justify-between mb-4">
                      <div class="relative w-full max-w-xs">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                        </div>
                        <input #commSearch (input)="communicationSearchTerm.set(commSearch.value)" type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md shadow-sm bg-white">
                      </div>
                      <div class="flex items-center gap-2">
                        <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 flex items-center gap-2">Excel</button>
                        <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 flex items-center gap-2">Print</button>
                        <button class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-500 rounded-md hover:bg-cyan-50 flex items-center gap-2">Columns to Display</button>
                      </div>
                    </div>
                    <!-- Table -->
                    <div class="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                      <table class="w-full text-sm text-left text-slate-500">
                        <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                          <tr><th scope="col" class="px-6 py-3">Sno</th><th scope="col" class="px-6 py-3">Ref No</th><th scope="col" class="px-6 py-3">link</th><th scope="col" class="px-6 py-3 text-right">Actions</th></tr>
                        </thead>
                        <tbody>
                          @for(comm of paginatedCommunications(); track comm.id) {
                            <tr class="border-b"><td class="px-6 py-4">{{ comm.sno }}</td><td class="px-6 py-4 font-medium text-slate-800">{{ comm.refNo }}</td><td class="px-6 py-4"><a [href]="comm.link" target="_blank"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>PDF</span></a></td><td class="px-6 py-4 text-right"><div class="flex items-center justify-end gap-2"><button class="p-2 rounded-full bg-green-50 hover:bg-green-100 text-green-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button><button (click)="promptDeleteCommunication(comm)" class="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button></div></td></tr>
                          } @empty {
                            <tr><td colspan="4" class="text-center py-8 text-slate-500">No communication details found.</td></tr>
                          }
                        </tbody>
                      </table>
                    </div>
                    <!-- Pagination -->
                    <div class="flex items-center justify-between pt-4">
                      <div class="text-sm text-slate-600">Items per page: <select #commItemsPerPage (change)="communicationItemsPerPage.set(+commItemsPerPage.value)" class="form-select text-sm p-1 border-slate-300 rounded-md"><option value="5">5</option><option value="10" selected>10</option><option value="20">20</option></select></div>
                      <div class="text-sm text-slate-600">{{ communicationPaginationSummary() }}</div>
                      <div class="flex items-center gap-1">
                        <button (click)="changeCommunicationPage(communicationCurrentPage() - 1)" [disabled]="communicationCurrentPage() === 1" class="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg></button>
                        <button (click)="changeCommunicationPage(communicationCurrentPage() + 1)" [disabled]="communicationCurrentPage() === communicationTotalPages()" class="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg></button>
                      </div>
                    </div>
                  </div>
                }
                @default {
                  <div class="p-6 text-center text-slate-500">
                    <p>Content for "{{ activeInfoTab() }}" is not yet available.</p>
                  </div>
                }
              }
            </div>
          </div>
          <!-- Right Sidebar -->
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold text-slate-800 mb-1 flex items-center gap-2"><div class="p-1.5 bg-purple-100 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>Progress Overview</h4>
                  <p class="text-xs text-slate-500">Project Completion</p>
                </div>
                <p class="text-3xl font-bold text-blue-600">{{ project.progress }}%</p>
              </div>
              <div class="mt-4"><p class="text-sm font-medium text-slate-600 mb-2">Progress</p><div class="relative w-full bg-slate-200 rounded-full h-2"><div class="bg-blue-600 h-2 rounded-full" [style.width]="project.progress + '%'"></div></div></div>
              <div class="mt-6">
                <div class="flex justify-between items-center">
                  <h4 class="font-bold text-slate-800 mb-1 flex items-center gap-2"><div class="p-1.5 bg-blue-100 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a6 6 0 00-12 0v2" /></svg></div>Team Members</h4>
                  <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{{ project.assignees?.length || 0 }} Members</span>
                </div>
                <div class="flex -space-x-2 mt-3">
                  @for (assignee of project.assignees; track assignee) {
                    <div class="w-10 h-10 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center font-bold text-white text-sm" [title]="assignee">{{ getInitials(assignee) }}</div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="space-y-4">
        <!-- Header & Tabs -->
        <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-slate-800">Projects</h2>
          <div class="flex items-center border border-sky-400 rounded-lg p-0.5">
            <button 
              (click)="setActiveTab('open')" 
              class="px-3 py-1 text-sm font-semibold rounded-md transition-colors"
              [class]="activeTab() === 'open' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-sky-50'">
              Commercially Open
            </button>
            <button 
              (click)="setActiveTab('closed')" 
              class="px-3 py-1 text-sm font-semibold rounded-md transition-colors"
              [class]="activeTab() === 'closed' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-sky-50'">
              Commercially Closed
            </button>
            <button 
              (click)="setActiveTab('awarded')" 
              class="px-3 py-1 text-sm font-semibold rounded-md transition-colors"
              [class]="activeTab() === 'awarded' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-sky-50'">
              Total Awarded Projects
            </button>
          </div>
        </div>

        <!-- Filters & Table -->
        <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <div>
            <select #divisionSelect (change)="selectedDivision.set(divisionSelect.value)" class="form-select w-full max-w-xs border-slate-300 rounded-md shadow-sm focus:border-sky-500 focus:ring-sky-500">
              <option value="all">All Divisions</option>
              @for(division of divisions(); track division) {
                <option [value]="division">{{ division }}</option>
              }
            </select>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="relative w-full max-w-md">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
              </div>
              <input #searchInput (input)="searchTerm.set(searchInput.value)" type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-sky-300 rounded-full bg-sky-50/50 focus:border-sky-500 focus:ring-sky-500 placeholder-sky-400">
            </div>

            <div class="flex items-center gap-2">
              <button class="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" /></svg>
                Excel
              </button>
              <button class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
                Print
              </button>
              <div class="relative">
                <button (click)="showColumnsDropdown.set(!showColumnsDropdown())" class="px-4 py-2 text-sm font-medium text-sky-700 bg-white border border-sky-400 rounded-lg hover:bg-sky-50 flex items-center gap-2">
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
          <div class="overflow-x-auto border-t border-slate-200">
            <table class="w-full text-sm text-left text-slate-500">
              <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th class="px-2 py-3"><input type="checkbox" class="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"></th>
                  @for(col of allColumns; track col.id) {
                    @if(visibleColumns().has(col.id)) { <th scope="col" class="px-4 py-3 whitespace-nowrap">{{ col.name }}</th> }
                  }
                </tr>
              </thead>
              <tbody>
                @for (project of filteredProjects(); track project.id) {
                  <tr class="bg-white border-b hover:bg-slate-50">
                    <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"></td>
                    @if(visibleColumns().has('id')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.id }}</td> }
                    @if(visibleColumns().has('division')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.division }}</td> }
                    @if(visibleColumns().has('rfqId')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.rfqId }}</td> }
                    @if(visibleColumns().has('oldProject')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.oldProject }}</td> }
                    @if(visibleColumns().has('projectId')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.projectId }}</td> }
                    @if(visibleColumns().has('projectName')) { <td class="px-4 py-4 whitespace-nowrap font-semibold text-slate-800">{{ project.projectName }}</td> }
                    @if(visibleColumns().has('client')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.client }}</td> }
                    @if(visibleColumns().has('scope')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.scope }}</td> }
                    @if(visibleColumns().has('projectType')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.projectType }}</td> }
                    @if(visibleColumns().has('poStatus')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.poStatus }}</td> }
                    @if(visibleColumns().has('totalPO')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.totalPO | currency }}</td> }
                    @if(visibleColumns().has('totalVAT')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.totalVAT | currency }}</td> }
                    @if(visibleColumns().has('monthOfAward')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.monthOfAward | date:'MMM yyyy' }}</td> }
                    @if(visibleColumns().has('projectStatus')) { <td class="px-4 py-4 whitespace-nowrap"><span class="px-2 py-1 text-xs rounded-full" [class]="getStatusClass(project.projectStatus)">{{ project.projectStatus }}</span></td> }
                    @if(visibleColumns().has('startDate')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.startDate }}</td> }
                    @if(visibleColumns().has('endDate')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.endDate }}</td> }
                    @if(visibleColumns().has('estimatedTime')) { <td class="px-4 py-4 whitespace-nowrap">{{ project.estimatedTime }}</td> }
                    @if(visibleColumns().has('actions')) {
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-3">
                          <button (click)="openProjectView(project)" class="text-slate-500 hover:text-blue-600" title="View Project"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg></button>
                          <button (click)="openEditModal(project)" class="text-slate-500 hover:text-green-600" title="Edit Project"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                          <button (click)="promptDelete(project)" class="text-slate-500 hover:text-red-600" title="Delete Project"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                        </div>
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr>
                    <td [attr.colspan]="visibleColumns().size + 1" class="px-6 py-10 text-center text-slate-500">
                      No projects found for the selected criteria.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    <!-- Delete Project Confirmation Modal -->
    @if (projectToDelete(); as project) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="cancelDelete()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-start p-6">
              <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100"><svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <div class="ml-4 text-left">
                <h3 class="text-lg font-medium text-slate-900">Delete Project</h3>
                <p class="text-sm text-slate-500 mt-2">Are you sure you want to delete the project <strong>{{ project.projectName }}</strong>? This action is permanent and cannot be undone.</p>
              </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button (click)="cancelDelete()" type="button" class="px-4 py-2 text-sm font-medium bg-white border rounded-md">Cancel</button>
            <button (click)="confirmDelete()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">Yes, Delete</button>
          </div>
        </div>
      </div>
    }
    
    <!-- Delete Communication Confirmation Modal -->
    @if (communicationToDelete(); as comm) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="cancelDeleteCommunication()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-start p-6">
              <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100"><svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <div class="ml-4 text-left">
                <h3 class="text-lg font-medium text-slate-900">Delete Communication</h3>
                <p class="text-sm text-slate-500 mt-2">Are you sure you want to delete the communication with Ref No: <strong>{{ comm.refNo }}</strong>? This action is permanent.</p>
              </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button (click)="cancelDeleteCommunication()" type="button" class="px-4 py-2 text-sm font-medium bg-white border rounded-md">Cancel</button>
            <button (click)="confirmDeleteCommunication()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">Yes, Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, DatePipe],
})
export class ProjectsComponent implements OnInit {
  private employeeService = inject(EmployeeService);

  activeTab = signal<'open' | 'closed' | 'awarded'>('open');
  searchTerm = signal('');
  selectedDivision = signal('all');
  showColumnsDropdown = signal(false);
  showEditForm = signal(false);
  editingProject = signal<Project | null>(null);
  editProjectForm!: FormGroup;
  projectToDelete = signal<Project | null>(null);
  
  // State for detail view
  viewingProject = signal<Project | null>(null);
  activeInfoTab = signal<'info' | 'tasks' | 'communication' | 'invoice'>('info');

  // State for communication tab
  communicationSearchTerm = signal('');
  communicationCurrentPage = signal(1);
  communicationItemsPerPage = signal(10);
  communicationToDelete = signal<Communication | null>(null);

  employees = computed(() => this.employeeService.employees().map(e => e.name));
  paymentTermsOptions = ['Milestone Basis', 'Monthly Basis', 'Prorata Basis'];
  projectTypeOptions: Project['projectType'][] = ['Project', 'Deviation', 'DEPUTATION'];
  poStatusOptions: Project['poStatus'][] = ['YES', 'NO'];
  openStatusOptions: Array<'YES' | 'NO'> = ['YES', 'NO'];
  statusOptions: Project['projectStatus'][] = ['Commercially Open', 'Commercially Closed', 'Awarded', 'On Hold'];

  showOpenStatus = computed(() => this.editProjectForm.get('poStatus')?.value === 'YES');
  showExpiryDate = computed(() => this.showOpenStatus() && this.editProjectForm.get('openStatus')?.value === 'NO');

  private allProjects = signal<Project[]>([
    { 
      id: 1, division: 'ENGINEERING', rfqId: 'CONSA-ENG-CCC-LLC-12-2025-1376_00', oldProject: 'ETS - Laser Scanning', projectId: 'CONSA-ENG-DEP-0212', 
      projectName: 'Call Center Create', client: 'Leo-Leon-company', scope: 'Design', poStatus: 'YES', openStatus: 'YES',
      totalPO: 60000, totalVAT: 9000, monthOfAward: '2025-10', projectStatus: 'Commercially Open', 
      startDate: '2025-12-26', endDate: '2026-01-26', estimatedTime: '31 days', projectType: 'DEPUTATION',
      responsibility: 'John Doe',
      paymentTerms: 'Milestone Basis',
      poLink: 'http://localhost:4200/projectManagement/enquiry',
      poRefNo: '564578',
      invoiceDues: 30, // Mapped to Number of Dues
      logoUrl: '',
      paymentDues: 30, // Mapped to Number of Dues
      contactDetails: { person: 'Raj', designation: 'Project Manager', email: 'raj@gmail.com', phone: '0769904534'},
      finalQuotation: '#', // link to pdf
      assignees: ['John Doe', 'Jane Smith'],
      communicationRefNo: 'COM-123',
      communicationLink: 'http://link.com',
      paymentResponsibility: 'Jane Smith',
      // Detail view fields
      progress: 0,
      enquiryDate: '2025-12-11',
      paymentDueDays: 31,
      communications: [
        { id: 1, sno: 1, refNo: '985673', link: '#' },
        { id: 2, sno: 2, refNo: '458765', link: '#' },
        { id: 3, sno: 3, refNo: '985673', link: '#' },
      ]
    },
    { id: 2, division: 'BIM', rfqId: 'BIM/SA/CO-ARCH-10-2025', oldProject: 'Architectural BIM', projectId: 'P-1520', projectName: 'Architectural BIM', client: 'EG - Elenora', scope: 'LOD 300 Modeling', poStatus: 'YES', openStatus: 'YES', totalPO: 250000, totalVAT: 37500, monthOfAward: '2025-11', projectStatus: 'Commercially Closed', startDate: '2025-11-01', endDate: '2026-05-01', estimatedTime: '181 days', projectType: 'Project', responsibility: 'Jane Smith', paymentTerms: 'Monthly Basis', assignees:['Jane Smith'], progress: 75 },
    { id: 3, division: 'LASER', rfqId: 'LAS/SA/CO-SCAN-10-2025', oldProject: '3D Laser Scanning of Plant', projectId: 'P-1410', projectName: '3D Laser Scanning of Plant', client: 'PetroCorp', scope: 'On-site Laser Scan', poStatus: 'YES', openStatus: 'NO', expiryDate: '2025-01-01', totalPO: 85000, totalVAT: 12750, monthOfAward: '2024-08', projectStatus: 'Commercially Closed', startDate: '2024-09-01', endDate: '2024-12-15', estimatedTime: '105 days', projectType: 'Project', responsibility: 'John Doe', paymentTerms: 'Prorata Basis', assignees:['John Doe'], progress: 100 },
    { id: 4, division: 'BIM', rfqId: 'BIM/SA/CO-MEP-11-2025', oldProject: 'MEP Coordination', projectId: 'P-1601', projectName: 'MEP Coordination for Tower', client: 'ConstructCo', scope: 'Clash Detection', poStatus: 'YES', openStatus: 'YES', totalPO: 180000, totalVAT: 27000, monthOfAward: '2025-11', projectStatus: 'Commercially Open', startDate: '2025-11-15', endDate: '2026-04-15', estimatedTime: '151 days', projectType: 'Project', responsibility: 'Susan Wilson', paymentTerms: 'Milestone Basis', assignees:['Susan Wilson', 'John Doe', 'Jane Smith'], progress: 30 },
    { id: 5, division: 'BIM', rfqId: 'BIM/SA/CO-MNT-11-2025', oldProject: 'Monthly BIM Support', projectId: 'M-BIM-001', projectName: 'Monthly BIM Support', client: 'Architex', scope: 'Ongoing Support', poStatus: 'YES', openStatus: 'YES', totalPO: 120000, totalVAT: 18000, monthOfAward: '2025-11', projectStatus: 'Commercially Open', startDate: '2025-11-01', endDate: '2026-10-31', estimatedTime: '365 days', projectType: 'Project', responsibility: 'Jane Smith', paymentTerms: 'Monthly Basis', assignees: ['Jane Smith'], progress: 10 },
    { id: 6, division: 'ENGINEERING', rfqId: 'ENG/SA/CO-RET-12-2025', oldProject: 'Retainer Engineering Services', projectId: 'M-ENG-002', projectName: 'Retainer Engineering Services', client: 'ConstructCo', scope: 'Consulting', poStatus: 'YES', openStatus: 'YES', totalPO: 240000, totalVAT: 36000, monthOfAward: '2025-12', projectStatus: 'Commercially Open', startDate: '2025-12-01', endDate: '2026-11-30', estimatedTime: '365 days', projectType: 'Project', responsibility: 'John Doe', paymentTerms: 'Monthly Basis', assignees: ['John Doe'], progress: 5 },
    { id: 7, division: 'LASER', rfqId: 'LSR/SA/CO-MNT-07-2025', oldProject: 'Monthly Laser Scan Maintenance', projectId: 'M-LSR-003', projectName: 'Monthly Laser Scan Maintenance', client: 'InfraBuild', scope: 'Calibration & Support', poStatus: 'YES', openStatus: 'YES', totalPO: 50000, totalVAT: 7500, monthOfAward: '2025-07', projectStatus: 'Commercially Open', startDate: '2025-07-01', endDate: '2026-06-30', estimatedTime: '365 days', projectType: 'Project', responsibility: 'John Doe', paymentTerms: 'Monthly Basis', assignees: ['John Doe'], progress: 50 },
    { id: 8, division: 'LASER', rfqId: 'LSR/SA/CO-PART-10-2025', oldProject: 'Partial Plant Scan', projectId: 'PR-LSR-001', projectName: 'Partial Plant Scan', client: 'PetroCorp', scope: 'Phase 1 Scan', poStatus: 'YES', openStatus: 'NO', expiryDate: '2025-12-31', totalPO: 50000, totalVAT: 7500, monthOfAward: '2025-10', projectStatus: 'Commercially Closed', startDate: '2025-10-01', endDate: '2025-10-31', estimatedTime: '30 days', projectType: 'Project', responsibility: 'John Doe', paymentTerms: 'Prorata Basis', assignees: ['John Doe'], progress: 100 },
    { id: 9, division: 'BIM', rfqId: 'BIM/SA/CO-INIT-11-2025', oldProject: 'Initial BIM modeling', projectId: 'PR-BIM-002', projectName: 'Initial BIM modeling', client: 'Architex', scope: 'Phase 1 Modeling', poStatus: 'YES', openStatus: 'YES', totalPO: 75000, totalVAT: 11250, monthOfAward: '2025-11', projectStatus: 'Commercially Open', startDate: '2025-11-15', endDate: '2026-01-15', estimatedTime: '61 days', projectType: 'Project', responsibility: 'Jane Smith', paymentTerms: 'Prorata Basis', assignees: ['Jane Smith'], progress: 0 },
    { id: 10, division: 'ENGINEERING', rfqId: 'ENG/SA/CO-FS-09-2025', oldProject: 'Feasibility Study', projectId: 'PR-ENG-003', projectName: 'Feasibility Study', client: 'ConstructCo', scope: 'Initial Report', poStatus: 'YES', openStatus: 'NO', expiryDate: '2025-10-31', totalPO: 25000, totalVAT: 3750, monthOfAward: '2025-09', projectStatus: 'Commercially Closed', startDate: '2025-09-01', endDate: '2025-09-30', estimatedTime: '30 days', projectType: 'Project', responsibility: 'Susan Wilson', paymentTerms: 'Prorata Basis', assignees: ['Susan Wilson'], progress: 100 },
  ]);

  divisions = computed(() => [...new Set(this.allProjects().map(p => p.division))]);

  filteredProjects = computed(() => {
    const tab = this.activeTab();
    const term = this.searchTerm().toLowerCase();
    const division = this.selectedDivision();

    return this.allProjects().filter(p => {
      const statusMatch = 
        (tab === 'open' && p.projectStatus === 'Commercially Open') ||
        (tab === 'closed' && p.projectStatus === 'Commercially Closed') ||
        (tab === 'awarded' && ['Awarded', 'Commercially Open', 'Commercially Closed'].includes(p.projectStatus));
        
      const divisionMatch = division === 'all' || p.division === division;
      
      const termMatch = !term ||
        p.projectName.toLowerCase().includes(term) ||
        p.client.toLowerCase().includes(term) ||
        p.rfqId.toLowerCase().includes(term) ||
        p.projectId.toLowerCase().includes(term);

      return statusMatch && divisionMatch && termMatch;
    });
  });

  // --- Computed properties for Communication Details ---
  filteredCommunications = computed(() => {
    const project = this.viewingProject();
    const term = this.communicationSearchTerm().toLowerCase();
    if (!project || !project.communications) return [];
    
    return project.communications.filter(comm => 
      comm.refNo.toLowerCase().includes(term)
    );
  });
  
  communicationTotalPages = computed(() => Math.ceil(this.filteredCommunications().length / this.communicationItemsPerPage()));

  paginatedCommunications = computed(() => {
    const start = (this.communicationCurrentPage() - 1) * this.communicationItemsPerPage();
    const end = start + this.communicationItemsPerPage();
    return this.filteredCommunications().slice(start, end);
  });

  communicationPaginationSummary = computed(() => {
    const total = this.filteredCommunications().length;
    if (total === 0) return '0 of 0';
    const start = (this.communicationCurrentPage() - 1) * this.communicationItemsPerPage() + 1;
    const end = Math.min(start + this.communicationItemsPerPage() - 1, total);
    return `${start} - ${end} of ${total}`;
  });

  allColumns = [
    { id: 'id', name: 'ID' }, { id: 'division', name: 'Division' }, { id: 'rfqId', name: 'RFQ ID' },
    { id: 'oldProject', name: 'Old Project' }, { id: 'projectId', name: 'Project ID' }, { id: 'projectName', name: 'Project Name' },
    { id: 'client', name: 'Client' }, { id: 'scope', name: 'Scope' }, { id: 'projectType', name: 'Project Type' },
    { id: 'poStatus', name: 'PO Status' }, { id: 'totalPO', name: 'Total PO' }, { id: 'totalVAT', name: 'Total VAT' },
    { id: 'monthOfAward', name: 'Month of Award' }, { id: 'projectStatus', name: 'Status of Projects' },
    { id: 'startDate', name: 'Start Date' }, { id: 'endDate', name: 'End Date' }, { id: 'estimatedTime', name: 'Estimated Time' },
    { id: 'actions', name: 'Actions' }
  ];

  visibleColumns = signal(new Set([
    'division', 'rfqId', 'oldProject', 'projectId', 'projectName', 'client', 'scope', 'actions'
  ]));

  constructor() {
    this.editProjectForm = new FormGroup({
      projectName: new FormControl({ value: '', disabled: true }, Validators.required),
      responsibility: new FormControl({ value: '', disabled: true }, Validators.required),
      division: new FormControl({ value: '', disabled: true }, Validators.required),
      client: new FormControl({ value: '', disabled: true }),
      scope: new FormControl({ value: '', disabled: true }, Validators.required),
      totalPO: new FormControl(0, [Validators.required, Validators.min(0)]),
      totalVAT: new FormControl(0, [Validators.required, Validators.min(0)]),
      paymentTerms: new FormControl('', Validators.required),
      projectType: new FormControl('', Validators.required),
      poLink: new FormControl(''),
      poRefNo: new FormControl(''),
      invoiceDues: new FormControl(0),
      poStatus: new FormControl('', Validators.required),
      openStatus: new FormControl(''),
      expiryDate: new FormControl(''),
      projectStatus: new FormControl('', Validators.required),
      logoUrl: new FormControl(''),
      paymentDues: new FormControl(0),
      contactPerson: new FormControl(''),
      contactDesignation: new FormControl(''),
      contactEmail: new FormControl('', [Validators.email]),
      contactPhone: new FormControl(''),
      finalQuotation: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl('', Validators.required),
      assignees: new FormControl<string[]>([]),
      communicationRefNo: new FormControl(''),
      communicationLink: new FormControl(''),
      paymentResponsibility: new FormControl(''),
    });

    this.editProjectForm.get('poStatus')?.valueChanges.subscribe(value => {
      const openStatusControl = this.editProjectForm.get('openStatus');
      if (value === 'NO') {
        openStatusControl?.reset('');
      }
    });

    this.editProjectForm.get('openStatus')?.valueChanges.subscribe(value => {
      const expiryDateControl = this.editProjectForm.get('expiryDate');
      if (value !== 'NO') {
        expiryDateControl?.reset('');
      }
    });
  }

  ngOnInit() {}

  openProjectView(project: Project) {
    this.viewingProject.set(project);
    this.activeInfoTab.set('info');
  }

  closeProjectView() {
    this.viewingProject.set(null);
  }

  openEditModal(project: Project) {
    this.editingProject.set(project);
    this.editProjectForm.patchValue({
      projectName: project.projectName,
      responsibility: project.responsibility,
      division: project.division,
      client: project.client,
      scope: project.scope,
      totalPO: project.totalPO,
      totalVAT: project.totalVAT,
      paymentTerms: project.paymentTerms,
      projectType: project.projectType,
      poLink: project.poLink,
      poRefNo: project.poRefNo,
      invoiceDues: project.invoiceDues,
      poStatus: project.poStatus,
      openStatus: project.openStatus || '',
      expiryDate: project.expiryDate || '',
      projectStatus: project.projectStatus,
      logoUrl: project.logoUrl,
      paymentDues: project.paymentDues,
      contactPerson: project.contactDetails?.person,
      contactDesignation: project.contactDetails?.designation,
      contactEmail: project.contactDetails?.email,
      contactPhone: project.contactDetails?.phone,
      finalQuotation: project.finalQuotation,
      startDate: project.startDate,
      endDate: project.endDate,
      assignees: project.assignees || [],
      communicationRefNo: project.communicationRefNo,
      communicationLink: project.communicationLink,
      paymentResponsibility: project.paymentResponsibility,
    });
    this.showEditForm.set(true);
  }

  closeEditModal() {
    this.showEditForm.set(false);
    this.editingProject.set(null);
    this.editProjectForm.reset();
  }

  onUpdateSubmit() {
    if (this.editProjectForm.invalid) {
      this.editProjectForm.markAllAsTouched();
      return;
    }

    const currentProject = this.editingProject();
    if (!currentProject) return;

    const formValue = this.editProjectForm.getRawValue();

    const updatedProject: Project = {
      ...currentProject,
      projectName: formValue.projectName,
      responsibility: formValue.responsibility,
      scope: formValue.scope,
      totalPO: formValue.totalPO,
      totalVAT: formValue.totalVAT,
      paymentTerms: formValue.paymentTerms,
      projectType: formValue.projectType,
      poLink: formValue.poLink,
      poRefNo: formValue.poRefNo,
      invoiceDues: formValue.invoiceDues,
      poStatus: formValue.poStatus,
      openStatus: this.showOpenStatus() ? formValue.openStatus : undefined,
      expiryDate: this.showExpiryDate() ? formValue.expiryDate : undefined,
      projectStatus: formValue.projectStatus,
      logoUrl: formValue.logoUrl,
      paymentDues: formValue.paymentDues,
      contactDetails: {
        person: formValue.contactPerson,
        designation: formValue.contactDesignation,
        email: formValue.contactEmail,
        phone: formValue.contactPhone,
      },
      finalQuotation: formValue.finalQuotation,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      assignees: formValue.assignees,
      communicationRefNo: formValue.communicationRefNo,
      communicationLink: formValue.communicationLink,
      paymentResponsibility: formValue.paymentResponsibility,
    };
    
    this.allProjects.update(projects => 
      projects.map(p => p.id === updatedProject.id ? updatedProject : p)
    );

    // If we're editing the currently viewed project, update the view as well
    if (this.viewingProject()?.id === updatedProject.id) {
        this.viewingProject.set(updatedProject);
    }

    this.closeEditModal();
  }

  promptDelete(project: Project): void {
    this.projectToDelete.set(project);
  }

  cancelDelete(): void {
    this.projectToDelete.set(null);
  }

  confirmDelete(): void {
    const project = this.projectToDelete();
    if (project) {
      this.allProjects.update(projects => projects.filter(p => p.id !== project.id));
      // If we deleted the project we were viewing, go back to the list
      if (this.viewingProject()?.id === project.id) {
          this.closeProjectView();
      }
      this.cancelDelete();
    }
  }

  setActiveTab(tab: 'open' | 'closed' | 'awarded') {
    this.activeTab.set(tab);
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

  // --- Communication Tab Methods ---
  changeCommunicationPage(page: number): void {
    if (page >= 1 && page <= this.communicationTotalPages()) {
      this.communicationCurrentPage.set(page);
    }
  }

  promptDeleteCommunication(comm: Communication): void {
    this.communicationToDelete.set(comm);
  }

  cancelDeleteCommunication(): void {
    this.communicationToDelete.set(null);
  }

  confirmDeleteCommunication(): void {
    const commToDelete = this.communicationToDelete();
    const currentProject = this.viewingProject();
    if (!commToDelete || !currentProject) return;

    this.allProjects.update(projects =>
      projects.map(p => {
        if (p.id === currentProject.id) {
          return { ...p, communications: p.communications?.filter(c => c.id !== commToDelete.id) };
        }
        return p;
      })
    );
    this.viewingProject.update(p => {
      if (p) {
        return { ...p, communications: p.communications?.filter(c => c.id !== commToDelete.id) };
      }
      return p;
    });
    this.cancelDeleteCommunication();
  }

  // --- Template Helpers ---
  getStatusClass(status: Project['projectStatus']): string {
    switch(status) {
      case 'Commercially Open': return 'bg-green-100 text-green-800';
      case 'Commercially Closed': return 'bg-slate-100 text-slate-800';
      case 'Awarded': return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  getInfoTabClass(tabName: string) {
    const base = 'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors';
    return this.activeInfoTab() === tabName
      ? `${base} border-blue-500 text-blue-600`
      : `${base} border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`;
  }
  
  getInitials(name: string | undefined): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}