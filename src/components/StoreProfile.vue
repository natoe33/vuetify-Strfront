<script setup lang="ts">
import { onMounted, watch, ref, defineAsyncComponent } from "vue";
import { useAppStore } from "@/store/app";
import { newShipping, IEvent, Event } from "@/models";
import { storeToRefs } from "pinia";

const StoreCard = defineAsyncComponent(
  () => import("@/components/StoreCard.vue")
);

const appStore = useAppStore();
const { openStore, store, addItem, userStores, deleteStore } = storeToRefs(appStore);
const stores = ref([] as Event[]);
const showDelete = ref(false);

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

function showAddItem() {
  addItem.value = !addItem.value;
}

function showDeleteStore() {
  deleteStore.value = !deleteStore.value;
}

function hideDeleteStore() {
  deleteStore.value = !deleteStore.value;
}

function confirmDeleteStore() {
  console.log(`Sending Kind 5 event for ${storeProfile.value.name}`);
}

watch(store, (newVal) => {
  console.log(newVal.content);
  storeProfile.value = JSON.parse(newVal.content);
  console.log(storeProfile.value);
})

onMounted(async () => {
  if (store.value.content === "") {
    const storeList = await appStore.getUserMerchantEvents;
    if (storeList && storeList.size > 0) {
      storeList.forEach((store) => {
        const newStore: IEvent = store;
        stores.value.push(new Event(newStore));
        userStores.value.push(new Event(newStore));
      });
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
        <v-btn
          color="primary"
          elevation="4"
          :disabled="stores.length === 0"
          @click="showAddItem"
          >Create Listing</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-sheet>
  <v-dialog width="400" v-model="deleteStore">
    <v-card>
      <v-card-title>
        Delete Store
      </v-card-title>
      <v-card-text>{{ storeProfile.name }}</v-card-text>
      <v-card-subtitle>
        Are you sure you want to delete this stall?
      </v-card-subtitle>
      <v-card-actions>
        <v-btn @click="hideDeleteStore">Close</v-btn>
        <v-btn @click="confirmDeleteStore">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
