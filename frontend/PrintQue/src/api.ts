// Central API base URL (hard-coded as requested)
export const API_BASE = 'https://printque.andreibanu.com';

export const apiUrl = (path: string) => `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
