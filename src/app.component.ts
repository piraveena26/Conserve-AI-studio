
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarComponent } from './components/sidebar.component';
import { HeaderComponent } from './components/header.component';
import { EmployeeComponent } from './components/employee.component';
import { DepartmentComponent } from './components/department.component';
import { DesignationComponent } from './components/designation.component';
import { JobRolesComponent } from './components/job-roles.component';
import { ShiftsComponent } from './components/shifts.component';
import { UsersComponent } from './components/users.component';
import { UserRequestsComponent } from './components/user-requests.component';
import { UserGroupsComponent } from './components/user-groups.component';
import { GuestUsersComponent } from './components/guest-users.component';
import { LocationConfigurationComponent } from './components/location-configuration.component';
import { TimesheetConfigurationComponent } from './components/timesheet-configuration.component';
import { MailConfigurationComponent } from './components/mail-configuration.component';
import { FinancialConfigurationComponent } from './components/financial-configuration.component';
import { TimeSheetComponent } from './components/time-sheet.component';
import { LeaveComponent } from './components/leave.component';
import { AttendanceComponent } from './components/attendance.component';
import { HolidaysComponent } from './components/holidays.component';
import { WorkAllocationComponent } from './components/work-allocation.component';
import { EnquiryComponent } from './components/enquiry.component';
import { ProjectsComponent } from './components/projects.component';
import { DashboardComponent } from './components/dashboard.component';
import { ReportsManagementComponent } from './components/reports-management.component';
import { Employee360Component } from './components/employee-360.component';
import { MilestoneInvoiceComponent } from './components/milestone-invoice.component';
import { MonthlyInvoiceComponent } from './components/monthly-invoice.component';
import { ProRataInvoiceComponent } from './components/pro-rata-invoice.component';
import { InvoiceTrackingComponent } from './components/invoice-tracking.component';
import { InvoiceDetailsComponent } from './components/invoice-details.component';
import { AccountsBoardComponent } from './components/accounts-board.component';
import { AccountsComponent } from './components/accounts.component';
import { DaybookComponent } from './components/daybook.component';
import { AccountReportsComponent } from './components/account-reports.component';
import { BankComponent } from './components/bank.component';
import { AccountsManagementComponent } from './components/accounts-management.component';
import { StatementOfAccountMainComponent } from './components/statement-of-account-main.component';
import { StatementOfAccountAllClientsComponent } from './components/statement-of-account-all-clients.component';
import { StatementOfAccountDetailsComponent } from './components/statement-of-account-details.component';
import { PmsPeriodsComponent } from './components/pms-periods.component';
import { PmsGoalsComponent } from './components/pms-goals.component';
import { PmsMetricsComponent } from './components/pms-metrics.component';
import { PmsFormTemplateComponent } from './components/pms-form-template.component';
import { PmsFormBuilderComponent } from './components/pms-form-builder.component';
import { PmsFormResponsesComponent } from './components/pms-form-responses.component';
import { ProposalComponent } from './components/proposal.component';
import { LoginComponent } from './components/login.component';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-screen'
  },
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    EmployeeComponent,
    DepartmentComponent,
    DesignationComponent,
    JobRolesComponent,
    ShiftsComponent,
    UsersComponent,
    UserRequestsComponent,
    UserGroupsComponent,
    GuestUsersComponent,
    LocationConfigurationComponent,
    TimesheetConfigurationComponent,
    MailConfigurationComponent,
    FinancialConfigurationComponent,
    TimeSheetComponent,
    LeaveComponent,
    AttendanceComponent,
    HolidaysComponent,
    WorkAllocationComponent,
    EnquiryComponent,
    ProjectsComponent,
    DashboardComponent,
    ReportsManagementComponent,
    Employee360Component,
    MilestoneInvoiceComponent,
    MonthlyInvoiceComponent,
    ProRataInvoiceComponent,
    InvoiceTrackingComponent,
    InvoiceDetailsComponent,
    AccountsBoardComponent,
    AccountsComponent,
    DaybookComponent,
    AccountReportsComponent,
    BankComponent,
    AccountsManagementComponent,
    StatementOfAccountMainComponent,
    StatementOfAccountAllClientsComponent,
    StatementOfAccountDetailsComponent,
    PmsPeriodsComponent,
    PmsGoalsComponent,
    PmsMetricsComponent,
    PmsFormTemplateComponent,
    PmsFormBuilderComponent,
    PmsFormResponsesComponent,
    ProposalComponent,
    LoginComponent,
  ],
})
export class AppComponent {
  private userService = inject(UserService);
  
  isLoggedIn = this.userService.isLoggedIn;
  activeView = signal<string>('dashboard');
  selectedEmployeeId = signal<string | null>(null);
  selectedInvoiceProjectId = signal<string | null>(null);
  selectedStatementId = signal<string | null>(null);
  statementViewMode = signal<'project' | 'client'>('project');
  
  private viewHistory = signal<string[]>([]);
  public canGoBack = computed(() => this.viewHistory().length > 0);
  
  currentUserEmployeeId = computed(() => this.userService.currentUser()?.employeeId);

  private readonly viewTitleMap: { [key: string]: string } = {
    dashboard: 'Dashboard',
    employee: 'Employee Management',
    'employee-360': 'Employee 360',
    my_profile: 'My Profile',
    department: 'Department',
    designation: 'Designation',
    job_roles: 'Job Roles',
    shifts: 'Shifts',
    users: 'Users Management',
    user_requests: 'User Requests',
    user_groups: 'User Groups',
    guest_users: 'Guest Users',
    config_location: 'Location Configuration',
    config_timesheet: 'Timesheet Configuration',
    config_mail: 'Mail Configuration',
    config_financial: 'Financial Configuration',
    time_sheet: 'Time Management',
    leave: 'Leave Management',
    attendance: 'Attendance',
    holidays: 'Holidays',
    work_allocation: 'Work Allocation',
    project_enquiry: 'Enquiry',
    project_proposals: 'Proposals',
    project_projects: 'Projects',
    invoice_milestone: 'Milestone Invoice',
    invoice_monthly: 'Monthly Invoice',
    invoice_prorata: 'Pro-rata Invoice',
    invoice_tracking: 'Invoice Tracking',
    invoice_details: 'Invoices Details',
    statement_of_account_main: 'Statement of Account',
    statement_of_account_details: 'Statement of Account Details',
    statement_of_account_all_clients: 'All Clients',
    accounts_board: 'Accounts Board',
    accounts_main: 'Accounts',
    accounts_daybook: 'Daybook',
    accounts_reports: 'Account Reports',
    accounts_bank: 'Bank',
    reports_enquiry_dashboard: 'Enquiry Dashboard',
    reports_proposal_dashboard: 'Proposal Dashboard',
    reports_project_dashboard: 'Project Dashboard',
    reports_invoice_tracker: 'Invoice Tracker',
    reports_po_tracker: 'PO Tracker',
    reports_payment_follow_up: 'Payment Follow-up Tracker',
    reports_consolidated: 'Consolidated Report',
    reports_payment_tracker: 'Payment Tracker',
    pms_periods: 'PMS Periods',
    pms_goals: 'PMS Goals',
    pms_metrics: 'PMS Metrics',
    pms_form_template: 'PMS Form Template',
  };

  currentTitle = computed(() => this.viewTitleMap[this.activeView()] ?? 'Dashboard');

  private navigateTo(view: string): void {
    const currentView = this.activeView();
    if (view !== currentView) {
      this.viewHistory.update(history => [...history, currentView]);
      this.activeView.set(view);
    }
  }

  handleViewChange(view: string): void {
    if (view !== 'employee-360') {
      this.selectedEmployeeId.set(null);
    }
    if (view !== 'invoice_details') {
      this.selectedInvoiceProjectId.set(null);
    }
    if (view !== 'statement_of_account_details') {
      this.selectedStatementId.set(null);
    }
    this.navigateTo(view);
  }
  
  showEmployeeProfile(employeeId: string): void {
    this.selectedEmployeeId.set(employeeId);
    this.navigateTo('employee-360');
  }

  showInvoiceDetails(projectId: string): void {
    this.selectedInvoiceProjectId.set(projectId);
    this.navigateTo('invoice_details');
  }

  showStatementProjectDetails(projectId: string): void {
    this.selectedStatementId.set(projectId);
    this.statementViewMode.set('project');
    this.navigateTo('statement_of_account_details');
  }

  showStatementClientDetails(projectId: string): void {
    this.selectedStatementId.set(projectId);
    this.statementViewMode.set('client');
    this.navigateTo('statement_of_account_details');
  }

  handleGoBack(): void {
    const history = this.viewHistory();
    if (history.length > 0) {
        const previousView = history[history.length - 1];
        this.viewHistory.update(h => h.slice(0, -1));
        this.activeView.set(previousView);
    }
  }

  handleLogout(): void {
    this.userService.logout();
    this.activeView.set('dashboard');
    this.viewHistory.set([]);
  }
}
