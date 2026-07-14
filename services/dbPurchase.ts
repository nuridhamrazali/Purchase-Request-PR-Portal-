import { PurchaseLog } from '../type';
import { syncLogsToSheetsDB, fetchLogsFromSheets, getScriptUrl } from './appScriptDB';

const LOCAL_STORAGE_KEY = 'halagel_purchase_requests';

export const savePurchaseLog = async (log: PurchaseLog): Promise<void> => {
  try {
    const existingLogs = await getPurchaseLogs();
    const index = existingLogs.findIndex(l => l.id === log.id);
    
    if (index >= 0) {
      existingLogs[index] = log;
    } else {
      existingLogs.push(log);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingLogs));

    // Automatically sync to sheets if configured
    if (getScriptUrl()) {
      await syncLogsToSheetsDB(existingLogs);
    }
  } catch (error) {
    console.error("Error saving purchase log: ", error);
  }
};

export const getPurchaseLogs = async (): Promise<PurchaseLog[]> => {
  try {
    let logs: PurchaseLog[] = [];

    // Try pulling from Sheets first as source of truth
    if (getScriptUrl()) {
      try {
        logs = await fetchLogsFromSheets();
        if (logs.length > 0) {
          // Update local storage cache
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
        }
      } catch (e) {
        console.error("Failed to sync from sheets, falling back to local cache", e);
      }
    }

    // Fallback or local load
    if (logs.length === 0) {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        logs = JSON.parse(data);
      }
    }
    
    // Sort descending by ID
    return logs.sort((a, b) => Number(b.id) - Number(a.id));
  } catch (error) {
    console.error("Error getting purchase logs: ", error);
    return [];
  }
};
