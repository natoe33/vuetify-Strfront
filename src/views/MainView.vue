<script setup lang="ts">
import { onMounted } from "vue";
import { useAppStore } from "@/store";
import ProductsList from "@/components/ProductsList.vue";
import { storeToRefs } from "pinia";

onMounted(() => {
  const appStore = useAppStore();
  const { loaded } = storeToRefs(appStore);
  console.log(loaded.value);
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
