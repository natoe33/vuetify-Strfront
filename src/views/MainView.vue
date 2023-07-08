<script setup lang="ts">
import ProductsList from "@/components/ProductsList.vue";
</script>
<template>
  <v-row>
    <Suspense>
      <ProductsList />
    </Suspense>
  </v-row>
</template>
