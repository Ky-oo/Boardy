// Store Pinia pour les activités
import { defineStore } from "pinia";
import type { Activity, ActivityWithHost } from "../types/Activity/index";
import type { User } from "../types/User/index";
import type { Organisation } from "../types/Organisation/index";
import { get } from "../utils/api/api";

export const useActivityStore = defineStore("activity", {
  state: () => ({
    activities: [] as ActivityWithHost[],
    currentActivity: null as ActivityWithHost | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getActivities: (state): ActivityWithHost[] => state.activities,

    // Activités à venir (date future uniquement)
    getUpcomingActivities: (state): ActivityWithHost[] => {
      const now = new Date();
      return state.activities.filter((a) => new Date(a.date) > now);
    },

    // Nombre d'activités par type (futures uniquement)
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

    // Filtrer les activités par type (futures uniquement)
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

    // Obtenir des activités similaires basées sur l'activité actuelle
    getSimilarActivities: (state): ActivityWithHost[] => {
      if (!state.currentActivity) return [];

      const now = new Date();
      const currentId = state.currentActivity.id;
      const currentCity = state.currentActivity.city;

      return state.activities
        .filter((a) => {
          // Exclure l'activité actuelle et les activités passées
          if (a.id === currentId || new Date(a.date) <= now) return false;

          // Vérifier uniquement si l'activité est dans la même ville
          return a.city === currentCity;
        })
        .slice(0, 3); // Limiter à 3 activités similaires
    },
  },

  actions: {
    async fetchActivities() {
      this.loading = true;
      this.error = null;
      try {
        const activities: Activity[] = await get(`/activities`);

        // Enrichir chaque activité avec les données de l'hôte OU de l'organisation
        const enrichedActivities = await Promise.all(
          activities.map(async (activity) => {
            try {
              if (activity.hostType === "organisation") {
                // Charger l'organisation
                const organisation: Organisation = await get(
                  `/organisations/${activity.hostId}`
                );
                return { ...activity, organisation };
              } else {
                // Charger l'utilisateur (pour hostType "user" ou "event")
                const host: User = await get(`/users/${activity.hostId}`);
                return { ...activity, host };
              }
            } catch (error) {
              console.error(
                `Erreur lors du chargement de l'hôte/organisation ${activity.hostId}:`,
                error
              );
              return activity; // Retourner l'activité sans l'hôte en cas d'erreur
            }
          })
        );

        this.activities = enrichedActivities;
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
        const activity: Activity = await get(`/activities/${id}`);

        // Enrichir l'activité avec les données de l'hôte OU de l'organisation
        if (activity.hostType === "organisation") {
          const organisation: Organisation = await get(
            `/organisations/${activity.hostId}`
          );
          this.currentActivity = { ...activity, organisation };
        } else {
          const host: User = await get(`/users/${activity.hostId}`);
          this.currentActivity = { ...activity, host };
        }
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
        const newActivity: Activity = await post("/activities", activity);

        // Enrichir la nouvelle activité
        let enrichedActivity: ActivityWithHost;
        if (newActivity.type === "organisation") {
          const organisation: Organisation = await get(
            `/organisations/${newActivity.hostId}`
          );
          enrichedActivity = { ...newActivity, organisation };
        } else {
          const host: User = await get(`/users/${newActivity.hostId}`);
          enrichedActivity = { ...newActivity, host };
        }

        this.activities.push(enrichedActivity);
        return enrichedActivity;
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
        const updated: Activity = await put(`/activities/${id}`, activity);

        // Enrichir l'activité mise à jour
        let enrichedActivity: ActivityWithHost;
        if (updated.type === "organisation") {
          const organisation: Organisation = await get(
            `/organisations/${updated.hostId}`
          );
          enrichedActivity = { ...updated, organisation };
        } else {
          const host: User = await get(`/users/${updated.hostId}`);
          enrichedActivity = { ...updated, host };
        }

        const index = this.activities.findIndex((a) => a.id === id);
        if (index !== -1) {
          this.activities[index] = enrichedActivity;
        }
        return enrichedActivity;
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
