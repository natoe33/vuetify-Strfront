<script setup lang="ts">
// TODO: Figure out why data isn't loading
// TODO: Figure out the right way to retrieve merchant data

import { ref, onMounted, defineAsyncComponent } from "vue";
import { useDisplay } from "vuetify";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store/app";
import { Product, Stall, IProfile } from "@/models";
import { NDKEvent } from "@nostr-dev-kit/ndk";
// import { NDKEvent } from "@nostr-dev-kit/ndk";
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

const { mobile, lgAndDown } = useDisplay();

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

async function setProductObjects() {
  product.value = getProduct.value(props.id);
  if (product.value) {
    merchant.value = getMerchant.value(product.value.stall_id);
    console.log(merchant.value?.shipping);
  }

  const merchKey: string =
    merchant.value && merchant.value.pubkey
      ? merchant.value.pubkey
      : product.value && product.value.pubkey
        ? product.value.pubkey
        : "";
  const tempProfile = await getMerchantProfile.value(merchKey);
  if (tempProfile && tempProfile.size > 0) {
    const tmp: NDKEvent = tempProfile.values().next().value;
    profile.value = parseProfile(tmp.content);
  }
}

onMounted(async () => {
  await setProductObjects();
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
