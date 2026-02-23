import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose a minimal auth API to the renderer process.
 * The renderer can call window.electronAuth.getToken() etc.
 * without direct access to Electron APIs or the encrypted store.
 */
contextBridge.exposeInMainWorld('electronAuth', {
  getToken: (): Promise<string | null> => ipcRenderer.invoke('auth:get-token'),

  setToken: (token: string): Promise<boolean> => ipcRenderer.invoke('auth:store-token', token),

  clearToken: (): Promise<boolean> => ipcRenderer.invoke('auth:clear-token'),
});
