import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Period {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
}

@Injectable({
    providedIn: 'root',
})
export class PeriodService {
    private http = inject(HttpClient);
    private apiUrl = '/api/periods';

    private readonly _periods = signal<Period[]>([]);
    public readonly periods = this._periods.asReadonly();

    constructor() {
        this.loadPeriods();
    }

    loadPeriods() {
        this.http.get<Period[]>(this.apiUrl).subscribe({
            next: (periods) => this._periods.set(periods),
            error: (err) => console.error('Error loading periods:', err)
        });
    }

    addPeriod(period: Omit<Period, 'id'>): void {
        this.http.post<Period>(this.apiUrl, period).subscribe({
            next: (newPeriod) => {
                this._periods.update(periods => [...periods, newPeriod]);
            },
            error: (err) => console.error('Error adding period:', err)
        });
    }

    updatePeriod(period: Period): void {
        this.http.put<Period>(`${this.apiUrl}/${period.id}`, period).subscribe({
            next: (updatedPeriod) => {
                this._periods.update(periods =>
                    periods.map(p => p.id === updatedPeriod.id ? updatedPeriod : p)
                );
            },
            error: (err) => console.error('Error updating period:', err)
        });
    }

    deletePeriod(id: number): void {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe({
            next: () => {
                this._periods.update(periods => periods.filter(p => p.id !== id));
            },
            error: (err) => console.error('Error deleting period:', err)
        });
    }
}
