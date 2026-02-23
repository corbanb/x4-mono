/**
 * Electron main-process auth helpers.
 *
 * Uses Electron's `safeStorage` to encrypt/decrypt the bearer token
 * at rest and exposes IPC handlers so the renderer can request the
 * token without direct access to the encrypted store.
 *
 * Setup (in your main process entry):
 *   import { registerAuthIPC } from "./auth";
 *   registerAuthIPC(ipcMain);
 */

import { safeStorage, type IpcMain, type IpcMainInvokeEvent } from 'electron';

const TOKEN_KEY = 'x4_auth_token';
let encryptedToken: Buffer | null = null;

export function storeToken(token: string): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('safeStorage encryption is not available on this system');
  }
  encryptedToken = safeStorage.encryptString(token);
}

export function getToken(): string | null {
  if (!encryptedToken) return null;
  if (!safeStorage.isEncryptionAvailable()) return null;
  return safeStorage.decryptString(encryptedToken);
}

export function clearToken(): void {
  encryptedToken = null;
}

/**
 * Register IPC handlers so the renderer can manage the auth token
 * via contextBridge-exposed APIs.
 *
 * Channels:
 *   "auth:store-token"  — encrypt and store a token
 *   "auth:get-token"    — retrieve the decrypted token (or null)
 *   "auth:clear-token"  — wipe the stored token
 */
export function registerAuthIPC(ipcMain: IpcMain): void {
  ipcMain.handle('auth:store-token', (_event: IpcMainInvokeEvent, token: string) => {
    storeToken(token);
    return true;
  });

  ipcMain.handle('auth:get-token', () => {
    return getToken();
  });

  ipcMain.handle('auth:clear-token', () => {
    clearToken();
    return true;
  });
}
