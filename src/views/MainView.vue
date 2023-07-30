<script setup lang="ts">
import { onMounted } from "vue";
import { useAppStore } from "@/store";
import { NostrProviderService } from "@/utils";
import ProductsList from "@/components/ProductsList.vue";
import { storeToRefs } from "pinia";

onMounted(() => {
  const appStore = useAppStore();
  const { loaded, npub, nostrProvider } = storeToRefs(appStore);
  if (npub.value && npub.value !== '') {
    console.log('MainView npub found');
    nostrProvider.value = new NostrProviderService();
  }
  console.log(`MainView loaded value ${loaded.value}`);
  if (!loaded.value || loaded.value === undefined) {
    appStore.initialEvents();
  }
});
</script>
<template>
  <v-row>
    <Suspense>
      <ProductsList />
    </Suspense>
  </v-row>
</template>
