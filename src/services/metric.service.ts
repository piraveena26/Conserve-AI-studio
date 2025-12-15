import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Metric {
    id: number;
    metricType: string;
    metric: string;
    definition5star: number;
    definition4star: number;
    definition3star: number;
    definition2star: number;
    definition1star: number;
}

@Injectable({
    providedIn: 'root',
})
export class MetricService {
    private http = inject(HttpClient);
    private apiUrl = '/api/metrics';

    private readonly _metrics = signal<Metric[]>([]);
    public readonly metrics = this._metrics.asReadonly();

    constructor() {
        this.loadMetrics();
    }

    loadMetrics() {
        this.http.get<Metric[]>(this.apiUrl).subscribe({
            next: (metrics) => this._metrics.set(metrics),
            error: (err) => console.error('Error loading metrics:', err)
        });
    }

    addMetric(metric: Omit<Metric, 'id'>): void {
        this.http.post<Metric>(this.apiUrl, metric).subscribe({
            next: (newMetric) => {
                this._metrics.update(metrics => [newMetric, ...metrics]);
            },
            error: (err) => console.error('Error adding metric:', err)
        });
    }

    updateMetric(metric: Metric): void {
        this.http.put<Metric>(`${this.apiUrl}/${metric.id}`, metric).subscribe({
            next: (updatedMetric) => {
                this._metrics.update(metrics =>
                    metrics.map(m => m.id === updatedMetric.id ? updatedMetric : m)
                );
            },
            error: (err) => console.error('Error updating metric:', err)
        });
    }

    deleteMetric(id: number): void {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe({
            next: () => {
                this._metrics.update(metrics => metrics.filter(m => m.id !== id));
            },
            error: (err) => console.error('Error deleting metric:', err)
        });
    }
}
