<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store/app";
import ProductsList from "@/components/ProductsList.vue";

onMounted(() => {
  const appStore = useAppStore();
  const { loaded } = storeToRefs(appStore);
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
