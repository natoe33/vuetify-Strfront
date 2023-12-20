<script setup lang="ts">
import { RouterView } from "vue-router";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store/app";
import { onMounted, defineAsyncComponent, watch } from "vue";
import AppBar from "@/components/AppBar.vue";
import NavDrawer from "@/components/NavDrawer.vue";
import OverFlow from "@/components/OverFlow.vue";
import { NDKSubscription } from "@nostr-dev-kit/ndk";

const LoginDialog = defineAsyncComponent(
  () => import("@/components/LoginDialog.vue")
);
const OpenStore = defineAsyncComponent(
  () => import("@/components/OpenStore.vue")
);

const EditStore = defineAsyncComponent(
  () => import("@/components/EditStore.vue")
);

const AddItem = defineAsyncComponent(() => import("@/components/AddItem.vue"));

const appStore = useAppStore();
const { productsLoading, user  } = storeToRefs(appStore);

watch(user, (newval) => {
  console.log('App user updated');
})


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
      <EditStore />
      <AddItem />
    </v-main>
  </v-app>
</template>
