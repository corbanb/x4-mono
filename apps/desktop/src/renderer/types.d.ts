/** Type declarations for the electronAuth API exposed via contextBridge */
interface ElectronAuth {
  getToken: () => Promise<string | null>;
  setToken: (token: string) => Promise<boolean>;
  clearToken: () => Promise<boolean>;
}

interface Window {
  electronAuth: ElectronAuth;
}
