// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import Home from "../pages/Home.vue";
import Account from "../pages/Account.vue";
import CreateEvent from "../pages/CreateEvent.vue";
import Login from "@/pages/Login.vue";
import Register from "@/pages/Register.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/account",
    name: "account",
    component: Account,
  },
  {
    path: "/create_event",
    name: "create_event",
    component: CreateEvent,
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
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
