<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store/app";
import { Event, newShipping, newStall } from "@/models";
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
const { store, editStore, utils, nostrProvider } = storeToRefs(appStore);

const storeProfile = ref({
  id: "",
  name: "",
  description: "",
  currency: "",
  shipping: [] as newShipping[],
});

const selectedCurrency = ref("");
const currencies = ref([] as currency[]);
currencies.value.push({ cc: "SAT", symbol: "S", name: "Satoshi" });
const countries = ref([] as country[]);
const disabled = ref(true);
const agsi = ref(true);

function addZone() {
  const newz: newShipping = { id: "", name: "", cost: 0, country: [] };
  storeProfile.value.shipping.push(newz);
}

function popZone() {
  storeProfile.value.shipping.pop();
}

async function updateStore() {
  if (!nostrProvider.value.ndk?.signer) {
    nostrProvider.value = await new NostrProviderService();
  }
  if (agsi.value) {
    storeProfile.value.shipping.forEach((zone) => {
      if (zone.id === "") {
        zone.id = appStore.utils.generateUUID().replaceAll("-", "");
      }
    });
  }
  store.value.content = JSON.stringify(storeProfile.value);
  // console.log(store.value);
  const editEvent: Event = new Event({
    pubkey: store.value.pubkey,
    kind: store.value.kind,
    tags: store.value.tags,
    content: store.value.content,
  });
  console.log(editEvent);
  const retEvent = await appStore.nostrProvider.updateStall(editEvent);
  console.log(retEvent);
}

watch(editStore, (newval) => {
  console.log(editStore.value);
  console.log(storeProfile.value);
  console.log(store.value);
  if (newval) {
    storeProfile.value = JSON.parse(store.value.content);
  }
});

watch(storeProfile.value.shipping, (newval) => {
  if (newval.length > 1) {
    disabled.value = false;
  } else {
    disabled.value = true;
  }
});

onMounted(async () => {
  const currencyList = await utils.value.getWorldCurrencies();
  const countryList = await utils.value.getCountries();
  countries.value = countryList;
});
</script>
<template>
  <v-dialog v-model="editStore" scrollable>
    <v-card>
      <v-card-title>Edit Store</v-card-title>
      <v-divider></v-divider>
      <v-card-subtitle>Store ID: {{ storeProfile.id }}</v-card-subtitle>
      <v-form>
        <v-container>
          <v-row>
            <v-text-field
              v-model="storeProfile.name"
              label="Store Name"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-textarea
              v-model="storeProfile.description"
              label="Store Description"
              hint="Describe your store, what you're selling, why you're selling it, etc..."
            ></v-textarea>
          </v-row>
          <v-row>
            <v-select
              v-model="storeProfile.currency"
              chips
              label="Accepted Currency"
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
          <template v-for="(zone, index) in storeProfile.shipping" :key="index">
            <v-sheet class="mt-4" elevation="12">
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
        <v-btn @click="updateStore">Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
