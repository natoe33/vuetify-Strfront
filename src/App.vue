<script setup lang="ts">
import { RouterView } from "vue-router";
import { defineAsyncComponent } from "vue";
import AppBar from "@/components/AppBar.vue";

const LoginDialog = defineAsyncComponent(
  () => import("@/components/LoginDialog.vue")
);
const OpenStore = defineAsyncComponent(
  () => import("@/components/OpenStore.vue")
);

const EditStore = defineAsyncComponent(
  () => import("@/components/EditStore.vue")
);

const NavDrawer = defineAsyncComponent(() => import("@/components/NavDrawer.vue"));

const AddItem = defineAsyncComponent(() => import("@/components/AddItem.vue"));

</script>
<template>
  <v-app>
    <v-main class="bg-grey-lighten-3">
      <Suspense>
        <AppBar />
      </Suspense>
      <Suspense>
        <NavDrawer />
      </Suspense>
      <Suspense>
        <RouterView />
      </Suspense>
      <LoginDialog />
      <OpenStore />
      <EditStore />
      <AddItem />
    </v-main>
  </v-app>
</template>
