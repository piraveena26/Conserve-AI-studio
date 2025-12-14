import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface DivisionTaxSetting {
  id: number;
  name: string;
  code: string;
  taxType: 'VAT' | 'GST';
  taxPercentage: number;
  status: 'Active' | 'Inactive';
}

const API_URL = '/api/financial-config/tax-settings';

@Injectable({
  providedIn: 'root'
})
export class FinancialConfigService {
  private http = inject(HttpClient);
  
  private _taxSettings = signal<DivisionTaxSetting[]>([]);
  public readonly taxSettings = this._taxSettings.asReadonly();
  public readonly divisions = computed(() => this._taxSettings().map(s => s.name));
  
  constructor() {
    this.loadTaxSettings();
  }

  async loadTaxSettings(): Promise<void> {
    try {
      const settings = await lastValueFrom(this.http.get<DivisionTaxSetting[]>(API_URL));
      this._taxSettings.set(settings);
    } catch (error) {
        console.error("Failed to load tax settings", error);
        // On failure, set to empty array to avoid breaking the UI
        this._taxSettings.set([]);
    }
  }

  async addTaxSetting(setting: Omit<DivisionTaxSetting, 'id' | 'code' | 'status'>): Promise<void> {
    await lastValueFrom(this.http.post<DivisionTaxSetting>(API_URL, setting));
    await this.loadTaxSettings();
  }
  
  async updateTaxSetting(setting: DivisionTaxSetting): Promise<void> {
    await lastValueFrom(this.http.put<DivisionTaxSetting>(`${API_URL}/${setting.id}`, setting));
    await this.loadTaxSettings();
  }
  
  async deleteTaxSetting(id: number): Promise<void> {
    await lastValueFrom(this.http.delete(`${API_URL}/${id}`));
    await this.loadTaxSettings();
  }
}
