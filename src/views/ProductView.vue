<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { Product } from "@/models/Product";

const appStore = useAppStore();
const { getProduct } = storeToRefs(appStore);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const product = getProduct.value(props.id);
</script>
<template>
  <v-sheet class="d-md-inline ma-2 pa-0">
    <template v-if="product?.images">
      <v-carousel show-arrows="hover">
        <v-carousel-item
          v-for="(image, i) in product?.images"
          :key="i"
          :src="image"
        >
        </v-carousel-item>
      </v-carousel>
    </template>
    <v-sheet>
      <p>{{ product?.name }}</p>
      <p>{{ product?.description }}</p>
      <!--TODO: Put merchant info here-->
    </v-sheet>
  </v-sheet>
</template>
