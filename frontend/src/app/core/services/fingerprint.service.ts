import { Injectable, signal } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
// ✅ Import correct de la lib open-source v4
import FingerprintJS, { Agent, GetResult } from '@fingerprintjs/fingerprintjs';
import { ApiService } from './api.service';

export interface FingerprintPayload {
  visitorId: string;
  confidence: { score: number };
  components: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class FingerprintService {

  currentFingerprint = signal<FingerprintPayload | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // ✅ L'agent est mis en cache pour éviter de le recharger à chaque appel
  private agentPromise: Promise<Agent> | null = null;

  constructor(private apiService: ApiService) {}

  private getAgent(): Promise<Agent> {
    if (!this.agentPromise) {
      // ✅ FingerprintJS.load() charge la lib et retourne un agent
      this.agentPromise = FingerprintJS.load();
    }
    return this.agentPromise;
  }

  initAndTrack(): Observable<any> {
    this.isLoading.set(true);
    this.error.set(null);

    return from(this.getAgent()).pipe(

      // ✅ fp.get() sans option extendedResult (n'existe pas en v4 open-source)
      switchMap((fp: Agent) => from(fp.get())),

      switchMap((result: GetResult) => {

        // ✅ Extraction correcte des composants dans la v4 open-source
        // Chaque composant est un objet { value, duration } ou { error, duration }
        const components: Record<string, any> = {};

        for (const [key, component] of Object.entries(result.components)) {
          const comp = component as any;
          if (comp && typeof comp === 'object') {
            components[key] = {
              value: comp.value,
              duration: comp.duration,
              error: comp.error ?? null
            };
          } else {
            components[key] = { value: comp };
          }
        }

        const payload: FingerprintPayload = {
          visitorId: result.visitorId,
          confidence: result.confidence,
          components
        };

        console.log('🔍 VisitorId:', payload.visitorId);
        console.log('🎯 Confidence:', payload.confidence);
        console.log('📦 Nombre de composants:', Object.keys(components).length);
        console.log('📋 Composants:', components);

        this.currentFingerprint.set(payload);
        this.isLoading.set(false);

        // Envoi au backend Node.js
        return this.apiService.post<any>('/fingerprints', payload);
      })
    );
  }

  getAllFingerprints(): Observable<any> {
    return this.apiService.get('/fingerprints');
  }

  getStats(): Observable<any> {
    return this.apiService.get('/fingerprints/stats/summary');
  }

  deleteAll(): Observable<any> {
    return this.apiService.delete('/fingerprints');
  }
}
