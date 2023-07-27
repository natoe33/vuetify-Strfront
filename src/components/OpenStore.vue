<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppStore } from "@/store";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { json } from "stream/consumers";

interface currency {
  cc: string;
  symbol: string;
  name: string;
}

interface country {
  name: string;
  code: string;
}

interface shipping {
  name: string;
  cost: number;
  country: string[];
}

const appStore = useAppStore();
const { openStore, utils } = storeToRefs(appStore);
const storeName = ref("");
const description = ref("");
const currencies = ref([] as currency[]);
currencies.value.push({ cc: "SAT", symbol: "S", name: "Satoshi" });
const countries = ref([] as country[]);
const zones = ref([] as shipping[]);

onMounted(async () => {
  const currencyList = await utils.value.getWorldCurrencies();
  const countryList = await utils.value.getCountries();
  // currencies.value = currencyList.map(currency => currency.cc);
  // currencies.value = currencies.value.concat(currencyList);
  countries.value = countryList;
});
</script>
<template>
  <v-dialog v-model="openStore">
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
              multiple
              chips
              :items="currencies"
              item-title="name"
              item-value="cc"
              hint="Currently, only Sats (Lightning Satoshis)"
            ></v-select>
          </v-row>
          <v-row>
            <v-select
              label="Countries"
              multiple
              chips
              :items="countries"
              item-title="name"
              item-value="code"
              hint="Select the countries you're willing to ship to"
            ></v-select>
            <v-text-field
              type="number"
              label="Cost"
              hint="Cost in your accepted currencies you will charge for shipping"
            ></v-text-field>
          </v-row>
          <template v-for="(zone, index) in zones" :key="index">
            <v-row>
              <v-select
                label="Countries"
                multiple
                chips
                :items="countries"
                item-title="name"
                item-value="code"
                hint="Select the countries you're willing to ship to"
              ></v-select>
              <v-text-field
                type="number"
                label="Cost"
                hint="Cost in your accepted currencies you will charge for shipping"
              ></v-text-field>
            </v-row>
          </template>
        </v-container>
      </v-form>
    </v-card>
  </v-dialog>
</template>
