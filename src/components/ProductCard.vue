<script setup lang="ts">
// import { useRouter } from "vue-router";
import { type PropType } from "vue";
import { Product } from "@/models/Product";
const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});
</script>

<template>
  <v-card class="mx-auto my-1" width="175" height="250" variant="tonal">
    <template v-if="props.product.images[0]">
      <v-img
        :src="props.product?.images[0]"
        height="150px"
        class="grey-darken-2"
      />
    </template>
    <template v-else>
      <v-img src="https://placehold.co/600x400?text=No+Image" height="150px" />
    </template>
    <v-card-item class="ma-auto pa-1" min-height="100">
      <v-card-item class="ma-auto pa-1 overflow-hidden" height="90">
        <v-card-subtitle class="ma-auto pa-0">{{
          props.product?.name
        }}</v-card-subtitle>
        <v-card-text class="text-caption ma-auto pa-0 text-truncate">{{
          props.product?.description
        }}</v-card-text>
      </v-card-item>
      <v-card-item class="ma-auto pa-1" height="10">
        <v-card-text class="ma-auto pa-0"
          >{{ props.product.price }} {{ props.product.currency }}</v-card-text
        >
      </v-card-item>
    </v-card-item>
  </v-card>
</template>
