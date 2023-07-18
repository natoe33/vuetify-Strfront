<script setup lang="ts">
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import AppBar from "@/components/AppBar.vue";
import NavDrawer from "@/components/NavDrawer.vue";
import LoginDialog from "@/components/LoginDialog.vue";
import { type Filter, Kind } from "@/nostr-tools";
import { useAppStore } from "@/store";

const appStore = useAppStore();
// const { getEvents } = appStore;
// appStore.initialEvents();

onMounted(async () => {
  console.log("app mounted");
  const count: number = await appStore.getEvents;
  console.log(`Products stored ${count}`);
  if (count === 0) appStore.initialEvents();
});

// const filter: Filter = { kinds: [Kind.Product] };
// const filter2: Filter = { kinds: [Kind.Stall] };
// appStore.createSub(filter);
// appStore.createSub(filter2);
</script>
<template>
  <v-app>
    <v-main class="bg-grey-lighten-3">
      <Suspense>
        <AppBar />
      </Suspense>
      <Suspense><NavDrawer /></Suspense>
      <RouterView />
      <LoginDialog />
    </v-main>
  </v-app>
</template>
