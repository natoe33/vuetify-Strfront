<script setup lang="ts">
// TODO: Display item quantity

import ProductCard from "./ProductCard.vue";
import { onMounted, ref, watch, computed, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { Product } from "@/models";
import { useAppStore } from "@/store/app";
import { storeToRefs } from "pinia";
const LoadingOverlay = defineAsyncComponent(
  () => import("@/components/LoadingOverlay.vue")
);

const appStore = useAppStore();

const router = useRouter();

const { itemsPerPage, loading, page, products } = storeToRefs(appStore);

const events = ref([] as Product[]);
const pages = ref(0);
const showLoading = ref(false);

const eventList = computed(() => products.value);
const showEvents = computed(() => events.value);

async function loadProducts() {
  events.value = appStore.getProducts;
  pages.value = appStore.getNumOfPages;
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
  page.value = event;
}

watch(eventList, (newval) => {
  pages.value = appStore.getNumOfPages;
  if (page.value < 1) page.value = 1;
  const startIndex: number = (page.value - 1) * itemsPerPage.value;
  const endIndex: number = startIndex + itemsPerPage.value;
  events.value = newval.slice(startIndex, endIndex);
  console.log(
    `page: ${page.value} - pages: ${pages.value} - startIndex: ${startIndex} - endIndex: ${endIndex}`
  );
});

watch(page, () => {
  loadProducts();
});

watch(loading, (newval) => {
  showLoading.value = newval;
  if(!newval) loadProducts();
});

onMounted(() => {
  loadProducts();
});
</script>

<template>
  <v-container class="mx-auto px-0">
    <v-sheet
      class="d-flex flex-wrap align-content-center mx-auto pa-2"
      color="background"
      rounded="lg"
    >
      <template v-for="event of showEvents" :key="event.event_id">
        <ProductCard
          :product="(event as Product)"
          @click="loadProduct(event)"
        />
      </template>
    </v-sheet>
    <v-pagination
      theme="dark"
      v-model="page"
      :length="pages"
      @update:model-value="itemClicked"
    ></v-pagination>
    <template v-if="showLoading">
      <LoadingOverlay />
    </template>
  </v-container>
</template>
