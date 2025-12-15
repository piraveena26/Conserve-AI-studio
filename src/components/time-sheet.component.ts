import { Component, ChangeDetectionStrategy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Employee, EmployeeService } from '../services/employee.service';
import { UserService } from '../services/user.service';
import { TimesheetProjectService } from '../services/timesheet-project.service';

// --- Interfaces for Data Structure ---
interface TimeEntry {
  startTime: string;
  endTime: string;
}

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
  projectId: string;
}

type TaskLevel = 'New Work' | 'Rework (Internal)' | 'Rework (Client)';

interface TimesheetRecord {
  id: number;
  date: string; // Storing date as YYYY-MM-DD string for easy comparison
  logType: 'task' | 'activity';
  project?: Project;
  taskLevel?: TaskLevel;
  task?: Task;
  customTaskName?: string;
  activity?: string;
  timeEntries: TimeEntry[];
  totalMinutes: number;
}

interface EmployeeTimesheetSubmission {
  id: number;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  approvalDate: string | null;
  submissionDate: string;
  totalHours: string;
  comment: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface TimesheetProject {
  id: number;
  name: string;
  client: string;
  startDate: string;
  endDate: string;
  estimatedTime: string;
  status: 'Commercially Open' | 'On Hold';
  description: string;
  assignedTo: string[]; // employee ids
}


@Component({
  selector: 'app-time-sheet',
  template: `
    <div class="space-y-6 w-full">
      <h1 class="text-3xl font-bold text-slate-800">Timesheet Management</h1>

      <!-- Main Tabs -->
      <div class="border-b border-slate-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button (click)="setActiveTab('timesheet')" [class]="getTabClass('timesheet')">Timesheet</button>
          <button (click)="setActiveTab('myTimeSheets')" [class]="getTabClass('myTimeSheets')">My TimeSheets</button>
          <button (click)="setActiveTab('employeeTimeSheets')" [class]="getTabClass('employeeTimeSheets')">Employee's TimeSheets</button>
          <button (click)="setActiveTab('projects')" [class]="getTabClass('projects')">Projects for Timesheet</button>
        </nav>
      </div>

      <!-- Tab Content -->
      @switch (activeTab()) {
        @case ('timesheet') {
          <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6">
            <!-- Top Bar: Progress, Date, and Log Type -->
            <div class="flex items-center justify-between gap-6">
              <div class="w-full max-w-sm">
                <div class="relative w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" [style.width]="progressWidth()"></div>
                </div>
              </div>
              <div class="flex items-center gap-2 text-slate-600 font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{{ totalHoursDisplay() }}</span>
              </div>
              <div class="relative">
                <input type="date" [value]="selectedDate()" (change)="onDateChange($event)" class="form-input block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
              <div class="flex items-center p-1 bg-slate-100 rounded-lg">
                <button (click)="setLogType('task')" class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors" [class]="activeLogType() === 'task' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-200'">
                  Tasks
                </button>
                <button (click)="setLogType('activity')" class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors" [class]="activeLogType() === 'activity' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-200'">
                  Activities
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
              <!-- Left: Form -->
              <div class="lg:col-span-2">
                <form [formGroup]="recordForm" (ngSubmit)="addRecord()" class="space-y-5">
                  @if (activeLogType() === 'task') {
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Project*</label>
                        <select formControlName="project" class="form-select w-full border-slate-300 rounded-md">
                          <option value="" disabled>Select a project</option>
                          @for(project of projects(); track project.id) { <option [ngValue]="project">{{ project.name }}</option> }
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Task Level*</label>
                        <select formControlName="taskLevel" class="form-select w-full border-slate-300 rounded-md">
                          <option value="" disabled>Select a level</option>
                          @for(level of taskLevels; track level) { <option [value]="level">{{ level }}</option> }
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Task*</label>
                        <select formControlName="task" class="form-select w-full border-slate-300 rounded-md">
                          <option value="" disabled>Select a task</option>
                          @for(task of availableTasks(); track task.id) { <option [ngValue]="task">{{ task.name }}</option> }
                        </select>
                      </div>
                    </div>
                     @if (isCustomTaskSelected()) {
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Task Name*</label>
                        <textarea formControlName="customTaskName" placeholder="Enter custom task details" rows="2" class="form-input w-full border-slate-300 rounded-md"></textarea>
                      </div>
                    }
                  } @else {
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Activity*</label>
                      <input formControlName="activity" type="text" placeholder="Describe your activity" class="form-input w-full border-slate-300 rounded-md">
                    </div>
                  }

                  <div formArrayName="timeEntries" class="space-y-3">
                    @for (entry of timeEntriesArray.controls; track $index) {
                      <div [formGroupName]="$index" class="flex items-center gap-4">
                        <div class="flex-1">
                          <label class="block text-sm font-medium text-slate-700 mb-1">Start Time*</label>
                          <input type="time" formControlName="startTime" class="form-input w-full border-slate-300 rounded-md">
                        </div>
                        <div class="flex-1">
                          <label class="block text-sm font-medium text-slate-700 mb-1">End Time*</label>
                          <input type="time" formControlName="endTime" class="form-input w-full border-slate-300 rounded-md">
                        </div>
                         <button (click)="removeTimeEntry($index)" type="button" [disabled]="timeEntriesArray.controls.length <= 1" class="mt-6 p-2 text-slate-400 hover:text-red-600 disabled:text-slate-300 disabled:cursor-not-allowed rounded-full hover:bg-slate-100">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>
                         </button>
                        @if ($last) {
                           <button (click)="addTimeEntry()" type="button" class="mt-6 p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" /></svg>
                           </button>
                        } @else {
                          <div class="w-9 h-9 mt-6"></div> <!-- Placeholder for alignment -->
                        }
                      </div>
                    }
                  </div>

                  <div class="pt-2">
                    <button type="submit" [disabled]="recordForm.invalid" class="px-6 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-md disabled:bg-slate-400 disabled:cursor-not-allowed">
                      Add Record
                    </button>
                  </div>
                </form>
              </div>

              <!-- Right: Records -->
              <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 h-full">
                <h3 class="font-bold text-slate-800">Records for {{ formatDate(selectedDate()) }}</h3>
                <div class="mt-1 text-sm text-slate-500">
                  <p><span class="font-semibold">Status:</span> <span class="text-yellow-600 font-bold">{{ status() }}</span></p>
                  <p><span class="font-semibold">Reporting to:</span> {{ reportingTo() }}</p>
                </div>
                <div class="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
                  @for (record of recordsForSelectedDate(); track record.id) {
                    <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div class="flex justify-between items-start">
                        <p class="font-semibold text-sm text-slate-800">{{ getRecordTitle(record) }}</p>
                        <div class="flex items-center gap-2">
                           <button class="text-slate-400 hover:text-green-600">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                           </button>
                           <button (click)="deleteRecord(record.id)" class="text-slate-400 hover:text-red-600">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                           </button>
                        </div>
                      </div>
                      @for (entry of record.timeEntries; track entry) {
                        <p class="text-xs text-slate-600 font-mono">{{ formatTime(entry.startTime) }} - {{ formatTime(entry.endTime) }}</p>
                      }
                      <p class="text-xs text-slate-500 mt-2">
                        <span class="font-bold">({{ formatDuration(record.totalMinutes) }})</span> on {{ formatDate(record.date) }}
                      </p>
                    </div>
                  } @empty {
                    <div class="text-center py-10">
                      <p class="text-sm text-slate-500">No records for this date.</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }
        @case ('myTimeSheets') { 
           <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-slate-800">My Recorded Timesheets</h2>
              <div class="flex items-center p-1 bg-slate-100 rounded-lg">
                <button (click)="myTimesheetsViewMode.set('card')" class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2" [class]="myTimesheetsViewMode() === 'card' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-200'">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  Card View
                </button>
                <button (click)="myTimesheetsViewMode.set('table')" class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2" [class]="myTimesheetsViewMode() === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-200'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>
                  Table View
                </button>
              </div>
            </div>
            
            @if(myTimesheetsViewMode() === 'card') {
                <div class="space-y-6">
                  @for(group of recordsByDate(); track group.date) {
                    <div>
                      <h3 class="font-semibold text-slate-700 mb-2 pb-2 border-b">{{ formatDate(group.date) }}</h3>
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        @for(record of group.records; track record.id) {
                          <div class="bg-slate-50 border border-slate-200 rounded-md p-3">
                            <p class="font-semibold text-sm text-slate-800">{{ getRecordTitle(record) }}</p>
                            @if(record.logType === 'task') {
                                <p class="text-xs text-slate-500">{{ record.taskLevel }}</p>
                            }
                            <div class="mt-2">
                              @for (entry of record.timeEntries; track entry) {
                                <p class="text-xs text-slate-600 font-mono">{{ formatTime(entry.startTime) }} - {{ formatTime(entry.endTime) }}</p>
                              }
                            </div>
                            <p class="text-sm font-bold text-slate-700 mt-2">{{ formatDuration(record.totalMinutes) }}</p>
                          </div>
                        }
                      </div>
                    </div>
                  } @empty {
                     <div class="text-center py-10">
                        <p class="text-slate-500">No timesheets recorded yet.</p>
                    </div>
                  }
                </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-slate-500">
                  <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" class="px-6 py-3">Date</th>
                      <th scope="col" class="px-6 py-3">Details</th>
                      <th scope="col" class="px-6 py-3">Time Entries</th>
                      <th scope="col" class="px-6 py-3">Total Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for(record of timesheetRecords(); track record.id) {
                       <tr class="bg-white border-b hover:bg-slate-50">
                          <td class="px-6 py-4">{{ formatDate(record.date) }}</td>
                          <td class="px-6 py-4 font-medium text-slate-900">{{ getRecordTitle(record) }}</td>
                          <td class="px-6 py-4">
                            @for(entry of record.timeEntries; track entry) {
                              <span class="font-mono text-xs">{{ formatTime(entry.startTime) }} - {{ formatTime(entry.endTime) }}</span><br>
                            }
                          </td>
                          <td class="px-6 py-4 font-semibold">{{ formatDuration(record.totalMinutes) }}</td>
                       </tr>
                    } @empty {
                       <tr>
                         <td colspan="4" class="text-center py-10 text-slate-500">No timesheets recorded yet.</td>
                       </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }
        @case ('employeeTimeSheets') { 
          <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4">
            <!-- Toolbar -->
            <div class="flex items-center justify-between">
              <div class="relative w-full max-w-xs">
                 <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                 </div>
                 <input #searchInput (input)="employeeTimesheetsSearchTerm.set(searchInput.value)" type="text" placeholder="Search..." class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md">
              </div>
              <div class="flex items-center gap-2">
                 <button class="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" /></svg>
                    Excel
                 </button>
                 <button class="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
                    Print
                 </button>
                 <div class="relative">
                    <button (click)="showColumnsDropdown.set(!showColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2">
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
            <div class="overflow-x-auto">
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
                  @for(item of paginatedEmployeeTimesheets(); track item.id) {
                     <tr class="bg-white border-b hover:bg-slate-50">
                        <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"></td>
                        @if(visibleColumns().has('id')) { <td class="px-6 py-4">{{ item.id }}</td> }
                        @if(visibleColumns().has('employee')) { <td class="px-6 py-4 font-medium text-slate-900">{{ item.employeeName }}</td> }
                        @if(visibleColumns().has('startDate')) { <td class="px-6 py-4">{{ item.startDate }}</td> }
                        @if(visibleColumns().has('endDate')) { <td class="px-6 py-4">{{ item.endDate }}</td> }
                        @if(visibleColumns().has('approvalDate')) { <td class="px-6 py-4">{{ item.approvalDate || 'N/A' }}</td> }
                        @if(visibleColumns().has('submissionDate')) { <td class="px-6 py-4">{{ item.submissionDate }}</td> }
                        @if(visibleColumns().has('totalHours')) { <td class="px-6 py-4">{{ item.totalHours }}</td> }
                        @if(visibleColumns().has('comment')) { <td class="px-6 py-4">{{ item.comment || 'N/A' }}</td> }
                        @if(visibleColumns().has('status')) { 
                          <td class="px-6 py-4">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" [class]="getStatusClass(item.status)">
                              {{ item.status }}
                            </span>
                          </td> 
                        }
                        @if(visibleColumns().has('actions')) {
                          <td class="px-6 py-4">
                            @if(item.status === 'PENDING') {
                              <div class="flex items-center gap-2">
                                <button (click)="updateSubmissionStatus(item.id, 'APPROVED')" class="px-2 py-1 text-xs text-white bg-green-600 rounded-md hover:bg-green-700">Approve</button>
                                <button (click)="updateSubmissionStatus(item.id, 'REJECTED')" class="px-2 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700">Reject</button>
                              </div>
                            } @else {
                                <button class="p-2 rounded-full hover:bg-slate-200">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                                </button>
                            }
                          </td>
                        }
                     </tr>
                  } @empty {
                    <tr>
                      <td [attr.colspan]="visibleColumns().size + 1" class="text-center py-10 text-slate-500">No employee timesheets found.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <!-- Pagination -->
            <div class="flex items-center justify-between pt-2">
              <div class="text-sm text-slate-600">
                Items per page:
                <select #itemsPerPageSelect (change)="itemsPerPage.set(+itemsPerPageSelect.value)" class="form-select text-sm p-1 border-slate-300 rounded-md">
                  <option value="5">5</option>
                  <option value="10" selected>10</option>
                  <option value="20">20</option>
                </select>
              </div>
              <div class="text-sm text-slate-600">
                {{ paginationSummary() }}
              </div>
              <div class="flex items-center gap-1">
                 <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 1" class="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                 </button>
                 <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() === totalPages()" class="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-md">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                 </button>
              </div>
            </div>
          </div>
        }
        @case ('projects') { 
          <div class="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-slate-800">Time Sheets</h2>
              <button (click)="openProjectModal(null)" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                New Project
              </button>
            </div>
            <!-- Toolbar -->
            <div class="flex items-center justify-between">
              <div class="relative w-full max-w-xs">
                 <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                 </div>
                 <input #projectSearchInput (input)="projectSearchTerm.set(projectSearchInput.value)" type="text" placeholder="Search..." class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md">
              </div>
               <div class="flex items-center gap-2">
                 <button class="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" /></svg>
                    Excel
                 </button>
                 <button class="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
                    Print
                 </button>
                 <button class="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 flex items-center gap-2">
                      Columns to Display <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                 </button>
              </div>
            </div>
             <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left text-slate-500">
                <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                   <tr>
                    <th class="px-2 py-3"><input type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"></th>
                    <th scope="col" class="px-6 py-3">Id</th>
                    <th scope="col" class="px-6 py-3">Name</th>
                    <th scope="col" class="px-6 py-3">Client</th>
                    <th scope="col" class="px-6 py-3">Start Date</th>
                    <th scope="col" class="px-6 py-3">End Date</th>
                    <th scope="col" class="px-6 py-3">Estimated Time</th>
                    <th scope="col" class="px-6 py-3">Status</th>
                    <th scope="col" class="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                 <tbody>
                  @for(project of paginatedTimesheetProjects(); track project.id) {
                    <tr class="bg-white border-b hover:bg-slate-50">
                      <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"></td>
                      <td class="px-6 py-4">{{ project.id }}</td>
                      <td class="px-6 py-4 font-medium text-slate-900">{{ project.name }}</td>
                      <td class="px-6 py-4">{{ project.client }}</td>
                      <td class="px-6 py-4">{{ project.startDate | date:'mediumDate' }}</td>
                      <td class="px-6 py-4">{{ project.endDate | date:'mediumDate' }}</td>
                      <td class="px-6 py-4">{{ project.estimatedTime }}</td>
                      <td class="px-6 py-4">{{ project.status }}</td>
                      <td class="px-6 py-4">
                        <button (click)="openProjectModal(project)" class="p-2 rounded-full hover:bg-slate-200">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="9" class="text-center py-10">No projects found.</td></tr>
                  }
                 </tbody>
              </table>
            </div>
             <!-- Pagination -->
            <div class="flex items-center justify-between pt-2">
              <div class="text-sm text-slate-600">
                 Items per page:
                <select #projectItemsPerPageSelect (change)="projectItemsPerPage.set(+projectItemsPerPageSelect.value)" class="form-select text-sm p-1 border-slate-300 rounded-md">
                  <option value="5">5</option>
                  <option value="10" selected>10</option>
                  <option value="20">20</option>
                </select>
              </div>
              <div class="text-sm text-slate-600">
                {{ projectPaginationSummary() }}
              </div>
              <div class="flex items-center gap-1">
                 <button (click)="changeProjectPage(projectCurrentPage() - 1)" [disabled]="projectCurrentPage() === 1" class="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                 </button>
                 <button (click)="changeProjectPage(projectCurrentPage() + 1)" [disabled]="projectCurrentPage() === projectTotalPages()" class="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-md">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                 </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
    
    <!-- Add/Edit Project Modal -->
    @if(showProjectModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" (click)="closeProjectModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" (click)="$event.stopPropagation()">
           <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-semibold text-slate-800">{{ editingProject() ? 'Edit Project' : 'New Project' }}</h3>
            <button (click)="closeProjectModal()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="p-6 flex-grow overflow-y-auto">
            <form [formGroup]="projectForm" (ngSubmit)="onProjectSubmit()" class="space-y-4">
              <div>
                <label for="projectName" class="block text-sm font-medium text-slate-700">Project Name*</label>
                <input type="text" id="projectName" formControlName="projectName" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                @if(projectForm.get('projectName')?.invalid && projectForm.get('projectName')?.touched) {
                  <p class="text-xs text-red-600 mt-1">Project Name is required.</p>
                }
              </div>
              <div>
                <label for="projectDescription" class="block text-sm font-medium text-slate-700">Project Description*</label>
                <textarea id="projectDescription" formControlName="projectDescription" rows="3" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2"></textarea>
                 @if(projectForm.get('projectDescription')?.invalid && projectForm.get('projectDescription')?.touched) {
                  <p class="text-xs text-red-600 mt-1">Project Description is required.</p>
                }
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="startDate" class="block text-sm font-medium text-slate-700">Start Date*</label>
                  <input type="date" id="startDate" formControlName="startDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                </div>
                 <div>
                  <label for="endDate" class="block text-sm font-medium text-slate-700">End Date*</label>
                  <input type="date" id="endDate" formControlName="endDate" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
                </div>
              </div>
              <div>
                <label for="client" class="block text-sm font-medium text-slate-700">Client</label>
                <input type="text" id="client" formControlName="client" placeholder="Enter client name" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2">
              </div>
              <div>
                <label for="assignedTo" class="block text-sm font-medium text-slate-700">Assigned to:*</label>
                <select multiple id="assignedTo" formControlName="assignedTo" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 h-32">
                  @for (employee of allEmployeesForProjects(); track employee.id) {
                    <option [value]="employee.id">{{ employee.name }}</option>
                  }
                </select>
                <p class="text-xs text-slate-500 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple employees.</p>
              </div>
            </form>
          </div>
          <div class="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg">
            <button (click)="closeProjectModal()" type="button" class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">Cancel</button>
            <button (click)="onProjectSubmit()" [disabled]="projectForm.invalid" type="submit" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
              {{ editingProject() ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TimeSheetComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly userService = inject(UserService);
  private readonly timesheetProjectService = inject(TimesheetProjectService);

  // --- Constants ---
  private readonly CUSTOM_TASK: Task = { id: 'custom', name: 'Custom Task', projectId: '*' };

  // --- UI State ---
  activeTab = signal<'timesheet' | 'myTimeSheets' | 'employeeTimeSheets' | 'projects'>('timesheet');
  activeLogType = signal<'task' | 'activity'>('task');
  selectedDate = signal(this.formatDateForInput('2025-12-12'));
  myTimesheetsViewMode = signal<'card' | 'table'>('card');

  // --- Data ---
  private nextRecordId = signal(2);
  reportingTo = signal('Venkatesh S');
  status = signal('PENDING');

  taskLevels: TaskLevel[] = ['New Work', 'Rework (Internal)', 'Rework (Client)'];

  allTasks = signal<Task[]>([
    { id: 't0', projectId: '1518', name: 'Perform UAT' },
    { id: 't1', projectId: '1516', name: 'Client meeting' },
    { id: 't2', projectId: '1515', name: 'Design Database Schema' },
    { id: 't3', projectId: '1526', name: 'Splash Screen Design' },
    { id: 't4', projectId: '1523', name: 'Setup Push Notifications' },
    { id: 't5', projectId: '1514', name: 'Configure S3 Buckets' },
  ]);

  timesheetRecords = signal<TimesheetRecord[]>([]);

  // --- Form ---
  recordForm = new FormGroup({
    project: new FormControl<Project | null>(null, Validators.required),
    taskLevel: new FormControl<TaskLevel | null>(null, Validators.required),
    task: new FormControl<Task | null>(this.CUSTOM_TASK, Validators.required),
    customTaskName: new FormControl<string | null>(null),
    activity: new FormControl<string | null>(null),
    timeEntries: new FormArray([
      new FormGroup({
        startTime: new FormControl('09:00', Validators.required),
        endTime: new FormControl('17:00', Validators.required)
      })
    ])
  });

  constructor() {
    const initialTasks = this.allTasks();
    const projectForRecord = { id: '1518', name: 'testing Timesheet' };
    const taskForRecord = initialTasks.find(t => t.id === 't0');

    this.timesheetRecords.set([
      {
        id: 1,
        date: '2025-12-12',
        logType: 'task',
        project: projectForRecord,
        taskLevel: 'New Work',
        task: taskForRecord,
        timeEntries: [{ startTime: '16:00', endTime: '19:30' }],
        totalMinutes: 210
      }
    ]);

    this.updateFormValidators();

    this.recordForm.get('project')?.valueChanges.subscribe(() => {
      this.recordForm.get('task')?.setValue(this.CUSTOM_TASK);
      this.recordForm.get('customTaskName')?.reset();
    });

    effect(() => {
      this.updateFormValidators();
    });
  }

  // --- Computed Signals ---
  currentUser = this.userService.currentUser;
  currentUserEmployeeId = computed(() => this.currentUser()?.employeeId);

  projects = computed(() => {
    const employeeId = this.currentUserEmployeeId();
    if (!employeeId) {
      return [];
    }
    return this.timesheetProjects()
      .filter(p => p.assignedTo.includes(employeeId))
      .map(p => ({ id: p.id.toString(), name: p.name }));
  });

  recordsForSelectedDate = computed(() => this.timesheetRecords().filter(r => r.date === this.selectedDate()));
  totalMinutes = computed(() => this.recordsForSelectedDate().reduce((acc, curr) => acc + curr.totalMinutes, 0));
  totalHoursDisplay = computed(() => this.formatDuration(this.totalMinutes()));
  progressWidth = computed(() => {
    const totalMinutes = this.totalMinutes();
    const workdayMinutes = 8 * 60; // 8-hour workday
    const percentage = Math.min((totalMinutes / workdayMinutes) * 100, 100);
    return `${percentage}%`;
  });
  availableTasks = computed(() => {
    const selectedProject = this.recordForm.get('project')?.value;
    if (!selectedProject) return [this.CUSTOM_TASK];
    const projectTasks = this.allTasks().filter(t => t.projectId === selectedProject.id);
    return [...projectTasks, this.CUSTOM_TASK];
  });
  isCustomTaskSelected = computed(() => this.recordForm.get('task')?.value?.id === this.CUSTOM_TASK.id);

  recordsByDate = computed(() => {
    const records = this.timesheetRecords();
    const grouped = new Map<string, TimesheetRecord[]>();

    const sortedRecords = [...records].sort((a, b) => {
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      return b.id - a.id;
    });

    for (const record of sortedRecords) {
      if (!grouped.has(record.date)) {
        grouped.set(record.date, []);
      }
      grouped.get(record.date)!.push(record);
    }
    return Array.from(grouped.entries()).map(([date, records]) => ({ date, records }));
  });

  get timeEntriesArray() {
    return this.recordForm.get('timeEntries') as FormArray;
  }

  private updateFormValidators() {
    const logType = this.activeLogType();
    const projectControl = this.recordForm.get('project');
    const taskLevelControl = this.recordForm.get('taskLevel');
    const taskControl = this.recordForm.get('task');
    const customTaskNameControl = this.recordForm.get('customTaskName');
    const activityControl = this.recordForm.get('activity');

    if (logType === 'task') {
      projectControl?.setValidators(Validators.required);
      taskLevelControl?.setValidators(Validators.required);
      taskControl?.setValidators(Validators.required);
      activityControl?.clearValidators();
      activityControl?.setValue(null);

      if (this.isCustomTaskSelected()) {
        customTaskNameControl?.setValidators(Validators.required);
      } else {
        customTaskNameControl?.clearValidators();
        customTaskNameControl?.setValue(null);
      }
    } else {
      projectControl?.clearValidators();
      projectControl?.setValue(null);
      taskLevelControl?.clearValidators();
      taskLevelControl?.setValue(null);
      taskControl?.clearValidators();
      taskControl?.setValue(null);
      customTaskNameControl?.clearValidators();
      customTaskNameControl?.setValue(null);
      activityControl?.setValidators(Validators.required);
    }
    projectControl?.updateValueAndValidity();
    taskLevelControl?.updateValueAndValidity();
    taskControl?.updateValueAndValidity();
    customTaskNameControl?.updateValueAndValidity();
    activityControl?.updateValueAndValidity();
  }

  addTimeEntry() {
    this.timeEntriesArray.push(new FormGroup({
      startTime: new FormControl('', Validators.required),
      endTime: new FormControl('', Validators.required)
    }));
  }

  removeTimeEntry(index: number) {
    if (this.timeEntriesArray.length > 1) {
      this.timeEntriesArray.removeAt(index);
    }
  }

  addRecord() {
    if (this.recordForm.invalid) return;

    const formValue = this.recordForm.value;
    const totalMinutes = (formValue.timeEntries || []).reduce((acc, entry) => {
      if (entry && entry.startTime && entry.endTime) {
        return acc + this.calculateMinutes(entry.startTime, entry.endTime);
      }
      return acc;
    }, 0);

    const newRecord: TimesheetRecord = {
      id: this.nextRecordId(),
      date: this.selectedDate(),
      logType: this.activeLogType(),
      project: formValue.project ?? undefined,
      taskLevel: formValue.taskLevel ?? undefined,
      task: formValue.task ?? undefined,
      customTaskName: formValue.customTaskName ?? undefined,
      activity: formValue.activity ?? undefined,
      timeEntries: formValue.timeEntries as TimeEntry[],
      totalMinutes,
    };

    this.timesheetRecords.update(records => [...records, newRecord]);
    this.nextRecordId.update(id => id + 1);

    this.timeEntriesArray.clear();
    this.timeEntriesArray.push(new FormGroup({
      startTime: new FormControl('09:00', Validators.required),
      endTime: new FormControl('17:00', Validators.required)
    }));
    this.recordForm.reset({
      project: null,
      taskLevel: null,
      task: this.CUSTOM_TASK
    });
  }

  deleteRecord(id: number) {
    this.timesheetRecords.update(records => records.filter(r => r.id !== id));
  }

  setActiveTab(tab: 'timesheet' | 'myTimeSheets' | 'employeeTimeSheets' | 'projects') { this.activeTab.set(tab); }
  setLogType(type: 'task' | 'activity') { this.activeLogType.set(type); }
  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(input.value);
  }

  // --- Employee's Timesheets Logic ---
  employeeTimesheetsSearchTerm = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(10);
  showColumnsDropdown = signal(false);

  allColumns = [
    { id: 'id', name: 'Id' }, { id: 'employee', name: 'Employee' },
    { id: 'startDate', name: 'Start Date' }, { id: 'endDate', name: 'End Date' },
    { id: 'approvalDate', name: 'Approval Date' }, { id: 'submissionDate', name: 'Submission Date' },
    { id: 'totalHours', name: 'Total Hours' }, { id: 'comment', name: 'Comment' },
    { id: 'status', name: 'Status' }, { id: 'actions', name: 'Actions' }
  ];
  visibleColumns = signal(new Set(this.allColumns.map(c => c.id)));

  employeeTimesheetSubmissions = signal<EmployeeTimesheetSubmission[]>([
    { id: 853, employeeId: 'EMP005', employeeName: 'Thenu Kunam', startDate: '2025-12-12', endDate: '2025-12-12', approvalDate: null, submissionDate: '2025-12-12', totalHours: '9h 30m', comment: null, status: 'PENDING' },
    { id: 854, employeeId: 'EMP005', employeeName: 'Thenu Kunam', startDate: '2025-12-09', endDate: '2025-12-09', approvalDate: null, submissionDate: '2025-12-12', totalHours: '8h 30m', comment: null, status: 'PENDING' },
    { id: 824, employeeId: 'EMP006', employeeName: 'Surya Narayanan R', startDate: '2025-11-26', endDate: '2025-11-26', approvalDate: '2025-11-26', submissionDate: '2025-11-26', totalHours: '12h 50m', comment: 'Closed', status: 'APPROVED' },
    { id: 825, employeeId: 'EMP007', employeeName: 'Michael Chen', startDate: '2025-11-25', endDate: '2025-11-25', approvalDate: '2025-11-26', submissionDate: '2025-11-25', totalHours: '8h 00m', comment: 'Rejected due to missing details', status: 'REJECTED' },
  ]);

  filteredEmployeeTimesheets = computed(() => {
    const term = this.employeeTimesheetsSearchTerm().toLowerCase();
    return this.employeeTimesheetSubmissions().filter(s => s.employeeName.toLowerCase().includes(term));
  });

  totalPages = computed(() => Math.ceil(this.filteredEmployeeTimesheets().length / this.itemsPerPage()));

  paginatedEmployeeTimesheets = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredEmployeeTimesheets().slice(start, end);
  });

  paginationSummary = computed(() => {
    const total = this.filteredEmployeeTimesheets().length;
    if (total === 0) return '0 of 0';
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    const end = Math.min(start + this.itemsPerPage() - 1, total);
    return `${start} - ${end} of ${total}`;
  });

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
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

  updateSubmissionStatus(id: number, status: 'APPROVED' | 'REJECTED'): void {
    this.employeeTimesheetSubmissions.update(submissions =>
      submissions.map(s => s.id === id ? { ...s, status, approvalDate: this.formatDateForInput(new Date()) } : s)
    );
  }

  getStatusClass(status: 'PENDING' | 'APPROVED' | 'REJECTED'): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
    }
  }

  // --- Projects for Timesheet Logic ---
  showProjectModal = signal(false);
  editingProject = signal<TimesheetProject | null>(null);
  allEmployeesForProjects = computed(() => this.employeeService.employees().map(e => ({ id: e.id, name: e.name })));
  projectSearchTerm = signal('');
  projectCurrentPage = signal(1);
  projectItemsPerPage = signal(10);

  timesheetProjects = this.timesheetProjectService.projects;

  projectForm = new FormGroup({
    projectName: new FormControl('', Validators.required),
    projectDescription: new FormControl('', Validators.required),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
    client: new FormControl(''),
    assignedTo: new FormControl<string[]>([], Validators.required),
  });

  filteredTimesheetProjects = computed(() => {
    const term = this.projectSearchTerm().toLowerCase();
    if (!term) return this.timesheetProjects();
    return this.timesheetProjects().filter(p => p.name.toLowerCase().includes(term) || p.client.toLowerCase().includes(term));
  });

  projectTotalPages = computed(() => Math.ceil(this.filteredTimesheetProjects().length / this.projectItemsPerPage()));

  paginatedTimesheetProjects = computed(() => {
    const start = (this.projectCurrentPage() - 1) * this.projectItemsPerPage();
    const end = start + this.projectItemsPerPage();
    return this.filteredTimesheetProjects().slice(start, end);
  });

  projectPaginationSummary = computed(() => {
    const total = this.filteredTimesheetProjects().length;
    if (total === 0) return '0 of 0';
    const start = (this.projectCurrentPage() - 1) * this.projectItemsPerPage() + 1;
    const end = Math.min(start + this.projectItemsPerPage() - 1, total);
    return `${start} - ${end} of ${total}`;
  });

  changeProjectPage(page: number): void {
    if (page >= 1 && page <= this.projectTotalPages()) {
      this.projectCurrentPage.set(page);
    }
  }

  openProjectModal(project: TimesheetProject | null) {
    if (project) {
      this.editingProject.set(project);
      this.projectForm.setValue({
        projectName: project.name,
        projectDescription: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        client: project.client,
        assignedTo: project.assignedTo,
      });
    } else {
      this.editingProject.set(null);
      this.projectForm.reset();
    }
    this.showProjectModal.set(true);
  }

  closeProjectModal() {
    this.showProjectModal.set(false);
    this.editingProject.set(null);
  }

  onProjectSubmit() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const formVal = this.projectForm.getRawValue();
    const projectData = {
      name: formVal.projectName!,
      description: formVal.projectDescription!,
      client: formVal.client!,
      startDate: formVal.startDate!,
      endDate: formVal.endDate!,
      assignedTo: formVal.assignedTo!,
      estimatedTime: this.calculateEstimatedTime(formVal.startDate!, formVal.endDate!),
      status: 'Commercially Open' as const,
    };

    const currentProject = this.editingProject();
    if (currentProject) {
      this.timesheetProjectService.updateProject({ ...currentProject, ...projectData });
    } else {
      this.timesheetProjectService.addProject(projectData);
    }
    this.closeProjectModal();
  }

  calculateEstimatedTime(start: string, end: string): string {
    if (!start || !end) return '0';
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate > endDate) return '0';
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} days, 0:00:00`;
  }

  // --- Template Helpers ---
  getTabClass(tabName: string) {
    const base = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm';
    return this.activeTab() === tabName
      ? `${base} border-indigo-500 text-indigo-600`
      : `${base} border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`;
  }

  getRecordTitle(record: TimesheetRecord): string {
    if (record.logType === 'task') {
      const taskName = record.task?.id === this.CUSTOM_TASK.id
        ? record.customTaskName
        : record.task?.name;
      return `Timesheet for ${record.project?.name} - ${taskName || 'work'}`;
    }
    return record.activity || 'Activity';
  }

  private calculateMinutes(start: string, end: string): number {
    const startDate = new Date(`1970-01-01T${start}:00`);
    const endDate = new Date(`1970-01-01T${end}:00`);
    let diff = (endDate.getTime() - startDate.getTime()) / 60000;
    if (diff < 0) diff += 24 * 60;
    return diff;
  }

  formatDuration(totalMinutes: number): string {
    if (totalMinutes < 0) return '0m';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  private formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const d = new Date();
    d.setHours(parseInt(hours, 10));
    d.setMinutes(parseInt(minutes, 10));
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}
