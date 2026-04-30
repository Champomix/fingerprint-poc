import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FingerprintProService, FingerprintProPayload } from '../../core/services/fingerprint-pro.service';

@Component({
  selector: 'app-home-pro',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './home-pro.component.html',
  styleUrl: './home-pro.component.scss'
})
export class HomeProComponent implements OnInit {

  private fingerprintProService = inject(FingerprintProService);

  isLoading = this.fingerprintProService.isLoading;
  currentFingerprint = this.fingerprintProService.currentFingerprint;
  error = this.fingerprintProService.error;

  trackingDone = false;
  serverResponse: any = null;

  ngOnInit(): void {
    this.startTracking();
  }

  startTracking(): void {
    this.trackingDone = false;
    this.serverResponse = null;

    this.fingerprintProService.initAndTrack().subscribe({
      next: (response) => {
        this.serverResponse = response;
        this.trackingDone = true;
        console.log('✅ Réponse serveur Pro:', response);
      },
      error: (err) => {
        console.error('❌ Erreur Pro:', err);
        this.trackingDone = true;
      }
    });
  }

  formatDate(timestamp: string | null | undefined): string {
    if (!timestamp) return 'Jamais';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('fr-FR');
    } catch {
      return 'Invalide';
    }
  }

  getLocationString(fp: FingerprintProPayload): string {
    if (!fp.ipLocation) return 'Non disponible';
    const parts: string[] = [];
    if (fp.ipLocation.city?.name) parts.push(fp.ipLocation.city.name);
    if (fp.ipLocation.country?.name) parts.push(fp.ipLocation.country.name);
    return parts.length > 0 ? parts.join(', ') : 'Non disponible';
  }
}
