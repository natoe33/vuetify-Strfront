<script setup lang="ts">
import { onMounted, watch, ref, computed, defineAsyncComponent } from "vue";
import { useAppStore } from "@/store/app";
import { newShipping, IEvent, Event } from "@/models";
import { storeToRefs } from "pinia";
import { useDisplay } from "vuetify";
import { NDKTag } from "@nostr-dev-kit/ndk";

const StoreCard = defineAsyncComponent(
  () => import("@/components/StoreCard.vue")
);

const {xs, sm, name} = useDisplay();
const cols = computed(() => xs.value ? 12 : sm.value ? 6 : 3);

const appStore = useAppStore();
const { openStore, store, addItem, userStores, deleteStore } = storeToRefs(appStore);
// const stores = ref([] as Event[]);
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

async function getStalls() {
  console.log(appStore.ndkInitialized);
  userStores.value = [] as Event[];
  const storeList = await appStore.getUserMerchantEvents;
  if (storeList && storeList.size > 0) {
    storeList.forEach((store) => {
      const newStore: IEvent = store;
      userStores.value.push(new Event(newStore));
    });
  }
}

function hideDeleteStore() {
  deleteStore.value = !deleteStore.value;
}

async function confirmDeleteStore() {
  console.log(`Sending Kind 5 event for ${storeProfile.value.name}`);
  const tag = store.value.tags.find(tag => tag[0] === 'd');
  console.log(tag);
  const event = await appStore.nostrProvider.deleteEvent(store.value.kind, store.value.id, tag ? tag[1]: '');
  if (event) {
    deleteStore.value = !deleteStore.value;
    getStalls();
  }
}

watch(store, (newVal) => {
  console.log(newVal.content);
  storeProfile.value = JSON.parse(newVal.content);
  console.log(storeProfile.value);
})

onMounted(async () => {
  console.log(name.value);
  if (store.value.content === "") {
    userStores.value = [] as Event[];
    const storeList = await appStore.getUserMerchantEvents;
    console.log(storeList);
    if (storeList && storeList.size > 0) {
      storeList.forEach((store) => {
        const newStore: IEvent = store;
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
      <template v-if="userStores.length > 0">
        <v-container>
          <v-row>
            <template v-for="(store, index) in userStores" :key="index">
              <v-col :cols="cols">
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
          :disabled="userStores.length === 0"
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
