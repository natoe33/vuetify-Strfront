<script setup lang="ts">
// TODO: Figure out why data isn't loading
// TODO: Figure out the right way to retrieve merchant data

import { ref, onMounted, defineAsyncComponent } from "vue";
import { useDisplay } from "vuetify";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { Product, Stall, IProfile, IStall, TProduct } from "@/models";
import { NDKEvent } from "@/ndk";
// import ProductSection from "@/components/ProductSection.vue";
const ProductSection = defineAsyncComponent(
  () => import("@/components/ProductSection.vue")
);
// import MerchantSection from "@/components/MerchantSection.vue";
const MerchantSection = defineAsyncComponent(
  () => import("@/components/MerchantSection.vue")
);

const appStore = useAppStore();
const { getProduct, getMerchant, getMerchantProfile } = storeToRefs(appStore);

const { mobile, name, lgAndDown, mdAndDown } = useDisplay();

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const product = ref<Product>();
const merchant = ref<Stall>();
const profile = ref<IProfile>();

function parseProfile(content: string): IProfile {
  const tempProfile: IProfile = JSON.parse(content);
  return tempProfile;
}

function objectToProduct(product: TProduct): Product {
  const prod = new Product(
    product.product_id,
    product.event_id,
    product.stall_id,
    product.name,
    product.description,
    product.images,
    product.currency,
    product.price,
    product.quantity,
    product.tags,
    product.created_at,
    product.pubkey
  );
  return prod;
}

function objectToStall(merchant: IStall): Stall {
  const stall = new Stall(
    merchant.stall_id,
    merchant.event_id,
    merchant.pubkey,
    merchant.created_at,
    merchant.name,
    merchant.description,
    merchant.currency
  );
  return stall;
}

onMounted(async () => {
  // const tempProduct = getProduct.value(props.id);
  // product.value = objectToProduct(tempProduct[0]);
  console.log(getProduct.value(props.id));
  product.value = getProduct.value(props.id);
  console.log(product.value);
  if (product.value) {
    console.log(getMerchant.value(product.value.stall_id));
    merchant.value = getMerchant.value(product.value.stall_id);
    console.log(merchant.value);
  }
  // const tempMerch = getMerchant.value(product.value.stall_id);
  // if (tempMerch[0]){
  //   console.log(tempMerch[0]);
  //   merchant.value = objectToStall(tempMerch[0]);
  // }
  console.log(merchant.value?.pubkey);
  console.log(product.value?.pubkey);
  if (merchant.value && merchant.value.pubkey !== undefined) {
    const tempProfile = await getMerchantProfile.value(merchant.value.pubkey);
    if (tempProfile && tempProfile.size > 0) {
      const tmp: NDKEvent = tempProfile.values().next().value;
      profile.value = parseProfile(tmp.content);
    }
  } else if (product.value?.pubkey !== undefined) {
    const tempProfile = await getMerchantProfile.value(product.value.pubkey);
    if (tempProfile && tempProfile?.size > 0) {
      const tmp: NDKEvent = tempProfile.values().next().value;
      profile.value = parseProfile(tmp.content);
    }
  }
  console.log(profile.value);
});
</script>
<template>
  <Suspense>
    <v-container :fluid="lgAndDown ? true : false" class="w-auto">
      <v-row>
        <v-col v-if="!mobile && (merchant || profile)" cols="3">
          <MerchantSection :merchant="merchant" :profile="profile" />
        </v-col>
        <v-col>
          <ProductSection :product="product" />
        </v-col>
      </v-row>
      <v-row v-if="mobile && (merchant || profile)">
        <v-col>
          <MerchantSection :merchant="merchant" :profile="profile" />
        </v-col>
      </v-row>
    </v-container>
  </Suspense>
</template>
