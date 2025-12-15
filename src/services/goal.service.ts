
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Metric } from './metric.service';

export interface PmsGoal {
    id: number;
    jobRole: string;
    goalTitle: string;
    weightage: number;
    metric: Metric;
    baseline: string;
    assessmentPeriod: 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Yearly';
}

@Injectable({
    providedIn: 'root'
})
export class GoalService {
    private http = inject(HttpClient);
    private apiUrl = '/api/goals';

    private _goals = signal<PmsGoal[]>([]);
    readonly goals = this._goals.asReadonly();

    constructor() {
        this.loadGoals();
    }

    loadGoals() {
        this.http.get<PmsGoal[]>(this.apiUrl).subscribe({
            next: (goals) => this._goals.set(goals),
            error: (err) => console.error('Error loading goals:', err)
        });
    }

    addGoal(goal: Omit<PmsGoal, 'id'>) {
        this.http.post<PmsGoal>(this.apiUrl, goal).subscribe({
            next: (newGoal) => {
                this._goals.update(goals => [newGoal, ...goals]);
            },
            error: (err) => console.error('Error adding goal:', err)
        });
    }

    updateGoal(updatedGoal: PmsGoal) {
        this.http.put<PmsGoal>(`${this.apiUrl}/${updatedGoal.id}`, updatedGoal).subscribe({
            next: (resGoal) => {
                this._goals.update(goals =>
                    goals.map(g => g.id === resGoal.id ? resGoal : g)
                );
            },
            error: (err) => console.error('Error updating goal:', err)
        });
    }

    deleteGoal(id: number) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe({
            next: () => {
                this._goals.update(goals => goals.filter(g => g.id !== id));
            },
            error: (err) => console.error('Error deleting goal:', err)
        });
    }
}
