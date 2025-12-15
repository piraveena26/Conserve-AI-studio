import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Designation, DesignationService } from '../services/designation.service';
import { DepartmentService } from '../services/department.service';

@Component({
  selector: 'app-designation',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-800">Designations</h2>
        <button (click)="openModal(null)" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
          Add Designation
        </button>
      </div>
      
      <!-- Designations Table -->
      <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3 w-24">ID</th>
                <th scope="col" class="px-6 py-3">Job Title</th>
                <th scope="col" class="px-6 py-3">Department</th>
                <th scope="col" class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (designation of designations(); track designation.id) {
                <tr class="bg-white border-b hover:bg-slate-50">
                  <td class="px-6 py-4 font-medium text-slate-900">{{ designation.id }}</td>
                  <td class="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{{ designation.name }}</td>
                  <td class="px-6 py-4">{{ designation.department }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-4">
                      <button (click)="openModal(designation)" class="text-slate-500 hover:text-green-600" title="Edit Designation">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <button (click)="promptDelete(designation)" class="text-slate-500 hover:text-red-600" title="Delete Designation">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-slate-500">No designations found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Designation Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" (click)="closeModal()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="text-xl font-semibold text-slate-800">{{ editingDesignation() ? 'Edit Designation' : 'Add New Designation' }}</h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form [formGroup]="designationForm" (ngSubmit)="onSubmit()">
            <div class="p-6 space-y-4">
              <div>
                <label for="department" class="block text-sm font-medium text-slate-700">Department</label>
                <select id="department" formControlName="department" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3">
                  <option value="" disabled>Select a department</option>
                  @for (department of departments(); track department.id) {
                    <option [value]="department.name">{{ department.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label for="jobTitle" class="block text-sm font-medium text-slate-700">Job Title</label>
                <input 
                    type="text" 
                    id="jobTitle" 
                    formControlName="name" 
                    class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3" 
                    placeholder="Enter Job Title">
              </div>
            </div>
            <div class="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg">
              <button (click)="closeModal()" type="button" class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
              <button type="submit" [disabled]="designationForm.invalid" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                {{ editingDesignation() ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
    
    <!-- Delete Confirmation Modal -->
    @if (designationToDelete(); as designation) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" (click)="cancelDelete()"></div>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-start p-6">
            <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <h3 class="text-lg leading-6 font-medium text-slate-900">Delete Designation</h3>
              <div class="mt-2">
                <p class="text-sm text-slate-500">
                  Are you sure you want to permanently delete <strong>{{ designation.name }}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button (click)="cancelDelete()" type="button" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
              Cancel
            </button>
            <button (click)="confirmDelete()" type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DesignationComponent {
  private designationService = inject(DesignationService);
  private departmentService = inject(DepartmentService);

  showModal = signal(false);
  editingDesignation = signal<Designation | null>(null);
  designationToDelete = signal<Designation | null>(null);

  designations = this.designationService.designations;
  departments = this.departmentService.departments;

  designationForm = new FormGroup({
    department: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
  });

  openModal(designation: Designation | null): void {
    if (designation) {
      this.editingDesignation.set(designation);
      this.designationForm.setValue({ name: designation.name, department: designation.department });
    } else {
      this.editingDesignation.set(null);
      this.designationForm.reset({ department: '', name: '' });
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingDesignation.set(null);
  }

  async onSubmit(): Promise<void> {
    if (this.designationForm.invalid) {
      return;
    }

    // Use safe access or non-null assertion
    const formValue = {
      name: this.designationForm.value.name!,
      department: this.designationForm.value.department!
    };
    const currentDesignation = this.editingDesignation();

    try {
      if (currentDesignation) {
        await this.designationService.updateDesignation({ id: currentDesignation.id, ...formValue });
      } else {
        await this.designationService.addDesignation(formValue);
      }
      this.closeModal();
    } catch (e) {
      console.error(e);
    }
  }

  promptDelete(designation: Designation): void {
    this.designationToDelete.set(designation);
  }

  cancelDelete(): void {
    this.designationToDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const designation = this.designationToDelete();
    if (designation) {
      try {
        await this.designationService.deleteDesignation(designation.id);
        this.cancelDelete();
      } catch (e) {
        console.error(e);
      }
    }
  }
}
