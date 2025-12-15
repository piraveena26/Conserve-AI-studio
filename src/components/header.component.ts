
import { Component, ChangeDetectionStrategy, input, output, computed, inject, signal, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserService } from '../services/user.service';
import { EmployeeService, AttendanceService } from '../services/employee.service';
import { ShiftService, Shift } from '../services/shift.service';

@Component({
  selector: 'app-header',
  template: `
    <header class="relative z-10 h-16 bg-white/70 backdrop-blur-xl shadow-sm flex-shrink-0 flex items-center justify-between px-4 sm:px-6">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        @if (canGoBack()) {
          <button (click)="goBack.emit()" class="mr-2 flex items-center justify-center h-9 w-9 rounded-lg border border-blue-200 text-slate-600 hover:bg-slate-100 hover:border-blue-400 transition-colors" title="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        }
        <button (click)="viewChanged.emit('dashboard')" class="hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>
        <span class="text-gray-300">/</span>
        <span class="font-medium text-gray-800">{{ breadcrumb() }}</span>
        @if(activeView() === 'employee-360') {
          <span class="text-gray-300">/</span>
          <span class="font-medium text-gray-800">Employee 360</span>
        }
      </div>
      <div class="flex items-center space-x-4">
        
        <div class="relative">
          <button #checkinButton (click)="toggleTimer()" [disabled]="isCheckinDisabled()"
                  class="px-4 py-2 border rounded-full text-sm font-semibold flex items-center space-x-2 transition-colors w-32 justify-center bg-white hover:bg-cyan-50 border-cyan-400 text-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-400">
            @if (isRunning()) {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-2m-4-2h8m0 0l-3-3m3 3l-3 3" />
              </svg>
              <span class="font-mono tracking-wider">{{ formattedTime() }}</span>
            } @else {
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" /></svg>
              <span>{{ hasCheckedInToday() ? 'Completed' : 'Check In' }}</span>
            }
          </button>
          
          @if(showCheckinDropdown()) {
            <div #checkinDropdown class="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-4">
              <form [formGroup]="checkinForm" (ngSubmit)="onCheckinSubmit()">
                <h3 class="font-semibold text-slate-800 mb-4 text-base">Start your shift</h3>
                <div class="space-y-4">
                  <input type="text" formControlName="location" placeholder="Location" class="form-input w-full rounded-md border-slate-300 p-2 text-sm">
                  <select formControlName="locationType" class="form-select w-full rounded-md border-slate-300 p-2 text-sm bg-white">
                    <option value="" disabled>Location Type</option>
                    @for(type of locationTypes; track type) {
                      <option [value]="type">{{type}}</option>
                    }
                  </select>
                  <select formControlName="shift" class="form-select w-full rounded-md border-slate-300 p-2 text-sm bg-white">
                    <option [ngValue]="null" disabled>Shift</option>
                    @for(s of shifts(); track s.id) {
                      <option [ngValue]="s">{{ s.name }} ({{ s.startTime }} - {{ s.endTime }})</option>
                    }
                  </select>
                </div>
                <div class="flex justify-end mt-4">
                  <button type="submit" [disabled]="checkinForm.invalid" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                    Check In
                  </button>
                </div>
              </form>
            </div>
          }
        </div>

        <div class="flex items-center space-x-2">
          <!-- Settings button -->
          <button class="p-2 h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <button class="p-2 rounded-full hover:bg-gray-100 text-gray-500">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 16a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        
        <!-- User Profile Dropdown -->
        <div class="relative">
          <button #dropdownButton (click)="toggleDropdown()" class="flex items-center space-x-2 focus:outline-none p-1.5 rounded-lg hover:bg-gray-100/80 transition-colors">
            <img class="h-9 w-9 rounded-full object-cover" [src]="currentUser()?.avatar" alt="User avatar">
            <div class="text-left hidden md:block">
              <div class="text-sm font-semibold text-gray-800">{{ currentUser()?.name }}</div>
              <div class="text-xs text-gray-500">{{ currentUserDesignation() }}</div>
            </div>
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 transition-transform" [class.rotate-180]="isDropdownOpen()" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          @if (isDropdownOpen()) {
            <div #dropdownMenu class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200/50 py-1 z-50">
              <button (click)="onMyProfileClick()" class="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">My Profile</button>
              <a href="#" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Settings</a>
              <div class="border-t border-slate-100 my-1"></div>
              <button (click)="onLogout()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                Logout
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})
export class HeaderComponent implements OnDestroy {
  title = input.required<string>();
  activeView = input.required<string>();
  canGoBack = input<boolean>(false);
  viewChanged = output<string>();
  logout = output<void>();
  goBack = output<void>();

  private userService = inject(UserService);
  private employeeService = inject(EmployeeService);
  private shiftService = inject(ShiftService);
  private attendanceService = inject(AttendanceService);
  private fb = inject(FormBuilder);

  private timerId: any = null;
  isRunning = signal(false);
  startTime = signal<number | null>(null);
  elapsedTime = signal(0); // in seconds
  showCheckinDropdown = signal(false);

  shifts = this.shiftService.shifts;
  locationTypes: Array<'Office' | 'Project site' | 'Remote'> = ['Office', 'Project site', 'Remote'];
  checkinForm: FormGroup;

  isDropdownOpen = signal(false);

  hasCheckedInToday = computed(() => {
    const user = this.currentUser();
    if (!user?.employeeId) return false;
    return this.attendanceService.hasCheckedInToday(user.employeeId);
  });

  isCheckinDisabled = computed(() => !this.isRunning() && this.hasCheckedInToday());

  @ViewChild('dropdownButton') dropdownButton?: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu?: ElementRef;
  @ViewChild('checkinButton') checkinButton?: ElementRef;
  @ViewChild('checkinDropdown') checkinDropdown?: ElementRef;

  formattedTime = computed(() => {
    const totalSeconds = this.elapsedTime();
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  });

  constructor() {
    this.checkinForm = this.fb.group({
      location: ['', Validators.required],
      locationType: ['', Validators.required],
      shift: [null as Shift | null, Validators.required]
    });

    const currentUser = this.userService.currentUser();
    if (currentUser?.employeeId) {
      const activeCheckin = this.attendanceService.getActiveCheckin(currentUser.employeeId);
      if (activeCheckin) {
        this.isRunning.set(true);
        this.startTime.set(activeCheckin.checkIn.getTime());
        this.timerId = setInterval(() => {
          const now = Date.now();
          const start = this.startTime();
          if (start) {
            this.elapsedTime.set(Math.floor((now - start) / 1000));
          }
        }, 1000);
      }
    }
  }

  toggleTimer(): void {
    if (this.isRunning()) {
      this.onCheckout();
    } else if (!this.hasCheckedInToday()) {
      this.showCheckinDropdown.set(true);
    }
  }

  onCheckinSubmit(): void {
    if (this.checkinForm.invalid) return;

    const currentUser = this.userService.currentUser();
    if (!currentUser || !currentUser.employeeId) return;

    const formValue = this.checkinForm.value;

    try {
      this.attendanceService.checkIn({
        employeeId: currentUser.employeeId,
        location: formValue.location,
        locationType: formValue.locationType,
        shift: formValue.shift.name,
      });

      this.isRunning.set(true);
      this.startTime.set(Date.now());
      this.elapsedTime.set(0);
      this.timerId = setInterval(() => {
        const now = Date.now();
        const start = this.startTime();
        if (start) {
          this.elapsedTime.set(Math.floor((now - start) / 1000));
        }
      }, 1000);

      this.showCheckinDropdown.set(false);
      this.checkinForm.reset({ locationType: '', shift: null });
    } catch (error) {
      alert((error as Error).message);
      this.showCheckinDropdown.set(false);
    }
  }

  onCheckout(): void {
    const currentUser = this.userService.currentUser();
    if (!currentUser || !currentUser.employeeId) return;

    this.attendanceService.checkOut(currentUser.employeeId);

    this.isRunning.set(false);
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.startTime.set(null);
    this.elapsedTime.set(0);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  currentUser = this.userService.currentUser;

  currentUserDesignation = computed(() => {
    const user = this.currentUser();
    if (!user || !user.employeeId) return 'N/A';

    const employee = this.employeeService.employees().find(e => e.id === user.employeeId);
    return employee?.designation || 'N/A';
  });

  breadcrumb = computed(() => {
    const title = this.title();
    if (title.includes('Management')) {
      return title.replace('Management', '').trim();
    }
    return title;
  });

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  onMyProfileClick(): void {
    this.closeDropdown();
    this.viewChanged.emit('my_profile');
  }

  onLogout(): void {
    this.closeDropdown();
    this.logout.emit();
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (this.dropdownButton?.nativeElement.contains(target)) {
      return;
    }

    if (this.isDropdownOpen() && this.dropdownMenu && !this.dropdownMenu.nativeElement.contains(target)) {
      this.closeDropdown();
    }

    if (this.showCheckinDropdown() && this.checkinDropdown && !this.checkinDropdown.nativeElement.contains(target) && !this.checkinButton?.nativeElement.contains(target)) {
      this.showCheckinDropdown.set(false);
    }
  }
}
