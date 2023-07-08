<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { Product } from "@/models/Product";

const appStore = useAppStore()
const { getProduct } = storeToRefs(appStore)

const props = defineProps({
  id: {
    type: String,
    required: true,
  }
});

const product = getProduct.value(props.id)

</script>
<template>
  <p>{{ props.id }}</p>
  <v-carousel show-arrows="hover">
    <v-carousel-item
    v-for="(image,i) in product?.images"
    :key="i"
    :src="image"
    cover>
    </v-carousel-item>
  </v-carousel>
</template>
