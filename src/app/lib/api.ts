import axios, { type AxiosInstance } from 'axios';
import { FetchCharacterOutput } from '../hooks/api/use-fetch-character';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EV_API_URL,
  withCredentials: true
});

let accessTokenGetter: (() => string | null) | null = null;

export function setAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter;
}

api.interceptors.request.use((config) => {
  const accessToken = accessTokenGetter?.() ?? process.env.NEXT_PUBLIC_EV_ANON_TOKEN!;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error('Refresh failed');
        }

        const { accessToken: newAccessToken, redirectTo } = await res.json();

        if (redirectTo) {
          const currentPath = window.location.pathname;
          const url = new URL(redirectTo, window.location.origin);
          url.searchParams.set('redirectedFrom', currentPath);
          window.location.href = url.toString();
          return Promise.reject(new Error('Redirecting to refresh provider token'));
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/api/v1/oauth/bnet/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
type AvatarOutput = {
  avatarUrl: string;
  source: 'battlenet' | 'database';
  updated: boolean;
}

type ItemOutput = {
  itemIconUrl: string;
  displayId: number;
  itemDetails: {
    itemLevel: number;
    quality: {
      type: string;
      name: string;
    };
    icon: string;
    name?: string;
    type?: string;
    icons?: {
      large: string;
      medium: string;
      small: string;
    };
    level?: number;
    tooltip?: string;
    qualityName?: string;
  };
}

type GearScoreOutput = {
  success: boolean;
  data: [{ characterName: string; score: number; color: string; hash: string; isFullEnchanted: boolean }];
}

type UserCharactersOutput = {
  id: string;
  name: string;
  realm: {
    id: number;
    name: string;
    slug: string;
  };
  level: number;
  character_class: {
    id: number;
    name: string;
  };
  playable_class: {
    id: number;
    name: string;
  };
  avatar: string;
  guild?: {
    id: string;
    name: string;
  };
}[];

export function createServerApiClient(accessToken: string | null) {
  const serverApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_EV_API_URL,
    withCredentials: true,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : { Authorization: `Bearer ${process.env.NEXT_PUBLIC_EV_ANON_TOKEN!}` },
  });

  return serverApi;
}



export const createAPIService = (_api: AxiosInstance = api) => ({
  anon: {
    getCharacterAvatar: async (realmSlug: string, characterName: string): Promise<AvatarOutput> => {
      try {
        const { data } = await _api.get(`/wow/character/avatar/${realmSlug}/${characterName}`);
        return data;
      } catch (error) {
        console.error('Error fetching character avatar:', error);
        throw error;
      }
    },
    getItem: async (itemId: number, options: { force?: boolean } = {}): Promise<ItemOutput> => {
      try {
        const { data } = await _api.get(`/wow/item/${itemId}?force=${options.force}`);
        return data;
      } catch (error) {
        console.error('Error fetching item:', error);
        throw error;
      }
    },
    gearScore: async (characters: { name: string; realm: string }[], force: boolean | undefined): Promise<GearScoreOutput> => {
      try {
        const { data } = await _api.post(`/gearscore`, { characters, forceRefresh: !!force });
        return data;
      } catch (error) {
        console.error('Error fetching gear score:', error);
        throw error;
      }
    },

    getCharacter: async (realmSlug: string, characterName: string) => {
      try {
        const { data } = await _api.get(`/wow/character/${realmSlug}/${characterName}`);
        return data?.character as FetchCharacterOutput;
      } catch (error) {
        console.error('Error fetching character:', error, realmSlug, characterName);
        throw error;
      }
    },

    getGuildRoster: async () => {
      try {
        const { data } = await _api.get(`/wow/roster`);
        return data.roster as FetchCharacterOutput[];
      } catch (error) {
        console.error('Error fetching guild roster:', error);
        throw error;
      }
    },
  },
  auth: {
    getMyProfile: async (): Promise<{ members: any, accounts: any }> => {
      try {
        const { data } = await _api.get(`/auth/my-profile`);
        return data;
      } catch (error) {
        console.error('Error fetching my profile:', error);
        throw error;
      }
    },
    getUserCharacters: async (realmSlug: string): Promise<UserCharactersOutput> => {
      try {
        const { data } = await _api.get(`/user/characters?realmSlug=${realmSlug}`);
        return data;
      } catch (error) {
        console.error('Error fetching user characters:', error);
        throw error;
      }
    }
  },
  realms: {
    getAllowed: async (): Promise<{ id: number, name: string, slug: string }[]> => {
      try {
        const { data } = await _api.get(`/realms/allowed`);
        return data.realms;
      } catch (error) {
        console.error('Error fetching allowed realms:', error);
        throw error;
      }
    }
  },
  characters: {
    link: async (characterName: string, realmSlug: string) => {
      try {
        const { data } = await _api.post(`/characters/link`, { characterName, realmSlug });
        return data;
      } catch (error) {
        console.error('Error linking character:', error);
        throw error;
      }
    }
  }
});