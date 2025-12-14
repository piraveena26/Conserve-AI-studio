import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface MailConfiguration {
  email: string;
  host: string;
  port: number;
  hostUser: string;
  hostPassword?: string; // Password might not be returned from GET
  useSsl: boolean;
}

const API_URL = '/api/mail-config';

@Injectable({
  providedIn: 'root'
})
export class MailConfigService {
  private http = inject(HttpClient);
  
  private _config = signal<MailConfiguration | null>(null);
  public readonly config = this._config.asReadonly();
  
  constructor() {
    this.loadConfig();
  }

  async loadConfig(): Promise<void> {
    try {
      // We assume the API returns a single config object
      const config = await lastValueFrom(this.http.get<MailConfiguration>(API_URL));
      this._config.set(config);
    } catch (error) {
      console.error('Failed to load mail configuration', error);
      // Set a default or handle the error appropriately
      this._config.set({ email: '', host: '', port: 0, hostUser: '', useSsl: false });
    }
  }

  async updateConfig(config: MailConfiguration): Promise<void> {
    // Filter out password if it's empty, so we don't send an empty string
    const payload: Partial<MailConfiguration> = { ...config };
    if (!payload.hostPassword) {
      delete payload.hostPassword;
    }
    await lastValueFrom(this.http.put<MailConfiguration>(API_URL, payload));
    await this.loadConfig();
  }
}
