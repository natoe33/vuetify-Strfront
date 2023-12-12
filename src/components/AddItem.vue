<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { newStall } from "@/models";
import { NDKEvent } from "@nostr-dev-kit/ndk";

const appStore = useAppStore();
const { addItem, userStores, utils } = storeToRefs(appStore);
const stores = ref([] as newStall[]);
const storeList = ref(new Set());
const images = ref([] as File[]);
//TODO: Add product tags

const prodProfile = ref({
  id: "",
  stall_id: "",
  name: "",
  description: "",
  images: [],
  currency: "",
  price: 0,
  quantity: 0,
});

function addImage() {
  console.log(images.value)
  utils.value.uploadImage(images.value[0])
}

function createItem() {
  prodProfile.value.id = utils.value.generateUUID();
  prodProfile.value.currency = stores.value.find(store => store.id = prodProfile.value.stall_id)?.currency || 'SAT';
  console.log(prodProfile.value);
}

watch(addItem, (newval) => {
  if(newval) {
    console.log(userStores.value);
    userStores.value.forEach((store) => {
      const stall: newStall = JSON.parse(store.content);
      stores.value.push(stall);
    })
  }
})

watch(images, (newval) => {
  console.log(newval);

})

onMounted(async () => {
  const tempStore = await appStore.getUserMerchantEvents;
  if (tempStore && tempStore.size > 0) {
    storeList.value = tempStore;
  }
});
</script>
<template>
  <v-dialog v-model="addItem">
    <v-card>
      <v-card-title>Add Item</v-card-title>
      <v-divider></v-divider>
      <v-form>
        <v-container>
          <v-row>
            <v-col>
              <v-select
                v-model="prodProfile.stall_id"
                label="Create in store"
                :items="stores"
                item-title="name"
                item-value="id"
              />
            </v-col>
            <v-col>
              <v-text-field v-model="prodProfile.name" label="Item Name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
            <v-textarea
              v-model="prodProfile.description"
              label="Item Description"
            />
            </v-col>
          </v-row>
          <v-row>
            <v-file-input
              v-model="images"
              label="Add Pictures"
              accept="image/png, image/jpeg, image/bmp"
              multiple
              show-size
              counter
              chips
              prepend-icon="mdi-cloud-upload"
              @change="addImage"
            />
            </v-row>
          <v-row>
            <v-col>
              <v-text-field v-model="prodProfile.price" label="Item Price" />
            </v-col>
            <v-col>
              <v-text-field v-model="prodProfile.quantity" label="Number Available" />
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-card-actions>
        <v-btn @click="createItem">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
