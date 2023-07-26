<script setup lang="ts">
import { onMounted } from "vue";
import { useAppStore } from "@/store";
import ProductsList from "@/components/ProductsList.vue";

onMounted(() => {
  const appStore = useAppStore();
  appStore.initialEvents();
})
</script>
<template>
  <v-row>
    <Suspense>
      <ProductsList />
    </Suspense>
  </v-row>
</template>
