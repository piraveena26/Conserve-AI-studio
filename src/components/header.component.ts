import { Component, ChangeDetectionStrategy, input, output, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-header',
  template: `
    <header class="h-16 bg-white/70 backdrop-blur-xl shadow-sm flex-shrink-0 flex items-center justify-between px-4 sm:px-6">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
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
        
        <div class="flex items-center space-x-2">
          <!-- Check-in/Check-out button -->
          <button (click)="toggleTimer()" 
                  class="px-4 py-2 border rounded-full text-sm font-semibold flex items-center space-x-2 transition-colors w-32 justify-center"
                  [class]="isRunning() ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'">
            @if (isRunning()) {
              <!-- Check Out Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            } @else {
              <!-- Check In Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
              </svg>
            }
            <span class="font-mono tracking-wider">{{ formattedTime() }}</span>
          </button>

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
        
        <!-- User Profile -->
        <div class="relative">
          <button class="flex items-center space-x-2 focus:outline-none p-1.5 rounded-lg hover:bg-gray-100">
            <img class="h-9 w-9 rounded-full object-cover" [src]="currentUser()?.avatar" alt="User avatar">
            <div class="text-left hidden md:block">
              <div class="text-sm font-semibold text-gray-800">{{ currentUser()?.name }}</div>
              <div class="text-xs text-gray-500">{{ currentUserDesignation() }}</div>
            </div>
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class HeaderComponent implements OnDestroy {
  title = input.required<string>();
  activeView = input.required<string>();
  viewChanged = output<string>();
  
  private userService = inject(UserService);
  private employeeService = inject(EmployeeService);
  
  private timerId: any = null;
  isRunning = signal(false);
  startTime = signal<number | null>(null);
  elapsedTime = signal(0); // in seconds

  formattedTime = computed(() => {
    const totalSeconds = this.elapsedTime();
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  });

  toggleTimer(): void {
    if (this.isRunning()) {
        // Stop the timer
        this.isRunning.set(false);
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.startTime.set(null);
        this.elapsedTime.set(0); // Reset for next time
    } else {
        // Start the timer
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
    }
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
}