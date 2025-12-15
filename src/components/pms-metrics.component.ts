import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MetricService, Metric } from '../services/metric.service';

@Component({
  selector: 'app-pms-metrics',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-800">Metrics</h1>
        <button (click)="openModal(null)" class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
          <span>New Metrics</span>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <!-- Toolbar -->
        <div class="flex items-center justify-between">
          <div class="relative w-full max-w-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
            </div>
            <input #searchInput (input)="searchTerm.set(searchInput.value)" type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-blue-200 rounded-full bg-blue-50/50 shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 flex items-center gap-2">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Excel
            </button>
            <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 flex items-center gap-2">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h8a2 2 0 002-2v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clip-rule="evenodd"></path></svg>
              Print
            </button>
            <div class="relative">
              <button (click)="showColumnsDropdown.set(!showColumnsDropdown())" class="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50">
                Columns to Display &#9662;
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
        <div class="overflow-x-auto border-t border-slate-200">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-blue-50">
              <tr>
                <th class="p-2 pl-4"><input type="checkbox" class="rounded border-slate-300"></th>
                @for(col of allColumns; track col.id) {
                  @if(visibleColumns().has(col.id)) { <th scope="col" class="px-6 py-3 font-semibold tracking-wider">{{ col.name }}</th> }
                }
              </tr>
            </thead>
            <tbody>
              @for(metric of filteredMetrics(); track metric.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="p-2 pl-4"><input type="checkbox" class="rounded border-slate-300"></td>
                  @if(visibleColumns().has('id')) { <td class="px-6 py-4">{{ metric.id }}</td> }
                  @if(visibleColumns().has('metricType')) { <td class="px-6 py-4 font-medium text-slate-900">{{ metric.metricType }}</td> }
                  @if(visibleColumns().has('metric')) { <td class="px-6 py-4">{{ metric.metric }}</td> }
                  @if(visibleColumns().has('actions')) {
                    <td class="px-6 py-4">
                      <div class="flex items-center space-x-2">
                        <button (click)="openModal(metric)" class="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200" title="Edit Metric">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                        </button>
                        <button (click)="promptDelete(metric)" class="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200" title="Delete Metric">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        </button>
                      </div>
                    </td>
                  }
                </tr>
              } @empty {
                <tr><td [attr.colspan]="visibleColumns().size + 1" class="text-center p-8 text-slate-500">No metrics found.</td></tr>
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
          <form [formGroup]="metricForm" (ngSubmit)="onSubmit()">
            <div class="p-8 space-y-8">
              <div>
                <h2 class="text-xl font-bold text-slate-800">New Metrics</h2>
                <div class="mt-4">
                  <label for="metricType" class="text-sm font-medium text-slate-700">Metrics Type <span class="text-red-500">*</span></label>
                  <input type="text" id="metricType" formControlName="metricType" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>
              
              <div>
                <h2 class="text-xl font-bold text-slate-800">Metrics Description</h2>
                 <div class="mt-4">
                  <label for="metric" class="text-sm font-medium text-slate-700">Metrics <span class="text-red-500">*</span></label>
                  <input type="text" id="metric" formControlName="metric" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="def5" class="text-sm font-medium text-slate-700">5 star - definition <span class="text-red-500">*</span></label>
                  <input type="number" id="def5" formControlName="definition5star" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                  <label for="def4" class="text-sm font-medium text-slate-700">4 star - definition <span class="text-red-500">*</span></label>
                  <input type="number" id="def4" formControlName="definition4star" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                  <label for="def3" class="text-sm font-medium text-slate-700">3 star - definition <span class="text-red-500">*</span></label>
                  <input type="number" id="def3" formControlName="definition3star" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                 <div>
                  <label for="def2" class="text-sm font-medium text-slate-700">2 star - definition <span class="text-red-500">*</span></label>
                  <input type="number" id="def2" formControlName="definition2star" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div class="md:col-span-2">
                  <label for="def1" class="text-sm font-medium text-slate-700">1 star - definition <span class="text-red-500">*</span></label>
                  <input type="number" id="def1" formControlName="definition1star" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>
            </div>
            <div class="flex justify-end p-4 bg-slate-50 border-t border-slate-200 rounded-b-lg space-x-3">
              <button (click)="closeModal()" type="button" class="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
              <button type="submit" [disabled]="metricForm.invalid" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                {{ editingMetric() ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
     @if (metricToDelete(); as metric) {
      <div class="fixed inset-0 bg-black/30 z-50" (click)="cancelDelete()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-slate-900">Delete Metric</h3>
            <p class="mt-2 text-sm text-slate-500">Are you sure you want to delete <strong>{{ metric.metricType }}</strong>? This action cannot be undone.</p>
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
export class PmsMetricsComponent {
  private metricService = inject(MetricService);

  showModal = signal(false);
  editingMetric = signal<Metric | null>(null);
  metricToDelete = signal<Metric | null>(null);
  searchTerm = signal('');
  showColumnsDropdown = signal(false);

  metrics = this.metricService.metrics;

  metricForm = new FormGroup({
    metricType: new FormControl('', Validators.required),
    metric: new FormControl('', Validators.required),
    definition5star: new FormControl<number | null>(null, Validators.required),
    definition4star: new FormControl<number | null>(null, Validators.required),
    definition3star: new FormControl<number | null>(null, Validators.required),
    definition2star: new FormControl<number | null>(null, Validators.required),
    definition1star: new FormControl<number | null>(null, Validators.required),
  });

  allColumns = [
    { id: 'id', name: 'Id' },
    { id: 'metricType', name: 'Metrics Type' },
    { id: 'metric', name: 'Metrics' },
    { id: 'actions', name: 'Actions' },
  ];
  visibleColumns = signal(new Set(this.allColumns.map(c => c.id)));

  filteredMetrics = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.metrics();
    return this.metrics().filter(m =>
      m.metricType.toLowerCase().includes(term) ||
      m.metric.toLowerCase().includes(term)
    );
  });

  openModal(metric: Metric | null): void {
    if (metric) {
      this.editingMetric.set(metric);
      this.metricForm.setValue({
        metricType: metric.metricType,
        metric: metric.metric,
        definition1star: metric.definition1star,
        definition2star: metric.definition2star,
        definition3star: metric.definition3star,
        definition4star: metric.definition4star,
        definition5star: metric.definition5star,
      });
    } else {
      this.editingMetric.set(null);
      this.metricForm.reset();
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.metricForm.invalid) {
      return;
    }

    const formValue = this.metricForm.getRawValue();
    const currentMetric = this.editingMetric();

    if (currentMetric) {
      this.metricService.updateMetric({
        ...currentMetric,
        metricType: formValue.metricType!,
        metric: formValue.metric!,
        definition1star: formValue.definition1star!,
        definition2star: formValue.definition2star!,
        definition3star: formValue.definition3star!,
        definition4star: formValue.definition4star!,
        definition5star: formValue.definition5star!,
      });
    } else {
      this.metricService.addMetric({
        metricType: formValue.metricType!,
        metric: formValue.metric!,
        definition1star: formValue.definition1star!,
        definition2star: formValue.definition2star!,
        definition3star: formValue.definition3star!,
        definition4star: formValue.definition4star!,
        definition5star: formValue.definition5star!,
      });
    }
    this.closeModal();
  }

  promptDelete(metric: Metric): void {
    this.metricToDelete.set(metric);
  }

  cancelDelete(): void {
    this.metricToDelete.set(null);
  }

  confirmDelete(): void {
    const metric = this.metricToDelete();
    if (metric) {
      this.metricService.deleteMetric(metric.id);
      this.cancelDelete();
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
}
