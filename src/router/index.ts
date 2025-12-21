// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuth } from "@/stores/authStore";

import Home from "@/pages/Home.vue";
import CreateEvent from "@/pages/CreateEvent.vue";
import Login from "@/pages/Login.vue";
import ActivityDetail from "@/pages/ActivityDetail.vue";
import ParticipationConfirmed from "@/pages/ParticipationConfirmed.vue";
import Register from "@/pages/Register.vue";
import MyEvent from "@/pages/MyEvent.vue";
import Category from "@/pages/Category.vue";
import Profile from "@/pages/Profile.vue";
import Admin from "@/pages/Admin.vue";
import Organisation from "@/pages/Organisation.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/category/:type",
    name: "category",
    component: Category,
  },
  {
    path: "/activity/:id",
    name: "activity-detail",
    component: ActivityDetail,
  },
  {
    path: "/participation-confirmed",
    name: "participation-confirmed",
    component: ParticipationConfirmed,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/account",
    redirect: { name: "profile" },
  },
  {
    path: "/my_events",
    name: "my_events",
    component: MyEvent,
    meta: { requiresAuth: true },
  },
  {
    path: "/create_event",
    name: "create_event",
    component: CreateEvent,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/register",
    name: "register",
    component: Register,
  },
  {
    path: "/admin",
    name: "admin",
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/organisation",
    name: "organisation",
    component: Organisation,
    meta: { requiresAuth: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuth();

  if (to.meta.requiresAuth && !authStore.checkIfLogged) {
    next({ name: "login" });
    return;
  }
  console.log(authStore.user?.role);
  if (to.meta.requiresAdmin && authStore.user?.role !== "admin") {
    next({ name: "home" });
    return;
  }

  next();
});
