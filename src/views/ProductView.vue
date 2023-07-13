<script setup lang="ts">
// TODO: Figure out why data isn't loading
// TODO: Figure out the right way to retrieve merchant data

import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { Stall } from "@/models";

const appStore = useAppStore();
const { getProduct, getMerchant } = storeToRefs(appStore);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

let merchant: Stall[] = [];

const product = await getProduct.value(props.id);
console.log(product);
if (product) merchant = await getMerchant.value(product[0].stall_id);

console.log(merchant);
</script>
<template>
  <Suspense>
    <v-sheet class="d-md-inline ma-2 pa-0">
      <template v-if="product[0].images">
        <v-carousel show-arrows="hover" hide-delimiters progress="primary">
          <v-carousel-item
            v-for="(image, i) in product[0].images"
            :key="i"
            :src="image"
          >
          </v-carousel-item>
        </v-carousel>
      </template>
      <v-sheet>
        <p>{{ product[0].name }}</p>
        <p>{{ product[0].description }}</p>
        <!--TODO: Put merchant info here-->
        <div v-if="merchant[0]">
        <p>{{ merchant[0].name }}</p>
        <p>{{ merchant[0].description }}</p>
      </div>
      </v-sheet>
    </v-sheet>
  </Suspense>
</template>
