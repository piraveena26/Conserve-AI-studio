import { Component, ChangeDetectionStrategy, input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee, EmployeeService } from '../services/employee.service';

type InfoTab = 'information' | 'education' | 'professional' | 'identification' | 'attendance' | 'projects' | 'timesheet' | 'assessments';

@Component({
  selector: 'app-employee-360',
  template: `
    @if (employee(); as emp) {
      <div class="space-y-6">
        <!-- Profile Header -->
        <div class="bg-white rounded-lg shadow-md p-6 relative">
           <button class="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-green-100 text-slate-500 hover:text-green-600">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
             </svg>
           </button>
          <div class="flex items-start space-x-6">
            <img class="h-28 w-28 rounded-lg object-cover border-4 border-white shadow-lg" [src]="emp.avatar" [alt]="emp.name">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h1 class="text-2xl font-bold text-slate-800">{{ emp.name }}</h1>
                <!-- FIX: Make status badge dynamic -->
                <span class="px-2 py-0.5 text-xs font-semibold rounded-full flex items-center" [class]="getStatusColor(emp.status)">
                  <svg class="w-2 h-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                  {{ emp.status }}
                </span>
              </div>
              <div class="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm text-slate-600">
                <div class="flex items-center space-x-2">
                   <div class="p-1.5 bg-blue-100 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                   <span>{{ emp.designation }}</span>
                </div>
                 <div class="flex items-center space-x-2">
                   <div class="p-1.5 bg-green-100 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                   <span>Saudi Arabia</span>
                </div>
                <div class="flex items-center space-x-2">
                   <div class="p-1.5 bg-purple-100 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                   <span>{{ emp.email }}</span>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div class="p-3 rounded-lg bg-gradient-to-br from-green-100 to-green-200 border border-green-200">
                  <div class="flex items-center space-x-2">
                     <div class="p-2 bg-green-500 rounded-md text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.134 0V7.418zM10 16a2.5 2.5 0 001.134-.302v-1.698c-.155.103-.346.196-.567-.267a2.5 2.5 0 01-1.134 0v1.698A2.5 2.5 0 0010 16zm-5-8.5a2.5 2.5 0 001.134.302v1.698c-.155-.103-.346-.196-.567-.267a2.5 2.5 0 01-1.134 0V7.802A2.5 2.5 0 005 7.5zm10 0a2.5 2.5 0 00-1.134.302v1.698c.155-.103.346-.196.567-.267a2.5 2.5 0 011.134 0V7.802A2.5 2.5 0 0015 7.5z" /><path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l6 2.5a1 1 0 01.504.868v8.998a1 1 0 01-.504.868l-6 2.5a1 1 0 01-.992 0l-6-2.5a1 1 0 01-.504-.868V4.5a1 1 0 01.504-.868l6-2.5zM10 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clip-rule="evenodd" /></svg></div>
                    <span class="text-sm font-semibold text-slate-700">Earnings</span>
                  </div>
                  <p class="mt-2 text-2xl font-bold text-slate-800">$0</p>
                </div>
                <div class="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200">
                  <div class="flex items-center space-x-2">
                     <div class="p-2 bg-blue-500 rounded-md text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 3a3 3 0 013-3h2a3 3 0 013 3v2a3 3 0 01-3 3H9a3 3 0 01-3-3V3zm2 1a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V4z" clip-rule="evenodd" /><path d="M3 10a3 3 0 013-3h8a3 3 0 013 3v6a3 3 0 01-3 3H6a3 3 0 01-3-3v-6zm3-1a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1v-6a1 1 0 00-1-1H6z" /></svg></div>
                    <span class="text-sm font-semibold text-slate-700">Projects</span>
                  </div>
                  <p class="mt-2 text-2xl font-bold text-slate-800">1</p>
                </div>
                <div class="p-3 rounded-lg bg-gradient-to-br from-yellow-100 to-amber-200 border border-amber-200">
                  <div class="flex items-center space-x-2">
                     <div class="p-2 bg-amber-500 rounded-md text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg></div>
                    <span class="text-sm font-semibold text-slate-700">Success Rate</span>
                  </div>
                  <p class="mt-2 text-2xl font-bold text-slate-800">0%</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="border-b border-slate-200 mt-6">
            <nav class="-mb-px flex space-x-6 overflow-x-auto">
              @for(tab of tabs; track tab.id) {
                 <button (click)="activeTab.set(tab.id)" [class]="getTabClass(tab.id)">
                   <svg [innerHTML]="tab.icon" class="h-5 w-5 mr-2"></svg>
                   <span>{{ tab.name }}</span>
                 </button>
              }
            </nav>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="mt-6">
          @switch (activeTab()) {
            @case ('information') {
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Basic Information -->
                <div class="bg-white rounded-lg shadow-md">
                  <div class="p-4 border-b flex justify-between items-center bg-violet-50 rounded-t-lg">
                    <div class="flex items-center space-x-3">
                       <div class="p-2 bg-violet-200 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                      <div>
                        <h3 class="text-lg font-bold text-slate-800">Basic Information</h3>
                        <p class="text-sm text-slate-500">Employee information summary</p>
                      </div>
                    </div>
                    <button class="p-2 rounded-full hover:bg-green-100 text-green-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                  </div>
                  <dl class="p-6 space-y-4 text-sm">
                    @for(item of basicInfo(); track item.label) {
                      <div class="flex justify-between items-center">
                        <dt class="text-slate-500 flex items-center space-x-2"><div class="w-2.5 h-2.5 bg-violet-200 rounded-sm"></div><span>{{ item.label }}</span></dt>
                        <dd class="font-semibold text-slate-800 text-right">{{ item.value }}</dd>
                      </div>
                    }
                  </dl>
                </div>
                <!-- Personal Information -->
                <div class="bg-white rounded-lg shadow-md">
                  <div class="p-4 border-b flex justify-between items-center bg-blue-50 rounded-t-lg">
                    <div class="flex items-center space-x-3">
                       <div class="p-2 bg-blue-200 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6" /></svg></div>
                      <div>
                        <h3 class="text-lg font-bold text-slate-800">Personal Information</h3>
                        <p class="text-sm text-slate-500">Emergency and Personal information</p>
                      </div>
                    </div>
                     <button class="p-2 rounded-full hover:bg-green-100 text-green-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                  </div>
                  <dl class="p-6 space-y-4 text-sm">
                     @for(item of personalInfo(); track item.label) {
                      <div class="flex justify-between items-center">
                        <dt class="text-slate-500 flex items-center space-x-2"><div class="w-2.5 h-2.5 bg-blue-200 rounded-sm"></div><span>{{ item.label }}</span></dt>
                        <dd class="font-semibold text-slate-800 text-right">{{ item.value }}</dd>
                      </div>
                    }
                  </dl>
                </div>
              </div>
            }
            @case ('identification') {
              <div class="bg-white rounded-lg shadow-md">
                <div class="p-4 border-b flex justify-between items-center bg-blue-50 rounded-t-lg">
                  <div class="flex items-center space-x-3">
                      <div class="p-2 bg-blue-200 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6" />
                      </svg></div>
                    <div>
                      <h3 class="text-lg font-bold text-slate-800">Identification</h3>
                      <p class="text-sm text-slate-500">Official identification documents</p>
                    </div>
                  </div>
                  <button class="p-2 rounded-full hover:bg-green-100 text-green-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                </div>
                <dl class="p-6 space-y-4 text-sm">
                  <div class="flex justify-between items-center">
                    <dt class="text-slate-500 flex items-center space-x-2"><div class="w-2.5 h-2.5 bg-blue-200 rounded-sm"></div><span>National ID</span></dt>
                    <dd class="font-semibold text-slate-800 text-right">{{ emp.identification.nationalId || 'N/A' }}</dd>
                  </div>
                  <div class="flex justify-between items-center">
                    <dt class="text-slate-500 flex items-center space-x-2"><div class="w-2.5 h-2.5 bg-blue-200 rounded-sm"></div><span>Passport Number</span></dt>
                    <dd class="font-semibold text-slate-800 text-right">{{ emp.identification.passport || 'N/A' }}</dd>
                  </div>
                </dl>
              </div>
            }
            @default {
              <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-bold">{{ activeTab() | titlecase }}</h3>
                <p class="text-slate-500 mt-2">Content for this section is not yet implemented.</p>
              </div>
            }
          }
        </div>
      </div>
    } @else {
      <div class="text-center p-10 bg-white rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-slate-700">Employee Not Found</h2>
        <p class="text-slate-500 mt-2">The selected employee could not be found. Please go back and select a valid employee.</p>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class Employee360Component {
  employeeId = input.required<string>();
  private readonly employeeService = inject(EmployeeService);

  activeTab = signal<InfoTab>('information');
  
  employee = computed(() => 
    this.employeeService.employees().find(e => e.id === this.employeeId())
  );

  // FIX: Populate all fields and fix bug where `Employment Status` would render as [object Object].
  basicInfo = computed(() => {
    const emp = this.employee();
    if (!emp) return [];
    return [
      { label: 'First Name', value: emp.firstName || 'N/A' },
      { label: 'Last Name', value: emp.lastName || 'N/A' },
      { label: 'Badge ID', value: emp.employeeId || 'N/A' },
      { label: 'Email', value: emp.email || 'N/A' },
      { label: 'Official Email', value: emp.email || 'N/A' },
      { label: 'Date of Joining', value: emp.orgDateOfJoining || 'N/A' },
      { label: 'KAS DOJ', value: emp.ksaEmploymentJoining || 'N/A' },
      { label: 'Employment Status', value: emp.status || 'N/A' },
      { label: 'Employment Type', value: emp.employmentType || 'N/A' },
      { label: 'Designation', value: emp.designation || 'N/A' },
    ];
  });
  
  // FIX: Correctly access `permanentAddress` and populate all other `N/A` fields.
  personalInfo = computed(() => {
    const emp = this.employee();
    if (!emp) return [];
    return [
      { label: 'Father Name', value: emp.personalDetails.fatherOrSpouseName || 'N/A' },
      { label: 'Permanent Address', value: emp.personalDetails.permanentAddress || 'N/A' },
      { label: 'Residential Address', value: emp.personalDetails.residentialAddress || 'N/A' },
      { label: 'Gender', value: emp.gender || 'N/A' },
      { label: 'Marital Status', value: emp.personalDetails.maritalStatus || 'N/A' },
      { label: 'Blood Group', value: emp.personalDetails.bloodGroup || 'N/A' },
      { label: 'Phone', value: emp.phoneNumber || 'N/A' },
      { label: 'Alternate Phone', value: emp.alternateContact || 'N/A' },
      { label: 'Date Of Birth', value: emp.personalDetails.dateOfBirth || 'N/A' },
      { label: 'Nationality', value: emp.nationality || 'N/A' },
    ];
  });

  tabs: {id: InfoTab, name: string, icon: string}[] = [
    { id: 'information', name: 'Information', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />' },
    { id: 'education', name: 'Education', icon: '<path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A12.052 12.052 0 0012 20.055a12.052 12.052 0 00-6.824-5.002 12.083 12.083 0 01.665-6.479L12 14z" /><path d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />' },
    { id: 'professional', name: 'Professional', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />' },
    { id: 'identification', name: 'Identification', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6" />' },
    { id: 'attendance', name: 'Attendance', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />' },
    { id: 'projects', name: 'Projects', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />' },
    { id: 'timesheet', name: 'Timesheet', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />' },
    { id: 'assessments', name: 'Assessments', icon: '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />' },
  ];
  
  // FIX: Fix type error by removing invalid statuses 'Inactive' and 'On Leave' and adding missing valid statuses.
  getStatusColor(status: Employee['status']): string {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Resigned': return 'bg-rose-100 text-rose-800';
      case 'Absconded': return 'bg-orange-100 text-orange-800';
      case 'Terminated': return 'bg-red-100 text-red-800';
      case 'Transferred': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  getTabClass(tabId: InfoTab): string {
    const base = 'flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors';
    return this.activeTab() === tabId 
      ? `${base} border-blue-500 text-blue-600`
      : `${base} border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300`;
  }
}
