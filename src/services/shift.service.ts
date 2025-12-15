import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface Shift {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    assignedEmployees: string[];
}

const API_URL = '/api/shifts';

@Injectable({
    providedIn: 'root'
})
export class ShiftService {
    private http = inject(HttpClient);
    private _shifts = signal<Shift[]>([]);
    public readonly shifts = this._shifts.asReadonly();

    constructor() {
        this.loadShifts();
    }

    async loadShifts(): Promise<void> {
        try {
            const shifts = await lastValueFrom(this.http.get<Shift[]>(API_URL));
            this._shifts.set(shifts.map(s => ({ ...s, assignedEmployees: s.assignedEmployees || [] })));
        } catch (error) {
            console.error("Failed to load shifts", error);
            this._shifts.set([]);
        }
    }

    async addShift(shift: { name: string, startTime: string, endTime: string }): Promise<void> {
        await lastValueFrom(this.http.post<Shift>(API_URL, shift));
        await this.loadShifts();
    }

    async updateShift(shift: { id: number, name: string, startTime: string, endTime: string }): Promise<void> {
        await lastValueFrom(this.http.put<Shift>(`${API_URL}/${shift.id}`, shift));
        await this.loadShifts();
    }

    async deleteShift(id: number): Promise<void> {
        await lastValueFrom(this.http.delete(`${API_URL}/${id}`));
        await this.loadShifts();
    }
}
