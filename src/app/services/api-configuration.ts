import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN', {
  providedIn: 'root',
  factory: () => environment.apiOrigin
});

export function createApiBaseUrl(origin: string): string {
  try {
    const url = new URL(origin.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname.split('/').some(part => part !== '')) {
      throw new Error();
    }
    return url.origin + '/api';
  } catch {
    throw new Error('Origem da API inválida');
  }
}
