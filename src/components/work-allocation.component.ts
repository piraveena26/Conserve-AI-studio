import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Employee, EmployeeService } from '../services/employee.service';
import { WorkAllocationService, WorkAllocation } from '../services/work-allocation.service';


interface Project {
  id: string;
  name: string;
}

interface DepartmentSummary {
  department: string;
  discipline: string;
  total: number;
  officePresent: number;
  leave: number;
  wfh: number;
}

@Component({
  selector: 'app-work-allocation',
  template: `
    <div class="space-y-6">
      <div class="bg-sky-100 p-4 rounded-lg shadow-sm -m-4 sm:-m-6 lg:-m-8 mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Daily Work Allocation</h1>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm">
        <!-- Tabs -->
        <div class="border-b border-slate-200">
          <nav class="-mb-px flex justify-center space-x-8">
            <button (click)="activeTab.set('dashboard')" [class]="getTabClass('dashboard')">Dashboard</button>
            <button (click)="activeTab.set('workAllocation')" [class]="getTabClass('workAllocation')">Work Allocation</button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
            @if (activeTab() === 'dashboard') {
              <div class="space-y-6 bg-slate-50 -m-6 p-6 rounded-b-lg">
                <!-- Submission Progress -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-slate-800">Submission Progress</h3>
                  <div class="mt-4">
                    <div class="relative w-full bg-slate-200 rounded-full h-4">
                      <div class="bg-slate-600 h-4 rounded-full" [style.width]="submissionPercentage()"></div>
                    </div>
                    <p class="text-sm text-slate-500 mt-2">
                      Submitted: {{ submissionProgress().submitted }} / {{ submissionProgress().total }} employees ({{ submissionPercentage() }})
                    </p>
                  </div>
                </div>

                <!-- Filters & Stats -->
                <div class="bg-white rounded-lg shadow-sm p-6 space-y-6">
                  <!-- Date Filters -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div class="flex items-end gap-2">
                          <div class="relative flex-grow">
                              <label for="dashDate" class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">Date</label>
                              <input id="dashDate" type="date" class="form-input w-full rounded-md border-slate-300 shadow-sm p-2 pr-10">
                              <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div>
                          </div>
                            <button class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-500 hover:bg-blue-50 shadow-sm" title="Apply Date Filter">
                              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                          </button>
                      </div>
                      <div class="relative flex-grow">
                          <label for="dashFromDate" class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">From Date</label>
                          <input id="dashFromDate" type="date" class="form-input w-full rounded-md border-slate-300 shadow-sm p-2 pr-10">
                          <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div>
                      </div>
                      <div class="flex items-end gap-2">
                          <div class="relative flex-grow">
                              <label for="dashToDate" class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-600">To Date</label>
                              <input id="dashToDate" type="date" class="form-input w-full rounded-md border-slate-300 shadow-sm p-2 pr-10">
                              <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div>
                          </div>
                            <button class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-500 hover:bg-blue-50 shadow-sm" title="Apply Date Range Filter">
                              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                          </button>
                      </div>
                  </div>
                  
                  <!-- Stat Cards -->
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 text-center">
                    <div class="p-4 rounded-lg border border-slate-200 shadow-sm"><p class="text-xs font-semibold text-slate-500">TOTAL PRESENT</p><p class="text-3xl font-bold text-blue-600 mt-1">{{ attendanceStats().totalPresent }}</p></div>
                    <div class="p-4 rounded-lg border border-slate-200 shadow-sm"><p class="text-xs font-semibold text-slate-500">WFO</p><p class="text-3xl font-bold text-green-600 mt-1">{{ attendanceStats().wfo }}</p></div>
                    <div class="p-4 rounded-lg border border-slate-200 shadow-sm"><p class="text-xs font-semibold text-slate-500">WFH</p><p class="text-3xl font-bold text-slate-600 mt-1">{{ attendanceStats().wfh }}</p></div>
                    <div class="p-4 rounded-lg border border-slate-200 shadow-sm"><p class="text-xs font-semibold text-slate-500">PERMISSION</p><p class="text-3xl font-bold text-yellow-500 mt-1">{{ attendanceStats().permission }}</p></div>
                    <div class="p-4 rounded-lg border border-slate-200 shadow-sm"><p class="text-xs font-semibold text-slate-500">INFORMED LEAVE</p><p class="text-3xl font-bold text-orange-500 mt-1">{{ attendanceStats().informedLeave }}</p></div>
                    <div class="p-4 rounded-lg border border-slate-200 shadow-sm"><p class="text-xs font-semibold text-slate-500">UNINFORMED LEAVE</p><p class="text-3xl font-bold text-red-600 mt-1">{{ attendanceStats().uninformedLeave }}</p></div>
                  </div>
                  
                  <!-- Report Type Selector -->
                  <div class="flex items-center gap-4 pt-4">
                    <label for="reportType" class="text-sm font-medium text-slate-700 whitespace-nowrap">Select Report Type:</label>
                    <select id="reportType" [value]="selectedReportType()" (change)="selectedReportType.set($any($event.target).value)" class="form-select w-full max-w-sm rounded-md border-slate-300 shadow-sm p-2 text-sm">
                      @for(type of reportTypes; track type) {
                        <option [value]="type">{{ type }}</option>
                      }
                    </select>
                  </div>
                </div>

                <!-- Report Table -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                  @switch (selectedReportType()) {
                    @case ('Department Wise Reports') {
                      <div>
                        <div class="flex items-center justify-between mb-4">
                          <h3 class="text-lg font-semibold text-slate-800">Department-wise Attendance Summary</h3>
                          <div class="flex items-center gap-2">
                            <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 flex items-center gap-2">Excel</button>
                            <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 flex items-center gap-2">Print</button>
                          </div>
                        </div>
                        <div class="overflow-x-auto border border-slate-200 rounded-lg">
                          <table class="w-full text-sm text-left text-slate-500">
                            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                              <tr>
                                <th scope="col" class="px-6 py-3">Department</th><th scope="col" class="px-6 py-3">Discipline</th><th scope="col" class="px-6 py-3">Total</th><th scope="col" class="px-6 py-3">Office Present</th><th scope="col" class="px-6 py-3">Leave</th><th scope="col" class="px-6 py-3">WFH</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for(row of departmentSummary(); track row.department) {
                                <tr class="bg-white border-b hover:bg-slate-50">
                                  <td class="px-6 py-4 font-medium text-slate-900">{{ row.department }}</td><td class="px-6 py-4">{{ row.discipline }}</td><td class="px-6 py-4">{{ row.total }}</td><td class="px-6 py-4">{{ row.officePresent }}</td><td class="px-6 py-4">{{ row.leave }}</td><td class="px-6 py-4">{{ row.wfh }}</td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    }
                    @case ('Project Wise Reports') {
                      @let report = projectWiseReportData();
                      <div>
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-slate-800">Project Wise Report</h3>
                            <div class="flex items-center gap-2">
                                <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 flex items-center gap-2">Excel</button>
                                <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 flex items-center gap-2">Print</button>
                            </div>
                        </div>
                        <div class="overflow-x-auto border border-slate-200 rounded-lg">
                          <table class="w-full text-sm text-left text-slate-500">
                            <thead class="text-xs text-slate-700 uppercase">
                              <tr>
                                <th class="px-6 py-3 bg-slate-50">Project Name</th>
                                @for(role of report.billingRoleColumns; track role) {
                                  <th class="px-6 py-3 bg-blue-50 text-blue-800">{{role}}</th>
                                }
                                <th class="px-6 py-3 bg-green-50 text-green-800">Present Count</th>
                                <th class="px-6 py-3 bg-green-50 text-green-800">Absent Count</th>
                                <th class="px-6 py-3 bg-green-50 text-green-800">WFH</th>
                                <th class="px-6 py-3 bg-green-50 text-green-800 font-bold">Grand Total</th>
                                <th class="px-6 py-3 bg-green-50 text-green-800">Billing Count</th>
                                <th class="px-6 py-3 bg-green-50 text-green-800">Non-Billing Count</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for(row of report.rows; track row.projectName) {
                                <tr class="bg-white border-b hover:bg-slate-50">
                                  <td class="px-6 py-4 font-medium text-slate-900">{{ row.projectName }}</td>
                                  @for(role of report.billingRoleColumns; track role) {
                                    <td class="px-6 py-4 text-center bg-blue-50/50">{{ row[role] }}</td>
                                  }
                                  <td class="px-6 py-4 text-center bg-green-50/50">{{ row.presentCount }}</td>
                                  <td class="px-6 py-4 text-center bg-green-50/50">{{ row.absentCount }}</td>
                                  <td class="px-6 py-4 text-center bg-green-50/50">{{ row.wfhCount }}</td>
                                  <td class="px-6 py-4 text-center bg-green-50/50 font-bold text-slate-800">{{ row.grandTotal }}</td>
                                  <td class="px-6 py-4 text-center bg-green-50/50">{{ row.billingCount }}</td>
                                  <td class="px-6 py-4 text-center bg-green-50/50">{{ row.nonBillingCount }}</td>
                                </tr>
                              }
                            </tbody>
                            <tfoot class="font-bold bg-slate-100 text-slate-800">
                              <tr>
                                <td class="px-6 py-4">GRAND TOTAL</td>
                                @for(role of report.billingRoleColumns; track role) {
                                  <td class="px-6 py-4 text-center bg-blue-100">{{ report.totals[role] }}</td>
                                }
                                <td class="px-6 py-4 text-center bg-green-100">{{ report.totals.presentCount }}</td>
                                <td class="px-6 py-4 text-center bg-green-100">{{ report.totals.absentCount }}</td>
                                <td class="px-6 py-4 text-center bg-green-100">{{ report.totals.wfhCount }}</td>
                                <td class="px-6 py-4 text-center bg-green-100">{{ report.totals.grandTotal }}</td>
                                <td class="px-6 py-4 text-center bg-green-100">{{ report.totals.billingCount }}</td>
                                <td class="px-6 py-4 text-center bg-green-100">{{ report.totals.nonBillingCount }}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    }
                    @case ('Reporting Manager Reports') {
                       <div>
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-slate-800">Reporting Manager Reports</h3>
                            <div class="flex items-center gap-2">
                                <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 flex items-center gap-2">Excel</button>
                                <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 flex items-center gap-2">Print</button>
                            </div>
                        </div>
                        <div class="overflow-x-auto border border-slate-200 rounded-lg">
                          <table class="w-full text-sm text-left text-slate-500">
                            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                              <tr>
                                <th class="px-6 py-3">S.No</th>
                                <th class="px-6 py-3">Conservian</th>
                                <th class="px-6 py-3">BadgeId</th>
                                <th class="px-6 py-3">Billability</th>
                                <th class="px-6 py-3">Billing Role</th>
                                <th class="px-6 py-3">Attendance</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for(managerGroup of reportingManagerReportData(); track managerGroup.managerName) {
                                <tr class="bg-green-100 font-bold text-green-800">
                                  <td [attr.colspan]="6" class="px-6 py-2 text-center uppercase tracking-wider">{{ managerGroup.managerName }}</td>
                                </tr>
                                @for(deptGroup of managerGroup.departments; track deptGroup.departmentName) {
                                   <tr class="bg-green-50 font-semibold text-green-700">
                                    <td [attr.colspan]="6" class="px-6 py-2 text-center uppercase tracking-wider">{{ deptGroup.departmentName }}</td>
                                  </tr>
                                  @for(alloc of deptGroup.allocations; track alloc.id; let i = $index) {
                                    <tr class="bg-white border-b hover:bg-slate-50">
                                      <td class="px-6 py-4">{{ i + 1 }}</td>
                                      <td class="px-6 py-4">{{ alloc.employeeName }}</td>
                                      <td class="px-6 py-4">{{ alloc.badgeId }}</td>
                                      <td class="px-6 py-4">{{ alloc.billability }}</td>
                                      <td class="px-6 py-4">{{ alloc.billingRole }}</td>
                                      <td class="px-6 py-4">{{ alloc.attendance }}</td>
                                    </tr>
                                  }
                                }
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    }
                    @default {
                      <div class="text-center p-8 text-slate-500 bg-slate-100 rounded-lg">
                        <h3 class="font-semibold">{{ selectedReportType() }}</h3>
                        <p>Report for this view is not yet implemented.</p>
                      </div>
                    }
                  }
                </div>
              </div>
            } @else {
              <div class="space-y-6">
                <!-- Add/Edit Form -->
                <div class="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <form [formGroup]="allocationForm" (ngSubmit)="onSubmit()">
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-end">
                            <div class="lg:col-span-1">
                                <label for="conservian" class="block text-xs font-medium text-slate-600 mb-1">Conservian*</label>
                                <select id="conservian" formControlName="employeeId" class="form-select w-full rounded-md border-slate-300 shadow-sm text-sm p-2.5">
                                  <option value="" disabled>Select employee</option>
                                  @for(emp of employees(); track emp.id) {
                                    <option [value]="emp.id">{{ emp.name }}</option>
                                  }
                                </select>
                            </div>
                            <div class="lg:col-span-1">
                                <label for="project" class="block text-xs font-medium text-slate-600 mb-1">Project*</label>
                                <select id="project" formControlName="projectId" class="form-select w-full rounded-md border-slate-300 shadow-sm text-sm p-2.5">
                                   <option value="" disabled>Select project</option>
                                  @for(proj of projects(); track proj.id) {
                                    <option [value]="proj.id">{{ proj.name }}</option>
                                  }
                                </select>
                            </div>
                            <div class="lg:col-span-1">
                                <label for="reportingTo" class="block text-xs font-medium text-slate-600 mb-1">Reporting To*</label>
                                <select id="reportingTo" formControlName="reportingToId" class="form-select w-full rounded-md border-slate-300 shadow-sm text-sm p-2.5">
                                   <option value="" disabled>Select manager</option>
                                  @for(emp of employees(); track emp.id) {
                                    <option [value]="emp.id">{{ emp.name }}</option>
                                  }
                                </select>
                            </div>
                            <div class="lg:col-span-1">
                                <label for="billability" class="block text-xs font-medium text-slate-600 mb-1">Billability*</label>
                                <select id="billability" formControlName="billability" class="form-select w-full rounded-md border-slate-300 shadow-sm text-sm p-2.5">
                                   <option value="" disabled>Select billability</option>
                                  @for(item of billabilityOptions; track item) {
                                    <option [value]="item">{{ item }}</option>
                                  }
                                </select>
                            </div>
                            <div class="lg:col-span-1">
                                <label for="billingRole" class="block text-xs font-medium text-slate-600 mb-1">Billing Role*</label>
                                <select id="billingRole" formControlName="billingRole" class="form-select w-full rounded-md border-slate-300 shadow-sm text-sm p-2.5">
                                   <option value="" disabled>Select role</option>
                                  @for(role of billingRoles; track role) {
                                    <option [value]="role">{{ role }}</option>
                                  }
                                </select>
                            </div>
                            <div class="lg:col-span-1">
                                <label for="attendance" class="block text-xs font-medium text-slate-600 mb-1">Attendance*</label>
                                <select id="attendance" formControlName="attendance" class="form-select w-full rounded-md border-slate-300 shadow-sm text-sm p-2.5">
                                   <option value="" disabled>Select status</option>
                                  @for(att of attendanceOptions; track att) {
                                    <option [value]="att">{{ att }}</option>
                                  }
                                </select>
                            </div>
                            <div class="lg:col-span-1">
                                <button type="submit" [disabled]="allocationForm.invalid" class="w-full h-10 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                                  <span>{{ editingAllocation() ? 'Update' : 'Add' }}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Date Filters -->
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div class="flex items-end gap-2">
                            <div class="relative flex-grow">
                                <label for="filterDate" class="absolute -top-2 left-2 inline-block bg-slate-50 px-1 text-xs font-medium text-slate-600">Date</label>
                                <input id="filterDate" type="date" [value]="filterDate()" (input)="filterDate.set($any($event.target).value)" class="form-input w-full rounded-md border-slate-300 shadow-sm p-2 pr-10">
                                <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>
                                </div>
                            </div>
                             <button (click)="applyDateFilter()" class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-500 hover:bg-blue-50 shadow-sm" title="Apply Date Filter">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            </button>
                        </div>
                        <div class="flex items-end gap-2">
                            <div class="relative flex-grow">
                                <label for="fromDate" class="absolute -top-2 left-2 inline-block bg-slate-50 px-1 text-xs font-medium text-slate-600">From Date</label>
                                <input id="fromDate" type="date" [value]="filterFromDate()" (input)="filterFromDate.set($any($event.target).value)" class="form-input w-full rounded-md border-slate-300 shadow-sm p-2 pr-10">
                                <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div>
                            </div>
                        </div>
                        <div class="flex items-end gap-2">
                            <div class="relative flex-grow">
                                <label for="toDate" class="absolute -top-2 left-2 inline-block bg-slate-50 px-1 text-xs font-medium text-slate-600">To Date</label>
                                <input id="toDate" type="date" [value]="filterToDate()" (input)="filterToDate.set($any($event.target).value)" class="form-input w-full rounded-md border-slate-300 shadow-sm p-2 pr-10">
                                <div class="absolute inset-y-0 right-0 top-6 pr-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg></div>
                            </div>
                             <button (click)="applyDateRangeFilter()" class="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white border-2 border-blue-400 text-blue-500 hover:bg-blue-50 shadow-sm" title="Apply Date Range Filter">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
                    <!-- Toolbar -->
                    <div class="flex items-center justify-between">
                        <div class="relative w-full max-w-xs">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                          </div>
                          <input #tableSearch (input)="searchTerm.set(tableSearch.value)" type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md shadow-sm">
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
                                @for(alloc of filteredAllocations(); track alloc.id) {
                                    <tr class="bg-white border-b hover:bg-slate-50">
                                        <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"></td>
                                        @if(visibleColumns().has('name')) { <td class="px-6 py-4 font-medium text-slate-900">{{ alloc.employeeName }}</td> }
                                        @if(visibleColumns().has('reportingTo')) { <td class="px-6 py-4">{{ alloc.reportingToName }}</td> }
                                        @if(visibleColumns().has('project')) { <td class="px-6 py-4">{{ alloc.projectName }}</td> }
                                        @if(visibleColumns().has('billability')) { <td class="px-6 py-4">{{ alloc.billability }}</td> }
                                        @if(visibleColumns().has('billingRole')) { <td class="px-6 py-4">{{ alloc.billingRole }}</td> }
                                        @if(visibleColumns().has('attendance')) { <td class="px-6 py-4">{{ alloc.attendance }}</td> }
                                        @if(visibleColumns().has('actions')) { 
                                            <td class="px-6 py-4 text-right">
                                                <div class="flex items-center justify-end space-x-3">
                                                    <button (click)="openEditModal(alloc)" class="text-slate-500 hover:text-green-600" title="Edit">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                                                    </button>
                                                    <button (click)="deleteAllocation(alloc.id)" class="text-slate-500 hover:text-red-600" title="Delete">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        }
                                    </tr>
                                } @empty {
                                    <tr><td [attr.colspan]="visibleColumns().size + 1" class="text-center p-8 text-slate-500">No work allocations found for the selected criteria.</td></tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
              </div>
            }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
})
export class WorkAllocationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  workAllocationService = inject(WorkAllocationService);

  activeTab = signal<'dashboard' | 'workAllocation'>('dashboard');
  allocations = this.workAllocationService.allocations;
  editingAllocation = signal<WorkAllocation | null>(null);

  filterDate = signal<string>(new Date().toISOString().split('T')[0]);
  filterFromDate = signal<string>('');
  filterToDate = signal<string>('');
  searchTerm = signal('');
  showColumnsDropdown = signal(false);

  allocationForm!: FormGroup;

  // --- Dashboard Properties ---
  submissionProgress = signal({ submitted: 3, total: 27 });
  submissionPercentage = computed(() => {
    const progress = this.submissionProgress();
    if (progress.total === 0) return '0';
    return ((progress.submitted / progress.total) * 100).toFixed(1) + '%';
  });

  attendanceStats = signal({
    totalPresent: 1,
    wfo: 1,
    wfh: 0,
    permission: 2,
    informedLeave: 1,
    uninformedLeave: 1,
  });

  reportTypes = [
    'Department Wise Reports',
    'Project Wise Reports',
    'Reporting Manager Reports',
    'Summary Reports',
    'Jump Project Reports'
  ];
  selectedReportType = signal(this.reportTypes[0]);

  departmentSummary = signal<DepartmentSummary[]>([
    { department: 'BIM', discipline: 'AEC', total: 15, officePresent: 12, leave: 1, wfh: 2 },
    { department: 'ENGINEERING', discipline: 'AEC', total: 10, officePresent: 8, leave: 2, wfh: 0 },
    { department: 'SUSTAINABILITY', discipline: 'AEC', total: 5, officePresent: 4, leave: 0, wfh: 1 },
  ]);
  // --- End Dashboard Properties ---


  employees = computed(() => this.employeeService.employees().map(e => ({ id: e.id, name: e.name })));
  projects = signal<Project[]>([
    { id: 'p1', name: 'Amaala Triple Bay - Medical Wellness' },
    { id: 'p2', name: 'Expand Upstream High- Perform.C.' },
    { id: 'p3', name: 'Exit 15 Entertainment Complex' },
    { id: 'p4', name: 'Medical Wellness' }
  ]);
  billabilityOptions: WorkAllocation['billability'][] = ['Billable', 'Non-Billable'];
  billingRoles: string[] = ['Accounts & Admin Executive', 'BIM Modeller / Draftsman', 'Country Manager', 'KSA-Administration'];
  attendanceOptions: WorkAllocation['attendance'][] = ['PRESENT', 'PERMISSION', 'ON DUTY', 'HOLIDAY', 'LEAVE', 'WFO', 'Informed Leave', 'Uninformed Leave'];

  filteredAllocations = computed(() => {
    const allAllocations = this.allocations();
    const term = this.searchTerm().toLowerCase();
    const fDate = this.filterDate();
    const from = this.filterFromDate();
    const to = this.filterToDate();

    return allAllocations.filter(alloc => {
      // Normalize alloc date to YYYY-MM-DD string in local timezone
      const allocDate = new Date(alloc.date).toLocaleDateString('en-CA');

      let dateMatch = false;
      if (from && to) {
        dateMatch = allocDate >= from && allocDate <= to;
      } else if (fDate) {
        dateMatch = allocDate === fDate;
      } else {
        dateMatch = true;
      }

      const termMatch = !term ||
        alloc.employeeName.toLowerCase().includes(term) ||
        alloc.reportingToName.toLowerCase().includes(term) ||
        alloc.projectName.toLowerCase().includes(term);

      return dateMatch && termMatch;
    });
  });

  projectWiseReportData = computed(() => {
    const allocations = this.allocations();
    const projects = this.projects();
    const billingRoles = this.billingRoles;

    const report = new Map<string, any>();

    projects.forEach(p => {
      const projectRow: any = {
        projectName: p.name, presentCount: 0, absentCount: 0, wfhCount: 0,
        grandTotal: 0, billingCount: 0, nonBillingCount: 0,
      };
      billingRoles.forEach(role => { projectRow[role] = 0; });
      report.set(p.name, projectRow);
    });

    allocations.forEach(alloc => {
      if (report.has(alloc.projectName)) {
        const projectRow = report.get(alloc.projectName);

        if (billingRoles.includes(alloc.billingRole)) {
          projectRow[alloc.billingRole]++;
        }

        if (alloc.attendance === 'PRESENT' || alloc.attendance === 'WFO') projectRow.presentCount++;
        else if (['HOLIDAY', 'LEAVE', 'Informed Leave', 'Uninformed Leave', 'PERMISSION'].includes(alloc.attendance)) projectRow.absentCount++;

        projectRow.grandTotal++;

        if (alloc.billability === 'Billable') projectRow.billingCount++;
        else projectRow.nonBillingCount++;
      }
    });

    const grandTotals: any = { projectName: 'GRAND TOTAL' };
    billingRoles.forEach(role => grandTotals[role] = 0);
    grandTotals.presentCount = 0; grandTotals.absentCount = 0; grandTotals.wfhCount = 0;
    grandTotals.grandTotal = 0; grandTotals.billingCount = 0; grandTotals.nonBillingCount = 0;

    report.forEach(projectRow => {
      billingRoles.forEach(role => { grandTotals[role] += projectRow[role]; });
      grandTotals.presentCount += projectRow.presentCount;
      grandTotals.absentCount += projectRow.absentCount;
      grandTotals.wfhCount += projectRow.wfhCount;
      grandTotals.grandTotal += projectRow.grandTotal;
      grandTotals.billingCount += projectRow.billingCount;
      grandTotals.nonBillingCount += projectRow.nonBillingCount;
    });

    return {
      rows: Array.from(report.values()),
      totals: grandTotals,
      billingRoleColumns: billingRoles
    };
  });

  reportingManagerReportData = computed(() => {
    const allocations = this.allocations();
    const groupedByManager = new Map<string, { managerName: string, departments: Map<string, WorkAllocation[]> }>();

    allocations.forEach(alloc => {
      if (!groupedByManager.has(alloc.reportingToId)) {
        groupedByManager.set(alloc.reportingToId, {
          managerName: alloc.reportingToName,
          departments: new Map<string, WorkAllocation[]>()
        });
      }

      const managerGroup = groupedByManager.get(alloc.reportingToId)!;
      if (!managerGroup.departments.has(alloc.department)) {
        managerGroup.departments.set(alloc.department, []);
      }
      managerGroup.departments.get(alloc.department)!.push(alloc);
    });

    return Array.from(groupedByManager.values()).map(managerGroup => ({
      managerName: managerGroup.managerName,
      departments: Array.from(managerGroup.departments.entries()).map(([departmentName, allocations]) => ({
        departmentName,
        allocations
      }))
    }));
  });

  allColumns = [
    { id: 'name', name: 'Name' },
    { id: 'reportingTo', name: 'Reporting To' },
    { id: 'project', name: 'Project' },
    { id: 'billability', name: 'Billability' },
    { id: 'billingRole', name: 'Billing Role' },
    { id: 'attendance', name: 'Attendance' },
    { id: 'actions', name: 'Actions' },
  ];
  visibleColumns = signal(new Set(this.allColumns.map(c => c.id)));

  ngOnInit() {
    this.allocationForm = this.fb.group({
      employeeId: ['', Validators.required],
      projectId: ['', Validators.required],
      reportingToId: ['', Validators.required],
      billability: ['', Validators.required],
      billingRole: ['', Validators.required],
      attendance: ['', Validators.required],
    });
  }

  getTabClass(tabName: 'dashboard' | 'workAllocation'): string {
    const base = 'whitespace-nowrap py-4 px-8 text-sm font-medium';
    if (this.activeTab() === tabName) {
      return `${base} border-b-2 border-cyan-500 text-cyan-600`;
    }
    return `${base} border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`;
  }

  toggleColumn(columnId: string): void {
    this.visibleColumns.update(cols => {
      const newCols = new Set(cols);
      if (newCols.has(columnId)) newCols.delete(columnId);
      else newCols.add(columnId);
      return newCols;
    });
  }

  applyDateFilter(): void {
    this.filterFromDate.set('');
    this.filterToDate.set('');
  }

  applyDateRangeFilter(): void {
    this.filterDate.set('');
  }

  onSubmit(): void {
    if (this.allocationForm.invalid) return;

    const formValue = this.allocationForm.value;
    const employee = this.employees().find(e => e.id === formValue.employeeId);
    const project = this.projects().find(p => p.id === formValue.projectId);
    const reportingTo = this.employees().find(e => e.id === formValue.reportingToId);

    if (!employee || !project || !reportingTo) return;

    const allocationData = {
      employeeId: employee.id, employeeName: employee.name,
      badgeId: employee.id.replace('EMP', 'CONSA-'), // Mock badgeId
      projectId: project.id, projectName: project.name,
      reportingToId: reportingTo.id, reportingToName: reportingTo.name,
      billability: formValue.billability, billingRole: formValue.billingRole,
      attendance: formValue.attendance,
      department: 'ENGINEERING', // Mock department
      date: this.filterDate() || new Date().toISOString().split('T')[0]
    };

    const editing = this.editingAllocation();
    if (editing) {
      this.workAllocationService.updateAllocation(editing.id, allocationData);
      this.editingAllocation.set(null);
    } else {
      this.workAllocationService.createAllocation(allocationData);
    }

    this.allocationForm.reset({ employeeId: '', projectId: '', reportingToId: '', billability: '', billingRole: '', attendance: '' });
  }

  openEditModal(allocation: WorkAllocation): void {
    this.editingAllocation.set(allocation);
    this.allocationForm.patchValue({
      employeeId: allocation.employeeId,
      projectId: allocation.projectId,
      reportingToId: allocation.reportingToId,
      billability: allocation.billability,
      billingRole: allocation.billingRole,
      attendance: allocation.attendance,
    });
  }

  deleteAllocation(id: number): void {
    if (confirm('Are you sure you want to delete this allocation?')) {
      this.workAllocationService.deleteAllocation(id);
    }
  }
}
