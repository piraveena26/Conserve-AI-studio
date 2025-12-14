import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PmsFormBuilderComponent, TemplateFormData, Question } from './pms-form-builder.component';
import { PmsFormResponsesComponent } from './pms-form-responses.component';

// FIX: Re-export the Question type to make it available to other components that import from this file, resolving a circular dependency issue.
export type { Question } from './pms-form-builder.component';

export interface Template {
  id: number;
  title: string;
  description: string;
  active: boolean;
  questions: Question[];
  lastUpdated: string;
  responses: number;
}

interface Response {
  id: number;
  templateId: number;
  templateTitle: string;
  employeeName: string;
  employeeId: string;
  submissionDate: string;
}

@Component({
  selector: 'app-pms-form-template',
  template: `
    <div class="space-y-6 bg-sky-100 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 min-h-full">
      @if (viewMode() === 'list') {
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div class="relative w-full max-w-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
              </div>
              <input type="text" placeholder="Search templates" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md">
            </div>
            <button (click)="createTemplate()" class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm border border-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
              <span>Create Template</span>
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for(template of templates(); track template.id) {
            <div class="bg-white rounded-xl shadow-md border border-slate-200/80 flex flex-col">
              <div class="p-6">
                <h3 class="text-xl font-bold text-slate-800">{{ template.title }}</h3>
                <p class="text-sm text-slate-500 mt-1 h-10">{{ template.description }}</p>
                
                <div class="grid grid-cols-3 gap-4 text-center my-6">
                  <div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-bold text-2xl text-slate-700">{{ template.questions.length }}</p><p class="text-xs font-semibold text-slate-500">QUESTIONS</p></div>
                  </div>
                  <div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-bold text-2xl text-slate-700">{{ template.responses }}</p><p class="text-xs font-semibold text-slate-500">RESPONSES</p></div>
                  </div>
                  <div>
                    <div class="p-3 bg-slate-100 rounded-lg"><p class="font-bold text-lg text-slate-700">{{ template.lastUpdated | date:'MM/dd/yyyy' }}</p><p class="text-xs font-semibold text-slate-500">LAST UPDATED</p></div>
                  </div>
                </div>

                <div>
                  <h4 class="text-sm font-semibold text-slate-600 mb-2">Question Types:</h4>
                  <div class="flex flex-wrap gap-2">
                    @for(type of getQuestionTypes(template); track type) {
                      <span class="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">{{ type }}</span>
                    }
                  </div>
                </div>
              </div>

              <div class="border-t border-slate-200 mt-auto p-3 bg-slate-50/50 rounded-b-xl">
                <div class="flex items-center justify-between">
                  <button (click)="viewResponses(template)" class="px-3 py-1.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm">View Responses</button>
                  <div class="flex items-center gap-1">
                    <button class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full" title="Preview"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg></button>
                    <button (click)="editTemplate(template)" class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                    <div class="relative">
                      <button (click)="toggleDropdown(template.id)" class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full" title="More options"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg></button>
                      @if(activeDropdown() === template.id) {
                        <div class="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-md shadow-lg border border-slate-200 z-10">
                          <a href="#" (click)="duplicateTemplate(template, $event)" class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Duplicate
                          </a>
                          <a href="#" (click)="promptDelete(template, $event)" class="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete
                          </a>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Templates Table View -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h2 class="text-xl font-bold text-slate-800">Templates Table View</h2>
          </div>
           <div class="flex items-center justify-between mb-4">
            <div class="relative w-full max-w-xs"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg></div><input type="text" placeholder="Search" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md"></div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50">Excel</button>
              <button class="px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50">Print</button>
              <button class="px-3 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-400 rounded-md hover:bg-cyan-50">Columns to Display</button>
            </div>
          </div>
          <div class="overflow-x-auto border border-slate-200 rounded-lg">
            <table class="w-full text-sm text-left text-slate-500">
              <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th class="px-6 py-3">Template Title</th><th class="px-6 py-3">Employee Name</th><th class="px-6 py-3">Submission Date</th>
                </tr>
              </thead>
              <tbody>
                @for(response of responses(); track response.id) {
                  <tr class="border-b hover:bg-slate-50">
                    <td class="px-6 py-4 font-medium text-slate-800">{{ response.templateTitle }}</td>
                    <td class="px-6 py-4">{{ response.employeeName }}</td>
                    <td class="px-6 py-4">{{ response.submissionDate | date:'medium' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        @if (templateToDelete(); as template) {
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
                  <h3 class="text-lg leading-6 font-medium text-slate-900">Delete Template</h3>
                  <div class="mt-2">
                    <p class="text-sm text-slate-500">
                      Are you sure you want to permanently delete <strong>{{ template.title }}</strong>? This action cannot be undone.
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
      } @else if (viewMode() === 'builder') {
        <app-pms-form-builder [template]="editingTemplate()" (save)="saveTemplate($event)" (cancel)="cancelBuilder()"></app-pms-form-builder>
      } @else if (viewMode() === 'responses' && selectedTemplate(); as template) {
        <app-pms-form-responses [template]="template" (back)="backToList()"></app-pms-form-responses>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PmsFormBuilderComponent, DatePipe, PmsFormResponsesComponent],
})
export class PmsFormTemplateComponent {
  viewMode = signal<'list' | 'builder' | 'responses'>('list');
  editingTemplate = signal<Template | null>(null);
  selectedTemplate = signal<Template | null>(null);
  activeDropdown = signal<number | null>(null);
  templateToDelete = signal<Template | null>(null);
  private nextId = signal(2);

  templates = signal<Template[]>([
    {
      id: 1,
      title: 'sample',
      description: 'a',
      active: true,
      questions: [
        { id: 'q1', type: 'Radio Buttons', label: 'Sample Radio Question', options: ['Option 1', 'Option 2'] },
        { id: 'q2', type: 'Text Input', label: 'Sample Text Question' }
      ],
      lastUpdated: '2025-10-25T00:00:00Z',
      responses: 1
    }
  ]);

  responses = signal<Response[]>([
    { id: 1, templateId: 1, templateTitle: 'sample', employeeName: 'John Doe', employeeId: 'EMP001', submissionDate: new Date().toISOString() }
  ]);

  getQuestionTypes(template: Template): string[] {
    const types = new Set(template.questions.map(q => q.type));
    return Array.from(types);
  }
  
  toggleDropdown(templateId: number): void {
    this.activeDropdown.update(current => current === templateId ? null : templateId);
  }

  createTemplate(): void {
    this.editingTemplate.set(null);
    this.viewMode.set('builder');
  }

  editTemplate(template: Template): void {
    this.editingTemplate.set(template);
    this.viewMode.set('builder');
    this.activeDropdown.set(null);
  }

  viewResponses(template: Template): void {
    this.selectedTemplate.set(template);
    this.viewMode.set('responses');
  }

  duplicateTemplate(template: Template, event: Event): void {
    event.preventDefault();
    const newId = this.nextId();
    this.nextId.update(id => id + 1);
    const newTemplate: Template = {
      ...template,
      id: newId,
      title: `${template.title} (Copy)`,
      lastUpdated: new Date().toISOString(),
      responses: 0,
    };
    this.templates.update(templates => [...templates, newTemplate]);
    this.activeDropdown.set(null);
  }

  promptDelete(template: Template, event: Event): void {
    event.preventDefault();
    this.templateToDelete.set(template);
    this.activeDropdown.set(null);
  }

  cancelDelete(): void {
    this.templateToDelete.set(null);
  }

  confirmDelete(): void {
    const template = this.templateToDelete();
    if (template) {
      this.templates.update(templates => templates.filter(t => t.id !== template.id));
      this.cancelDelete();
    }
  }

  saveTemplate(templateData: TemplateFormData): void {
    const editing = this.editingTemplate();
    if (editing) {
      // Update
      this.templates.update(templates => templates.map(t => 
        t.id === editing.id
          ? { ...t, ...templateData, lastUpdated: new Date().toISOString() }
          : t
      ));
    } else {
      // Create
      const newId = this.nextId();
      this.nextId.update(id => id + 1);
      const newTemplate: Template = {
        id: newId,
        ...templateData,
        lastUpdated: new Date().toISOString(),
        responses: 0
      };
      this.templates.update(templates => [...templates, newTemplate]);
    }
    this.viewMode.set('list');
    this.editingTemplate.set(null);
  }

  cancelBuilder(): void {
    this.viewMode.set('list');
    this.editingTemplate.set(null);
  }

  backToList(): void {
    this.viewMode.set('list');
    this.editingTemplate.set(null);
    this.selectedTemplate.set(null);
  }
}
