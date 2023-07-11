<script setup lang="ts">
import ProductCard from "./ProductCard.vue";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Product } from "@/models";
import { useAppStore } from "@/store";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const appStore = useAppStore();
const router = useRouter();

const { tagLoading, loading, tag, page } = storeToRefs(appStore);
const events = ref([] as Product[]);

const eventList = computed(() => events.value);

async function loadProducts() {
  events.value = appStore.getProducts;
  loading.value = false;
}

async function loadProduct(event: Product) {
  router.push({
    name: "product",
    params: {
      id: event.id,
    },
  });
}

async function loadProductsWithTags() {
  events.value = await appStore.loadProductsUsingTags();
  tagLoading.value = false;
}

watch(tagLoading, (newLoading, oldLoading) => {
  if (newLoading) {
    console.log(
      `from watch: newLoading: ${newLoading} oldLoading: ${oldLoading}`
    );
    console.log(`tag: ${tag.value}`);
    loadProductsWithTags();
  } else {
    console.log(
      `from watch else: newLoading: ${newLoading} oldLoading: ${oldLoading}`
    );
  }
});
watch(loading, (newPage, oldPage) => {
  console.log(`new page: ${newPage} old page: ${oldPage}`);
  loadProducts();
});

onMounted(() => {
  console.log(`ProductsList mounted. Page: ${page.value}`);
  loadProducts();
});
</script>

<template>
  <v-sheet class="d-flex flex-wrap align-content-center">
    <template v-for="event of eventList" :key="event.id">
      <ProductCard :product="(event as Product)" @click="loadProduct(event)" />
    </template>
  </v-sheet>
  <v-btn v-if="page > 0" @click="appStore.prevPage">Prev</v-btn>
  <v-btn @click="appStore.nextPage">Next</v-btn>
</template>
