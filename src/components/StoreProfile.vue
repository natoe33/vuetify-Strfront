<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent } from "vue";
import { useAppStore } from "@/store";
import { newStall, newShipping, IEvent, Event } from "@/models";
import { storeToRefs } from "pinia";
import { NDKEvent } from "@/ndk";
const StoreCard = defineAsyncComponent(
  () => import("@/components/StoreCard.vue")
);

const appStore = useAppStore();
const { openStore, store } = storeToRefs(appStore);
const stores = ref([] as Event[]);

const storeProfile = ref({
  id: "",
  name: "",
  description: "",
  currency: "",
  shipping: [] as newShipping[],
});

function showOpenStore() {
  openStore.value = !openStore.value;
}

onMounted(async () => {
  if (store.value.content === "") {
    const storeList = await appStore.getUserMerchantEvents;
    console.log(storeList);
    if (storeList && storeList.size > 0) {
      storeList.forEach((store) => {
        const newStore: IEvent = store;
        stores.value.push(new Event(newStore));
      });
      console.log(stores.value);
      // store.value = storeList;
      // console.log(store.value);
      // storeProfile.value = JSON.parse(storeList.content);
      console.log(storeProfile.value);
    }
  }
});
</script>
<template>
  <v-sheet>
    <v-card>
      <v-card-title>My Stores</v-card-title>
      <template v-if="stores.length > 0">
        <v-container>
          <v-row>
            <template v-for="(store, index) in stores" :key="index">
              <v-col>
                <StoreCard :storeEvent="store" />
              </v-col>
            </template>
          </v-row>
        </v-container>
      </template>
      <v-card-actions>
        <v-btn color="primary" elevation="4" @click="showOpenStore"
          >Open Store</v-btn
        >
      </v-card-actions>
    </v-card>
    <v-divider inset></v-divider>
    <v-card title="My Listings">
      <v-card-actions>
        <v-btn color="primary" elevation="4">Create Listing</v-btn>
      </v-card-actions>
    </v-card>
  </v-sheet>
</template>
