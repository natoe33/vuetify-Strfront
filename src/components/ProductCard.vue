<script setup lang="ts">
import { useRouter } from "vue-router";
import { Product } from "@/models/Product";
const props = defineProps({
  product: {
    type: Product,
    required: true,
  },
});

const router = useRouter();

function navigate(id: string) {
  // router.push({path: `/product/${id}` })
  console.log(`Product id: ${id}`);
  router.push({ path: `/product/${id}` });
}
</script>
<template>
  <v-card class="mx-auto my-auto" width="175" height="250" variant="outlined">
    <v-img :src="props.product?.images[0]" height="150px" />
    <v-card-item>
      <v-card-title>{{ props.product?.name }}</v-card-title>
      <v-card-text>{{ props.product?.description }}</v-card-text>
    </v-card-item>
  </v-card>
</template>
