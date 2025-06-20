import { createRouter, createWebHistory } from "vue-router";
import { watch } from "vue";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/components/auth/LoginForm.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/components/auth/RegisterForm.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/views/Admin.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/success",
    name: "Success",
    component: () => import("@/views/Success.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/bestellingen",
    name: "Orders",
    component: () => import("@/views/Orders.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  // Wait for auth to initialize
  if (auth.loading) {
    const unwatch = watch(
      () => auth.loading,
      (loading) => {
        if (!loading) {
          unwatch();
          checkAuth();
        }
      }
    );
  } else {
    checkAuth();
  }

  function checkAuth() {
    if (to.meta.requiresAuth && !auth.user) {
      // If route requires auth and user is not logged in
      next("/login");
    } else if (to.meta.requiresAdmin && !auth.isAdmin) {
      // If route requires admin and user is not admin
      next("/");
    } else if (to.meta.requiresGuest && auth.user) {
      // If route requires guest and user is logged in
      next("/");
    } else {
      // Proceed as normal
      next();
    }
  }
});

export default router;
