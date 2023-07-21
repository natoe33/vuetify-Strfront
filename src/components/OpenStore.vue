<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppStore } from "@/store";
import { storeToRefs } from "pinia";

const appStore = useAppStore();
const { openStore } = storeToRefs(appStore);
const storeName = ref('');
const description = ref('');


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
                </v-container>
            </v-form>
        </v-card>
    </v-dialog>
</template>