import { create } from "zustand";

import apiClient from "@/services/api/client";
import { IUser } from "@/types/models";

interface UserStore {
  user: IUser | null;
  setUser: (user: IUser) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>;
  isRefreshing: boolean;
}

const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isRefreshing: false,
  setUser: (user: IUser) => set({ user }),
  clearUser: () => set({ user: null }),

  refreshUser: async () => {
    const { user } = get();

    if (!user) return Promise.resolve();

    try {
      set({ isRefreshing: true });

      // Request organization, subscription, and profile to be included
      const response = await apiClient<{ data: IUser }>(
        `me?include=organization,subscription,orgprofile,seatstats`
      );

      if (response && response.data) {
        set({ user: response.data });
      }

      return Promise.resolve();
    } catch (error) {
      console.log("Failed to refresh user data:", error);

      return Promise.reject(error);
    } finally {
      set({ isRefreshing: false });
    }
  },
}));

export default useUserStore;
