import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { EnquiryService, Enquiry, Scope, Client } from '../services/enquiry.service';
import { EmployeeService } from '../services/employee.service';
import { FinancialConfigService } from '../services/financial-config.service';

type EnquiryTab = 'allEnquiry' | 'followUp' | 'addScope' | 'allClients';

@Component({
  selector: 'app-enquiry',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-slate-800">Enquiry</h1>
        @if (activeTab() === 'allEnquiry' && !showAddEnquiryForm()) {
          <button (click)="showAddEnquiryForm.set(true)" class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            <span>Add Enquiry</span>
          </button>
        }
      </div>
      
      <div class="bg-white rounded-lg shadow-sm">
        @if(showAddEnquiryForm()) {
          <div class="bg-slate-50 p-8 rounded-lg">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-slate-800">{{ editingEnquiry() ? 'Edit Enquiry' : 'Add Enquiry' }}</h2>
                <button (click)="closeEnquiryForm()" class="text-sm font-medium text-slate-600 hover:text-slate-900">&larr; Back to list</button>
            </div>
            
            <form [formGroup]="addEnquiryForm" (ngSubmit)="onSubmitEnquiry()">
              <div class="space-y-6">
                  <!-- Project Details -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-6 rounded-lg border border-slate-200">
                      <div>
                          <label class="block text-sm font-medium text-slate-700">Division*</label>
                          <select formControlName="division" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5 bg-white">
                            <option value="" disabled>Select Division</option>
                            @for(d of divisions(); track d) { <option [value]="d">{{d}}</option> }
                          </select>
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-slate-700">Project Type*</label>
                          <select formControlName="projectType" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5 bg-white">
                              <option value="" disabled>Project Type</option>
                              @for(pt of projectTypes(); track pt) { <option [value]="pt">{{pt}}</option> }
                          </select>
                      </div>
                      <div class="relative">
                          <label class="block text-sm font-medium text-slate-700">Enq. Date*</label>
                          <input type="date" formControlName="enquiryDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 pr-10">
                          <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>
                          </div>
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-slate-700">Stage*</label>
                          <select formControlName="stage" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5 bg-white">
                            <option value="" disabled>Stage</option>
                            @for(s of stageOptions(); track s) { <option [value]="s">{{s}}</option> }
                          </select>
                      </div>
                       <div class="md:col-span-2 flex items-start gap-4">
                          <div class="flex-grow">
                              <label class="block text-sm font-medium text-slate-700">Project Name*</label>
                              <input type="text" formControlName="projectName" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5">
                          </div>
                          <div class="w-1/4">
                              <label class="block text-sm font-medium text-slate-700">Abbr*</label>
                              <input type="text" formControlName="projectAbbr" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5">
                          </div>
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-slate-700">Scope*</label>
                        <input type="text" formControlName="scope" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5">
                      </div>
                  </div>
                  
                  <!-- Client Details -->
                  <div class="bg-white p-6 rounded-lg border border-slate-200">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4">Client details</h3>
                      <div class="flex items-start gap-4 mb-6">
                          <div class="flex-grow">
                              <label class="block text-sm font-medium text-slate-700">Client Name*</label>
                              <select formControlName="clientName" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5 bg-white">
                                <option value="" disabled>Select Client</option>
                                @for(client of clients(); track client.id) {
                                  <option [value]="client.name">{{ client.name }}</option>
                                }
                              </select>
                          </div>
                          <div class="w-1/4">
                              <label class="block text-sm font-medium text-slate-700">Abbr*</label>
                              <input type="text" formControlName="clientAbbr" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5">
                          </div>
                      </div>
                       <!-- Client Contacts Array -->
                      <div formArrayName="clientContacts" class="space-y-4">
                        @for(contactGroup of clientContactsArray.controls; track $index) {
                          <div [formGroupName]="$index" class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div class="md:col-span-3">
                              <label class="block text-sm font-medium text-slate-700">Contact Person*</label>
                              <input type="text" formControlName="contactPerson" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5">
                            </div>
                            <div class="md:col-span-2">
                              <label class="block text-sm font-medium text-slate-700">Designation*</label>
                              <input type="text" formControlName="designation" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5">
                            </div>
                            <div class="md:col-span-3">
                              <label class="block text-sm font-medium text-slate-700">Phone Number/Landline*</label>
                              <input type="text" formControlName="phone" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5">
                            </div>
                            <div class="md:col-span-3">
                              <label class="block text-sm font-medium text-slate-700">Email*</label>
                              <input type="email" formControlName="email" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5">
                            </div>
                            <div class="md:col-span-1 flex items-end h-full pt-6 space-x-2">
                               <button type="button" (click)="addClientContact()" class="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                              </button>
                              @if (clientContactsArray.length > 1) {
                                <button type="button" (click)="removeClientContact($index)" class="h-8 w-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>
                                </button>
                              }
                            </div>
                          </div>
                        }
                      </div>
                  </div>
                  
                  <!-- Submission & Other Details -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-6 rounded-lg border border-slate-200">
                      <div>
                        <label class="block text-sm font-medium text-slate-700">Responsibility*</label>
                        <select formControlName="responsibilities" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5 bg-white">
                          <option value="" disabled>Select Person</option>
                          @for(person of responsiblePersons(); track person.id) {
                            <option [value]="person.name">{{ person.name }}</option>
                          }
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Enquiry Status*</label>
                        <select formControlName="enquiryStatus" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5 bg-white">
                            @for(es of enquiryStatuses(); track es) { <option [value]="es">{{es}}</option> }
                        </select>
                    </div>
                    <div class="relative">
                        <label class="block text-sm font-medium text-slate-700">Submission Date*</label>
                        <input type="date" formControlName="submissionDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5 pr-10">
                        <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea formControlName="notes" rows="1" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2.5"></textarea>
                    </div>
                  </div>

                    <div class="flex justify-end pt-2">
                      <button type="button" (click)="closeEnquiryForm()" class="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancel</button>
                      <button type="submit" [disabled]="addEnquiryForm.invalid" class="ml-3 px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">{{ editingEnquiry() ? 'Update Enquiry' : 'Save Enquiry' }}</button>
                    </div>
              </div>
            </form>
          </div>
        } @else {
          <div class="border-b border-slate-200 px-6">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <button (click)="setActiveTab('allEnquiry')" [class]="getTabClass('allEnquiry')">
                All Enquiry
              </button>
              <button (click)="setActiveTab('followUp')" [class]="getTabClass('followUp')">
                Enquiry Followup
              </button>
              <button (click)="setActiveTab('addScope')" [class]="getTabClass('addScope')">
                Add Scope
              </button>
              <button (click)="setActiveTab('allClients')" [class]="getTabClass('allClients')">
                All Clients
              </button>
            </nav>
          </div>

          <div class="p-6">
            @switch (activeTab()) {
              @case ('allEnquiry') {
                <div class="space-y-4">
                  <!-- Filters -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      <option value="">Select Status</option>
                        @for(status of statusOptions(); track status) {
                        <option [value]="status">{{ status }}</option>
                      }
                    </select>
                    <select class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                      <option value="">Select Stage</option>
                      @for(stage of stageOptions(); track stage) {
                        <option [value]="stage">{{ stage }}</option>
                      }
                    </select>
                  </div>
                  <!-- Search and Actions -->
                  <div class="flex items-center justify-between">
                      <div class="relative w-full max-w-xs">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                      </div>
                      <input type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500">
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
                        <button (click)="showColumnsDropdown.set(!showColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-500 rounded-md hover:bg-cyan-50 flex items-center gap-2">
                          Columns to Display <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                        </button>
                          @if(showColumnsDropdown()) {
                          <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10">
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

                  <!-- Table -->
                  <div class="overflow-x-auto border border-slate-200 rounded-lg">
                    <table class="w-full text-sm text-left text-slate-500">
                      <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                          <th class="px-2 py-3"><input type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"></th>
                            @for(col of allColumns; track col.id) {
                            @if(visibleColumns().has(col.id)) { <th scope="col" class="px-6 py-3">{{ col.name }}</th> }
                          }
                        </tr>
                      </thead>
                      <tbody>
                        @for(enquiry of enquiries(); track enquiry.id) {
                          <tr class="bg-white border-b hover:bg-slate-50">
                            <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"></td>
                            @if(visibleColumns().has('sno')) { <td class="px-6 py-4">{{ enquiry.sno }}</td> }
                            @if(visibleColumns().has('enquiryDate')) { <td class="px-6 py-4">{{ enquiry.enquiryDate }}</td> }
                            @if(visibleColumns().has('division')) { <td class="px-6 py-4">{{ enquiry.division }}</td> }
                            @if(visibleColumns().has('rfqId')) { <td class="px-6 py-4">{{ enquiry.rfqId }}</td> }
                            @if(visibleColumns().has('projectName')) { <td class="px-6 py-4 font-medium text-slate-900">{{ enquiry.projectName }}</td> }
                            @if(visibleColumns().has('clientName')) { <td class="px-6 py-4">{{ enquiry.clientName }}</td> }
                            @if(visibleColumns().has('projectType')) { <td class="px-6 py-4">{{ enquiry.projectType }}</td> }
                            @if(visibleColumns().has('scope')) { <td class="px-6 py-4">{{ enquiry.scope }}</td> }
                            @if(visibleColumns().has('stage')) { <td class="px-6 py-4">{{ enquiry.stage }}</td> }
                            @if(visibleColumns().has('responsibilities')) { <td class="px-6 py-4">{{ enquiry.responsibilities }}</td> }
                            @if(visibleColumns().has('enquiryStatus')) { <td class="px-6 py-4">{{ enquiry.enquiryStatus }}</td> }
                            @if(visibleColumns().has('submissionDeadline')) { <td class="px-6 py-4">{{ enquiry.submissionDeadline }}</td> }
                              @if(visibleColumns().has('actions')) { 
                              <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end space-x-3">
                                  <button (click)="openEditEnquiryModal(enquiry)" class="text-slate-500 hover:text-green-600" title="Edit Enquiry">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                                  </button>
                                  <button (click)="promptDeleteEnquiry(enquiry)" class="text-slate-500 hover:text-red-600" title="Delete Enquiry">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                                  </button>
                                </div>
                              </td>
                            }
                          </tr>
                        } @empty {
                          <tr><td [attr.colspan]="visibleColumns().size + 1" class="text-center py-10 text-slate-500">No enquiries found.</td></tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
              @case ('followUp') {
                <div class="space-y-4">
                  <div class="overflow-x-auto border border-slate-200 rounded-lg">
                    <table class="w-full text-sm text-left text-slate-500">
                      <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                          <th class="px-2 py-3"><input type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"></th>
                          @for(col of allColumns; track col.id) {
                            @if(visibleColumns().has(col.id) && col.id !== 'actions') { <th scope="col" class="px-6 py-3">{{ col.name }}</th> }
                          }
                          <th scope="col" class="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for(enquiry of followUpEnquiries(); track enquiry.id) {
                          <tr class="bg-white border-b hover:bg-slate-50">
                            <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"></td>
                            @if(visibleColumns().has('sno')) { <td class="px-6 py-4">{{ enquiry.sno }}</td> }
                              @if(visibleColumns().has('enquiryDate')) { <td class="px-6 py-4">{{ enquiry.enquiryDate }}</td> }
                              @if(visibleColumns().has('division')) { <td class="px-6 py-4">{{ enquiry.division }}</td> }
                              @if(visibleColumns().has('rfqId')) { <td class="px-6 py-4">{{ enquiry.rfqId }}</td> }
                              @if(visibleColumns().has('projectName')) { <td class="px-6 py-4 font-medium text-slate-900">{{ enquiry.projectName }}</td> }
                              @if(visibleColumns().has('clientName')) { <td class="px-6 py-4">{{ enquiry.clientName }}</td> }
                              @if(visibleColumns().has('projectType')) { <td class="px-6 py-4">{{ enquiry.projectType }}</td> }
                              @if(visibleColumns().has('scope')) { <td class="px-6 py-4">{{ enquiry.scope }}</td> }
                              @if(visibleColumns().has('stage')) { <td class="px-6 py-4">{{ enquiry.stage }}</td> }
                              @if(visibleColumns().has('responsibilities')) { <td class="px-6 py-4">{{ enquiry.responsibilities }}</td> }
                              @if(visibleColumns().has('enquiryStatus')) { <td class="px-6 py-4">{{ enquiry.enquiryStatus }}</td> }
                              @if(visibleColumns().has('submissionDeadline')) { <td class="px-6 py-4">{{ enquiry.submissionDeadline }}</td> }
                            <td class="px-6 py-4 text-right">
                              <div class="flex items-center justify-end space-x-3">
                                <button (click)="openEditEnquiryModal(enquiry)" class="text-slate-500 hover:text-green-600" title="Edit Enquiry">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                                </button>
                                <button class="text-slate-500 hover:text-blue-600" title="View">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                                  </svg>
                                </button>
                                <button (click)="promptDeleteEnquiry(enquiry)" class="text-slate-500 hover:text-red-600" title="Delete">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                  </svg>
                                </button>
                                <button class="text-slate-500 hover:text-green-600" title="Proceed">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        } @empty {
                          <tr><td [attr.colspan]="visibleColumns().size + 1" class="text-center py-10 text-slate-500">No enquiries for followup.</td></tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
              @case ('addScope') {
                <div class="bg-sky-50 p-8 rounded-lg">
                  <h2 class="text-2xl font-bold text-slate-800 mb-6">Add Scope</h2>
                  <form [formGroup]="addScopeForm" (ngSubmit)="onAddScopeSubmit()" class="space-y-6 max-w-4xl">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label for="division" class="block text-sm font-medium text-slate-700">Division</label>
                        <select id="division" formControlName="division" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
                          <option value="" disabled>Select Division</option>
                          @for (division of divisions(); track division) {
                            <option [value]="division">{{ division }}</option>
                          }
                        </select>
                      </div>
                      <div>
                        <label for="subDivision" class="block text-sm font-medium text-slate-700">Sub Division</label>
                        <select id="subDivision" formControlName="subDivision" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
                          @for (sub of subDivisions(); track sub) {
                            <option [value]="sub">{{ sub }}</option>
                          }
                        </select>
                      </div>
                    </div>
                    <div>
                      <label for="scopeName" class="block text-sm font-medium text-slate-700">Scope Name</label>
                      <input type="text" id="scopeName" formControlName="scopeName" class="mt-1 block w-full rounded-md border-blue-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3" placeholder="Enter scope name">
                    </div>
                    <div class="flex justify-end pt-4">
                      <button type="submit" [disabled]="addScopeForm.invalid" class="px-6 py-2 text-sm font-medium text-white bg-sky-400 hover:bg-sky-500 rounded-lg disabled:opacity-50">
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              }
              @case ('allClients') {
                <div class="space-y-6">
                  <div>
                      <h2 class="text-xl font-bold text-slate-800 mb-4">Add New Client</h2>
                      <form [formGroup]="addClientForm" (ngSubmit)="onAddClientSubmit()" class="flex items-start space-x-2 max-w-lg">
                        <div class="flex-grow">
                            <label for="newClientName" class="sr-only">Client Name</label>
                            <input
                              type="text"
                              id="newClientName"
                              formControlName="clientName"
                              placeholder="Enter new client name"
                              class="block w-full rounded-md border-slate-300 shadow-sm p-3">
                        </div>
                        <button
                          type="submit"
                          [disabled]="addClientForm.invalid"
                          class="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:bg-indigo-400">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                          </svg>
                          <span>Add Client</span>
                        </button>
                      </form>
                  </div>

                  <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mt-8">
                      <h2 class="text-xl font-bold text-slate-800 p-4 border-b">All Clients</h2>
                      <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left text-slate-500">
                          <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                              <th scope="col" class="px-6 py-3 w-24">ID</th>
                              <th scope="col" class="px-6 py-3">Client Name</th>
                              <th scope="col" class="px-6 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (client of clients(); track client.id) {
                              <tr class="bg-white border-b hover:bg-slate-50">
                                <td class="px-6 py-4 font-medium text-slate-900">{{ client.id }}</td>
                                <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{{ client.name }}</td>
                                <td class="px-6 py-4 text-right">
                                  <div class="flex items-center justify-end space-x-4">
                                    <button (click)="openEditClientModal(client)" class="text-slate-500 hover:text-green-600" title="Edit Client">
                                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                                    </button>
                                    <button (click)="promptDeleteClient(client)" class="text-slate-500 hover:text-red-600" title="Delete Client">
                                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            } @empty {
                              <tr>
                                  <td colspan="3" class="px-6 py-4 text-center text-slate-500">No clients found.</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                </div>
              }
            }
          </div>
        }
      </div>
    </div>
    
    <!-- Edit Client Modal -->
    @if (showEditClientModal() && editingClient(); as client) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="closeEditClientModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <form [formGroup]="editClientForm" (ngSubmit)="onEditClientSubmit()">
            <div class="p-6 border-b">
              <h3 class="text-lg font-semibold text-slate-800">Edit Client: {{ client.name }}</h3>
            </div>
            <div class="p-6">
              <label for="editClientName" class="block text-sm font-medium text-slate-700">Client Name</label>
              <input type="text" id="editClientName" formControlName="clientName" class="mt-1 block w-full rounded-md border-slate-300 p-2 shadow-sm">
            </div>
            <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
              <button (click)="closeEditClientModal()" type="button" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancel</button>
              <button type="submit" [disabled]="editClientForm.invalid" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">Update</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Client Modal -->
    @if (clientToDelete(); as client) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="cancelDeleteClient()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-start p-6">
              <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100"><svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <div class="ml-4 text-left">
                <h3 class="text-lg font-medium text-slate-900">Delete Client</h3>
                <p class="text-sm text-slate-500 mt-2">Are you sure you want to delete <strong>{{ client.name }}</strong>? This action is permanent.</p>
              </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button (click)="cancelDeleteClient()" type="button" class="px-4 py-2 text-sm font-medium bg-white border rounded-md">Cancel</button>
            <button (click)="confirmDeleteClient()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">Yes, Delete</button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Enquiry Modal -->
    @if (enquiryToDelete(); as enquiry) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="cancelDeleteEnquiry()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-start p-6">
              <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100"><svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <div class="ml-4 text-left">
                <h3 class="text-lg font-medium text-slate-900">Delete Enquiry</h3>
                <p class="text-sm text-slate-500 mt-2">Are you sure you want to delete the enquiry for <strong>{{ enquiry.projectName }}</strong>? This action is permanent.</p>
              </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button (click)="cancelDeleteEnquiry()" type="button" class="px-4 py-2 text-sm font-medium bg-white border rounded-md">Cancel</button>
            <button (click)="confirmDeleteEnquiry()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">Yes, Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class EnquiryComponent implements OnInit {
  private readonly enquiryService = inject(EnquiryService);
  private readonly employeeService = inject(EmployeeService);
  private readonly financialConfigService = inject(FinancialConfigService);

  activeTab = signal<EnquiryTab>('allEnquiry');
  showColumnsDropdown = signal(false);
  showAddEnquiryForm = signal(false);
  editingEnquiry = signal<Enquiry | null>(null);
  
  statusOptions = signal(['Submitted', 'Not Submitted', 'Dropped']);
  stageOptions = signal(['Job in Hand', 'Tender']);
  projectTypes = signal(['Deputation', 'Project']);
  enquiryStatuses = signal(['Not Submitted', 'Submitted', 'Dropped']);

  addEnquiryForm!: FormGroup;
  addScopeForm!: FormGroup;
  addClientForm!: FormGroup;
  editClientForm!: FormGroup;
  
  // Data signals from service
  enquiries = this.enquiryService.enquiries;
  scopes = this.enquiryService.scopes;
  clients = this.enquiryService.clients;
  followUpEnquiries = this.enquiryService.followUpEnquiries;
  responsiblePersons = computed(() => this.employeeService.employees().map(e => ({id: e.id, name: e.name})));

  showEditClientModal = signal(false);
  editingClient = signal<Client | null>(null);
  clientToDelete = signal<Client | null>(null);
  enquiryToDelete = signal<Enquiry | null>(null);

  filteredScopes = computed(() => {
    const division = this.addEnquiryForm?.get('division')?.value;
    const projectType = this.addEnquiryForm?.get('projectType')?.value;
    if (!division || !projectType) {
      return [];
    }
    return this.scopes().filter(scope => scope.division === division && scope.subDivision === projectType);
  });

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

  divisions = this.financialConfigService.divisions;
  subDivisions = signal(['Deputation', 'Project']);

  ngOnInit() {
    this.addEnquiryForm = new FormGroup({
      division: new FormControl('', Validators.required),
      projectType: new FormControl('', Validators.required),
      enquiryDate: new FormControl('', Validators.required),
      stage: new FormControl('', Validators.required),
      projectName: new FormControl('', Validators.required),
      projectAbbr: new FormControl('', Validators.required),
      scope: new FormControl('', Validators.required),
      clientName: new FormControl('', Validators.required),
      clientAbbr: new FormControl('', Validators.required),
      clientContacts: new FormArray([this.createClientContactFormGroup()]),
      responsibilities: new FormControl('', Validators.required),
      enquiryStatus: new FormControl('Not Submitted', Validators.required),
      submissionDate: new FormControl('', Validators.required),
      notes: new FormControl(''),
    });

    this.addScopeForm = new FormGroup({
      division: new FormControl('', Validators.required),
      subDivision: new FormControl('Deputation', Validators.required),
      scopeName: new FormControl('', Validators.required),
    });

    this.addClientForm = new FormGroup({
      clientName: new FormControl('', Validators.required)
    });

    this.editClientForm = new FormGroup({
      clientName: new FormControl('', Validators.required)
    });
  }

  get clientContactsArray() {
    return this.addEnquiryForm.get('clientContacts') as FormArray;
  }

  createClientContactFormGroup(): FormGroup {
    return new FormGroup({
      contactPerson: new FormControl('', Validators.required),
      designation: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  addClientContact(): void {
    this.clientContactsArray.push(this.createClientContactFormGroup());
  }

  removeClientContact(index: number): void {
    if (this.clientContactsArray.length > 1) {
      this.clientContactsArray.removeAt(index);
    }
  }

  onSubmitEnquiry(): void {
    if (this.addEnquiryForm.invalid) {
      this.addEnquiryForm.markAllAsTouched();
      return;
    }

    const formVal = this.addEnquiryForm.getRawValue();
    const currentEnquiry = this.editingEnquiry();

    const enquiryData = {
        enquiryDate: formVal.enquiryDate!,
        division: formVal.division!,
        projectName: formVal.projectName!,
        projectAbbr: formVal.projectAbbr,
        clientName: formVal.clientName!,
        clientAbbr: formVal.clientAbbr,
        clientContacts: formVal.clientContacts,
        enquiryStatus: formVal.enquiryStatus as 'Submitted' | 'Not Submitted' | 'Dropped',
        submissionDeadline: formVal.submissionDate!,
        projectType: formVal.projectType!,
        scope: formVal.scope!,
        responsibilities: formVal.responsibilities!,
        stage: formVal.stage!,
        notes: formVal.notes,
    };
    
    if (currentEnquiry) {
      this.enquiryService.updateEnquiry({
        ...currentEnquiry,
        ...enquiryData,
        revision: currentEnquiry.revision,
        quotations: currentEnquiry.quotations,
      });
    } else {
      this.enquiryService.addEnquiry(enquiryData as any);
    }
    
    this.closeEnquiryForm();
  }
  
  openEditEnquiryModal(enquiry: Enquiry) {
    this.editingEnquiry.set(enquiry);
    this.addEnquiryForm.reset();
    
    this.addEnquiryForm.patchValue({
      division: enquiry.division,
      projectType: enquiry.projectType,
      enquiryDate: enquiry.enquiryDate,
      stage: enquiry.stage,
      projectName: enquiry.projectName,
      projectAbbr: enquiry.projectAbbr || '',
      scope: enquiry.scope,
      clientName: enquiry.clientName,
      clientAbbr: enquiry.clientAbbr || '',
      responsibilities: enquiry.responsibilities,
      enquiryStatus: enquiry.enquiryStatus,
      submissionDate: enquiry.submissionDeadline,
      notes: enquiry.notes || '',
    });

    this.clientContactsArray.clear();
    if (enquiry.clientContacts && enquiry.clientContacts.length > 0) {
      enquiry.clientContacts.forEach(contact => {
        this.clientContactsArray.push(new FormGroup({
          contactPerson: new FormControl(contact.contactPerson, Validators.required),
          designation: new FormControl(contact.designation, Validators.required),
          phone: new FormControl(contact.phone, Validators.required),
          email: new FormControl(contact.email, [Validators.required, Validators.email]),
        }));
      });
    } else {
      this.addClientContact();
    }

    this.showAddEnquiryForm.set(true);
  }

  closeEnquiryForm() {
    this.showAddEnquiryForm.set(false);
    this.editingEnquiry.set(null);
    this.addEnquiryForm.reset({
      division: '',
      projectType: '',
      enquiryDate: '',
      stage: '',
      projectName: '',
      projectAbbr: '',
      scope: '',
      clientName: '',
      clientAbbr: '',
      responsibilities: '',
      enquiryStatus: 'Not Submitted',
      submissionDate: '',
      notes: '',
    });

    this.clientContactsArray.clear();
    this.addClientContact();
  }

  promptDeleteEnquiry(enquiry: Enquiry): void {
    this.enquiryToDelete.set(enquiry);
  }

  cancelDeleteEnquiry(): void {
    this.enquiryToDelete.set(null);
  }

  confirmDeleteEnquiry(): void {
    const enquiry = this.enquiryToDelete();
    if (enquiry) {
      this.enquiryService.deleteEnquiry(enquiry.id);
      this.cancelDeleteEnquiry();
    }
  }

  onAddScopeSubmit(): void {
    if (this.addScopeForm.valid) {
      const formValue = this.addScopeForm.getRawValue();
      this.enquiryService.addScope({
        division: formValue.division!,
        subDivision: formValue.subDivision!,
        name: formValue.scopeName!
      });
      this.addScopeForm.reset({ division: '', subDivision: 'Deputation', scopeName: '' });
    }
  }

  onAddClientSubmit(): void {
    if (this.addClientForm.valid) {
      const newClientName = this.addClientForm.get('clientName')?.value;
      this.enquiryService.addClient(newClientName);
      this.addClientForm.reset();
    }
  }

  openEditClientModal(client: Client): void {
    this.editingClient.set(client);
    this.editClientForm.setValue({ clientName: client.name });
    this.showEditClientModal.set(true);
  }

  closeEditClientModal(): void {
    this.showEditClientModal.set(false);
    this.editingClient.set(null);
  }

  onEditClientSubmit(): void {
    if (this.editClientForm.invalid) return;
    const currentClient = this.editingClient();
    const updatedName = this.editClientForm.get('clientName')?.value;
    if (currentClient && updatedName) {
      this.enquiryService.updateClient({ ...currentClient, name: updatedName });
      this.closeEditClientModal();
    }
  }

  promptDeleteClient(client: Client): void {
    this.clientToDelete.set(client);
  }

  cancelDeleteClient(): void {
    this.clientToDelete.set(null);
  }

  confirmDeleteClient(): void {
    const client = this.clientToDelete();
    if (client) {
      this.enquiryService.deleteClient(client.id);
      this.cancelDeleteClient();
    }
  }

  setActiveTab(tab: EnquiryTab): void {
    this.activeTab.set(tab);
    if(this.showAddEnquiryForm()) {
       this.closeEnquiryForm();
    }
  }

  getTabClass(tabName: EnquiryTab): string {
    const baseClasses = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors';
    if (this.activeTab() === tabName) {
      return `${baseClasses} border-blue-500 text-blue-600`;
    }
    return `${baseClasses} border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`;
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
}
