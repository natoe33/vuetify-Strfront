<script setup lang="ts">
import { onMounted } from "vue";
import { useNostrStore, useAppStore } from "@/store";
import { storeToRefs } from "pinia";

const nostrStore = useNostrStore();
const { getUserMerchantEvent } = nostrStore;
const { store } = storeToRefs(nostrStore);

const appStore = useAppStore();
const { openStore } = storeToRefs(appStore);

function showOpenStore(){
  openStore.value = !openStore.value
}

onMounted(async () => {
  console.log(store.value.content);
  if (store.value.content !== '') {
    const tempStore = await getUserMerchantEvent;
    console.log("tempStore");
    console.log(tempStore?.values().next().value);
    if (tempStore && tempStore.size > 0) {
      store.value = tempStore.values().next().value;
    }
  }
});
</script>
<template>
  <v-sheet>
    <v-card>
      <v-card-title>My Store</v-card-title>
      <v-card-actions>
        <template v-if="store.content !== ''">
          <v-card-text>Your Store Info Here</v-card-text>
          <v-card-text></v-card-text>
        </template>
        <template v-else>
          <v-btn @click="showOpenStore">Open Store</v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-sheet>
</template>
