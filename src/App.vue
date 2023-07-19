<script setup lang="ts">
import { RouterView } from "vue-router";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import AppBar from "@/components/AppBar.vue";
import NavDrawer from "@/components/NavDrawer.vue";
import LoginDialog from "@/components/LoginDialog.vue";
import { useAppStore } from "@/store";

const appStore = useAppStore();
const { productsLoading } = storeToRefs(appStore);

onMounted(async () => {
  const count: number = await appStore.getEvents;
  if (count === 0) {
    productsLoading.value = true;
    appStore.initialEvents()
  }
});
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
      <RouterView />
      <LoginDialog />
    </v-main>
  </v-app>
</template>
