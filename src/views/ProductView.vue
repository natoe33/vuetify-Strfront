<script setup lang="ts">
// TODO: Figure out why data isn't loading
// TODO: Figure out the right way to retrieve merchant data

import { ref, onMounted, defineAsyncComponent } from "vue";
import { useDisplay } from "vuetify";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { Product, Stall, IProfile } from "@/models";
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

const { mobile, name, lgAndDown } = useDisplay();

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

onMounted(async () => {
  /**
   * TODO: Better profile loading
   * If the merchant event doesn't include the pubkey, get it from the product
   * If it's not in the product ???
   */
  const tempProduct = await getProduct.value(props.id);
  product.value = tempProduct[0];
  // console.log(product.value);
  // console.log(product.value.name, product.value.pubkey);
  const tempMerch = await getMerchant.value(product.value.stall_id);
  merchant.value = tempMerch[0];
  // console.log(merchant.value);
  if (merchant.value && merchant.value.pubkey !== undefined) {
    const tempProfile = await getMerchantProfile.value(merchant.value.pubkey);
    if (tempProfile && tempProfile.size > 0) {
      const tmp: NDKEvent = tempProfile.values().next().value;
      console.log(tmp.content);
    }
  } else if (product.value.pubkey !== undefined) {
    const tempProfile = await getMerchantProfile.value(product.value.pubkey);
    if (tempProfile && tempProfile?.size > 0) {
      const tmp: NDKEvent = tempProfile.values().next().value;
      profile.value = parseProfile(tmp.content);
    }
  }
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
