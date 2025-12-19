import { defineStore } from "pinia";
import type {
  Activity,
  ActivityHostType,
  ActivityUser,
  ActivityWithHost,
} from "../types/Activity/index";
import { del, get, post, put } from "../utils/api/api";

const deriveHostType = (
  hostOrganisation?: unknown,
  hostUserId?: number | null,
  hostType?: ActivityHostType
): ActivityHostType => {
  if (hostType) return hostType;
  if (hostOrganisation) return "organisation";
  if (hostUserId) return "user";
  return "event";
};

export const useActivityStore = defineStore("activity", {
  state: () => ({
    activities: [] as ActivityWithHost[],
    currentActivity: null as ActivityWithHost | null,
    loading: false,
    error: null as string | null,
    currentPage: 1 as number,
    hasMore: true as boolean,
  }),

  getters: {
    getActivities: (state): ActivityWithHost[] => state.activities,

    // Activites a venir (date future uniquement)
    getUpcomingActivities: (state): ActivityWithHost[] => {
      const now = new Date();
      return state.activities.filter((a) => new Date(a.date) > now);
    },

    // Nombre d'activites par type (futures uniquement)
    getOrganisationActivitiesCount: (state): number => {
      const now = new Date();
      return state.activities.filter(
        (a) => a.hostType === "organisation" && new Date(a.date) > now
      ).length;
    },

    getUserActivitiesCount: (state): number => {
      const now = new Date();
      return state.activities.filter(
        (a) => a.hostType === "user" && new Date(a.date) > now
      ).length;
    },

    getEventActivitiesCount: (state): number => {
      const now = new Date();
      return state.activities.filter(
        (a) => a.hostType === "event" && new Date(a.date) > now
      ).length;
    },

    // Filtrer les activites par type (futures uniquement)
    getOrganisationActivities: (state): Activity[] => {
      const now = new Date();
      return state.activities.filter(
        (a) => a.hostType === "organisation" && new Date(a.date) > now
      );
    },

    getUserActivities: (state): Activity[] => {
      const now = new Date();
      return state.activities.filter(
        (a) => a.hostType === "user" && new Date(a.date) > now
      );
    },

    // Obtenir des activites similaires basees sur l'activite actuelle
    getSimilarActivities: (state): ActivityWithHost[] => {
      if (!state.currentActivity) return [];

      const now = new Date();
      const currentId = state.currentActivity.id;
      const currentCity = state.currentActivity.city;

      return state.activities
        .filter((a) => {
          if (a.id === currentId || new Date(a.date) <= now) return false;
          return a.city === currentCity;
        })
        .slice(0, 3);
    },

    // Evenements crees par l'utilisateur (ou il est l'hote)
    getMyCreatedActivities:
      (state) =>
      (userId: number): ActivityWithHost[] => {
        const now = new Date();
        return state.activities.filter(
          (a) => a.hostId === userId && new Date(a.date) > now
        );
      },

    // Evenements auxquels l'utilisateur participe
    getMyJoinedActivities:
      (state) =>
      (userId: number): ActivityWithHost[] => {
        const now = new Date();
        return state.activities.filter(
          (a) => a.playersId.includes(userId) && new Date(a.date) > now
        );
      },
  },

  actions: {
    normalizeActivity(activity: Activity): ActivityWithHost {
      const hostOrganisation = activity.hostOrganisation ?? null;
      const hostUser = activity.hostUser ?? null;

      const hostType: ActivityHostType = deriveHostType(
        hostOrganisation,
        activity.hostUserId,
        activity.hostType
      );

      const hostId =
        activity.hostId ??
        (hostType === "organisation"
          ? hostOrganisation?.id ?? activity.hostOrganisationId ?? null
          : hostUser?.id ?? activity.hostUserId ?? null);

      const playersId =
        activity.playersId?.length && activity.playersId.length > 0
          ? activity.playersId
          : activity.users?.map((u: ActivityUser) => u.id) ?? [];

      return {
        ...activity,
        hostType,
        hostId: hostId ?? null,
        host: hostUser,
        organisation: hostOrganisation,
        playersId,
      };
    },

    async fetchActivities(page = 1, append = false) {
      this.loading = true;
      this.error = null;
      try {
        const response = await get(`/activity`, { page });
        const activities: Activity[] = Array.isArray(response)
          ? response
          : (response?.rows as Activity[]) ||
            (response?.data as Activity[]) ||
            [];

        const normalized = activities.map((activity) =>
          this.normalizeActivity(activity)
        );

        this.activities = append
          ? [...this.activities, ...normalized]
          : normalized;

        this.currentPage = page;
        this.hasMore = activities.length >= 6;
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : "Erreur lors du chargement";
        console.error("Erreur fetchActivities:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchActivity(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const activity: Activity = await get(`/activity/${id}`);
        this.currentActivity = this.normalizeActivity(activity);
        return this.currentActivity;
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : "Erreur lors du chargement";
        console.error("Erreur fetchActivity:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createActivity(activity: Record<string, unknown>) {
      this.loading = true;
      this.error = null;
      try {
        const newActivity: Activity = await post("/activity", activity);
        const normalized = this.normalizeActivity(newActivity);
        this.activities.push(normalized);
        return normalized;
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : "Erreur lors de la creation";
        console.error("Erreur createActivity:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateActivity(id: number, activity: Partial<Activity>) {
      this.loading = true;
      this.error = null;
      try {
        const updated: Activity = await put(`/activity/${id}`, activity);
        const normalized = this.normalizeActivity(updated);
        const index = this.activities.findIndex((a) => a.id === id);
        if (index !== -1) {
          this.activities[index] = normalized;
        }
        if (this.currentActivity?.id === id) {
          this.currentActivity = normalized;
        }
        return normalized;
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : "Erreur lors de la mise a jour";
        console.error("Erreur updateActivity:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async joinActivity(id: number) {
      try {
        const updated: Activity = await post(`/activity/${id}/join`);
        const normalized = this.normalizeActivity(updated);
        this.currentActivity =
          this.currentActivity?.id === id ? normalized : this.currentActivity;
        this.activities = this.activities.map((a) =>
          a.id === id ? normalized : a
        );
        return normalized;
      } catch (err) {
        console.error("Erreur joinActivity:", err);
        throw err;
      }
    },

    async leaveActivity(id: number) {
      try {
        const updated: Activity = await del(`/activity/${id}/leave`);
        const normalized = this.normalizeActivity(updated);
        this.currentActivity =
          this.currentActivity?.id === id ? normalized : this.currentActivity;
        this.activities = this.activities.map((a) =>
          a.id === id ? normalized : a
        );
        return normalized;
      } catch (err) {
        console.error("Erreur leaveActivity:", err);
        throw err;
      }
    },

    async deleteActivity(id: number) {
      try {
        await del(`/activity/${id}`);
        this.activities = this.activities.filter((a) => a.id !== id);
        if (this.currentActivity?.id === id) {
          this.currentActivity = null;
        }
      } catch (err) {
        console.error("Erreur deleteActivity:", err);
        throw err;
      }
    },
  },
});
