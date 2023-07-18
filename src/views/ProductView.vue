<script setup lang="ts">
// TODO: Figure out why data isn't loading
// TODO: Figure out the right way to retrieve merchant data

import { ref, onMounted } from "vue";
import { useDisplay } from "vuetify";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { Product, Stall, IProfile } from "@/models";
import { NDKEvent } from "@/ndk";

const appStore = useAppStore();
const { getProduct, getMerchant, getMerchantProfile } = storeToRefs(appStore);

const { mobile, name } = useDisplay();

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
  console.log(tempProfile);
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
  console.log(merchant.value);
  if (merchant.value && merchant.value.pubkey !== undefined) {
    const tempProfile = await getMerchantProfile.value(merchant.value.pubkey);
    if (tempProfile && tempProfile.size > 0) {
      const tmp: NDKEvent = tempProfile.values().next().value;
      console.log(tmp.content);
    }
    // console.log(profile.value);
  } else if (product.value.pubkey !== undefined) {
    // console.log("Fetching tempprofile")
    const tempProfile = await getMerchantProfile.value(product.value.pubkey);
    if (tempProfile && tempProfile?.size > 0) {
      const tmp: NDKEvent = tempProfile.values().next().value;
      console.log(tmp.content);
      profile.value = parseProfile(tmp.content);
    }
  }
});
</script>
<template>
  <Suspense>
      <v-container class="w-auto">
        <v-row>
          <v-col v-if="!mobile && (merchant || profile)" cols="2">
            <v-sheet rounded="lg">
              <v-card class="mx-auto">
                <template v-if="merchant">
                  <v-card-title>{{ merchant.name }}</v-card-title>
                  <v-card-subtitle>{{ merchant.description }}</v-card-subtitle>
                </template>
                <template v-else-if="profile">
                  <v-card-title>{{ profile.name }}</v-card-title>
                </template>
              </v-card>
              <div v-if="profile">
                <p>{{}}</p>
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
        <v-row v-if="mobile && (merchant || profile)">
          <v-col>
            <v-sheet rounded="lg">
              <v-card dense class="mx-auto">
                <div class="d-flex flex-no-wrap justify-space-between">
                  <template v-if="merchant">
                    <v-card-title>{{ merchant?.name }}</v-card-title>
                    <v-card-subtitle>{{
                      merchant.description
                    }}</v-card-subtitle>
                  </template>
                  <template v-else-if="profile">
                    <v-avatar class="ma-3" size="125" rounded="0">
                      <v-img :src="profile.picture"></v-img>
                    </v-avatar>
                    <v-card-title>{{ profile.name }}</v-card-title>
                    <v-card-subtitle>{{ profile.about }}</v-card-subtitle>
                  </template>
                  <template v-if="profile?.website !== undefined">
                    <v-card-actions>
                      <v-btn class="ms-2" variant="outlined" size="small">
                        Seller's Website
                      </v-btn>
                    </v-card-actions>
                  </template>
                </div>
              </v-card>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
  </Suspense>
</template>
