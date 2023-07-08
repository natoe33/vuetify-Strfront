<script setup lang="ts">
import { inject } from "vue";
import ProductCard from "./ProductCard.vue";
import { NostrProviderService } from "@/utils/nostrProvider";

const nostrProvider: NostrProviderService = inject<NostrProviderService>(
  "nostr",
  new NostrProviderService()
);
const events = await nostrProvider.fetchProductsLimit(20);
// for await (const event of events) {
//     console.log(event);
// }
</script>
<template>
  <v-sheet class="d-flex flex-wrap align-content-center bg-surface-variant">
    <template v-for="event of events" :key="event.id">
      <ProductCard :product="event" />
    </template>
  </v-sheet>
</template>
