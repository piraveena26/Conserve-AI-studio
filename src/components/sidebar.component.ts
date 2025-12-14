
import { Component, ChangeDetectionStrategy, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside class="w-64 bg-white/70 backdrop-blur-xl text-gray-800 flex-shrink-0 flex flex-col border-r border-white/30">
      <div class="h-16 flex items-center justify-center px-4 border-b border-white/30">
        <div class="flex items-center">
          <img src="https://img.logoipsum.com/243.svg" alt="Company Logo" class="h-8">
        </div>
      </div>
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        
        <a href="#" (click)="changeView('dashboard', $event)" [class]="getLinkClass('dashboard', true)">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span>Dashboard</span>
        </a>

        <!-- PMS Configuration -->
        <div>
          <button (click)="toggleMenu('pms')" [class]="getButtonClass('pms_')">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l-1.414-1.414m12.728 12.728l-1.414-1.414M18.364 5.636l-1.414 1.414m-12.728 12.728l-1.414-1.414M12 12a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>PMS Configuration</span>
            </span>
            <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!openMenus().has('pms')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          @if(openMenus().has('pms')) {
            <div class="mt-2 space-y-1 pl-9">
              <a href="#" (click)="changeView('pms_periods', $event)" [class]="getLinkClass('pms_periods')">Periods</a>
              <a href="#" (click)="changeView('pms_goals', $event)" [class]="getLinkClass('pms_goals')">Goals</a>
              <a href="#" (click)="changeView('pms_metrics', $event)" [class]="getLinkClass('pms_metrics')">Metrics</a>
              <a href="#" (click)="changeView('pms_form_template', $event)" [class]="getLinkClass('pms_form_template')">Form Template</a>
            </div>
          }
        </div>

        <!-- System Configuration -->
        <div>
          <button (click)="toggleMenu('system')" [class]="getButtonClass('config_')">
             <span class="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>System Configuration</span>
            </span>
            <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!openMenus().has('system')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          @if(openMenus().has('system')) {
            <div class="mt-2 space-y-1 pl-9">
              <a href="#" (click)="changeView('config_location', $event)" [class]="getLinkClass('config_location')">Location Configuration</a>
              <a href="#" (click)="changeView('config_timesheet', $event)" [class]="getLinkClass('config_timesheet')">Timesheet Configuration</a>
              <a href="#" (click)="changeView('config_mail', $event)" [class]="getLinkClass('config_mail')">Mail Configuration</a>
              <a href="#" (click)="changeView('config_financial', $event)" [class]="getLinkClass('config_financial')">Financial Configuration</a>
            </div>
          }
        </div>
        
        <!-- Employee Management -->
        <div>
          <button (click)="toggleMenu('employee')" [class]="getButtonClass('employee')">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Employee Management</span>
            </span>
            <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!openMenus().has('employee')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          @if(openMenus().has('employee')) {
            <div class="mt-2 space-y-1 pl-9">
              <a href="#" (click)="changeView('employee', $event)" [class]="getLinkClass('employee')">Employee</a>
              <a href="#" (click)="changeView('department', $event)" [class]="getLinkClass('department')">Department</a>
              <a href="#" (click)="changeView('designation', $event)" [class]="getLinkClass('designation')">Designation</a>
              <a href="#" (click)="changeView('job_roles', $event)" [class]="getLinkClass('job_roles')">Job Roles</a>
              <a href="#" (click)="changeView('shifts', $event)" [class]="getLinkClass('shifts')">Shifts</a>
            </div>
          }
        </div>

        <!-- Users Management -->
        <div>
          <button (click)="toggleMenu('user')" [class]="getButtonClass('user_')">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a6 6 0 00-12 0v2" />
              </svg>
              <span>Users Management</span>
            </span>
             <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!openMenus().has('user')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          @if(openMenus().has('user')) {
            <div class="mt-2 space-y-1 pl-9">
              <a href="#" (click)="changeView('users', $event)" [class]="getLinkClass('users')">Users</a>
              <a href="#" (click)="changeView('user_requests', $event)" [class]="getLinkClass('user_requests')">User Requests</a>
              <a href="#" (click)="changeView('user_groups', $event)" [class]="getLinkClass('user_groups')">User Groups</a>
              <a href="#" (click)="changeView('guest_users', $event)" [class]="getLinkClass('guest_users')">Guest Users</a>
            </div>
          }
        </div>

        <!-- Time Management -->
        <div>
          <button (click)="toggleMenu('time')" [class]="getButtonClass('time_')">
            <span class="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              <span>Time Management</span>
            </span>
             <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!openMenus().has('time')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          @if(openMenus().has('time')) {
            <div class="mt-2 space-y-1 pl-9">
              <a href="#" (click)="changeView('time_sheet', $event)" [class]="getLinkClass('time_sheet')">Time Sheet</a>
              <a href="#" (click)="changeView('leave', $event)" [class]="getLinkClass('leave')">Leave</a>
              <a href="#" (click)="changeView('attendance', $event)" [class]="getLinkClass('attendance')">Attendance</a>
              <a href="#" (click)="changeView('holidays', $event)" [class]="getLinkClass('holidays')">Holidays</a>
              <a href="#" (click)="changeView('work_allocation', $event)" [class]="getLinkClass('work_allocation')">Work Allocation</a>
            </div>
          }
        </div>

        <!-- Project Management -->
        <div>
          <button (click)="toggleMenu('project')" [class]="getButtonClass('project_')">
            <span class="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              <span>Project Management</span>
            </span>
             <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!openMenus().has('project')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          @if(openMenus().has('project')) {
            <div class="mt-2 space-y-1 pl-9">
              <a href="#" (click)="changeView('project_enquiry', $event)" [class]="getLinkClass('project_enquiry')">Enquiry</a>
              <a href="#" (click)="changeView('project_proposals', $event)" [class]="getLinkClass('project_proposals')">Proposals</a>
              <a href="#" (click)="changeView('project_projects', $event)" [class]="getLinkClass('project_projects')">Projects</a>
            </div>
          }
        </div>

        <!-- Invoice Management -->
        <div>
          <button (click)="toggleMenu('invoice')" [class]="getButtonClass('invoice_')">
            <span class="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
              <span>Invoice Management</span>
            </span>
             <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!openMenus().has('invoice')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          @if(openMenus().has('invoice')) {
            <div class="mt-2 space-y-1 pl-9">
              <a href="#" (click)="changeView('invoice_milestone', $event)" [class]="getLinkClass('invoice_milestone')">Milestone Invoice</a>
              <a href="#" (click)="changeView('invoice_monthly', $event)" [class]="getLinkClass('invoice_monthly')">Monthly Invoice</a>
              <a href="#" (click)="changeView('invoice_prorata', $event)" [class]="getLinkClass('invoice_prorata')">Pro-rata Invoice</a>
              <a href="#" (click)="changeView('invoice_tracking', $event)" [class]="getLinkClass('invoice_tracking')">Invoice Tracking</a>
            </div>
          }
        </div>

        <!-- Accounts Management -->
        <div>
          <button (click)="toggleMenu('accounts')" [class]="getButtonClass('accounts_')">
            <span class="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
               </svg>
              <span>Accounts Management</span>
            </span>
             <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!openMenus().has('accounts')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          @if(openMenus().has('accounts')) {
            <div class="mt-2 space-y-1 pl-9">
              <a href="#" (click)="changeView('accounts_board', $event)" [class]="getLinkClass('accounts_board')">Accounts Board</a>
              <a href="#" (click)="changeView('accounts_main', $event)" [class]="getLinkClass('accounts_main')">Accounts</a>
              <a href="#" (click)="changeView('accounts_daybook', $event)" [class]="getLinkClass('accounts_daybook')">Daybook</a>
              <a href="#" (click)="changeView('accounts_reports', $event)" [class]="getLinkClass('accounts_reports')">Reports</a>
              <a href="#" (click)="changeView('accounts_bank', $event)" [class]="getLinkClass('accounts_bank')">Bank</a>
            </div>
          }
        </div>

        <!-- Statement of Accounts -->
        <div>
          <button (click)="toggleMenu('statement')" [class]="getButtonClass('statement_of_account')">
            <span class="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
              <span>Statement of Accounts</span>
            </span>
             <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!openMenus().has('statement')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          @if(openMenus().has('statement')) {
            <div class="mt-2 space-y-1 pl-9">
              <a href="#" (click)="changeView('statement_of_account_main', $event)" [class]="getLinkClass('statement_of_account_main')">Statement of Account</a>
              <a href="#" (click)="changeView('statement_of_account_all_clients', $event)" [class]="getLinkClass('statement_of_account_all_clients')">All Clients</a>
            </div>
          }
        </div>

        <!-- Reports Management -->
        <div>
          <button (click)="toggleMenu('reports')" [class]="getButtonClass('reports_')">
            <span class="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
              <span>Reports Management</span>
            </span>
             <svg class="h-5 w-5 transform transition-transform duration-200" [class.rotate-180]="!openMenus().has('reports')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          @if(openMenus().has('reports')) {
            <div class="mt-2 space-y-1 pl-9">
              <a href="#" (click)="changeView('reports_enquiry_dashboard', $event)" [class]="getLinkClass('reports_enquiry_dashboard')">Enquiry dashboard</a>
              <a href="#" (click)="changeView('reports_proposal_dashboard', $event)" [class]="getLinkClass('reports_proposal_dashboard')">Proposal dashboard</a>
              <a href="#" (click)="changeView('reports_project_dashboard', $event)" [class]="getLinkClass('reports_project_dashboard')">Project dashboard</a>
              <a href="#" (click)="changeView('reports_invoice_tracker', $event)" [class]="getLinkClass('reports_invoice_tracker')">Invoice tracker</a>
              <a href="#" (click)="changeView('reports_po_tracker', $event)" [class]="getLinkClass('reports_po_tracker')">PO tracker</a>
              <a href="#" (click)="changeView('reports_payment_follow_up', $event)" [class]="getLinkClass('reports_payment_follow_up')">Payment follow-up tracker</a>
              <a href="#" (click)="changeView('reports_consolidated', $event)" [class]="getLinkClass('reports_consolidated')">Consolidated report</a>
              <a href="#" (click)="changeView('reports_payment_tracker', $event)" [class]="getLinkClass('reports_payment_tracker')">Payment tracker</a>
            </div>
          }
        </div>

      </nav>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class SidebarComponent {
  activeView = input.required<string>();
  viewChanged = output<string>();

  openMenus = signal(new Set(['employee']));

  toggleMenu(menu: string) {
    this.openMenus.update(menus => {
      const newMenus = new Set(menus);
      if (newMenus.has(menu)) {
        newMenus.delete(menu);
      } else {
        newMenus.add(menu);
      }
      return newMenus;
    });
  }
  
  changeView(view: string, event: Event): void {
    event.preventDefault();
    this.viewChanged.emit(view);
  }
  
  getButtonClass(viewPrefix: string): string {
    const baseClasses = 'w-full flex items-center justify-between text-left text-sm font-medium text-gray-600 hover:bg-black/5 p-2.5 rounded-lg transition-all duration-200 transform';
    if (this.activeView().startsWith(viewPrefix)) {
        return `${baseClasses} bg-black/5 font-semibold text-gray-800`;
    }
    return `${baseClasses} hover:translate-x-1`;
  }

  getLinkClass(view: string, isExact: boolean = false): string {
    const baseClasses = 'block px-3 py-2.5 text-sm rounded-lg transition-all duration-200 flex items-center transform';
    let isActive = isExact ? this.activeView() === view : this.activeView().startsWith(view);

    if (isActive) {
      return `${baseClasses} bg-blue-100 text-blue-700 font-semibold scale-[1.02] shadow-sm`;
    }
    return `${baseClasses} text-gray-600 hover:bg-black/5 hover:text-gray-900 hover:translate-x-1`;
  }
}
