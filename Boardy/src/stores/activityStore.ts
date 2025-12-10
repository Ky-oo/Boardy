// Store Pinia pour les activités
import { defineStore } from "pinia";
import type { Activity } from "../types/Activity/index";
import { get } from "../utils/api/api";

export const useActivityStore = defineStore("activity", {
  state: () => ({
    activities: [] as Activity[],
    currentActivity: null as Activity | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getActivities: (state): Activity[] => state.activities,

    // Nombre d'activités par type
    getOrganisationActivitiesCount: (state): number => {
      return state.activities.filter((a) => a.type === "organisation").length;
    },

    getUserActivitiesCount: (state): number => {
      return state.activities.filter((a) => a.type === "user").length;
    },

    // Filtrer les activités par type
    getOrganisationActivities: (state): Activity[] => {
      return state.activities.filter((a) => a.type === "organisation");
    },

    getUserActivities: (state): Activity[] => {
      return state.activities.filter((a) => a.type === "user");
    },
  },

  actions: {
    async fetchActivities() {
      this.loading = true;
      this.error = null;
      try {
        this.activities = await get(`/activities`);
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
        this.currentActivity = await apiService.getActivity(id);
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : "Erreur lors du chargement";
        console.error("Erreur fetchActivity:", err);
      } finally {
        this.loading = false;
      }
    },

    async createActivity(activity: Omit<Activity, "id">) {
      this.loading = true;
      this.error = null;
      try {
        const newActivity = await apiService.createActivity(activity);
        this.activities.push(newActivity);
        return newActivity;
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : "Erreur lors de la création";
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
        const updated = await apiService.updateActivity(id, activity);
        const index = this.activities.findIndex((a) => a.id === id);
        if (index !== -1) {
          this.activities[index] = updated;
        }
        return updated;
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        console.error("Erreur updateActivity:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteActivity(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await apiService.deleteActivity(id);
        this.activities = this.activities.filter((a) => a.id !== id);
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : "Erreur lors de la suppression";
        console.error("Erreur deleteActivity:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
