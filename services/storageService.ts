
import { Template, Batch, AppSettings } from '../types';

const DB_NAME = 'JobAppMailerDB';
const DB_VERSION = 1;
const STORES = {
  TEMPLATES: 'templates',
  BATCHES: 'batches',
  SETTINGS: 'settings',
};

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORES.TEMPLATES)) {
          db.createObjectStore(STORES.TEMPLATES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.BATCHES)) {
          db.createObjectStore(STORES.BATCHES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async saveTemplate(template: Template): Promise<void> {
    const store = await this.getStore(STORES.TEMPLATES, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(template);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTemplates(): Promise<Template[]> {
    const store = await this.getStore(STORES.TEMPLATES);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    const store = await this.getStore(STORES.TEMPLATES, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveBatch(batch: Batch): Promise<void> {
    const store = await this.getStore(STORES.BATCHES, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(batch);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getBatches(): Promise<Batch[]> {
    const store = await this.getStore(STORES.BATCHES);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBatch(id: string): Promise<void> {
    const store = await this.getStore(STORES.BATCHES, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    const store = await this.getStore(STORES.SETTINGS, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put({ id: 'current', ...settings });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSettings(): Promise<AppSettings | null> {
    const store = await this.getStore(STORES.SETTINGS);
    return new Promise((resolve, reject) => {
      const request = store.get('current');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
}

export const storage = new StorageService();
