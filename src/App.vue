<script setup lang="ts">
import { RouterView } from "vue-router";
import AppBar from "@/components/AppBar.vue";
import { type Filter, Kind } from "@/nostr-tools";
import { useAppStore } from "@/store";

const appStore = useAppStore();
// appStore.initialEvents();
const filter: Filter = { kinds: [Kind.Product] };
const filter2: Filter = { kinds: [Kind.Stall] };
appStore.createSub(filter);
appStore.createSub(filter2);
</script>
<template>
  <v-app>
    <v-main class="bg-grey-lighten-3">
      <Suspense>
        <AppBar />
      </Suspense>
      <RouterView />
    </v-main>
  </v-app>
</template>
