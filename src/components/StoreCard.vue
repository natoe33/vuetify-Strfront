<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from "vue";
import { newStall, newShipping, Event } from "@/models";
import { useAppStore } from "@/store/app";
import { storeToRefs } from "pinia";
const EditStore = defineAsyncComponent(
  () => import("@/components/EditStore.vue")
);

const appStore = useAppStore();
const { store, editStore, deleteStore } = storeToRefs(appStore);


const props = defineProps({
  storeEvent: {
    type: Event, // Object as PropType<NDKEvent>,
    required: true,
  },
});

function openEditStore() {
  store.value = props.storeEvent;
  editStore.value = !editStore.value;
}

function deleteSelectedStore() {
  store.value = props.storeEvent;
  console.log(store.value);
  deleteStore.value = !deleteStore.value;
}

const storeProfile = ref({
  id: "",
  name: "",
  description: "",
  currency: "",
  shipping: [] as newShipping[],
});

onMounted(() => {
  console.log(props.storeEvent);
  storeProfile.value = JSON.parse(props.storeEvent.content);
});
</script>
<template>
  <v-card variant="outlined">
    <v-card-title>{{ storeProfile.name }}</v-card-title>
    <v-card-subtitle>{{ storeProfile.description }}</v-card-subtitle>
    <v-card-text>
      <p>Accepted currencies: {{ storeProfile.currency }}</p>
    </v-card-text>
    <v-card-item>
      <p>Shipping</p>
      <v-row>
        <template v-for="(ship, index) in storeProfile.shipping" :key="index">
          <v-col cols="12">
            <v-card :title="ship.name" variant="outlined">
              <v-card-text>
                <p>Cost: {{ ship.cost }} {{ storeProfile.currency }}</p>
                <p>Shipping to:</p>
                <v-list density="compact">
                  <v-list-item
                    v-for="(country, i) in ship.country"
                    :key="i"
                    variant="tonal"
                  >
                    {{ country }}
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </template>
      </v-row>
    </v-card-item>
    <v-card-actions>
      <v-btn
        variant="tonal"
        color="primary"
        elevation="4"
        @click="openEditStore"
        >Edit</v-btn
      >
      <v-btn
      variant="tonal"
      color="accent"
      elevation="4"
      @click="deleteSelectedStore"
      >Delete</v-btn>
    </v-card-actions>
  </v-card>
</template>
