import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FingerprintService, FingerprintPayload } from '../../core/services/fingerprint.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  private fingerprintService = inject(FingerprintService);

  isLoading = this.fingerprintService.isLoading;
  currentFingerprint = this.fingerprintService.currentFingerprint;
  error = this.fingerprintService.error;

  trackingDone = false;
  serverResponse: any = null;

  // ✅ Composants réellement collectés par FingerprintJS v4 open-source
  readonly knownComponents: Record<string, string> = {
    fonts: '🔤 Polices installées',
    domBlockers: '🛡️ Bloqueurs de pub',
    fontPreferences: '🎨 Préférences de polices',
    audio: '🔊 Empreinte audio',
    screenFrame: '🖥️ Cadre d\'écran',
    canvas: '🖼️ Empreinte canvas',
    osCpu: '💻 OS/CPU',
    languages: '🌍 Langues',
    colorDepth: '🎨 Profondeur de couleur',
    deviceMemory: '💾 Mémoire RAM',
    screenResolution: '📺 Résolution d\'écran',
    hardwareConcurrency: '⚙️ Nombre de coeurs CPU',
    timezone: '🕐 Fuseau horaire',
    sessionStorage: '📦 Session Storage',
    localStorage: '📦 Local Storage',
    indexedDB: '🗄️ IndexedDB',
    openDatabase: '🗄️ Open Database',
    cpuClass: '⚙️ Classe CPU',
    platform: '💻 Plateforme',
    plugins: '🔌 Plugins navigateur',
    touchSupport: '👆 Support tactile',
    vendor: '🏭 Fabricant navigateur',
    vendorFlavors: '🏷️ Variantes navigateur',
    cookiesEnabled: '🍪 Cookies activés',
    colorGamut: '🌈 Gamut de couleurs',
    invertedColors: '🔄 Couleurs inversées',
    forcedColors: '🎨 Couleurs forcées',
    monochrome: '⬛ Mode monochrome',
    contrast: '☀️ Contraste',
    reducedMotion: '🎬 Animations réduites',
    hdr: '📡 Support HDR',
    math: '🔢 Empreinte mathématique',
    pdfViewerEnabled: '📄 Lecteur PDF',
    architecture: '🏗️ Architecture'
  };

  ngOnInit(): void {
    this.startTracking();
  }

  startTracking(): void {
    this.trackingDone = false;
    this.serverResponse = null;

    this.fingerprintService.initAndTrack().subscribe({
      next: (response) => {
        this.serverResponse = response;
        this.trackingDone = true;
        console.log('✅ Réponse serveur:', response);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.trackingDone = true;
      }
    });
  }

  getComponentEntries(fp: FingerprintPayload): { key: string; label: string; value: any }[] {
    if (!fp?.components) return [];
    return Object.entries(fp.components).map(([key, data]) => ({
      key,
      label: this.knownComponents[key] || key,
      value: (data as any)?.value
    }));
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? '✅ Oui' : '❌ Non';
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return value.map(v => Array.isArray(v) ? v.join(', ') : v).join(' | ');
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
