import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface WorkAllocation {
    id: number;
    employeeId: string;
    badgeId: string;
    employeeName: string;
    projectId: string;
    projectName: string;
    reportingToId: string;
    reportingToName: string;
    billability: 'Billable' | 'Non-Billable';
    billingRole: string;
    attendance: 'PRESENT' | 'PERMISSION' | 'ON DUTY' | 'HOLIDAY' | 'LEAVE' | 'WFO' | 'Informed Leave' | 'Uninformed Leave';
    date: string; // YYYY-MM-DD
    department: string;
}

@Injectable({
    providedIn: 'root',
})
export class WorkAllocationService {
    private http = inject(HttpClient);
    private apiUrl = '/api/work-allocations';

    private readonly _allocations = signal<WorkAllocation[]>([]);
    public readonly allocations = this._allocations.asReadonly();

    constructor() {
        this.loadAllocations();
    }

    loadAllocations(): void {
        this.http.get<WorkAllocation[]>(this.apiUrl).subscribe({
            next: (allocations) => {
                this._allocations.set(allocations);
            },
            error: (err) => console.error('Error loading work allocations:', err),
        });
    }

    createAllocation(allocationData: Omit<WorkAllocation, 'id'>): void {
        this.http.post<WorkAllocation>(this.apiUrl, allocationData).subscribe({
            next: (created) => {
                this._allocations.update(allocs =>
                    [created, ...allocs].sort((a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                );
            },
            error: (err) => console.error('Error creating work allocation:', err),
        });
    }

    updateAllocation(id: number, allocationData: Omit<WorkAllocation, 'id'>): void {
        this.http.put<WorkAllocation>(`${this.apiUrl}/${id}`, allocationData).subscribe({
            next: (updated) => {
                this._allocations.update(allocs =>
                    allocs.map(a => (a.id === id ? updated : a))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                );
            },
            error: (err) => console.error('Error updating work allocation:', err),
        });
    }

    deleteAllocation(id: number): void {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe({
            next: () => {
                this._allocations.update(allocs => allocs.filter(a => a.id !== id));
            },
            error: (err) => console.error('Error deleting work allocation:', err),
        });
    }
}
