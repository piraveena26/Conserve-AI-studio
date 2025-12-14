
import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AttendanceService, AttendanceRecord, EmployeeService, LeaveService } from '../services/employee.service';
import { UserService } from '../services/user.service';

interface DisplayRecord extends AttendanceRecord {
  employeeName: string;
}

@Component({
  selector: 'app-attendance',
  template: `
    <div class="space-y-6">
      <div class="w-full">
        <div class="flex justify-center space-x-8 border-b border-gray-200">
            <button (click)="activeReport.set('self')" class="relative py-4 px-4 text-sm font-medium"
                [class]="activeReport() === 'self' ? 'text-cyan-600' : 'text-gray-500 hover:text-gray-700'">
                Self-Attendance Report
                @if(activeReport() === 'self') {
                    <span class="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500"></span>
                }
            </button>
            <button (click)="activeReport.set('all')" class="relative py-4 px-4 text-sm font-medium"
                [class]="activeReport() === 'all' ? 'text-cyan-600' : 'text-gray-500 hover:text-gray-700'">
                All Attendance Report
                @if(activeReport() === 'all') {
                    <span class="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500"></span>
                }
            </button>
        </div>
      </div>

      @if (activeReport() === 'all') {
        <div class="space-y-6">
            <div class="relative w-fit">
                <label for="filterByDate" class="block text-xs font-medium text-slate-500 mb-1">Filter by Date</label>
                <div class="relative">
                    <input #dateInput type="date" id="filterByDate" [value]="selectedDate()" (change)="selectedDate.set(dateInput.value)" class="form-input rounded-md border-slate-300 shadow-sm pr-10">
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>
                    </div>
                </div>
            </div>
            
            @if(attendanceStats(); as stats) {
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <!-- Total -->
                    <div class="bg-white p-4 rounded-lg shadow-md border border-blue-200 flex justify-between items-center">
                        <div>
                            <p class="text-sm font-semibold text-blue-800">Total</p>
                            <p class="text-3xl font-bold text-slate-800">{{ stats.total }}</p>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                    </div>
                    <!-- Checked-in -->
                    <div class="bg-white p-4 rounded-lg shadow-md border border-green-200 flex justify-between items-center">
                        <div>
                            <p class="text-sm font-semibold text-green-800">Checked-in</p>
                            <p class="text-3xl font-bold text-slate-800">{{ stats.checkedIn }}</p>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <!-- Not Checked -->
                    <div class="bg-white p-4 rounded-lg shadow-md border border-orange-200 flex justify-between items-center">
                        <div>
                            <p class="text-sm font-semibold text-orange-800">Not Checked</p>
                            <p class="text-3xl font-bold text-slate-800">{{ stats.notChecked }}</p>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <!-- On Leave -->
                    <div class="bg-white p-4 rounded-lg shadow-md border border-purple-200 flex justify-between items-center">
                        <div>
                            <p class="text-sm font-semibold text-purple-800">On Leave</p>
                            <p class="text-3xl font-bold text-slate-800">{{ stats.onLeave }}</p>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                    <!-- Absent -->
                    <div class="bg-white p-4 rounded-lg shadow-md border border-red-200 flex justify-between items-center">
                        <div>
                            <p class="text-sm font-semibold text-red-800">Absent</p>
                            <p class="text-3xl font-bold text-slate-800">{{ stats.absent }}</p>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        </div>
                    </div>
                </div>
            }
        </div>
      }

      <!-- Toolbar -->
       <div class="flex items-center justify-between">
        <div class="relative w-full max-w-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
            </div>
            <input #searchInput (input)="searchTerm.set(searchInput.value)" type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-cyan-300 rounded-full bg-white text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500">
        </div>
        <div class="flex items-center space-x-2">
            <button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Excel
            </button>
            <button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd" /></svg>
                Print
            </button>
            <div class="relative">
                <button (click)="showColumnsDropdown.set(!showColumnsDropdown())" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-400 rounded-lg hover:bg-cyan-50">
                    Columns to Display
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
                @if(showColumnsDropdown()) {
                  <div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    @for(col of allColumns; track col.id) {
                      @if (activeReport() === 'all' || col.id !== 'employee') {
                        <label class="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                          <input type="checkbox" [checked]="visibleColumns().has(col.id)" (change)="toggleColumn(col.id)" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500">
                          <span class="ml-3">{{ col.name }}</span>
                        </label>
                      }
                    }
                  </div>
                }
            </div>
        </div>
      </div>
      
      @if (activeReport() === 'self') {
        <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-500">
              <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th class="px-2 py-3"><input type="checkbox" class="h-4 w-4 rounded border-gray-300"></th>
                  @for(col of allColumns; track col.id) {
                    @if (visibleColumns().has(col.id) && col.id !== 'employee') {
                      <th scope="col" class="px-6 py-3">{{ col.name }}</th>
                    }
                  }
                </tr>
              </thead>
              <tbody>
                @for (record of filteredMyRecords(); track record.id) {
                  <tr class="bg-white border-b hover:bg-slate-50">
                    <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 rounded border-gray-300"></td>
                    @if(visibleColumns().has('id')) { <td class="px-6 py-4">{{ record.id }}</td> }
                    @if(visibleColumns().has('date')) { <td class="px-6 py-4">{{ record.date | date:'mediumDate' }}</td> }
                    @if(visibleColumns().has('intime')) { <td class="px-6 py-4">{{ record.checkIn | date:'shortTime' }}</td> }
                    @if(visibleColumns().has('outtime')) { <td class="px-6 py-4">{{ record.checkOut ? (record.checkOut | date:'shortTime') : 'In Progress' }}</td> }
                    @if(visibleColumns().has('workingHrs')) { <td class="px-6 py-4 font-semibold">{{ getDuration(record) }}</td> }
                    @if(visibleColumns().has('locationType')) { <td class="px-6 py-4">{{ record.locationType }}</td> }
                    @if(visibleColumns().has('location')) { <td class="px-6 py-4">{{ record.location }}</td> }
                    @if(visibleColumns().has('attendanceStatus')) { <td class="px-6 py-4"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Present</span></td> }
                    @if(visibleColumns().has('shiftName')) { <td class="px-6 py-4">{{ record.shift }}</td> }
                  </tr>
                } @empty {
                  <tr><td [attr.colspan]="visibleColumns().size" class="px-6 py-10 text-center text-slate-500">No attendance records found.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-500">
              <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th class="px-2 py-3"><input type="checkbox" class="h-4 w-4 rounded border-gray-300"></th>
                  @for(col of allColumns; track col.id) {
                    @if (visibleColumns().has(col.id)) {
                      <th scope="col" class="px-6 py-3">{{ col.name }}</th>
                    }
                  }
                </tr>
              </thead>
              <tbody>
                @for (record of filteredAllRecords(); track record.id) {
                  <tr class="bg-white border-b hover:bg-slate-50">
                    <td class="px-2 py-4"><input type="checkbox" class="h-4 w-4 rounded border-gray-300"></td>
                    @if(visibleColumns().has('id')) { <td class="px-6 py-4">{{ record.id }}</td> }
                    @if(visibleColumns().has('employee')) { <td class="px-6 py-4 font-medium text-slate-800">{{ record.employeeName }}</td> }
                    @if(visibleColumns().has('intime')) { <td class="px-6 py-4">{{ record.checkIn | date:'shortTime' }}</td> }
                    @if(visibleColumns().has('outtime')) { <td class="px-6 py-4">{{ record.checkOut ? (record.checkOut | date:'shortTime') : 'In Progress' }}</td> }
                    @if(visibleColumns().has('workingHrs')) { <td class="px-6 py-4 font-semibold">{{ getDuration(record) }}</td> }
                    @if(visibleColumns().has('attendanceStatus')) { <td class="px-6 py-4"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Present</span></td> }
                    @if(visibleColumns().has('date')) { <td class="px-6 py-4">{{ record.date | date:'mediumDate' }}</td> }
                    @if(visibleColumns().has('locationType')) { <td class="px-6 py-4">{{ record.locationType }}</td> }
                    @if(visibleColumns().has('location')) { <td class="px-6 py-4">{{ record.location }}</td> }
                    @if(visibleColumns().has('shiftName')) { <td class="px-6 py-4">{{ record.shift }}</td> }
                  </tr>
                } @empty {
                  <tr><td [attr.colspan]="visibleColumns().size + 1" class="px-6 py-10 text-center text-slate-500">No attendance records found for this date.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe]
})
export class AttendanceComponent {
  private attendanceService = inject(AttendanceService);
  private userService = inject(UserService);
  private employeeService = inject(EmployeeService);
  private leaveService = inject(LeaveService);

  activeReport = signal<'self' | 'all'>('self');
  searchTerm = signal('');
  showColumnsDropdown = signal(false);
  selectedDate = signal<string>(this.formatDateForInput('2025-12-14'));


  currentUser = this.userService.currentUser;

  private myRecords = computed(() => {
    const userId = this.currentUser()?.employeeId;
    if (!userId) return [];
    return this.attendanceService.records()
      .filter(r => r.employeeId === userId)
      .sort((a,b) => b.checkIn.getTime() - a.checkIn.getTime());
  });

  private allRecords = computed((): DisplayRecord[] => {
    const records = this.attendanceService.records();
    const employees = this.employeeService.employees();
    const employeeMap = new Map(employees.map(e => [e.employeeId, e.name]));

    return records
      .map(r => ({
        ...r,
        employeeName: employeeMap.get(r.employeeId) || 'Unknown Employee'
      }))
      .sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime());
  });
  
  filteredMyRecords = computed(() => {
    const records = this.myRecords();
    const term = this.searchTerm().toLowerCase();
    if (!term) return records;
    return records.filter(r => 
        r.location.toLowerCase().includes(term) || 
        r.shift.toLowerCase().includes(term) ||
        (r.checkOut && this.getDuration(r).includes(term))
    );
  });

  filteredAllRecords = computed(() => {
    const date = this.selectedDate();
    const records = this.allRecords().filter(r => r.date === date);
    const term = this.searchTerm().toLowerCase();
    if (!term) return records;
    return records.filter(r => 
        r.employeeName.toLowerCase().includes(term) ||
        r.location.toLowerCase().includes(term) || 
        r.shift.toLowerCase().includes(term)
    );
  });

  attendanceStats = computed(() => {
    const date = this.selectedDate();
    const allEmployees = this.employeeService.employees();
    const total = allEmployees.length;

    const attendanceRecordsForDate = this.attendanceService.records().filter(r => r.date === date);
    const checkedInIds = new Set(attendanceRecordsForDate.map(r => r.employeeId));
    const checkedIn = checkedInIds.size;
    
    const onLeaveIds = this.leaveService.getOnLeaveEmployeeIdsForDate(date);
    const onLeave = onLeaveIds.length;

    const notChecked = total - checkedIn;
    
    const absent = notChecked - onLeave;
    
    return { total, checkedIn, onLeave, notChecked, absent };
  });

  allColumns = [
    { id: 'id', name: 'Id' },
    { id: 'employee', name: 'Conservian'},
    { id: 'intime', name: 'Intime' },
    { id: 'outtime', name: 'Outtime' },
    { id: 'workingHrs', name: 'Working Hrs' },
    { id: 'attendanceStatus', name: 'Attendance Status' },
    { id: 'date', name: 'Date' },
    { id: 'locationType', name: 'Location Type' },
    { id: 'location', name: 'Location' },
    { id: 'shiftName', name: 'Shift Name' }
  ];

  visibleColumns = signal(new Set(['id', 'employee', 'intime', 'outtime', 'workingHrs', 'attendanceStatus']));
  
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
  
  getDuration(record: AttendanceRecord): string {
    if (!record.checkOut) return '...';
    const durationMs = record.checkOut.getTime() - record.checkIn.getTime();
    if (durationMs < 0) return 'Invalid';
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  private formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    // Adjust for timezone offset to get correct YYYY-MM-DD in local time
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  }
}
