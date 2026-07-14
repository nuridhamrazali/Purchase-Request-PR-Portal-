import { PurchaseLog } from '../type';

// Make sure to add your Apps Script Web App URL in your .env file
// Example: VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbx5nHdCs-P59IZkqxN6nBvPH19mNnfgTImObYgDf2_YIQ4WiWzIX0AZyFpwmu3lK--MaA/exec';
const SCRIPT_URL = (import.meta as any).env.VITE_APPS_SCRIPT_URL || DEFAULT_URL;

export const getScriptUrl = (): string | null => {
  let urlStr = '';
  try {
    urlStr = localStorage.getItem('CUSTOM_APPS_SCRIPT_URL') || (import.meta as any).env.VITE_APPS_SCRIPT_URL || DEFAULT_URL;
  } catch (e) {
    urlStr = (import.meta as any).env.VITE_APPS_SCRIPT_URL || DEFAULT_URL;
  }
  
  urlStr = urlStr?.trim() || '';
  if (urlStr && !urlStr.startsWith('http')) {
      // If user just pasted the ID
      if (urlStr.length > 20 && !urlStr.includes('/')) {
        urlStr = `https://script.google.com/macros/s/${urlStr}/exec`;
      } else {
        return null;
      }
  }
  return urlStr || null;
};

export const fetchLogsFromSheets = async (): Promise<PurchaseLog[]> => {
  const url = getScriptUrl();
  if (!url) return [];

  try {
    const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}action=get&t=${Date.now()}`;
    const res = await fetch(fetchUrl, {
      cache: 'no-store'
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.sort((a: any, b: any) => {
        // Handle sorting by ID or Date if ID is alphanumeric string
        if (!isNaN(Number(b.id)) && !isNaN(Number(a.id))) {
           return Number(b.id) - Number(a.id);
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } else if (data.status === 'success' && data.logs) {
      // Sort descending by ID
      return data.logs.sort((a: any, b: any) => Number(b.id) - Number(a.id));
    }
    return [];
  } catch (error: any) {
    console.warn("Failed to fetch logs from Google Sheets. Using local storage.", error?.message || error);
    return [];
  }
};

export const syncLogsToSheetsDB = async (logs: PurchaseLog[]) => {
  const url = getScriptUrl();
  if (!url) return;

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action: 'save', logs }),
    });
  } catch (err) {
    console.error('Failed to sync sheets:', err);
  }
};
