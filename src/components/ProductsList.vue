<script setup lang="ts">
// TODO: Display item quantity

import ProductCard from "./ProductCard.vue";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Product } from "@/models";
import { useAppStore } from "@/store";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { NostrProviderService } from "@/utils";

const appStore = useAppStore();
//const nostrStore = useNostrStore();

const router = useRouter();

const {
  tagLoading,
  loading,
  newProduct,
  tag,
  page,
  productsLoading,
  products,
  npub,
  nostrProvider
} = storeToRefs(appStore);
// const { productsLoading } = storeToRefs(nostrStore);
const events = ref(new Map());
const pages = ref(0);

const eventList = computed(() => products.value);

async function loadProducts() {
  console.log("ProductList loading products");
  events.value = appStore.getProducts;
  pages.value = await appStore.getNumOfPages;
  console.log(`Product list: ${events.value.size} loaded`);
  loading.value = false;
  // if (!productsLoading.value) {
  //   appStore.initialEvents();
  // }
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

watch(productsLoading, (newLoading) => {
  if (!newLoading) loadProducts();
});

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
});
watch(npub, (newval) => {
  if (newval){
    nostrProvider.value = new NostrProviderService();
  }
})

onMounted(() => {
  console.log(`ProductsList mounted. Page: ${page.value}`);
  // appStore.initialEvents();
  loadProducts();
});
</script>

<template>
  <v-container class="mx-auto px-0">
    <v-sheet
      class="d-flex flex-wrap align-content-center mx-auto pa-2"
      rounded="lg"
    >
      <template v-for="event of eventList" :key="event[0]">
        <ProductCard
          :product="(event[1] as Product)"
          @click="loadProduct(event[1])"
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
