import { Component, ChangeDetectionStrategy, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatementProject {
  id: number;
  projectId: string;
  projectName: string;
  clientName: string; // Representing "Line Name"
  scope: string;
  paymentTerms: string;
  division: string;
}

@Component({
  selector: 'app-statement-of-account-main',
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h1 class="text-2xl font-bold text-slate-800">Statement of Account</h1>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
            <h2 class="text-xl font-semibold text-slate-700">Projects</h2>
            <div class="flex items-center space-x-2">
                <label for="division-filter" class="text-sm font-medium text-slate-700">Division:</label>
                <select id="division-filter" (change)="onDivisionChange($event)" class="rounded-md border-slate-300 shadow-sm p-2 bg-white">
                    @for(division of divisions(); track division) {
                        <option [value]="division">{{division}}</option>
                    }
                </select>
            </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="w-full text-sm text-left text-slate-500">
            <thead class="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th class="px-6 py-3">ID</th>
                <th class="px-6 py-3">Project ID</th>
                <th class="px-6 py-3">Project Name</th>
                <th class="px-6 py-3">Client Name</th>
                <th class="px-6 py-3">Scope</th>
                <th class="px-6 py-3">Payment Terms</th>
                <th class="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for(project of filteredProjects(); track project.id) {
                <tr class="border-b hover:bg-slate-50">
                  <td class="px-6 py-4">{{project.id}}</td>
                  <td class="px-6 py-4 font-mono text-xs">{{project.projectId}}</td>
                  <td class="px-6 py-4 font-medium text-slate-800">{{project.projectName}}</td>
                  <td class="px-6 py-4">{{project.clientName}}</td>
                  <td class="px-6 py-4">{{project.scope}}</td>
                  <td class="px-6 py-4">{{project.paymentTerms}}</td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center space-x-4">
                      <button (click)="viewProject.emit(project.projectId)" class="text-slate-500 hover:text-blue-600" title="View Project Statement">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                      </button>
                      <button (click)="viewClient.emit(project.projectId)" class="text-slate-500 hover:text-indigo-600" title="View Client Portfolio">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clip-rule="evenodd" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center p-8 text-slate-500">No projects found for the selected division.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class StatementOfAccountMainComponent {
  viewProject = output<string>();
  viewClient = output<string>();
  
  private allProjects = signal<StatementProject[]>([
    { 
      id: 1, projectId: 'CONSA-ENG-DEP-0212', projectName: 'Call Center Create', clientName: 'Leo-Leon-company',
      scope: 'Design', paymentTerms: 'Milestone Basis', division: 'ENGINEERING'
    },
    { 
      id: 2, projectId: 'P-1520', projectName: 'Architectural BIM', clientName: 'EG - Elenora',
      scope: 'LOD 300 Modeling', paymentTerms: 'Monthly Basis', division: 'BIM'
    },
    { 
      id: 3, projectId: 'SUS-PRO-0193', projectName: 'RX - Training Center', clientName: 'PetroCorp',
      scope: 'LEED DB+C Design & Construction', paymentTerms: 'Prorata Basis', division: 'SUSTAINABILITY'
    },
    { 
      id: 4, projectId: 'P-1601', projectName: 'MEP Coordination for Tower', clientName: 'ConstructCo',
      scope: 'Clash Detection', paymentTerms: 'Milestone Basis', division: 'BIM'
    },
    { 
      id: 5, projectId: 'M-BIM-001', projectName: 'Monthly BIM Support', clientName: 'Architex',
      scope: 'Ongoing Support', paymentTerms: 'Monthly Basis', division: 'BIM'
    },
    { 
      id: 6, projectId: 'M-ENG-002', projectName: 'Retainer Engineering Services', clientName: 'ConstructCo',
      scope: 'Consulting', paymentTerms: 'Monthly Basis', division: 'ENGINEERING'
    },
  ]);

  selectedDivision = signal('All');

  divisions = computed(() => ['All', ...new Set(this.allProjects().map(p => p.division))]);

  filteredProjects = computed(() => {
    const division = this.selectedDivision();
    if (division === 'All') {
      return this.allProjects();
    }
    return this.allProjects().filter(p => p.division === division);
  });
  
  onDivisionChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedDivision.set(selectElement.value);
  }
}