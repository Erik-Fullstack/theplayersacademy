import { create } from "zustand";

import { IConfigBackend } from "@/types/configBackend";
//store for config file from backend server, borde kanske vara serversiderenderadd men detta är för prototyp.
interface ConfigStore {
  config: IConfigBackend | null;
  setConfig: (config: IConfigBackend) => void;
  clearConfig: () => void;
}

const useConfigStore = create<ConfigStore>((set) => ({
  config: null,
  setConfig: (config: IConfigBackend) => set({ config }),
  clearConfig: () => set({ config: null }),
}));

export default useConfigStore;
