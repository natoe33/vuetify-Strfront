<script setup lang="ts">
import { RouterView } from "vue-router";
import AppBar from "@/components/AppBar.vue";
import { type Filter, Kind } from "@/nostr-tools";
import { useAppStore } from "@/store";

const appStore = useAppStore();
const filter: Filter = { kinds: [Kind.Product] };
appStore.createSub(filter);
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
