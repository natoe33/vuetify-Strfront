<script setup lang="ts">
import { Product } from "@/models";

const props = defineProps({
  product: {
    type: Product,
  },
});
</script>
<template>
  <!-- <v-sheet min-height="70vh" rounded="lg"> -->
  <v-sheet rounded="lg">
    <v-card class="mx-auto">
      <template v-if="props.product?.images">
        <v-carousel show-arrows="hover" hide-delimiters progress="primary">
          <v-carousel-item
            v-for="(image, i) in props.product?.images"
            :key="i"
            :src="image"
          >
          </v-carousel-item>
        </v-carousel>
      </template>
      <v-divider class="my-2"></v-divider>
      <v-card-item>
        <v-card-title>{{ props.product?.name }}</v-card-title>
        <v-card-subtitle>{{ props.product?.description }}</v-card-subtitle>
        <v-card-text>{{ props.product?.quantity }} Available</v-card-text>
        <v-card-actions>
          <v-btn class="ms-2" variant="outlined" size="small">
            {{ props.product?.price }} {{ props.product?.currency }}
          </v-btn>
        </v-card-actions>
      </v-card-item>
      <v-card-item>
        <v-chip-group>
          <v-chip
            v-for="(tag, i) in props.product?.tags"
            :key="i"
            prepend-icon="mdi-pound"
            >{{ tag }}</v-chip
          >
        </v-chip-group>
      </v-card-item>
    </v-card>
  </v-sheet>
</template>
