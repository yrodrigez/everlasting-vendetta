import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UserPreferencesState = {
  soundVolume: number
  setSoundVolume: (volume: number) => void
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    set => ({
      soundVolume: 0.5,
      setSoundVolume: volume => set({ soundVolume: volume }),
    }),
    {
      name: 'ev_user-preferences',
    }
  )
)