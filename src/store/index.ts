import { create } from "zustand";

interface Store {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export const useCreateNewSite = create<Store>((set) => ({
  onOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  onClose: () => set((state) => ({ isOpen: !state.isOpen })),
  isOpen: false,
}));
