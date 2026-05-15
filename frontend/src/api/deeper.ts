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

export interface SystemStatus {
  online: boolean;
  cpu: number; // 0-100
  ram: number; // 0-100
  tempC: number;
  uptimeSec: number;
}

export interface BandwidthPoint {
  t: number; // epoch ms
  down: number; // Mbps
  up: number; // Mbps
}

export interface Tunnel {
  id: string;
  countryCode: string;
  name: string;
  latencyMs: number;
  throughputMbps: number;
  active: boolean;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  ip: string;
  type: "phone" | "laptop" | "tv" | "console" | "tablet" | "iot" | "desktop";
  rxKbps: number;
  txKbps: number;
  throughDpn: boolean;
  blocked: boolean;
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
}

// ------ Mock simulator (single shared instance, drift over time) ------
class DeeperSimulator {
  state: DeeperState;
  private startedAt: number;

  constructor() {
    this.startedAt = Date.now() - 60 * 60 * 1000 * 26; // 26h uptime
    const now = Date.now();
    const initialBw: BandwidthPoint[] = [];
    for (let i = 60; i >= 0; i--) {
      initialBw.push({
        t: now - i * 10000,
        down: 40 + Math.sin(i / 4) * 18 + Math.random() * 10,
        up: 6 + Math.sin(i / 5) * 3 + Math.random() * 3,
      });
    }
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
      devices: [
        { id: "d1", name: "iPhone de Léa", ip: "192.168.0.21", type: "phone", rxKbps: 320, txKbps: 28, throughDpn: true, blocked: false },
        { id: "d2", name: "MacBook Pro", ip: "192.168.0.45", type: "laptop", rxKbps: 1480, txKbps: 96, throughDpn: true, blocked: false },
        { id: "d3", name: "Samsung TV", ip: "192.168.0.60", type: "tv", rxKbps: 4200, txKbps: 12, throughDpn: false, blocked: false },
        { id: "d4", name: "PS5", ip: "192.168.0.71", type: "console", rxKbps: 180, txKbps: 24, throughDpn: false, blocked: false },
        { id: "d5", name: "iPad", ip: "192.168.0.33", type: "tablet", rxKbps: 60, txKbps: 8, throughDpn: true, blocked: false },
        { id: "d6", name: "Nest Cam", ip: "192.168.0.88", type: "iot", rxKbps: 12, txKbps: 240, throughDpn: false, blocked: false },
      ],
      bandwidth: initialBw,
    };
  }

  tick(): DeeperState {
    // Update bandwidth (rolling 60 points, one every ~3s)
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
    // Drift hardware stats
    this.state.status = {
      online: true,
      cpu: Math.max(8, Math.min(85, this.state.status.cpu + (Math.random() - 0.5) * 6)),
      ram: Math.max(20, Math.min(90, this.state.status.ram + (Math.random() - 0.5) * 3)),
      tempC: Math.max(38, Math.min(72, this.state.status.tempC + (Math.random() - 0.5) * 1.2)),
      uptimeSec: Math.floor((now - this.startedAt) / 1000),
    };
    return this.state;
  }

  setDpn(v: boolean) { this.state.dpnEnabled = v; }
  setMode(m: DpnMode) { this.state.mode = m; }
  setAdblock(v: boolean) { this.state.adblock = v; }
  setParental(v: boolean) { this.state.parental = v; }
  setCountry(code: string) {
    this.state.selectedCountry = code;
    // Move tunnel of that country to top, add if missing
    let t = this.state.tunnels.find(x => x.countryCode === code);
    if (!t) {
      t = {
        id: `t_${Date.now()}`,
        countryCode: code,
        name: `${code}-Node-${Math.floor(Math.random() * 99)}`,
        latencyMs: 30 + Math.floor(Math.random() * 160),
        throughputMbps: 40 + Math.floor(Math.random() * 120),
        active: true,
      };
      this.state.tunnels = [t, ...this.state.tunnels];
    }
  }
  addTunnel(code: string) {
    const t: Tunnel = {
      id: `t_${Date.now()}`,
      countryCode: code,
      name: `${code}-Node-${Math.floor(Math.random() * 99)}`,
      latencyMs: 30 + Math.floor(Math.random() * 160),
      throughputMbps: 40 + Math.floor(Math.random() * 120),
      active: true,
    };
    this.state.tunnels = [t, ...this.state.tunnels];
  }
  removeTunnel(id: string) {
    this.state.tunnels = this.state.tunnels.filter(t => t.id !== id);
  }
  toggleDeviceDpn(id: string) {
    this.state.devices = this.state.devices.map(d => d.id === id ? { ...d, throughDpn: !d.throughDpn } : d);
  }
  toggleDeviceBlock(id: string) {
    this.state.devices = this.state.devices.map(d => d.id === id ? { ...d, blocked: !d.blocked } : d);
  }
  reboot() {
    this.state.status.online = false;
    setTimeout(() => { this.state.status.online = true; this.startedAt = Date.now(); }, 4000);
  }
}

const sim = new DeeperSimulator();

// ------ Public API ------
export interface DeeperClientConfig {
  ip: string;
  demo: boolean;
}

let currentConfig: DeeperClientConfig = { ip: "34.34.34.34", demo: true };

export function configureClient(cfg: DeeperClientConfig) {
  currentConfig = cfg;
}

export function getConfig(): DeeperClientConfig {
  return currentConfig;
}

// In production, replace these mock calls with real HTTP fetches to the Deeper.
// e.g. fetch(`http://${currentConfig.ip}/api/system/status`)

export async function pingDeeper(ip: string, timeoutMs = 1500): Promise<boolean> {
  // On web HTTPS preview, fetching plain http://... throws Mixed Content errors.
  // Skip and let the UI fall back to demo gracefully.
  if (typeof window !== "undefined" && (window as any)?.location?.protocol === "https:") {
    return false;
  }
  // Try a HEAD or GET against the IP. If reachable -> true.
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`http://${ip}/`, { method: "GET", signal: controller.signal });
    clearTimeout(id);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

export async function login(_password: string): Promise<boolean> {
  // Real impl would POST to Deeper's login endpoint.
  // Mock accepts any non-empty password >= 4 chars.
  await delay(450);
  return _password.length >= 4;
}

export async function fetchState(): Promise<DeeperState> {
  await delay(150);
  return JSON.parse(JSON.stringify(sim.tick()));
}

export async function setDpnEnabled(v: boolean): Promise<DeeperState> {
  sim.setDpn(v); await delay(200); return JSON.parse(JSON.stringify(sim.state));
}
export async function setMode(m: DpnMode): Promise<DeeperState> {
  sim.setMode(m); await delay(220); return JSON.parse(JSON.stringify(sim.state));
}
export async function setAdblock(v: boolean): Promise<DeeperState> {
  sim.setAdblock(v); await delay(180); return JSON.parse(JSON.stringify(sim.state));
}
export async function setParental(v: boolean): Promise<DeeperState> {
  sim.setParental(v); await delay(180); return JSON.parse(JSON.stringify(sim.state));
}
export async function setCountry(code: string): Promise<DeeperState> {
  sim.setCountry(code); await delay(260); return JSON.parse(JSON.stringify(sim.state));
}
export async function addTunnel(code: string): Promise<DeeperState> {
  sim.addTunnel(code); await delay(260); return JSON.parse(JSON.stringify(sim.state));
}
export async function removeTunnel(id: string): Promise<DeeperState> {
  sim.removeTunnel(id); await delay(200); return JSON.parse(JSON.stringify(sim.state));
}
export async function toggleDeviceDpn(id: string): Promise<DeeperState> {
  sim.toggleDeviceDpn(id); await delay(160); return JSON.parse(JSON.stringify(sim.state));
}
export async function toggleDeviceBlock(id: string): Promise<DeeperState> {
  sim.toggleDeviceBlock(id); await delay(160); return JSON.parse(JSON.stringify(sim.state));
}
export async function rebootDeeper(): Promise<void> {
  sim.reboot(); await delay(300);
}

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
