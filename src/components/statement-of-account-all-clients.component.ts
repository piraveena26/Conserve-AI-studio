import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Client {
  id: number;
  name: string;
  representativeProjectId: string;
  imageUrl: string;
}

@Component({
  selector: 'app-statement-of-account-all-clients',
  template: `
    <div class="space-y-6">
      <!-- All Clients Section -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="space-y-4">
          <div class="flex justify-between items-center border-b pb-2">
            <h2 class="text-xl font-semibold text-slate-700">All Clients</h2>
            <div class="relative w-full max-w-xs">
              <input type="text" placeholder="Search clients..." class="form-input block w-full pl-9 pr-3 py-2 border-slate-300 rounded-md">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto border border-slate-200 rounded-lg">
            <table class="w-full text-sm text-left text-slate-500">
              <thead class="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th class="px-6 py-3">Client Name</th>
                  <th class="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for(account of allClients(); track account.id) {
                    <tr class="border-b hover:bg-slate-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <img class="h-10 w-10 rounded-full object-cover" [src]="account.imageUrl" [alt]="account.name + ' logo'">
                          <div class="pl-3">
                            <div class="font-medium text-slate-800">{{ account.name }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <button (click)="viewClient.emit(account.representativeProjectId)" class="text-slate-500 hover:text-blue-600" title="View">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                        </button>
                      </td>
                    </tr>
                } @empty {
                    <tr><td colspan="2" class="text-center p-8 text-slate-500">No client accounts found.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class StatementOfAccountAllClientsComponent {
  viewClient = output<string>();

  allClients = signal<Client[]>([
    { id: 1, name: 'Leo-Leon-company', representativeProjectId: 'CONSA-ENG-DEP-0212', imageUrl: 'https://picsum.photos/seed/client1/40/40' },
    { id: 2, name: 'EG - Elenora', representativeProjectId: 'P-1520', imageUrl: 'https://picsum.photos/seed/client2/40/40' },
    { id: 3, name: 'PetroCorp', representativeProjectId: 'SUS-PRO-0193', imageUrl: 'https://picsum.photos/seed/client3/40/40' },
    { id: 4, name: 'ConstructCo', representativeProjectId: 'P-1601', imageUrl: 'https://picsum.photos/seed/client4/40/40' },
    { id: 5, name: 'Architex', representativeProjectId: 'M-BIM-001', imageUrl: 'https://picsum.photos/seed/client5/40/40' },
  ]);
}
