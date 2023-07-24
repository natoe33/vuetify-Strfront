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

const appStore = useAppStore();
const { openStore, utils } = storeToRefs(appStore);
const storeName = ref('');
const description = ref('');
const currencies = ref([] as currency[]);
currencies.value.push({'cc': 'SAT', 'symbol': 'S', 'name': 'Satoshi'});


onMounted(async () => {
    const currencyList = await utils.value.getWorldCurrencies();
    // currencies.value = currencyList.map(currency => currency.cc);
    currencies.value = currencies.value.concat(currencyList);
    
})


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
                        <v-textarea v-model="description" label="Store Description"></v-textarea>
                    </v-row>
                    <v-row>
                        <v-select label="Currency" multiple chips :items="currencies" item-title="name" item-value="cc"></v-select>
                    </v-row>
                </v-container>
            </v-form>
        </v-card>
    </v-dialog>
</template>