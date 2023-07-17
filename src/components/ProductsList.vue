<script setup lang="ts">
// TODO: Display item quantity

import ProductCard from "./ProductCard.vue";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Product } from "@/models";
import { useAppStore } from "@/store";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const appStore = useAppStore();
const router = useRouter();

const { tagLoading, loading, newProduct, tag, page } = storeToRefs(appStore);
const events = ref([] as Product[]);
const pages = ref(0);

const eventList = computed(() => events.value);

async function loadProducts() {
  console.log("ProductList loading products");
  events.value = await appStore.getProducts;
  pages.value = await appStore.getNumOfPages;
  console.log(`Product list: ${events.value.length} loaded`);
  loading.value = false;
  appStore.initialEvents();
}

async function loadProduct(event: Product) {
  router.push({
    name: "product",
    params: {
      id: event.event_id,
    },
  });
}

async function loadProductsWithTags() {
  // events.value = await appStore.loadProductsUsingTags();
  // tagLoading.value = false;
}

function itemClicked(event: number) {
  console.log(`pagination item clicked - ${event}`);
  page.value = event;
}

watch(tagLoading, (newLoading) => {
  if (newLoading) loadProductsWithTags();
});
watch(loading, () => {
  loadProducts();
});
watch(newProduct, (newVal) => {
  if (newVal) loadProducts();
});
watch(page, () => {
  loadProducts();
});
watch(events, () => {
  loadProducts();
})

onMounted(() => {
  console.log(`ProductsList mounted. Page: ${page.value}`);
  loadProducts();
});
</script>

<template>
  <v-container class="mx-auto px-0">
    <v-sheet
      class="d-flex flex-wrap align-content-center mx-auto pa-2"
      rounded="lg"
    >
      <template v-for="event of eventList" :key="event.id">
        <ProductCard
          :product="(event as Product)"
          @click="loadProduct(event)"
        />
      </template>
    </v-sheet>
    <v-pagination
      theme="dark"
      :length="pages"
      @update:model-value="itemClicked"
    ></v-pagination>
  </v-container>
</template>
