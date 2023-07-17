<script setup lang="ts">
// TODO: Figure out why data isn't loading
// TODO: Figure out the right way to retrieve merchant data

import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { Product, Stall } from "@/models";

const appStore = useAppStore();
const { getProduct, getMerchant } = storeToRefs(appStore);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const product = ref<Product>();
const merchant = ref<Stall>();

onMounted(async () => {
  const tempProduct = await getProduct.value(props.id);
  product.value = tempProduct[0];
  console.log(product.value);
  console.log(product.value.name);
  const tempMerch = await getMerchant.value(product.value.stall_id);
  merchant.value = tempMerch[0];
  console.log(merchant.value);
});
</script>
<template>
  <Suspense>
    <v-main class="bg-grey-lighten-3">
      <v-container class="mx-2">
        <v-row>
          <v-col cols="2" class="d-none d-md-flex">
            <v-sheet rounded="lg">
              <div v-if="merchant">
                <p>{{ merchant?.name }}</p>
                <p>{{ merchant?.description }}</p>
              </div>
            </v-sheet>
          </v-col>
          <v-col>
            <!-- <v-sheet min-height="70vh" rounded="lg"> -->
            <v-sheet rounded="lg">
              <v-card class="mx-auto">
                <template v-if="product?.images">
                  <v-carousel
                    show-arrows="hover"
                    hide-delimiters
                    progress="primary"
                  >
                    <v-carousel-item
                      v-for="(image, i) in product?.images"
                      :key="i"
                      :src="image"
                    >
                    </v-carousel-item>
                  </v-carousel>
                </template>
                <v-divider class="my-2"></v-divider>
                <v-card-item>
                  <v-card-title>{{ product?.name }}</v-card-title>
                  <v-card-text>{{ product?.description }}</v-card-text>
                </v-card-item>
              </v-card>
            </v-sheet>
          </v-col>
        </v-row>
        <v-row class="d-flex d-md-none">
          <v-col>
              <v-sheet rounded="lg">
                <div v-if="merchant">
                  <p>{{ merchant?.name }}</p>
                  <p>{{ merchant?.description }}</p>
                </div>
              </v-sheet>
            </v-col>
        </v-row>
      </v-container>
    </v-main>
  </Suspense>
</template>
