<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAppStore } from "@/store";
import { newStall, newShipping } from "@/models";
import { storeToRefs } from "pinia";

const appStore = useAppStore();
const { openStore, store } = storeToRefs(appStore);

const storeProfile = ref({id: '', name: '', description: '', currency: '', shipping: [] as newShipping[]})

function showOpenStore() {
  openStore.value = !openStore.value;
}

onMounted(async () => {
  if (store.value.content === "") {
    const tempStore = await appStore.getUserMerchantEvent;
    console.log(tempStore);
     if (tempStore && tempStore.content !== '') {
       store.value = tempStore;
       console.log(store.value);
       storeProfile.value = JSON.parse(tempStore.content);
       console.log(storeProfile.value);
    }
  }
});
</script>
<template>
  <v-sheet>
    <v-card>
      <v-card-title>My Store</v-card-title>
        <template v-if="store.content !== ''">
          <v-card-subtitle>{{ storeProfile.name }}</v-card-subtitle>
          <v-card-text>{{ storeProfile.description }}</v-card-text>
          <v-card-text>Accepted currencies: {{ storeProfile.currency }}</v-card-text>
          <template v-for="(ship, index) in storeProfile.shipping" :key="index">
            <v-card-text>{{ ship.name }}</v-card-text>
            <v-card-text>{{ ship.cost }}</v-card-text>
            <v-card-text>{{ ship.country }}</v-card-text>
          </template>
        </template>
        <template v-else>
          <v-card-actions>
          <v-btn @click="showOpenStore">Open Store</v-btn>
          </v-card-actions>
        </template>
    </v-card>
  </v-sheet>
</template>
