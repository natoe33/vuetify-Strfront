<script setup lang="ts">
import { RouterView } from "vue-router";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { onMounted, defineAsyncComponent, watch } from "vue";
import AppBar from "@/components/AppBar.vue";
import NavDrawer from "@/components/NavDrawer.vue";
import OverFlow from "@/components/OverFlow.vue";
import { NDKSubscription } from "./ndk";

const LoginDialog = defineAsyncComponent(
  () => import("@/components/LoginDialog.vue")
);
const OpenStore = defineAsyncComponent(
  () => import("@/components/OpenStore.vue")
);
// import LoginDialog from "@/components/LoginDialog.vue";

const appStore = useAppStore();
const { productsLoading } = storeToRefs(appStore);
// const sub: NDKSubscription = await appStore.nostrProvider.createSub(30018);

// watch(sub, (newval) => {
//   console.log(newval)
// })

onMounted(async () => {
  // appStore.db.products.clear();
  // appStore.db.merchants.clear();
  // console.log(window)
  // const count: number = await appStore.getEvents;
  // // const sub = await appStore.nostrProvider.createSub(30018);
  // console.log(count);
  // productsLoading.value = true;
  // console.log(appStore.relay)
  // appStore.initialEvents();
  // console.log(sub);
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
