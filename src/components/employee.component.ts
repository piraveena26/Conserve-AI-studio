
import { Component, ChangeDetectionStrategy, signal, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Employee, EmployeeService, Education, Experience, Reference } from '../services/employee.service';
import { UserService } from '../services/user.service';
import { UserRequestService } from '../services/user-request.service';

@Component({
  selector: 'app-employee',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-800">Employees</h2>
        <button (click)="openAddModal()" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
          Add Employee
        </button>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3">Name</th>
                <th scope="col" class="px-6 py-3">Employee ID</th>
                <th scope="col" class="px-6 py-3">Designation</th>
                <th scope="col" class="px-6 py-3">Status</th>
                <th scope="col" class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (employee of displayedEmployees(); track employee.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    <div class="flex items-center">
                      <img class="w-10 h-10 rounded-full" [src]="employee.avatar" alt="Avatar">
                      <div class="pl-3">
                        <div class="text-base font-semibold">{{ employee.name }}</div>
                        <div class="font-normal text-slate-500">{{ employee.email }}</div>
                      </div>  
                    </div>
                  </td>
                  <td class="px-6 py-4">{{ employee.employeeId }}</td>
                  <td class="px-6 py-4">{{ employee.designation }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="h-2.5 w-2.5 rounded-full mr-2" [class]="statusColors[employee.status]"></div>
                      {{ employee.status }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-4">
                       <button (click)="viewProfile.emit(employee.id)" class="text-slate-500 hover:text-blue-600" title="View Profile">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      @if (!userEmployeeIds().has(employee.id)) {
                        <button (click)="openInviteModal(employee)" 
                                class="text-slate-500"
                                [class.hover:text-green-600]="!pendingInviteIds().has(employee.id)"
                                [class.text-slate-300]="pendingInviteIds().has(employee.id)"
                                [class.cursor-not-allowed]="pendingInviteIds().has(employee.id)"
                                [disabled]="pendingInviteIds().has(employee.id)"
                                [title]="pendingInviteIds().has(employee.id) ? 'Invitation Sent' : 'Invite to be a User'">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </button>
                      }
                      <button (click)="openEditModal(employee)" class="text-slate-500 hover:text-green-600" title="Edit Employee">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <button (click)="promptDelete(employee)" class="text-slate-500 hover:text-red-600" title="Delete Employee">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Invite User Modal -->
    @if (employeeToInvite(); as employee) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="closeInviteModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-start p-6">
            <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <h3 class="text-lg leading-6 font-medium text-slate-900">Send User Invitation</h3>
              <div class="mt-2">
                <p class="text-sm text-slate-500">
                  An invitation will be sent to <strong>{{ employee.name }}</strong> at the email address <strong>{{ employee.email }}</strong> to create a user account.
                </p>
              </div>
            </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button (click)="closeInviteModal()" type="button" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
              Cancel
            </button>
            <button (click)="sendInvitation()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Add Employee Modal -->
    @if (showAddModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" (click)="closeAddModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-semibold text-slate-800">Add New Employee</h3>
            <button (click)="closeAddModal()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="p-6 overflow-y-auto">
            <form [formGroup]="addEmployeeForm" class="space-y-6">
               <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label for="add-firstName" class="block text-sm font-medium text-slate-700 mb-1">First Name*</label><input type="text" id="add-firstName" formControlName="firstName" class="form-input w-full rounded-md border-slate-300 p-2.5"></div>
                    <div><label for="add-lastName" class="block text-sm font-medium text-slate-700 mb-1">Last Name*</label><input type="text" id="add-lastName" formControlName="lastName" class="form-input w-full rounded-md border-slate-300 p-2.5"></div>
                    <div><label for="add-employeeId" class="block text-sm font-medium text-slate-700 mb-1">Employee ID*</label><input type="text" id="add-employeeId" formControlName="employeeId" class="form-input w-full rounded-md border-slate-300 p-2.5"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="relative"><label for="add-orgDoj" class="block text-sm font-medium text-slate-700 mb-1">Organization DOJ*</label><input type="date" id="add-orgDoj" formControlName="organizationDOJ" class="form-input w-full rounded-md border-slate-300 p-2.5 pr-10"><div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div></div>
                    <div class="relative"><label for="add-ksaDoj" class="block text-sm font-medium text-slate-700 mb-1">KSA DOJ</label><input type="date" id="add-ksaDoj" formControlName="ksaDOJ" class="form-input w-full rounded-md border-slate-300 p-2.5 pr-10"><div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div></div>
                </div>
                 <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div><label for="add-department" class="block text-sm font-medium text-slate-700 mb-1">Department</label><select id="add-department" formControlName="department" class="form-select w-full rounded-md border-slate-300 p-2.5 bg-white">@for(d of departments(); track d){<option [value]="d">{{d}}</option>}</select></div>
                    <div><label for="add-designation" class="block text-sm font-medium text-slate-700 mb-1">Designation*</label><select id="add-designation" formControlName="designation" class="form-select w-full rounded-md border-slate-300 p-2.5 bg-white">@for(d of designations(); track d){<option [value]="d">{{d}}</option>}</select></div>
                    <div><label for="add-reportingTo" class="block text-sm font-medium text-slate-700 mb-1">Reporting To*</label><select id="add-reportingTo" formControlName="reportingTo" class="form-select w-full rounded-md border-slate-300 p-2.5 bg-white">@for(m of allReportingManagers(); track m.id){<option [value]="m.id">{{m.name}}</option>}</select></div>
                    <div><label for="add-category" class="block text-sm font-medium text-slate-700 mb-1">Categorized</label><select id="add-category" formControlName="category" class="form-select w-full rounded-md border-slate-300 p-2.5 bg-white">@for(c of categories(); track c){<option [value]="c">{{c}}</option>}</select></div>
                </div>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="grid grid-cols-3 gap-2">
                        <div class="col-span-1"><label for="add-countryCode" class="block text-sm font-medium text-slate-700 mb-1">Code</label><select id="add-countryCode" formControlName="countryCode" class="form-select w-full rounded-md border-slate-300 p-2.5 bg-white">@for(c of countryCodes(); track c){<option [value]="c">{{c}}</option>}</select></div>
                        <div class="col-span-2"><label for="add-phone" class="block text-sm font-medium text-slate-700 mb-1">Phone Number*</label><input type="text" id="add-phone" formControlName="phoneNumber" class="form-input w-full rounded-md border-slate-300 p-2.5"></div>
                    </div>
                    <div><label for="add-email" class="block text-sm font-medium text-slate-700 mb-1">Official Email*</label><input type="email" id="add-email" formControlName="officialEmail" class="form-input w-full rounded-md border-slate-300 p-2.5"></div>
                </div>
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label for="add-nationality" class="block text-sm font-medium text-slate-700 mb-1">Nationality</label><input type="text" id="add-nationality" formControlName="nationality" class="form-input w-full rounded-md border-slate-300 p-2.5"></div>
                    <div><label for="add-empType" class="block text-sm font-medium text-slate-700 mb-1">Employment Type*</label><select id="add-empType" formControlName="employmentType" class="form-select w-full rounded-md border-slate-300 p-2.5 bg-white">@for(et of employmentTypes(); track et){<option [value]="et">{{et}}</option>}</select></div>
                    <div><label for="add-empStatus" class="block text-sm font-medium text-slate-700 mb-1">Employee Status*</label><select id="add-empStatus" formControlName="employeeStatus" class="form-select w-full rounded-md border-slate-300 p-2.5 bg-white">@for(es of employmentStatuses(); track es){<option [value]="es">{{es}}</option>}</select></div>
                </div>
            </form>
          </div>
          <div class="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg space-x-3">
            <button (click)="closeAddModal()" type="button" class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancel</button>
            <button (click)="onAddSubmit()" [disabled]="addEmployeeForm.invalid" type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-400 disabled:cursor-not-allowed">
              Create
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Edit Employee Modal -->
    @if (showEditModal() && editingEmployee(); as employee) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-40" (click)="closeEditModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-semibold text-slate-800">Update Conservian</h3>
            <button (click)="closeEditModal()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div class="border-b border-slate-200 px-6">
              <nav class="-mb-px flex space-x-8">
                  @for(tab of editTabs; track tab.id) {
                    <button (click)="setActiveTab(tab.id)" [class]="getTabClass(tab.id)">
                      {{ tab.name }}
                    </button>
                  }
              </nav>
          </div>

          <!-- Tab Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            @switch (activeEditTab()) {
              @case ('basic_info') {
                <div class="flex justify-center mb-6">
                    <div class="relative">
                        <img class="h-28 w-28 rounded-full object-cover" [src]="employee.avatar" alt="User avatar">
                        <button class="absolute -top-1 -right-1 bg-white p-1.5 rounded-full border border-slate-300 shadow-sm hover:bg-slate-100">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <form [formGroup]="basicInfoForm">
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
                    <div><label class="block text-sm font-medium text-slate-700">First Name</label><input formControlName="firstName" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                    <div><label class="block text-sm font-medium text-slate-700">Last Name</label><input formControlName="lastName" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                    <div><label class="block text-sm font-medium text-slate-700">Employee ID</label><input formControlName="employeeId" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                    
                    <div class="relative"><label class="block text-sm font-medium text-slate-700">Organization DOJ</label><input type="date" formControlName="organizationDOJ" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 pr-8"><div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div></div>
                    <div class="relative"><label class="block text-sm font-medium text-slate-700">KSA DOJ</label><input type="date" formControlName="ksaDOJ" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 pr-8"><div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div></div>
                    
                    <div><label class="block text-sm font-medium text-slate-700">Department</label><input formControlName="department" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                    <div><label class="block text-sm font-medium text-slate-700">Designation</label><input formControlName="designation" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                    <div><label class="block text-sm font-medium text-slate-700">Reporting To</label><select formControlName="reportingTo" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"><option value="" disabled>Select Manager</option>@for(m of reportingManagers(); track m.id){<option [value]="m.id">{{m.name}}</option>}</select></div>
                    <div><label class="block text-sm font-medium text-slate-700">Category</label><select formControlName="category" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"><option value="" disabled>Select Category</option>@for(c of categories(); track c){<option [value]="c">{{c}}</option>}</select></div>

                    <div><label class="block text-sm font-medium text-slate-700">Gender</label><select formControlName="gender" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"><option value="" disabled>Select Gender</option>@for(g of genders(); track g){<option [value]="g">{{g}}</option>}</select></div>
                    <div class="relative"><label class="block text-sm font-medium text-slate-700">Date of Birth (Certificate)</label><input type="date" formControlName="dobCertificate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 pr-8"><div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div></div>
                    <div class="relative"><label class="block text-sm font-medium text-slate-700">Date of Birth (Original)</label><input type="date" formControlName="dobOriginal" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 pr-8"><div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div></div>
                    
                    <div><label class="block text-sm font-medium text-slate-700">Marital Status</label><select formControlName="maritalStatus" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"><option value="" disabled>Select Status</option>@for(s of maritalStatuses(); track s){<option [value]="s">{{s}}</option>}</select></div>
                    <div class="col-span-1 grid grid-cols-3 gap-2">
                        <div class="col-span-1"><label class="block text-sm font-medium text-slate-700">Country Code</label><select formControlName="countryCode" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">@for(c of countryCodes(); track c){<option [value]="c">{{c}}</option>}</select></div>
                        <div class="col-span-2"><label class="block text-sm font-medium text-slate-700">Phone Number</label><input formControlName="phoneNumber" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                    </div>
                    <div><label class="block text-sm font-medium text-slate-700">Alternate Contact</label><input formControlName="alternateContact" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>

                    <div class="md:col-span-2"><label class="block text-sm font-medium text-slate-700">Official Email*</label><input formControlName="officialEmail" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                    <div><label class="block text-sm font-medium text-slate-700">Personal Email</label><input formControlName="personalEmail" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>

                    <div><label class="block text-sm font-medium text-slate-700">Nationality</label><input formControlName="nationality" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                    <div><label class="block text-sm font-medium text-slate-700">Employment Type</label><select formControlName="employmentType" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">@for(et of employmentTypes(); track et){<option [value]="et">{{et}}</option>}</select></div>
                    <div><label class="block text-sm font-medium text-slate-700">Employee Status</label><select formControlName="employeeStatus" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">@for(es of employmentStatuses(); track es){<option [value]="es">{{es}}</option>}</select></div>

                  </div>
                </form>
              }
              @case ('skills') {
                <div class="p-4 bg-white rounded-lg">
                  <form [formGroup]="skillsForm">
                      <h3 class="text-lg font-semibold text-slate-800 mb-6">Employee Skills</h3>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                              <label for="skill1" class="block text-sm font-medium text-slate-700">Skill 1</label>
                              <input id="skill1" formControlName="skill1" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                          </div>
                          <div>
                              <label for="skill2" class="block text-sm font-medium text-slate-700">Skill 2</label>
                              <input id="skill2" formControlName="skill2" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                          </div>
                          <div>
                              <label for="skill3" class="block text-sm font-medium text-slate-700">Skill 3</label>
                              <input id="skill3" formControlName="skill3" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                          </div>
                      </div>
                  </form>
                </div>
              }
              @case ('personal_details') {
                <div class="p-4 bg-white rounded-lg">
                  <form [formGroup]="personalDetailsForm">
                      <h3 class="text-lg font-semibold text-slate-800 mb-6">Personal Information</h3>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                          <div>
                              <label class="block text-sm font-medium text-slate-700">Father's/Spouse Name</label>
                              <input formControlName="fatherOrSpouseName" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                          </div>
                          <div>
                              <label class="block text-sm font-medium text-slate-700">Blood Group</label>
                              <input formControlName="bloodGroup" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                          </div>
                          <div>
                              <label class="block text-sm font-medium text-slate-700">Residential Address</label>
                              <input formControlName="residentialAddress" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                          </div>
                          <div>
                              <label class="block text-sm font-medium text-slate-700">Permanent Address</label>
                              <input formControlName="permanentAddress" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                          </div>
                          <div>
                              <label class="block text-sm font-medium text-slate-700">Emergency Contact Number</label>
                              <input formControlName="emergencyContactNumber" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                          </div>
                          <div>
                              <label class="block text-sm font-medium text-slate-700">Relation</label>
                              <input formControlName="relation" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                          </div>
                          <div>
                              <label class="block text-sm font-medium text-slate-700">Contact Number</label>
                              <input formControlName="contactNumber" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                          </div>
                      </div>
                  </form>
                </div>
              }
              @case ('education') {
                <div class="p-4 bg-white rounded-lg">
                  <h3 class="text-lg font-semibold text-slate-800 mb-6">Education Details</h3>
                  <form [formGroup]="educationForm">
                    <div formArrayName="educations" class="space-y-8">
                      @for(eduGroup of educationsArray.controls; track $index) {
                        <div [formGroupName]="$index" class="p-6 bg-slate-50 rounded-lg border border-slate-200 relative">
                          @if (educationsArray.controls.length > 1) {
                            <button
                              type="button"
                              (click)="removeEducation($index)"
                              class="absolute -top-3 -right-3 h-7 w-7 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                              &times;
                            </button>
                          }
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label class="block text-sm font-medium text-slate-700">Title of Certification</label>
                              <input formControlName="titleOfCertification" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-slate-700">Type of Certification</label>
                              <select formControlName="typeOfCertification" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-white">
                                @for(type of certificationTypes(); track type) { <option [value]="type">{{type}}</option> }
                              </select>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-slate-700">Field of Certification</label>
                              <input formControlName="fieldOfCertification" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-slate-700">Institution</label>
                              <input formControlName="institution" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-slate-700">Year of Passing</label>
                              <select formControlName="yearOfPassing" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 bg-white">
                                <option value="" disabled>Select Year</option>
                                @for(year of yearsOfPassing(); track year) { <option [value]="year">{{year}}</option> }
                              </select>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-slate-700">GPA/Grade</label>
                              <input type="text" formControlName="gpaOrGrade" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                            </div>
                            <div class="md:col-span-3">
                              <label class="block text-sm font-medium text-slate-700">Certificate File</label>
                              <button type="button" class="mt-1 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                                <svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                                Upload Certificate File
                              </button>
                            </div>
                          </div>
                        </div>
                      }
                      <div class="flex justify-end mt-4">
                        <button type="button" (click)="addEducation()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700">
                          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                          Add Education
                        </button>
                      </div>
                    </div>
                  </form>
                  <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                      <svg class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                      <p class="text-sm text-blue-800">You have added {{ educationsArray.controls.length }} education qualification(s). You can add more by clicking the "Add Education" button.</p>
                  </div>
                </div>
              }
              @case ('experience') {
                <div class="p-4 bg-white rounded-lg">
                  <h3 class="text-lg font-semibold text-slate-800 mb-6">Work Experience</h3>
                  <form [formGroup]="experienceForm">
                    <div formArrayName="experiences" class="space-y-8">
                      @for(expGroup of experiencesArray.controls; track $index) {
                        <div [formGroupName]="$index" class="p-6 bg-slate-50 rounded-lg border border-slate-200 relative">
                          @if (experiencesArray.controls.length > 1) {
                            <button type="button" (click)="removeExperience($index)" class="absolute -top-3 -right-3 h-7 w-7 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                              &times;
                            </button>
                          }
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label class="block text-sm font-medium text-slate-700">Company Name</label><input formControlName="companyName" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                            <div><label class="block text-sm font-medium text-slate-700">Designation</label><input formControlName="designation" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                            <div><label class="block text-sm font-medium text-slate-700">Annual CTC</label><input type="number" formControlName="annualCTC" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                            <div class="relative"><label class="block text-sm font-medium text-slate-700">From Date</label><input type="date" formControlName="fromDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 pr-8"><div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div></div>
                            <div class="relative"><label class="block text-sm font-medium text-slate-700">To Date</label><input type="date" formControlName="toDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 pr-8"><div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div></div>
                            <div><label class="block text-sm font-medium text-slate-700">Reason for Leaving</label><input formControlName="reasonForLeaving" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                            <div><label class="block text-sm font-medium text-slate-700">Experience Letter</label><button type="button" class="mt-1 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"><svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>Upload Experience Letter</button></div>
                            <div><label class="block text-sm font-medium text-slate-700">Last 3 Month Payslip</label><button type="button" class="mt-1 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"><svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>Upload Payslip</button></div>
                            <div><label class="block text-sm font-medium text-slate-700">Resume</label><button type="button" class="mt-1 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"><svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>Upload Resume</button></div>
                          </div>
                        </div>
                      }
                      <div class="flex justify-end mt-4">
                        <button type="button" (click)="addExperience()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700">
                          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                          Add Experience
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              }
              @case ('references') {
                <div class="p-4 bg-white rounded-lg">
                  <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-semibold text-slate-800">References</h3>
                    <button (click)="addReference()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700">
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                      Add Reference
                    </button>
                  </div>
                  <form [formGroup]="referencesForm">
                    <div formArrayName="references" class="space-y-6">
                      @for(refGroup of referencesArray.controls; track $index) {
                        <div [formGroupName]="$index" class="p-6 bg-slate-50 rounded-lg border border-slate-200 relative">
                           @if (referencesArray.controls.length > 1) {
                            <button type="button" (click)="removeReference($index)" class="absolute -top-3 -right-3 h-7 w-7 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                              &times;
                            </button>
                          }
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label class="block text-sm font-medium text-slate-700">Reference Name</label><input formControlName="referenceName" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                            <div><label class="block text-sm font-medium text-slate-700">Company</label><input formControlName="company" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                            <div><label class="block text-sm font-medium text-slate-700">Designation</label><input formControlName="designation" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                            <div><label class="block text-sm font-medium text-slate-700">Contact Number</label><input formControlName="contactNumber" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                          </div>
                        </div>
                      }
                    </div>
                  </form>
                </div>
              }
              @case ('identification') {
                <div class="p-4 bg-white rounded-lg">
                  <h3 class="text-lg font-semibold text-slate-800 mb-6">Identification Details</h3>
                  <form [formGroup]="identificationForm" class="space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                      <!-- Aadhar & PAN -->
                      <div>
                        <label class="block text-sm font-medium text-slate-700">Aadhar Number</label>
                        <input formControlName="aadharNumber" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700">PAN Number</label>
                        <input formControlName="panNumber" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700">Aadhar Copy</label>
                        <button type="button" class="mt-1 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                          <svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                          Upload Aadhar File
                        </button>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700">PAN Copy</label>
                        <button type="button" class="mt-1 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                           <svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                          Upload Pan File
                        </button>
                      </div>

                      <!-- Driving License -->
                      <div>
                        <label class="block text-sm font-medium text-slate-700">Driving License Number</label>
                        <input formControlName="drivingLicenseNumber" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                      </div>
                      <div class="relative">
                        <label class="block text-sm font-medium text-slate-700">License Valid Up To</label>
                        <input type="date" formControlName="licenseValidUpTo" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 pr-8">
                        <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div>
                      </div>
                      
                      <!-- Passport -->
                      <div>
                        <label class="block text-sm font-medium text-slate-700">Passport Number</label>
                        <input formControlName="passportNumber" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                      </div>
                      <div class="relative">
                        <label class="block text-sm font-medium text-slate-700">Passport Valid Up To</label>
                        <input type="date" formControlName="passportValidUpTo" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 pr-8">
                        <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div>
                      </div>

                      <!-- File Uploads -->
                      <div>
                        <label class="block text-sm font-medium text-slate-700">Passport Copy</label>
                        <button type="button" class="mt-1 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                           <svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                          Upload Passport File
                        </button>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700">License Copy</label>
                        <button type="button" class="mt-1 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                           <svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                          Upload License File
                        </button>
                      </div>
                    </div>

                    <!-- Visa Information -->
                    <div class="pt-8 border-t border-slate-200">
                      <h3 class="text-lg font-semibold text-slate-800 mb-6">Visa Information</h3>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        <div>
                          <label class="block text-sm font-medium text-slate-700">Visa Type</label>
                          <input formControlName="visaType" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-slate-700">Visa Number</label>
                          <input formControlName="visaNumber" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                        </div>
                        <div class="relative">
                          <label class="block text-sm font-medium text-slate-700">Visa Valid Up To</label>
                          <input type="date" formControlName="visaValidUpTo" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 pr-8">
                           <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-slate-700">Sponsor</label>
                          <input formControlName="sponsor" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-slate-700">Visa Image</label>
                          <button type="button" class="mt-1 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                             <svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                            Upload Visa File
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              }
              @case ('compensation') {
                <div class="p-4 bg-white rounded-lg">
                  <h3 class="text-lg font-semibold text-slate-800 mb-6">Compensation Details</h3>
                  <form [formGroup]="compensationForm">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 max-w-4xl mx-auto">
                      <div><label class="block text-sm font-medium text-slate-700">Basic Salary</label><input type="number" formControlName="basicSalary" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                      <div><label class="block text-sm font-medium text-slate-700">HRA</label><input type="number" formControlName="hra" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                      <div><label class="block text-sm font-medium text-slate-700">Other Allowances</label><input type="number" formControlName="otherAllowances" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                      <div><label class="block text-sm font-medium text-slate-700">CTC</label><input type="number" formControlName="ctc" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                      <div class="md:col-span-2"><label class="block text-sm font-medium text-slate-700">Cost Per Hour</label><input type="number" formControlName="costPerHour" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></div>
                    </div>
                  </form>
                </div>
              }
              @case ('bank_details') { 
                <div class="p-6 bg-white rounded-lg border border-slate-200">
                  <form [formGroup]="bankDetailsForm">
                    <div class="space-y-8">
                      <div>
                        <h3 class="text-lg font-semibold text-slate-800 mb-6">Bank Account Details</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <input formControlName="bankName" placeholder="Bank Name" class="block w-full rounded-md border-slate-300 shadow-sm p-3">
                          <input formControlName="branchName" placeholder="Branch Name" class="block w-full rounded-md border-slate-300 shadow-sm p-3">
                          <input formControlName="accountNumber" placeholder="Account Number" class="block w-full rounded-md border-slate-300 shadow-sm p-3">
                          <input formControlName="ifscCode" placeholder="IFSC Code" class="block w-full rounded-md border-slate-300 shadow-sm p-3">
                        </div>
                      </div>

                      <div class="pt-8">
                        <h3 class="text-lg font-semibold text-slate-800 mb-6">Bank Documents</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                          <div>
                            <p class="text-sm font-medium text-slate-700 mb-2">Passbook Copy</p>
                            <button type="button" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm">
                              <svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                              Upload Passbook File
                            </button>
                          </div>
                          <div>
                            <p class="text-sm font-medium text-slate-700 mb-2">Bank Profile Image</p>
                            <button type="button" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm">
                              <svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                              Upload Bank Profile Image
                            </button>
                          </div>
                          <div>
                            <p class="text-sm font-medium text-slate-700 mb-2">Offer Letter</p>
                            <button type="button" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm">
                              <svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                              Upload Offer Letter
                            </button>
                          </div>
                          <div>
                            <p class="text-sm font-medium text-slate-700 mb-2">Transfer Letter</p>
                            <button type="button" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm">
                              <svg class="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                              Upload Transfer Letter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              }
            }
          </div>

           <div class="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg">
            <button (click)="closeEditModal()" type="button" class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancel</button>
            <button (click)="onUpdateSubmit()" type="button" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Update</button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (employeeToDelete(); as employee) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="cancelDelete()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-start p-6">
            <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <h3 class="text-lg leading-6 font-medium text-slate-900">Delete Employee</h3>
              <div class="mt-2">
                <p class="text-sm text-slate-500">
                  Are you sure you want to permanently delete <strong>{{ employee.name }}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button (click)="cancelDelete()" type="button" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
              Cancel
            </button>
            <button (click)="confirmDelete()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class EmployeeComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly userService = inject(UserService);
  private readonly userRequestService = inject(UserRequestService);
  private readonly fb = inject(FormBuilder);
  
  viewProfile = output<string>();

  showAddModal = signal(false);
  showEditModal = signal(false);
  editingEmployee = signal<Employee | null>(null);
  employeeToDelete = signal<Employee | null>(null);
  employeeToInvite = signal<Employee | null>(null);
  activeEditTab = signal('basic_info');
  
  employees = this.employeeService.employees;
  currentUser = this.userService.currentUser;

  displayedEmployees = this.employees;

  userEmployeeIds = computed(() => new Set(this.userService.users().map(u => u.employeeId)));
  pendingInviteIds = computed(() => new Set(this.userRequestService.requests().map(r => r.id)));
  
  statusColors: Record<Employee['status'], string> = { 'Active': 'bg-green-500', 'Resigned': 'bg-rose-500', 'Absconded': 'bg-orange-500', 'Terminated': 'bg-red-500', 'Transferred': 'bg-purple-500' };
  organizations = signal([{ id: 'org1', name: 'Innovate Corp HQ' }, { id: 'org2', name: 'Synergy Solutions Inc.' }]);
  departments = signal(['Technology', 'Product', 'Design', 'Human Resources', 'Marketing', 'KSA-Administration - Conserve Solutions']);
  designations = signal(['Assistant Manager', 'Software Engineer', 'Sr. Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'HR Manager']);
  reportingManagers = computed(() => this.employees().filter(e => e.id !== this.editingEmployee()?.id).map(e => ({ id: e.id, name: e.name })));
  allReportingManagers = computed(() => this.employees().map(e => ({ id: e.id, name: e.name })));
  categories = signal(['Trainee', 'C1', 'C2', 'C3', 'C4']);
  employmentTypes = signal(['Full-time', 'Part-time', 'Contract basis', 'Probation']);
  employmentStatuses = signal<Employee['status'][]>(['Active', 'Resigned', 'Absconded', 'Terminated', 'Transferred']);
  genders = signal(['Male', 'Female', 'Other']);
  maritalStatuses = signal(['Single', 'Married', 'Divorced', 'Widowed']);
  countryCodes = signal(['+91', '+1', '+44', '+966']);
  certificationTypes = signal(['-- Select Level --', 'PhD', 'Masters', 'Bachelors', 'Diploma', 'Certificate']);
  yearsOfPassing = computed(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 1980; i--) {
      years.push(i.toString());
    }
    return years;
  });


  // --- Forms ---
  addEmployeeForm: FormGroup;
  basicInfoForm: FormGroup;
  skillsForm: FormGroup;
  personalDetailsForm: FormGroup;
  educationForm: FormGroup;
  experienceForm: FormGroup;
  referencesForm: FormGroup;
  identificationForm: FormGroup;
  compensationForm: FormGroup;
  bankDetailsForm: FormGroup;


  constructor() {
    this.addEmployeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      employeeId: ['', Validators.required],
      organizationDOJ: ['', Validators.required],
      ksaDOJ: [''],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      reportingTo: ['', Validators.required],
      category: [''],
      countryCode: ['+91', Validators.required],
      phoneNumber: ['', Validators.required],
      officialEmail: ['', [Validators.required, Validators.email]],
      nationality: [''],
      employmentType: ['', Validators.required],
      employeeStatus: ['Active', Validators.required]
    });
    this.basicInfoForm = this.fb.group({
      firstName: ['', Validators.required], lastName: ['', Validators.required], employeeId: ['', Validators.required],
      organizationDOJ: ['', Validators.required], ksaDOJ: ['', Validators.required], department: ['', Validators.required],
      designation: ['', Validators.required], reportingTo: [''], category: ['', Validators.required],
      gender: ['', Validators.required], dobCertificate: ['', Validators.required], dobOriginal: ['', Validators.required],
      maritalStatus: ['', Validators.required], countryCode: ['+91'], phoneNumber: [''], alternateContact: [''],
      officialEmail: ['', [Validators.required, Validators.email]], personalEmail: ['', [Validators.email]],
      nationality: [''], employmentType: ['', Validators.required], employeeStatus: ['Active' as Employee['status'], Validators.required],
    });
    this.skillsForm = this.fb.group({ skill1: [''], skill2: [''], skill3: [''] });
    this.personalDetailsForm = this.fb.group({
      fatherOrSpouseName: [''], bloodGroup: [''], residentialAddress: [''], permanentAddress: [''],
      emergencyContactNumber: [''], relation: [''], contactNumber: ['']
    });
    this.educationForm = this.fb.group({ educations: this.fb.array([]) });
    this.experienceForm = this.fb.group({ experiences: this.fb.array([]) });
    this.referencesForm = this.fb.group({ references: this.fb.array([]) });
    this.identificationForm = this.fb.group({
      aadharNumber: [''],
      panNumber: [''],
      drivingLicenseNumber: [''],
      licenseValidUpTo: [''],
      passportNumber: [''],
      passportValidUpTo: [''],
      visaType: [''],
      visaNumber: [''],
      visaValidUpTo: [''],
      sponsor: ['']
    });
    this.compensationForm = this.fb.group({
      basicSalary: [0, Validators.required],
      hra: [0, Validators.required],
      otherAllowances: [0, Validators.required],
      ctc: [0, Validators.required],
      costPerHour: [0, Validators.required],
    });
    this.bankDetailsForm = this.fb.group({
      bankName: [''],
      branchName: [''],
      accountNumber: [''],
      ifscCode: ['']
    });
  }
  
  get educationsArray() { return this.educationForm.get('educations') as FormArray; }
  get experiencesArray() { return this.experienceForm.get('experiences') as FormArray; }
  get referencesArray() { return this.referencesForm.get('references') as FormArray; }

  editTabs = [
    { id: 'basic_info', name: 'Basic Information' }, { id: 'skills', name: 'Skills' },
    { id: 'personal_details', name: 'Personal Details' }, { id: 'education', name: 'Education' },
    { id: 'experience', name: 'Experience' }, { id: 'references', name: 'References' },
    { id: 'identification', name: 'Identification' }, { id: 'compensation', name: 'Compensation' },
    { id: 'bank_details', name: 'Bank Details' }
  ];

  // --- Methods ---
  openAddModal() { this.showAddModal.set(true); }
  closeAddModal() { this.showAddModal.set(false); this.addEmployeeForm.reset({ countryCode: '+91', employeeStatus: 'Active' }); }
  onAddSubmit() { 
    if (this.addEmployeeForm.invalid) {
      this.addEmployeeForm.markAllAsTouched();
      return;
    }
    const formValue = this.addEmployeeForm.value;
    const newEmployeeData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      employeeId: formValue.employeeId,
      orgDateOfJoining: formValue.organizationDOJ,
      ksaEmploymentJoining: formValue.ksaDOJ,
      department: formValue.department,
      designation: formValue.designation,
      reportingTo: formValue.reportingTo,
      category: formValue.category,
      countryCode: formValue.countryCode,
      phoneNumber: formValue.phoneNumber,
      email: formValue.officialEmail,
      nationality: formValue.nationality,
      employmentType: formValue.employmentType,
      status: formValue.employeeStatus as Employee['status'],
    };
    
    this.employeeService.addEmployee(newEmployeeData as Partial<Employee>);
    this.closeAddModal();
  }

  openEditModal(employee: Employee) {
    this.editingEmployee.set(employee);
    this.activeEditTab.set('basic_info');
    
    this.basicInfoForm.patchValue({
      firstName: employee.firstName, lastName: employee.lastName, employeeId: employee.employeeId,
      organizationDOJ: employee.orgDateOfJoining, ksaDOJ: employee.ksaEmploymentJoining, department: employee.department,
      designation: employee.designation, reportingTo: employee.reportingTo, category: employee.category,
      gender: employee.gender, dobCertificate: employee.personalDetails.dateOfBirth, dobOriginal: employee.personalDetails.dobOriginal,
      maritalStatus: employee.personalDetails.maritalStatus, countryCode: employee.countryCode, phoneNumber: employee.phoneNumber,
      alternateContact: employee.alternateContact, officialEmail: employee.email, personalEmail: employee.personalEmail,
      nationality: employee.nationality, employmentType: employee.employmentType, employeeStatus: employee.status,
    });

    this.skillsForm.patchValue({ skill1: employee.skills?.[0] || '', skill2: employee.skills?.[1] || '', skill3: employee.skills?.[2] || '' });
    
    this.personalDetailsForm.patchValue({
      fatherOrSpouseName: employee.personalDetails.fatherOrSpouseName, bloodGroup: employee.personalDetails.bloodGroup,
      residentialAddress: employee.personalDetails.residentialAddress, permanentAddress: employee.personalDetails.permanentAddress,
      emergencyContactNumber: employee.personalDetails.emergencyContactNumber, relation: employee.personalDetails.relation,
      contactNumber: employee.personalDetails.contactNumber,
    });
    
    this.educationsArray.clear();
    if (employee.education?.length > 0) {
      employee.education.forEach(edu => this.educationsArray.push(this.createEducationGroup(edu)));
    } else { this.addEducation(); }

    this.experiencesArray.clear();
    if (employee.experience?.length > 0) {
      employee.experience.forEach(exp => this.experiencesArray.push(this.createExperienceGroup(exp)));
    } else { this.addExperience(); }
    
    this.referencesArray.clear();
    if (employee.references?.length > 0) {
      employee.references.forEach(ref => this.referencesArray.push(this.createReferenceGroup(ref)));
    } else { this.addReference(); }

    this.identificationForm.patchValue(employee.identification);
    this.compensationForm.patchValue(employee.compensation);
    this.bankDetailsForm.patchValue(employee.bankDetails);

    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingEmployee.set(null);
  }

  promptDelete(employee: Employee): void { this.employeeToDelete.set(employee); }
  cancelDelete(): void { this.employeeToDelete.set(null); }
  confirmDelete(): void {
    const employee = this.employeeToDelete();
    if (employee) { this.employeeService.deleteEmployee(employee.id); this.cancelDelete(); }
  }

  openInviteModal(employee: Employee): void { this.employeeToInvite.set(employee); }
  closeInviteModal(): void { this.employeeToInvite.set(null); }
  sendInvitation(): void {
    const employee = this.employeeToInvite();
    if (employee) { this.userRequestService.sendInvitation(employee); this.closeInviteModal(); }
  }
  
  setActiveTab(tabId: string) { this.activeEditTab.set(tabId); }
  
  getTabClass(tabId: string): string {
    const base = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm';
    return this.activeEditTab() === tabId ? `${base} border-blue-500 text-blue-600` : `${base} border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`;
  }

  onUpdateSubmit() {
    const editing = this.editingEmployee();
    if (!editing) return;

    if (this.basicInfoForm.invalid || this.skillsForm.invalid || this.personalDetailsForm.invalid || 
       this.educationForm.invalid || this.experienceForm.invalid || this.referencesForm.invalid || 
       this.identificationForm.invalid || this.compensationForm.invalid || this.bankDetailsForm.invalid) {
        
        this.basicInfoForm.markAllAsTouched();
        this.skillsForm.markAllAsTouched();
        this.personalDetailsForm.markAllAsTouched();
        this.educationForm.markAllAsTouched();
        this.experienceForm.markAllAsTouched();
        this.referencesForm.markAllAsTouched();
        this.identificationForm.markAllAsTouched();
        this.compensationForm.markAllAsTouched();
        this.bankDetailsForm.markAllAsTouched();
        console.error('One or more forms are invalid.');
        return;
    }

    const basicInfo = this.basicInfoForm.getRawValue();
    const skills = this.skillsForm.getRawValue();
    const personalDetails = this.personalDetailsForm.getRawValue();
    const education = this.educationForm.getRawValue();
    const experience = this.experienceForm.getRawValue();
    const references = this.referencesForm.getRawValue();
    const identification = this.identificationForm.getRawValue();
    const compensation = this.compensationForm.getRawValue();
    const bankDetails = this.bankDetailsForm.getRawValue();

    const updatedEmployee: Employee = {
      ...editing, // Preserve fields not in forms, like avatar and organization
      name: `${basicInfo.firstName} ${basicInfo.lastName}`,
      firstName: basicInfo.firstName,
      lastName: basicInfo.lastName,
      employeeId: basicInfo.employeeId,
      orgDateOfJoining: basicInfo.organizationDOJ,
      ksaEmploymentJoining: basicInfo.ksaDOJ,
      department: basicInfo.department,
      designation: basicInfo.designation,
      reportingTo: basicInfo.reportingTo,
      category: basicInfo.category,
      gender: basicInfo.gender,
      countryCode: basicInfo.countryCode,
      phoneNumber: basicInfo.phoneNumber,
      alternateContact: basicInfo.alternateContact,
      email: basicInfo.officialEmail,
      personalEmail: basicInfo.personalEmail,
      nationality: basicInfo.nationality,
      employmentType: basicInfo.employmentType,
      status: basicInfo.employeeStatus,
      
      skills: Object.values(skills).filter(s => s),

      personalDetails: {
        ...editing.personalDetails,
        dateOfBirth: basicInfo.dobCertificate,
        dobOriginal: basicInfo.dobOriginal,
        maritalStatus: basicInfo.maritalStatus,
        fatherOrSpouseName: personalDetails.fatherOrSpouseName,
        bloodGroup: personalDetails.bloodGroup,
        residentialAddress: personalDetails.residentialAddress,
        permanentAddress: personalDetails.permanentAddress,
        emergencyContactNumber: personalDetails.emergencyContactNumber,
        relation: personalDetails.relation,
        contactNumber: personalDetails.contactNumber,
      },

      education: education.educations,
      experience: experience.experiences,
      references: references.references,
      identification: identification,
      compensation: compensation,
      bankDetails: {
        ...editing.bankDetails, // Preserve optional file fields
        ...bankDetails,
      }
    };
    
    this.employeeService.updateEmployee(updatedEmployee);
    this.closeEditModal();
  }

  createEducationGroup(edu?: Education): FormGroup {
    return this.fb.group({
      titleOfCertification: [edu?.titleOfCertification || '', Validators.required],
      typeOfCertification: [edu?.typeOfCertification || '-- Select Level --', Validators.required],
      fieldOfCertification: [edu?.fieldOfCertification || '', Validators.required],
      institution: [edu?.institution || '', Validators.required],
      yearOfPassing: [edu?.yearOfPassing || '', Validators.required],
      gpaOrGrade: [edu?.gpaOrGrade || ''],
      certificateFile: [null]
    });
  }
  addEducation(): void { this.educationsArray.push(this.createEducationGroup()); }
  removeEducation(index: number): void { this.educationsArray.removeAt(index); }

  createExperienceGroup(exp?: Experience): FormGroup {
    return this.fb.group({
      companyName: [exp?.companyName || '', Validators.required],
      designation: [exp?.designation || '', Validators.required],
      annualCTC: [exp?.annualCTC || null, Validators.required],
      fromDate: [exp?.fromDate || '', Validators.required],
      toDate: [exp?.toDate || '', Validators.required],
      reasonForLeaving: [exp?.reasonForLeaving || ''],
      experienceLetter: [null], last3MonthPayslip: [null], resume: [null]
    });
  }
  addExperience(): void { this.experiencesArray.push(this.createExperienceGroup()); }
  removeExperience(index: number): void { this.experiencesArray.removeAt(index); }

  createReferenceGroup(ref?: Reference): FormGroup {
    return this.fb.group({
      referenceName: [ref?.referenceName || '', Validators.required],
      company: [ref?.company || '', Validators.required],
      designation: [ref?.designation || '', Validators.required],
      contactNumber: [ref?.contactNumber || '', Validators.required],
    });
  }
  addReference(): void { this.referencesArray.push(this.createReferenceGroup()); }
  removeReference(index: number): void { this.referencesArray.removeAt(index); }
}
