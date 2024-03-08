import parseJwtPayload from "@/lib/parseJwtPayload";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
interface User {
  id?: string | null | undefined;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
}

interface AuthStore {
  user?: User | null;
  accessToken?: string | null;
  expires?: string | null;
  setUser: (user: User) => void;
  updateUser: (user: User, data: Partial<User>) => void;
  setAccessToken: (accessToken: string) => void;
  getIsAuthenticated: () => boolean;
  clear: () => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      expires: null,
      setUser: (user: User) => set({ user }),
      updateUser: (data) =>
        set((state) => ({ user: { ...state.user, ...data } })),
      setAccessToken: (accessToken: string) =>
        set({
          accessToken,
          expires: parseJwtPayload(accessToken)?.expiredAt,
        }),
      getIsAuthenticated: () => {
        return get().expires
          ? new Date() < new Date(get().expires as string)
          : false;
      },
      clear: () =>
        set({
          user: null,
          accessToken: null,
          expires: null,
        }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useAuthStore;
