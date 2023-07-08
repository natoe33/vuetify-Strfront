<script setup lang="ts">
import ProductCard from "./ProductCard.vue";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Product } from "@/models";
import { useAppStore } from "@/store";

const appStore = useAppStore();
const router = useRouter();

const { getProducts } = appStore;
const events = ref([] as Product[]);

async function loadProducts() {
  events.value = getProducts;
}

async function loadProduct(event: Product) {
  router.push({
    name: "product",
    params: {
      id: event.id,
    },
  });
}

onMounted(() => {
  console.log("ProductsList mounted");
  loadProducts();
});
</script>
<template>
  <v-sheet class="d-flex flex-wrap align-content-center">
    <template v-for="event of events" :key="event.id">
      <ProductCard :product="(event as Product)" @click="loadProduct(event)"/>
    </template>
  </v-sheet>
</template>
