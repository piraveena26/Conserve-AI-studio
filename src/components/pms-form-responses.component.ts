import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Template, Question } from './pms-form-template.component';

export interface FormResponse {
  id: number;
  user: {
    id: string;
    name: string;
  };
  submittedAt: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
}

@Component({
  selector: 'app-pms-form-responses',
  template: `
    <div class="space-y-6">
      @if (viewMode() === 'list') {
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button (click)="back.emit()" class="p-2 rounded-full hover:bg-slate-100 text-slate-500" title="Go back">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-slate-800">Form Responses</h1>
                <p class="text-sm text-slate-500">{{ template().title }}</p>
              </div>
            </div>
            <div class="flex items-center gap-8">
              <div class="text-center"><p class="text-2xl font-bold text-blue-600">0</p><p class="text-xs font-semibold text-slate-500">Submitted</p></div>
              <div class="text-center"><p class="text-2xl font-bold text-blue-600">{{ responses().length }}</p><p class="text-xs font-semibold text-slate-500">Total Responses</p></div>
              <div class="text-center"><p class="text-2xl font-bold text-blue-600">100.0%</p><p class="text-xs font-semibold text-slate-500">Avg. Completion</p></div>
            </div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between">
              <div class="relative w-full max-w-xs">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                </div>
                <input #searchInput (input)="searchTerm.set(searchInput.value)" type="text" placeholder="Search Users" class="form-input block w-full pl-10 pr-3 py-2 border-slate-300 rounded-md">
              </div>
              <button class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export CSV
              </button>
          </div>
        </div>
        
        <!-- Responses Table -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-500">
              <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" class="px-6 py-3">User</th>
                  <th scope="col" class="px-6 py-3">Submitted At</th>
                  <th scope="col" class="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (response of paginatedResponses(); track response.id) {
                  <tr class="bg-white border-b hover:bg-slate-50">
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-lg">{{ getInitials(response.user.name) }}</div>
                        <div class="ml-3">
                          <div class="font-medium text-slate-800">{{ response.user.name }}</div>
                          <div class="text-slate-500 text-xs">{{ response.user.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">{{ response.submittedAt | date:'medium' }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <button (click)="viewResponse(response)" class="p-2 text-slate-500 rounded-md hover:bg-blue-100 hover:text-blue-600" title="View Response"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg></button>
                        <button (click)="promptDelete(response)" class="p-2 text-slate-500 rounded-md hover:bg-red-100 hover:text-red-600" title="Delete Response"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="text-center p-8 text-slate-500">No responses found for this template.</td></tr>
                }
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="flex items-center justify-between p-4 border-t border-slate-200">
            <div class="text-sm text-slate-600">
              Items per page:
              <select #itemsPerPageSelect (change)="itemsPerPage.set(+itemsPerPageSelect.value)" class="form-select text-sm p-1 border-slate-300 rounded-md">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="20">20</option>
              </select>
            </div>
            <div class="text-sm text-slate-600">
              {{ paginationSummary() }}
            </div>
            <div class="flex items-center gap-1">
                <button (click)="changePage(1)" [disabled]="currentPage() === 1" class="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-md"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg></button>
                <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 1" class="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-md"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></button>
                <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() === totalPages()" class="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-md"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg></button>
                <button (click)="changePage(totalPages())" [disabled]="currentPage() === totalPages()" class="p-2 text-slate-500 disabled:text-slate-300 hover:bg-slate-100 rounded-md"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
            </div>
          </div>
        </div>
      } @else if (viewMode() === 'detail' && selectedResponse(); as response) {
        <!-- Response Detail View -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center gap-4 border-b border-slate-200 pb-4">
            <button (click)="backToList()" class="p-2 rounded-full hover:bg-slate-100 text-slate-500" title="Go back">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-slate-800">Response from {{ response.user.name }}</h1>
              <p class="text-sm text-slate-500">Submitted on {{ response.submittedAt | date:'full' }}</p>
            </div>
          </div>
          <div class="py-6 space-y-6">
            @for (question of template().questions; track question.id) {
              <div class="pb-4 border-b border-slate-200/80 last:border-b-0">
                <p class="text-sm font-medium text-slate-500">{{ question.label }}</p>
                <p class="text-lg font-semibold text-slate-800 mt-2 whitespace-pre-wrap">
                  {{ getAnswerForQuestion(question.id) || 'Not answered' }}
                </p>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Delete Confirmation Modal -->
    @if (responseToDelete(); as response) {
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
              <h3 class="text-lg leading-6 font-medium text-slate-900">Delete Response</h3>
              <div class="mt-2">
                <p class="text-sm text-slate-500">
                  Are you sure you want to permanently delete the response from <strong>{{ response.user.name }}</strong>? This action cannot be undone.
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
  imports: [CommonModule, DatePipe],
})
export class PmsFormResponsesComponent {
  template = input.required<Template>();
  back = output<void>();

  viewMode = signal<'list' | 'detail'>('list');
  selectedResponse = signal<FormResponse | null>(null);
  responseToDelete = signal<FormResponse | null>(null);

  responses = signal<FormResponse[]>([]);
  searchTerm = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(10);
  
  constructor() {
    this.responses.set([
      {
        id: 1,
        user: { id: 'EMP001', name: 'John Doe' },
        submittedAt: '2025-10-25T10:33:00Z',
        answers: [
          { questionId: 'q1', answer: 'Option 1' },
          { questionId: 'q2', answer: 'This is a sample text answer from John Doe regarding the project requirements.' }
        ]
      },
    ]);
  }

  filteredResponses = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.responses();

    return this.responses().filter(response =>
      response.user.name.toLowerCase().includes(term) ||
      response.user.id.toLowerCase().includes(term)
    );
  });
  
  totalPages = computed(() => Math.ceil(this.filteredResponses().length / this.itemsPerPage()));
  
  paginatedResponses = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredResponses().slice(start, end);
  });
  
  paginationSummary = computed(() => {
    const total = this.filteredResponses().length;
    if (total === 0) return '0 of 0';
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    const end = Math.min(start + this.itemsPerPage() - 1, total);
    return `${start} - ${end} of ${total}`;
  });

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
  
  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  viewResponse(response: FormResponse): void {
    this.selectedResponse.set(response);
    this.viewMode.set('detail');
  }

  backToList(): void {
    this.viewMode.set('list');
    this.selectedResponse.set(null);
  }
  
  getAnswerForQuestion(questionId: string): string | undefined {
    const answer = this.selectedResponse()?.answers.find(a => a.questionId === questionId)?.answer;
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer;
  }
  
  promptDelete(response: FormResponse): void {
    this.responseToDelete.set(response);
  }

  cancelDelete(): void {
    this.responseToDelete.set(null);
  }

  confirmDelete(): void {
    const response = this.responseToDelete();
    if (response) {
      this.responses.update(responses => responses.filter(r => r.id !== response.id));
      this.cancelDelete();
    }
  }
}
