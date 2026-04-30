// src/app/core/services/fingerprint-pro.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, from, switchMap, catchError, of } from 'rxjs';
import {
  ExtendedGetResult,
  FingerprintjsProAngularService,
  GetResult,
} from '@fingerprintjs/fingerprintjs-pro-angular'
import { ApiService } from './api.service';

export interface FingerprintProPayload {
  requestId: string;
  visitorId: string;
  confidence: { score: number };
  visitorFound: boolean;
  incognito: boolean;
  browserName: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  ip: string;
  ipLocation?: {
    city?: { name: string };
    country?: { name: string; code: string };
    continent?: { name: string; code: string };
    timezone?: string;
  };
  firstSeenAt?: {
    global: string | null;
    subscription: string | null;
  };
  lastSeenAt?: {
    global: string | null;
    subscription: string | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FingerprintProService {

  currentFingerprint = signal<FingerprintProPayload | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private fpAngularService: FingerprintjsProAngularService,
    private apiService: ApiService
  ) {}

  initAndTrack(): Observable<any> {
    this.isLoading.set(true);
    this.error.set(null);

    // Utilise le SDK officiel Angular
    return from(
      this.fpAngularService.getVisitorData({ extendedResult: true })
    ).pipe(
      switchMap((result: ExtendedGetResult | any) => {
        console.log('🔍 Résultat FingerprintJS Pro:', result);

        const payload: FingerprintProPayload = {
          requestId:      result.requestId,
          visitorId:      result.visitorId,
          confidence:     result.confidence,
          visitorFound:   result.visitorFound ?? false,
          incognito:      result.incognito ?? false,
          browserName:    result.browserName ?? 'Unknown',
          browserVersion: result.browserVersion ?? 'Unknown',
          os:             result.os ?? 'Unknown',
          osVersion:      result.osVersion ?? 'Unknown',
          device:         result.device ?? 'Unknown',
          ip:             result.ip ?? 'Unknown',
          ipLocation:     result.ipLocation,
          firstSeenAt:    result.firstSeenAt,
          lastSeenAt:     result.lastSeenAt,
        };

        console.log('🎯 VisitorId:', payload.visitorId);
        console.log('🔒 Incognito:', payload.incognito);
        console.log('📍 Localisation:', payload.ipLocation);

        this.currentFingerprint.set(payload);
        this.isLoading.set(false);

        return this.apiService.post<any>('/fingerprints-pro', payload);
      }),
      catchError((err) => {
        console.error('❌ Erreur FingerprintJS Pro:', err);
        this.error.set(err.message ?? 'Erreur lors de l\'identification');
        this.isLoading.set(false);
        return of({ error: err.message });
      })
    );
  }

  getAllFingerprints(): Observable<any> {
    return this.apiService.get('/fingerprints-pro');
  }

  getStats(): Observable<any> {
    return this.apiService.get('/fingerprints-pro/stats/summary');
  }

  deleteAll(): Observable<any> {
    return this.apiService.delete('/fingerprints-pro');
  }
}
