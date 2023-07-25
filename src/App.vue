<script setup lang="ts">
import { RouterView } from "vue-router";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { onMounted, defineAsyncComponent } from "vue";
import AppBar from "@/components/AppBar.vue";
import NavDrawer from "@/components/NavDrawer.vue";
import OverFlow from "@/components/OverFlow.vue";

const LoginDialog = defineAsyncComponent(
  () => import("@/components/LoginDialog.vue")
);
const OpenStore = defineAsyncComponent(
  () => import("@/components/OpenStore.vue")
);
// import LoginDialog from "@/components/LoginDialog.vue";

const appStore = useAppStore();
const { productsLoading } = storeToRefs(appStore);

onMounted(async () => {
  // console.log(window)
  const count: number = await appStore.getEvents;
  console.log(count);
  appStore.initialEvents();
  if (count === 0) {
    productsLoading.value = true;
    appStore.initialEvents();
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
      <OpenStore />
    </v-main>
  </v-app>
</template>
