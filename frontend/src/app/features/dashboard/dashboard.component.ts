import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FingerprintService } from '../../core/services/fingerprint.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private fingerprintService = inject(FingerprintService);

  fingerprints = signal<any[]>([]);
  stats = signal<any | null>(null);
  isLoading = signal<boolean>(true);
  selectedFingerprint = signal<any | null>(null);
  activeTab = signal<string>('overview');
  errorMessage = signal<string | null>(null);

  readonly knownComponents: Record<string, string> = {
    fonts: '🔤 Polices',
    domBlockers: '🛡️ Ad Blockers',
    fontPreferences: '🎨 Préf. polices',
    audio: '🔊 Audio',
    screenFrame: '🖥️ Cadre écran',
    canvas: '🖼️ Canvas',
    osCpu: '💻 OS/CPU',
    languages: '🌍 Langues',
    colorDepth: '🎨 Couleurs',
    deviceMemory: '💾 RAM',
    screenResolution: '📺 Résolution',
    hardwareConcurrency: '⚙️ CPU Coeurs',
    timezone: '🕐 Timezone',
    sessionStorage: '📦 SessionStorage',
    localStorage: '📦 LocalStorage',
    indexedDB: '🗄️ IndexedDB',
    openDatabase: '🗄️ OpenDatabase',
    cpuClass: '⚙️ CPU Classe',
    platform: '💻 Plateforme',
    plugins: '🔌 Plugins',
    touchSupport: '👆 Touch',
    vendor: '🏭 Vendor',
    vendorFlavors: '🏷️ Vendor Flavors',
    cookiesEnabled: '🍪 Cookies',
    colorGamut: '🌈 Color Gamut',
    invertedColors: '🔄 Inv. Couleurs',
    forcedColors: '🎨 Forced Colors',
    monochrome: '⬛ Monochrome',
    contrast: '☀️ Contraste',
    reducedMotion: '🎬 Anim. réduites',
    hdr: '📡 HDR',
    math: '🔢 Math',
    pdfViewerEnabled: '📄 PDF Viewer',
    architecture: '🏗️ Architecture'
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.fingerprintService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (err) => {
        this.errorMessage.set('Impossible de charger les statistiques');
        console.error(err);
      }
    });

    this.fingerprintService.getAllFingerprints().subscribe({
      next: (response) => {
        this.fingerprints.set(response.fingerprints || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Impossible de charger les fingerprints');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  selectFingerprint(fp: any): void {
    if (this.selectedFingerprint()?._id === fp._id) {
      this.selectedFingerprint.set(null);
    } else {
      this.selectedFingerprint.set(fp);
    }
  }

  deleteAll(): void {
    if (!confirm('Supprimer tous les fingerprints ?')) return;

    this.fingerprintService.deleteAll().subscribe({
      next: () => {
        this.fingerprints.set([]);
        this.stats.set(null);
        this.selectedFingerprint.set(null);
      },
      error: (err) => console.error(err)
    });
  }

  getComponentEntries(fp: any): { key: string; label: string; value: any; duration: number }[] {
    if (!fp?.components) return [];
    return Object.entries(fp.components).map(([key, data]: [string, any]) => ({
      key,
      label: this.knownComponents[key] || key,
      value: data?.value,
      duration: data?.duration || 0
    }));
  }

  getStatEntries(obj: any): { key: string; value: number }[] {
    if (!obj) return [];
    return Object.entries(obj)
      .map(([key, value]) => ({ key, value: value as number }))
      .sort((a, b) => b.value - a.value);
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? '✅ Oui' : '❌ Non';
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return value.map(v => Array.isArray(v) ? v.join(', ') : String(v)).join(' | ');
    }
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('fr-FR');
  }

  truncateId(id: string): string {
    if (!id) return 'N/A';
    return id.length > 16 ? `${id.substring(0, 8)}...${id.substring(id.length - 8)}` : id;
  }
}
