import { defineStore } from "pinia";
import { del, get, post, put } from "@/utils/api/api";
import { useToastStore } from "./toastStore";
import type { Group, GroupMessage } from "@/types/Group";

type GroupState = {
  groups: Group[];
  myGroups: Group[];
  currentGroup: Group | null;
  messages: GroupMessage[];
  loading: boolean;
  error: string | null;
};

export const useGroupStore = defineStore("group", {
  state: (): GroupState => ({
    groups: [],
    myGroups: [],
    currentGroup: null,
    messages: [],
    loading: false,
    error: null,
  }),
  getters: {
    isMember:
      (state) =>
      (userId: number): boolean => {
        if (!state.currentGroup) return false;
        return state.currentGroup.members.some((m) => m.id === userId);
      },
    getMemberRole:
      (state) =>
      (userId: number): string | null => {
        if (!state.currentGroup) return null;
        const member = state.currentGroup.members.find((m) => m.id === userId);
        return member?.GroupMember.role ?? null;
      },
    isOwnerOrAdmin:
      (state) =>
      (userId: number): boolean => {
        if (!state.currentGroup) return false;
        const member = state.currentGroup.members.find((m) => m.id === userId);
        return (
          member?.GroupMember.role === "owner" ||
          member?.GroupMember.role === "admin"
        );
      },
  },
  actions: {
    async fetchGroups() {
      this.loading = true;
      this.error = null;
      try {
        const response = await get("/group");
        this.groups = Array.isArray(response) ? response : [];
        return this.groups;
      } catch (err: any) {
        this.error = err?.message || "Erreur lors du chargement des groupes.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchMyGroups() {
      this.loading = true;
      this.error = null;
      try {
        const response = await get("/group/mine");
        this.myGroups = Array.isArray(response) ? response : [];
        return this.myGroups;
      } catch (err: any) {
        this.error = err?.message || "Erreur lors du chargement.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchGroup(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const group: Group = await get(`/group/${id}`);
        this.currentGroup = group;
        return group;
      } catch (err: any) {
        this.error = err?.message || "Erreur lors du chargement du groupe.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createGroup(payload: {
      name: string;
      description?: string;
      cover_img_url?: string;
      is_public?: boolean;
    }) {
      this.loading = true;
      this.error = null;
      try {
        const group: Group = await post("/group", payload);
        this.groups.push(group);
        this.myGroups.push(group);
        const toastStore = useToastStore();
        toastStore.addToast("Groupe créé.", { type: "success" });
        return group;
      } catch (err: any) {
        this.error = err?.message || "Erreur lors de la création.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateGroup(
      id: number,
      payload: Partial<
        Pick<Group, "name" | "description" | "cover_img_url" | "is_public">
      >,
    ) {
      this.loading = true;
      this.error = null;
      try {
        const group: Group = await put(`/group/${id}`, payload);
        const idx = this.groups.findIndex((g) => g.id === id);
        if (idx !== -1) this.groups[idx] = group;
        const myIdx = this.myGroups.findIndex((g) => g.id === id);
        if (myIdx !== -1) this.myGroups[myIdx] = group;
        if (this.currentGroup?.id === id) this.currentGroup = group;
        const toastStore = useToastStore();
        toastStore.addToast("Groupe mis à jour.", { type: "success" });
        return group;
      } catch (err: any) {
        this.error = err?.message || "Erreur lors de la mise à jour.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteGroup(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await del(`/group/${id}`);
        this.groups = this.groups.filter((g) => g.id !== id);
        this.myGroups = this.myGroups.filter((g) => g.id !== id);
        if (this.currentGroup?.id === id) this.currentGroup = null;
        const toastStore = useToastStore();
        toastStore.addToast("Groupe supprimé.", { type: "warning" });
      } catch (err: any) {
        this.error = err?.message || "Erreur lors de la suppression.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async joinGroup(id: number) {
      try {
        await post(`/group/${id}/join`);
        await this.fetchGroup(id);
        const toastStore = useToastStore();
        toastStore.addToast("Vous avez rejoint le groupe.", {
          type: "success",
        });
      } catch (err: any) {
        const toastStore = useToastStore();
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Impossible de rejoindre le groupe.";
        toastStore.addToast(message, { type: "error" });
        throw err;
      }
    },

    async leaveGroup(id: number) {
      try {
        await del(`/group/${id}/leave`);
        this.myGroups = this.myGroups.filter((g) => g.id !== id);
        if (this.currentGroup?.id === id) {
          this.currentGroup = {
            ...this.currentGroup!,
            members: this.currentGroup!.members.filter(
              (m) => m.GroupMember.role !== "owner",
            ),
          };
          await this.fetchGroup(id);
        }
        const toastStore = useToastStore();
        toastStore.addToast("Vous avez quitté le groupe.", { type: "info" });
      } catch (err: any) {
        const toastStore = useToastStore();
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Impossible de quitter le groupe.";
        toastStore.addToast(message, { type: "error" });
        throw err;
      }
    },

    async inviteUser(groupId: number, userId: number) {
      try {
        await post(`/group/${groupId}/invite`, { userId });
        await this.fetchGroup(groupId);
        const toastStore = useToastStore();
        toastStore.addToast("Utilisateur invité.", { type: "success" });
      } catch (err: any) {
        const toastStore = useToastStore();
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Impossible d'inviter l'utilisateur.";
        toastStore.addToast(message, { type: "error" });
        throw err;
      }
    },

    async removeMember(groupId: number, userId: number) {
      try {
        await del(`/group/${groupId}/members/${userId}`);
        if (this.currentGroup?.id === groupId) {
          this.currentGroup.members = this.currentGroup.members.filter(
            (m) => m.id !== userId,
          );
        }
        const toastStore = useToastStore();
        toastStore.addToast("Membre retiré.", { type: "info" });
      } catch (err: any) {
        const toastStore = useToastStore();
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Impossible de retirer le membre.";
        toastStore.addToast(message, { type: "error" });
        throw err;
      }
    },

    async fetchMessages(groupId: number, before?: number) {
      try {
        const params: Record<string, unknown> = { limit: 50 };
        if (before) params.before = before;
        const response = await get(`/group/${groupId}/messages`, params);
        const msgs: GroupMessage[] = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        if (before) {
          this.messages = [...msgs, ...this.messages];
        } else {
          this.messages = msgs;
        }
        return msgs;
      } catch (err: any) {
        console.error("Erreur chargement messages:", err);
        throw err;
      }
    },

    async sendMessage(groupId: number, content: string, replyToId?: number) {
      try {
        const body: Record<string, unknown> = { content };
        if (replyToId) body.reply_to_id = replyToId;
        const message: GroupMessage = await post(
          `/group/${groupId}/messages`,
          body,
        );
        this.messages.push(message);
        return message;
      } catch (err: any) {
        console.error("Erreur envoi message:", err);
        throw err;
      }
    },

    async deleteMessage(groupId: number, messageId: number) {
      try {
        await del(`/group/${groupId}/messages/${messageId}`);
        this.messages = this.messages.map((m) =>
          m.id === messageId ? { ...m, is_deleted: true, content: "" } : m,
        );
      } catch (err: any) {
        console.error("Erreur suppression message:", err);
        throw err;
      }
    },
  },
});
