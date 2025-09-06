// Central API base URL
// Configure via Vite env var (VITE_API_BASE). Defaults to '/api' for same-origin reverse proxy setups.
// Examples:
// - Local dev (separate ports): VITE_API_BASE=http://127.0.0.1:5420
// - Production (same domain via /api): VITE_API_BASE=/api
// Use a loose cast to support editors that don't pick up vite/client ambient types
const IM: any = import.meta as any;
export const API_BASE = (IM?.env?.VITE_API_BASE as string | undefined) || '/api';

export const apiUrl = (path: string) => `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
