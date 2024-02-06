<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppStore } from "@/store/app";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { newShipping, newStall } from "@/models";
import { NostrProviderService } from "@/utils";

interface currency {
  cc: string;
  symbol: string;
  name: string;
}

interface country {
  name: string;
  code: string;
}

const appStore = useAppStore();
const { openStore, utils, nostrProvider } = storeToRefs(appStore);
const storeName = ref("");
const description = ref("");
const selectedCurrency = ref("");
const currencies = ref([] as currency[]);
currencies.value.push({ cc: "SAT", symbol: "S", name: "Satoshi" });
const countries = ref([] as country[]);
const zones = ref([] as newShipping[]);
const disabled = ref(true);
const agsi = ref(true);

function addZone() {
  const newz: newShipping = { id: "", name: "", cost: 0, country: [] };
  zones.value.push(newz);
}

function popZone() {
  zones.value.pop();
}

async function createStore() {
  // if (nostrProvider.value.ndk?.signer === undefined) {
  //   nostrProvider.value = await new NostrProviderService();
  // }
  if (agsi.value) {
    zones.value.forEach((zone) => {
      zone.id = appStore.utils.generateUUID().replaceAll("-", "");
    });
  }

  const stall: newStall = {
    id: appStore.utils.generateUUID().replaceAll("-", ""),
    name: storeName.value,
    description: description.value,
    currency: selectedCurrency.value,
    shipping: zones.value,
  };
  // console.log(stall);
  const retEvent = await appStore.nostrProvider.createStall(stall);
  console.log(retEvent);
}

onMounted(async () => {
  const currencyList = await utils.value.getWorldCurrencies();
  const countryList = await utils.value.getCountries();
  countries.value = countryList;
  const newz: newShipping = { id: "", name: "", cost: 0, country: [] };
  zones.value.push(newz);
});

watch(zones.value, (newval) => {
  if (newval.length > 1) {
    disabled.value = false;
  } else {
    disabled.value = true;
  }
});
</script>
<template>
  <v-dialog v-model="openStore" scrollable>
    <v-card>
      <v-card-title>Open a store</v-card-title>
      <v-divider></v-divider>
      <v-form>
        <v-container>
          <v-row>
            <v-text-field v-model="storeName" label="Store Name"></v-text-field>
          </v-row>
          <v-row>
            <v-textarea
              v-model="description"
              label="Store Description"
              hint="Describe your store, what you're selling, why you're selling it, etc..."
            ></v-textarea>
          </v-row>
          <v-row>
            <v-select
              label="Accepted Currency"
              v-model="selectedCurrency"
              chips
              :items="currencies"
              item-title="name"
              item-value="cc"
              hint="Currently, only Sats (Lightning Satoshis)"
            ></v-select>
          </v-row>
          <v-row>
            <v-card-subtitle>Shipping Zones</v-card-subtitle>
            <v-divider></v-divider>
          </v-row>
          <v-row>
            <v-checkbox
              v-model="agsi"
              label="Auto Generate Shipping IDs"
            ></v-checkbox>
          </v-row>
          <template v-for="(zone, index) in zones" :key="index">
            <v-sheet class="mt-4" elevation="2">
              <v-row>
                <template v-if="!agsi">
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="zone.id"
                      label="ID"
                      hint="Create a unique ID for this shipping option"
                    ></v-text-field>
                  </v-col>
                </template>
                <v-col>
                  <v-text-field
                    v-model="zone.name"
                    label="Name"
                    hint="Unique to this store"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="zone.country"
                    label="Countries"
                    multiple
                    chips
                    :items="countries"
                    item-title="name"
                    item-value="name"
                    hint="Select the countries you're willing to ship to"
                  ></v-select>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="zone.cost"
                    type="number"
                    label="Cost"
                    hint="Cost in your accepted currencies you will charge for shipping"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-sheet>
          </template>
          <v-row>
            <v-btn density="compact" icon="mdi-plus" @click="addZone"></v-btn>
            <v-spacer></v-spacer>
            <v-btn
              density="compact"
              icon="mdi-minus"
              :disabled="disabled"
              @click="popZone"
            ></v-btn>
          </v-row>
        </v-container>
      </v-form>
      <v-card-actions>
        <v-btn @click="createStore">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
