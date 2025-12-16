import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Holiday {
    id: number;
    title: string;
    type: 'National Holiday' | 'Regional Holiday' | 'Company Event';
    date: string; // YYYY-MM-DD
}

@Injectable({
    providedIn: 'root',
})
export class HolidayService {
    private http = inject(HttpClient);
    private apiUrl = '/api/holidays';

    private readonly _holidays = signal<Holiday[]>([]);
    public readonly holidays = this._holidays.asReadonly();

    constructor() {
        this.loadHolidays();
    }

    loadHolidays(): void {
        this.http.get<Holiday[]>(this.apiUrl).subscribe({
            next: (holidays) => {
                this._holidays.set(holidays);
            },
            error: (err) => console.error('Error loading holidays:', err),
        });
    }

    createHoliday(holidayData: Omit<Holiday, 'id'>): void {
        this.http.post<Holiday>(this.apiUrl, holidayData).subscribe({
            next: (created) => {
                this._holidays.update(holidays =>
                    [...holidays, created].sort((a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                );
            },
            error: (err) => console.error('Error creating holiday:', err),
        });
    }

    updateHoliday(id: number, holidayData: Omit<Holiday, 'id'>): void {
        this.http.put<Holiday>(`${this.apiUrl}/${id}`, holidayData).subscribe({
            next: (updated) => {
                this._holidays.update(holidays =>
                    holidays.map(h => (h.id === id ? updated : h))
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                );
            },
            error: (err) => console.error('Error updating holiday:', err),
        });
    }

    deleteHoliday(id: number): void {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe({
            next: () => {
                this._holidays.update(holidays => holidays.filter(h => h.id !== id));
            },
            error: (err) => console.error('Error deleting holiday:', err),
        });
    }
}
