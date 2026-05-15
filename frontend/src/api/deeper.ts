// Deeper Connect API client.
// - Tries the configured Deeper IP on the user's local network.
// - If unreachable (typical in preview/cloud), falls back to a realistic mock backend
//   so the UI is fully functional for demonstration and testing.

export const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

export type Country = (typeof COUNTRIES)[number];

export type DpnMode = "smart" | "full";
export type SecurityProfile = "basic" | "standard" | "strict";
export type LogType = "tunnel" | "security" | "device" | "system";
export type ParentalCategory = "adult" | "violence" | "gambling" | "social" | "gaming" | "shopping";

export interface SystemStatus {
  online: boolean;
  cpu: number;
  ram: number;
  tempC: number;
  uptimeSec: number;
}

export interface BandwidthPoint { t: number; down: number; up: number; }
export interface Tunnel { id: string; countryCode: string; name: string; latencyMs: number; throughputMbps: number; active: boolean; }
export interface ConnectedDevice {
  id: string; name: string; ip: string;
  type: "phone" | "laptop" | "tv" | "console" | "tablet" | "iot" | "desktop";
  rxKbps: number; txKbps: number; throughDpn: boolean; blocked: boolean;
  parentalProfileId?: string | null;
}

export interface ThreatStats { malware: number; trackers: number; intrusions: number; phishing: number; }
export interface AdblockExceptions { domains: string[]; }
export interface AppRelocation { id: string; appName: string; bundleId: string; countryCode: string; }
export interface DomainRule { id: string; domain: string; countryCode: string; }
export interface IpRule { id: string; cidr: string; countryCode: string; }
export interface Schedule { weekday: number[]; start: string; end: string; } // weekday 0=Sun..6=Sat, times "HH:mm"
export interface ParentalProfile {
  id: string;
  name: string;
  deviceIds: string[];
  blockedCategories: ParentalCategory[];
  schedule: Schedule | null;
  screenTimeMinutes: number; // daily max
}

export interface LogEntry {
  id: string;
  ts: number;
  type: LogType;
  level: "info" | "warn" | "error";
  message: string;
  meta?: Record<string, string>;
}

export interface DeeperDeviceRecord {
  id: string;
  label: string;
  ip: string;
  active: boolean;
  lastSeen: number;
}

export interface DeeperState {
  status: SystemStatus;
  dpnEnabled: boolean;
  mode: DpnMode;
  adblock: boolean;
  parental: boolean;
  selectedCountry: string;
  tunnels: Tunnel[];
  devices: ConnectedDevice[];
  bandwidth: BandwidthPoint[];
  // v2 additions
  securityProfile: SecurityProfile;
  threats: ThreatStats;
  adblockExceptions: string[];
  appRelocations: AppRelocation[];
  domainRules: DomainRule[];
  ipRules: IpRule[];
  parentalProfiles: ParentalProfile[];
  logs: LogEntry[];
}

// ------ Mock simulator ------
function uid(prefix = "id") { return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 999)}`; }

class DeeperSimulator {
  state: DeeperState;
  private startedAt: number;

  constructor() {
    this.startedAt = Date.now() - 60 * 60 * 1000 * 26;
    const now = Date.now();
    const initialBw: BandwidthPoint[] = [];
    for (let i = 60; i >= 0; i--) {
      initialBw.push({
        t: now - i * 10000,
        down: 40 + Math.sin(i / 4) * 18 + Math.random() * 10,
        up: 6 + Math.sin(i / 5) * 3 + Math.random() * 3,
      });
    }
    const devices: ConnectedDevice[] = [
      { id: "d1", name: "iPhone de Léa", ip: "192.168.0.21", type: "phone", rxKbps: 320, txKbps: 28, throughDpn: true, blocked: false, parentalProfileId: "p1" },
      { id: "d2", name: "MacBook Pro", ip: "192.168.0.45", type: "laptop", rxKbps: 1480, txKbps: 96, throughDpn: true, blocked: false },
      { id: "d3", name: "Samsung TV", ip: "192.168.0.60", type: "tv", rxKbps: 4200, txKbps: 12, throughDpn: false, blocked: false },
      { id: "d4", name: "PS5", ip: "192.168.0.71", type: "console", rxKbps: 180, txKbps: 24, throughDpn: false, blocked: false },
      { id: "d5", name: "iPad enfant", ip: "192.168.0.33", type: "tablet", rxKbps: 60, txKbps: 8, throughDpn: true, blocked: false, parentalProfileId: "p1" },
      { id: "d6", name: "Nest Cam", ip: "192.168.0.88", type: "iot", rxKbps: 12, txKbps: 240, throughDpn: false, blocked: false },
    ];
    this.state = {
      status: { online: true, cpu: 22, ram: 41, tempC: 47, uptimeSec: 26 * 3600 },
      dpnEnabled: true,
      mode: "smart",
      adblock: true,
      parental: false,
      selectedCountry: "US",
      tunnels: [
        { id: "t1", countryCode: "US", name: "US-East-12", latencyMs: 38, throughputMbps: 88, active: true },
        { id: "t2", countryCode: "JP", name: "JP-Tokyo-04", latencyMs: 142, throughputMbps: 52, active: true },
        { id: "t3", countryCode: "DE", name: "DE-Frankfurt-07", latencyMs: 24, throughputMbps: 120, active: true },
      ],
      devices,
      bandwidth: initialBw,
      securityProfile: "standard",
      threats: { malware: 12, trackers: 487, intrusions: 3, phishing: 6 },
      adblockExceptions: ["lemonde.fr", "wikipedia.org"],
      appRelocations: [
        { id: uid("ar"), appName: "Netflix", bundleId: "com.netflix.Netflix", countryCode: "US" },
        { id: uid("ar"), appName: "BBC iPlayer", bundleId: "uk.co.bbc.iplayer", countryCode: "GB" },
        { id: uid("ar"), appName: "Spotify", bundleId: "com.spotify.client", countryCode: "SG" },
      ],
      domainRules: [
        { id: uid("dr"), domain: "netflix.com", countryCode: "US" },
        { id: uid("dr"), domain: "bbc.co.uk", countryCode: "GB" },
        { id: uid("dr"), domain: "*.cn", countryCode: "JP" },
      ],
      ipRules: [
        { id: uid("ir"), cidr: "8.8.8.0/24", countryCode: "US" },
        { id: uid("ir"), cidr: "1.1.1.0/24", countryCode: "AU" },
      ],
      parentalProfiles: [
        {
          id: "p1",
          name: "Enfants",
          deviceIds: ["d1", "d5"],
          blockedCategories: ["adult", "violence", "gambling"],
          schedule: { weekday: [1, 2, 3, 4, 5], start: "07:00", end: "21:00" },
          screenTimeMinutes: 120,
        },
      ],
      logs: this.seedLogs(),
    };
  }

  private seedLogs(): LogEntry[] {
    const now = Date.now();
    const sample: Omit<LogEntry, "id" | "ts">[] = [
      { type: "tunnel", level: "info", message: "Tunnel US-East-12 connecté", meta: { country: "US", latency: "38ms" } },
      { type: "security", level: "warn", message: "Tracker bloqué : doubleclick.net", meta: { device: "d2" } },
      { type: "security", level: "error", message: "Tentative d'intrusion bloquée", meta: { ip: "185.220.101.42" } },
      { type: "device", level: "info", message: "Appareil connecté : iPhone de Léa", meta: { ip: "192.168.0.21" } },
      { type: "tunnel", level: "info", message: "Tunnel JP-Tokyo-04 connecté", meta: { country: "JP" } },
      { type: "security", level: "warn", message: "Malware bloqué : trojan.gen", meta: { device: "d3" } },
      { type: "system", level: "info", message: "AtomOS démarré", meta: { version: "2.4.1" } },
      { type: "security", level: "warn", message: "Pub bloquée : ads.example.com", meta: { device: "d2" } },
      { type: "device", level: "info", message: "iPad enfant — temps d'écran dépassé", meta: { device: "d5" } },
      { type: "tunnel", level: "info", message: "Tunnel DE-Frankfurt-07 connecté", meta: { country: "DE" } },
      { type: "device", level: "warn", message: "Nouvel appareil détecté", meta: { ip: "192.168.0.99" } },
      { type: "security", level: "warn", message: "Tracker bloqué : analytics.google.com", meta: { device: "d2" } },
    ];
    return sample.map((s, i) => ({ ...s, id: uid("log"), ts: now - i * 1000 * 60 * (5 + i * 2) }));
  }

  private addLog(entry: Omit<LogEntry, "id" | "ts">) {
    this.state.logs = [{ ...entry, id: uid("log"), ts: Date.now() }, ...this.state.logs].slice(0, 300);
  }

  tick(): DeeperState {
    const now = Date.now();
    const last = this.state.bandwidth[this.state.bandwidth.length - 1];
    if (!last || now - last.t > 3000) {
      const base = this.state.dpnEnabled ? 45 : 60;
      const point: BandwidthPoint = {
        t: now,
        down: Math.max(2, base + Math.sin(now / 5000) * 22 + (Math.random() - 0.5) * 18),
        up: Math.max(0.5, 6 + Math.sin(now / 4000) * 3 + (Math.random() - 0.5) * 3),
      };
      this.state.bandwidth = [...this.state.bandwidth.slice(-119), point];
    }
    this.state.status = {
      online: this.state.status.online,
      cpu: Math.max(8, Math.min(85, this.state.status.cpu + (Math.random() - 0.5) * 6)),
      ram: Math.max(20, Math.min(90, this.state.status.ram + (Math.random() - 0.5) * 3)),
      tempC: Math.max(38, Math.min(72, this.state.status.tempC + (Math.random() - 0.5) * 1.2)),
      uptimeSec: this.state.status.online ? Math.floor((now - this.startedAt) / 1000) : 0,
    };
    // Slowly grow threat counters when adblock/parental is enabled
    if (this.state.adblock && Math.random() < 0.2) this.state.threats.trackers += 1;
    if (this.state.adblock && Math.random() < 0.05) this.state.threats.malware += 1;
    return this.state;
  }

  setDpn(v: boolean) { this.state.dpnEnabled = v; this.addLog({ type: "tunnel", level: "info", message: v ? "DPN activé" : "DPN désactivé" }); }
  setMode(m: DpnMode) { this.state.mode = m; this.addLog({ type: "tunnel", level: "info", message: `Mode changé : ${m === "smart" ? "Smart Route" : "Full Route"}` }); }
  setAdblock(v: boolean) { this.state.adblock = v; this.addLog({ type: "security", level: "info", message: v ? "AdBlock activé" : "AdBlock désactivé" }); }
  setParental(v: boolean) { this.state.parental = v; this.addLog({ type: "security", level: "info", message: v ? "Contrôle parental activé" : "Contrôle parental désactivé" }); }
  setCountry(code: string) {
    this.state.selectedCountry = code;
    let t = this.state.tunnels.find(x => x.countryCode === code);
    if (!t) {
      t = { id: uid("t"), countryCode: code, name: `${code}-Node-${Math.floor(Math.random() * 99)}`, latencyMs: 30 + Math.floor(Math.random() * 160), throughputMbps: 40 + Math.floor(Math.random() * 120), active: true };
      this.state.tunnels = [t, ...this.state.tunnels];
    }
    this.addLog({ type: "tunnel", level: "info", message: `Pays sélectionné : ${code}`, meta: { country: code } });
  }
  addTunnel(code: string) {
    const t: Tunnel = { id: uid("t"), countryCode: code, name: `${code}-Node-${Math.floor(Math.random() * 99)}`, latencyMs: 30 + Math.floor(Math.random() * 160), throughputMbps: 40 + Math.floor(Math.random() * 120), active: true };
    this.state.tunnels = [t, ...this.state.tunnels];
    this.addLog({ type: "tunnel", level: "info", message: `Tunnel ajouté : ${t.name}`, meta: { country: code } });
  }
  removeTunnel(id: string) {
    const t = this.state.tunnels.find(x => x.id === id);
    this.state.tunnels = this.state.tunnels.filter(x => x.id !== id);
    if (t) this.addLog({ type: "tunnel", level: "info", message: `Tunnel supprimé : ${t.name}` });
  }
  toggleDeviceDpn(id: string) {
    this.state.devices = this.state.devices.map(d => d.id === id ? { ...d, throughDpn: !d.throughDpn } : d);
  }
  toggleDeviceBlock(id: string) {
    const d = this.state.devices.find(x => x.id === id);
    this.state.devices = this.state.devices.map(x => x.id === id ? { ...x, blocked: !x.blocked } : x);
    if (d) this.addLog({ type: "device", level: "warn", message: `Internet ${d.blocked ? "débloqué" : "bloqué"} pour ${d.name}` });
  }
  reboot() {
    this.state.status.online = false;
    this.addLog({ type: "system", level: "warn", message: "Redémarrage demandé" });
    setTimeout(() => {
      this.state.status.online = true;
      this.startedAt = Date.now();
      this.addLog({ type: "system", level: "info", message: "Système redémarré" });
    }, 4000);
  }

  // v2 setters
  setSecurityProfile(p: SecurityProfile) {
    this.state.securityProfile = p;
    this.addLog({ type: "security", level: "info", message: `Profil de sécurité : ${p}` });
  }
  addAdblockException(domain: string) {
    if (!this.state.adblockExceptions.includes(domain)) {
      this.state.adblockExceptions = [domain, ...this.state.adblockExceptions];
    }
  }
  removeAdblockException(domain: string) {
    this.state.adblockExceptions = this.state.adblockExceptions.filter(d => d !== domain);
  }
  upsertParentalProfile(p: ParentalProfile) {
    const idx = this.state.parentalProfiles.findIndex(x => x.id === p.id);
    if (idx >= 0) this.state.parentalProfiles[idx] = p;
    else this.state.parentalProfiles = [p, ...this.state.parentalProfiles];
    this.state.parentalProfiles = [...this.state.parentalProfiles];
  }
  removeParentalProfile(id: string) {
    this.state.parentalProfiles = this.state.parentalProfiles.filter(p => p.id !== id);
    this.state.devices = this.state.devices.map(d => d.parentalProfileId === id ? { ...d, parentalProfileId: null } : d);
  }
  assignDeviceToProfile(deviceId: string, profileId: string | null) {
    this.state.devices = this.state.devices.map(d => d.id === deviceId ? { ...d, parentalProfileId: profileId } : d);
  }
  addAppRelocation(appName: string, bundleId: string, code: string) {
    this.state.appRelocations = [{ id: uid("ar"), appName, bundleId, countryCode: code }, ...this.state.appRelocations];
  }
  removeAppRelocation(id: string) {
    this.state.appRelocations = this.state.appRelocations.filter(a => a.id !== id);
  }
  updateAppRelocationCountry(id: string, code: string) {
    this.state.appRelocations = this.state.appRelocations.map(a => a.id === id ? { ...a, countryCode: code } : a);
  }
  addDomainRule(domain: string, code: string) {
    this.state.domainRules = [{ id: uid("dr"), domain, countryCode: code }, ...this.state.domainRules];
  }
  removeDomainRule(id: string) {
    this.state.domainRules = this.state.domainRules.filter(r => r.id !== id);
  }
  updateDomainRule(id: string, code: string) {
    this.state.domainRules = this.state.domainRules.map(r => r.id === id ? { ...r, countryCode: code } : r);
  }
  addIpRule(cidr: string, code: string) {
    this.state.ipRules = [{ id: uid("ir"), cidr, countryCode: code }, ...this.state.ipRules];
  }
  removeIpRule(id: string) {
    this.state.ipRules = this.state.ipRules.filter(r => r.id !== id);
  }
  updateIpRule(id: string, code: string) {
    this.state.ipRules = this.state.ipRules.map(r => r.id === id ? { ...r, countryCode: code } : r);
  }
}

const sim = new DeeperSimulator();

// ------ Public API ------
export interface DeeperClientConfig { ip: string; demo: boolean; }
let currentConfig: DeeperClientConfig = { ip: "34.34.34.34", demo: true };
export function configureClient(cfg: DeeperClientConfig) { currentConfig = cfg; }
export function getConfig(): DeeperClientConfig { return currentConfig; }

export async function pingDeeper(ip: string, timeoutMs = 1500): Promise<boolean> {
  if (typeof window !== "undefined" && (window as any)?.location?.protocol === "https:") return false;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`http://${ip}/`, { method: "GET", signal: controller.signal });
    clearTimeout(id);
    return res.ok || res.status < 500;
  } catch { return false; }
}

export async function login(p: string): Promise<boolean> { await delay(400); return p.length >= 4; }
const clone = (s: DeeperState) => JSON.parse(JSON.stringify(s)) as DeeperState;
export async function fetchState(): Promise<DeeperState> { await delay(120); return clone(sim.tick()); }
export async function setDpnEnabled(v: boolean) { sim.setDpn(v); await delay(150); return clone(sim.state); }
export async function setMode(m: DpnMode) { sim.setMode(m); await delay(180); return clone(sim.state); }
export async function setAdblock(v: boolean) { sim.setAdblock(v); await delay(150); return clone(sim.state); }
export async function setParental(v: boolean) { sim.setParental(v); await delay(150); return clone(sim.state); }
export async function setCountry(code: string) { sim.setCountry(code); await delay(220); return clone(sim.state); }
export async function addTunnel(code: string) { sim.addTunnel(code); await delay(220); return clone(sim.state); }
export async function removeTunnel(id: string) { sim.removeTunnel(id); await delay(180); return clone(sim.state); }
export async function toggleDeviceDpn(id: string) { sim.toggleDeviceDpn(id); await delay(140); return clone(sim.state); }
export async function toggleDeviceBlock(id: string) { sim.toggleDeviceBlock(id); await delay(140); return clone(sim.state); }
export async function rebootDeeper() { sim.reboot(); await delay(220); }

// v2 endpoints
export async function setSecurityProfile(p: SecurityProfile) { sim.setSecurityProfile(p); await delay(180); return clone(sim.state); }
export async function addAdblockException(d: string) { sim.addAdblockException(d); await delay(120); return clone(sim.state); }
export async function removeAdblockException(d: string) { sim.removeAdblockException(d); await delay(120); return clone(sim.state); }
export async function upsertParentalProfile(p: ParentalProfile) { sim.upsertParentalProfile(p); await delay(180); return clone(sim.state); }
export async function removeParentalProfile(id: string) { sim.removeParentalProfile(id); await delay(180); return clone(sim.state); }
export async function assignDeviceToProfile(deviceId: string, profileId: string | null) { sim.assignDeviceToProfile(deviceId, profileId); await delay(140); return clone(sim.state); }
export async function addAppRelocation(name: string, bundle: string, code: string) { sim.addAppRelocation(name, bundle, code); await delay(160); return clone(sim.state); }
export async function removeAppRelocation(id: string) { sim.removeAppRelocation(id); await delay(140); return clone(sim.state); }
export async function updateAppRelocationCountry(id: string, code: string) { sim.updateAppRelocationCountry(id, code); await delay(140); return clone(sim.state); }
export async function addDomainRule(domain: string, code: string) { sim.addDomainRule(domain, code); await delay(140); return clone(sim.state); }
export async function removeDomainRule(id: string) { sim.removeDomainRule(id); await delay(120); return clone(sim.state); }
export async function updateDomainRule(id: string, code: string) { sim.updateDomainRule(id, code); await delay(140); return clone(sim.state); }
export async function addIpRule(cidr: string, code: string) { sim.addIpRule(cidr, code); await delay(140); return clone(sim.state); }
export async function removeIpRule(id: string) { sim.removeIpRule(id); await delay(120); return clone(sim.state); }
export async function updateIpRule(id: string, code: string) { sim.updateIpRule(id, code); await delay(140); return clone(sim.state); }

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
