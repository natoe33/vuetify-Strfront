<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { IContent } from "@/models";
import { NDKEvent } from "@nostr-dev-kit/ndk";

const appStore = useAppStore();
const { addItem } = storeToRefs(appStore);
const stores = ref([] as Event[]);
const storeList = ref(new Set());
const uploadFiles = ref([] as File[]);

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
              v-model="uploadFiles"
              label="Add Pictures"
              accept="image/png, image/jpeg, image/bmp"
              multiple
              show-size
              counter
              chips
              prepend-icon="mdi-cloud-upload"              
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
    </v-card>
  </v-dialog>
</template>
