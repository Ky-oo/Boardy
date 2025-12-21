// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuth } from "@/stores/authStore";

import Home from "@/pages/Home.vue";
import Account from "@/pages/Account.vue";
import CreateEvent from "@/pages/CreateEvent.vue";
import Login from "@/pages/Login.vue";
import ActivityDetail from "@/pages/ActivityDetail.vue";
import ParticipationConfirmed from "@/pages/ParticipationConfirmed.vue";
import Register from "@/pages/Register.vue";
import MyEvent from "@/pages/MyEvent.vue";
import Category from "@/pages/Category.vue";
import Profile from "@/pages/Profile.vue";

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
    path: "/account",
    name: "account",
    component: Account,
    meta: { requiresAuth: true },
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
    path: "/profile",
    name: "profile",
    component: Profile,
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
  } else {
    next();
  }
});
