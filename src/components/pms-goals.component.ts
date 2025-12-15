import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// Mocked from other components for dependency
// interface JobRole removed in favor of service import

import { GoalService, PmsGoal } from '../services/goal.service';
import { MetricService, Metric } from '../services/metric.service';
import { JobRoleService, JobRole } from '../services/job-roles.service';

@Component({
  selector: 'app-pms-goals',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-800">Goals</h1>
        <div class="flex items-center gap-4">
          <div class="relative w-full max-w-xs">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
            </div>
            <input #searchInput (input)="searchTerm.set(searchInput.value)" type="text" placeholder="Search goals..." class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md">
          </div>
          <select #roleFilter (change)="selectedJobRoleFilter.set(roleFilter.value)" class="form-select rounded-md border-slate-300 shadow-sm p-2 text-sm">
              <option value="All">All Job Roles</option>
              @for(role of jobRoles(); track role.id) {
                  <option [value]="role.name">{{ role.name }}</option>
              }
          </select>
          <button (click)="openModal(null)" class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
            <span>Add New Goal</span>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <!-- Table -->
        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3">ID</th>
                <th scope="col" class="px-6 py-3">Name</th>
                <th scope="col" class="px-6 py-3">Metrics</th>
                <th scope="col" class="px-6 py-3">Metrics Type</th>
                <th scope="col" class="px-6 py-3">Assessment Period</th>
                <th scope="col" class="px-6 py-3">Planned Weighting</th>
                <th scope="col" class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for(goal of filteredGoals(); track goal.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4">{{ goal.id }}</td>
                  <td class="px-6 py-4 font-medium text-slate-900">{{ goal.goalTitle }}</td>
                  <td class="px-6 py-4">{{ goal.metric.metric }}</td>
                  <td class="px-6 py-4">{{ goal.metric.metricType }}</td>
                  <td class="px-6 py-4">{{ goal.assessmentPeriod }}</td>
                  <td class="px-6 py-4">{{ goal.weightage }}%</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-4">
                      <button (click)="openModal(goal)" class="text-slate-500 hover:text-green-600" title="Edit Goal">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                      </button>
                      <button (click)="promptDelete(goal)" class="text-slate-500 hover:text-red-600" title="Delete Goal">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center p-8 text-slate-500">No goals found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/30 z-40" (click)="closeModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl border border-slate-200" (click)="$event.stopPropagation()">
          <form [formGroup]="goalForm" (ngSubmit)="onSubmit()">
            <div class="p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div>
                <label for="jobRole" class="block text-sm font-medium text-slate-700">Job Role <span class="text-red-500">*</span></label>
                <select id="jobRole" formControlName="jobRole" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                  <option [ngValue]="null" disabled>Select Job Role</option>
                  @for(role of jobRoles(); track role.id) {
                    <option [value]="role.name">{{ role.name }}</option>
                  }
                </select>
              </div>

              <div class="space-y-4">
                <h2 class="text-xl font-bold text-slate-800">Goals Session</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="goalTitle" class="block text-sm font-medium text-slate-700">Goal Title <span class="text-red-500">*</span></label>
                        <input type="text" id="goalTitle" formControlName="goalTitle" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3">
                    </div>
                    <div>
                        <label for="weightage" class="block text-sm font-medium text-slate-700">Weightage (planned) <span class="text-red-500">*</span></label>
                        <input type="number" id="weightage" formControlName="weightage" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3">
                    </div>
                    <div>
                        <label for="metric" class="block text-sm font-medium text-slate-700">Metrics Type <span class="text-red-500">*</span></label>
                        <select id="metric" formControlName="metric" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-white">
                            <option [ngValue]="null" disabled>Select Metric Type</option>
                            @for(m of metrics(); track m.id) {
                                <option [ngValue]="m">{{ m.metricType }}</option>
                            }
                        </select>
                    </div>
                    <div>
                        <label for="metricDesc" class="block text-sm font-medium text-slate-700">Metrics Description <span class="text-red-500">*</span></label>
                        <input type="text" id="metricDesc" [value]="selectedMetric()?.metric || ''" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-slate-100" readonly>
                    </div>
                </div>
              </div>

              <div class="space-y-4">
                <h2 class="text-xl font-bold text-slate-800">BaseLine Description</h2>
                <div>
                  <label for="baseline" class="block text-sm font-medium text-slate-700">Add Baseline (Enter to add) <span class="text-red-500">*</span></label>
                  <textarea id="baseline" formControlName="baseline" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3" rows="3"></textarea>
                </div>
              </div>
              
               <div class="space-y-4">
                <h2 class="text-xl font-bold text-slate-800">Assessment Period</h2>
                 <div>
                    <label for="assessmentPeriod" class="block text-sm font-medium text-slate-700">Assessment Period <span class="text-red-500">*</span></label>
                    <select id="assessmentPeriod" formControlName="assessmentPeriod" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-white">
                        <option [ngValue]="null" disabled>Select Assessment Period</option>
                        @for(period of assessmentPeriods; track period) {
                            <option [value]="period">{{ period }}</option>
                        }
                    </select>
                </div>
              </div>

              <div class="space-y-4">
                <h2 class="text-xl font-bold text-slate-800">Star Rating</h2>
                @if (selectedMetric(); as metric) {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label class="block text-sm font-medium text-slate-700">5 star - definition <span class="text-red-500">*</span></label><input type="text" [value]="metric.definition5star" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-slate-100" readonly></div>
                    <div><label class="block text-sm font-medium text-slate-700">4 star - definition <span class="text-red-500">*</span></label><input type="text" [value]="metric.definition4star" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-slate-100" readonly></div>
                    <div><label class="block text-sm font-medium text-slate-700">3 star - definition <span class="text-red-500">*</span></label><input type="text" [value]="metric.definition3star" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-slate-100" readonly></div>
                    <div><label class="block text-sm font-medium text-slate-700">2 star - definition <span class="text-red-500">*</span></label><input type="text" [value]="metric.definition2star" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-slate-100" readonly></div>
                    <div class="md:col-span-2"><label class="block text-sm font-medium text-slate-700">1 star - definition <span class="text-red-500">*</span></label><input type="text" [value]="metric.definition1star" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-slate-100" readonly></div>
                  </div>
                } @else {
                  <p class="text-sm text-slate-500 text-center py-4">Select a metric type to see star ratings.</p>
                }
              </div>

            </div>
            <div class="flex justify-end p-4 bg-slate-50 border-t border-slate-200 rounded-b-lg space-x-3">
              <button (click)="closeModal()" type="button" class="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
              <button type="submit" [disabled]="goalForm.invalid" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                {{ editingGoal() ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
     @if (goalToDelete(); as goal) {
      <div class="fixed inset-0 bg-black/30 z-50" (click)="cancelDelete()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-slate-900">Delete Goal</h3>
            <p class="mt-2 text-sm text-slate-500">Are you sure you want to delete <strong>{{ goal.goalTitle }}</strong>? This action cannot be undone.</p>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-center space-x-3 rounded-b-lg">
            <button (click)="cancelDelete()" type="button" class="px-4 py-2 text-sm font-medium bg-white border rounded-md">Cancel</button>
            <button (click)="confirmDelete()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">Yes, Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class PmsGoalsComponent {
  private goalService = inject(GoalService);
  private metricService = inject(MetricService);
  private jobRoleService = inject(JobRoleService);

  showModal = signal(false);
  editingGoal = signal<PmsGoal | null>(null);
  goalToDelete = signal<PmsGoal | null>(null);
  searchTerm = signal('');
  selectedJobRoleFilter = signal<string>('All');

  jobRoles = this.jobRoleService.jobRoles;

  metrics = this.metricService.metrics;

  goals = this.goalService.goals;

  assessmentPeriods: PmsGoal['assessmentPeriod'][] = ['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'];

  goalForm = new FormGroup({
    jobRole: new FormControl<string | null>(null, Validators.required),
    goalTitle: new FormControl('', Validators.required),
    weightage: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(100)]),
    metric: new FormControl<Metric | null>(null, Validators.required),
    baseline: new FormControl('', Validators.required),
    assessmentPeriod: new FormControl<PmsGoal['assessmentPeriod'] | null>(null, Validators.required),
  });

  selectedMetric = signal<Metric | null>(null);

  constructor() {
    this.goalForm.controls.metric.valueChanges.subscribe(metric => {
      this.selectedMetric.set(metric);
    });
  }

  filteredGoals = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const roleFilter = this.selectedJobRoleFilter();

    let goals = this.goals();

    if (roleFilter !== 'All') {
      goals = goals.filter(g => g.jobRole === roleFilter);
    }

    if (!term) return goals;

    return goals.filter(g =>
      g.goalTitle.toLowerCase().includes(term) ||
      g.jobRole.toLowerCase().includes(term)
    );
  });

  openModal(goal: PmsGoal | null): void {
    if (goal) {
      this.editingGoal.set(goal);
      this.goalForm.setValue({
        jobRole: goal.jobRole,
        goalTitle: goal.goalTitle,
        weightage: goal.weightage,
        metric: goal.metric,
        baseline: goal.baseline,
        assessmentPeriod: goal.assessmentPeriod,
      });
    } else {
      this.editingGoal.set(null);
      this.goalForm.reset();
      this.selectedMetric.set(null);
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.goalForm.invalid) {
      return;
    }

    const formValue = this.goalForm.getRawValue();
    const currentGoal = this.editingGoal();

    const goalData = {
      jobRole: formValue.jobRole!,
      goalTitle: formValue.goalTitle!,
      weightage: formValue.weightage!,
      metric: formValue.metric!,
      baseline: formValue.baseline!,
      assessmentPeriod: formValue.assessmentPeriod!,
    };

    if (currentGoal) {
      this.goalService.updateGoal({
        ...currentGoal,
        ...goalData
      });
    } else {
      this.goalService.addGoal(goalData);
    }
    this.closeModal();
  }

  promptDelete(goal: PmsGoal): void {
    this.goalToDelete.set(goal);
  }

  cancelDelete(): void {
    this.goalToDelete.set(null);
  }

  confirmDelete(): void {
    const goal = this.goalToDelete();
    if (goal) {
      this.goalService.deleteGoal(goal.id);
      this.cancelDelete();
    }
  }
}
