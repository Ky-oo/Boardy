import { defineStore } from "pinia";
import { del, get, post, put } from "@/utils/api/api";
import type { Organisation } from "@/types/Organisation";

type OrganisationState = {
  organisations: Organisation[];
  organisationsById: Record<number, Organisation>;
  currentOrganisation: Organisation | null;
  loading: boolean;
  error: string | null;
};

const upsertOrganisation = (
  state: OrganisationState,
  organisation: Organisation
) => {
  state.organisationsById[organisation.id] = organisation;
  const index = state.organisations.findIndex((org) => org.id === organisation.id);
  if (index === -1) {
    state.organisations.push(organisation);
  } else {
    state.organisations[index] = organisation;
  }
};

export const useOrganisationStore = defineStore("organisation", {
  state: (): OrganisationState => ({
    organisations: [],
    organisationsById: {},
    currentOrganisation: null,
    loading: false,
    error: null,
  }),
  getters: {
    getOrganisationById:
      (state) =>
      (id: number): Organisation | undefined =>
        state.organisationsById[id] ||
        state.organisations.find((org) => org.id === id),
  },
  actions: {
    async fetchOrganisation(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const organisation: Organisation = await get(`/organisation/${id}`);
        upsertOrganisation(this, organisation);
        this.currentOrganisation = organisation;
        return organisation;
      } catch (err: any) {
        this.error = err?.message || "Erreur lors du chargement.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchMine() {
      this.loading = true;
      this.error = null;
      try {
        const response = await get("/organisation/mine");
        const organisations: Organisation[] = Array.isArray(response)
          ? response
          : response?.data || [];
        this.organisations = organisations;
        organisations.forEach((organisation) =>
          upsertOrganisation(this, organisation)
        );
        return organisations;
      } catch (err: any) {
        this.error = err?.message || "Erreur lors du chargement.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        const response = await get("/organisation");
        const organisations: Organisation[] = Array.isArray(response)
          ? response
          : response?.data || [];
        this.organisations = organisations;
        organisations.forEach((organisation) =>
          upsertOrganisation(this, organisation)
        );
        return organisations;
      } catch (err: any) {
        this.error = err?.message || "Erreur lors du chargement.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async createOrganisation(payload: Partial<Organisation>) {
      this.loading = true;
      this.error = null;
      try {
        const organisation: Organisation = await post("/organisation", payload);
        upsertOrganisation(this, organisation);
        return organisation;
      } catch (err: any) {
        this.error = err?.message || "Erreur lors de la creation.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateOrganisation(id: number, payload: Partial<Organisation>) {
      this.loading = true;
      this.error = null;
      try {
        const organisation: Organisation = await put(
          `/organisation/${id}`,
          payload
        );
        upsertOrganisation(this, organisation);
        this.currentOrganisation =
          this.currentOrganisation?.id === id
            ? organisation
            : this.currentOrganisation;
        return organisation;
      } catch (err: any) {
        this.error = err?.message || "Erreur lors de la mise a jour.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteOrganisation(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await del(`/organisation/${id}`);
        this.organisations = this.organisations.filter((org) => org.id !== id);
        delete this.organisationsById[id];
        if (this.currentOrganisation?.id === id) {
          this.currentOrganisation = null;
        }
      } catch (err: any) {
        this.error = err?.message || "Erreur lors de la suppression.";
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
