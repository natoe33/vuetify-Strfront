<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppStore } from "@/store";
import { storeToRefs } from "pinia";

const appStore = useAppStore();
const { openStore } = storeToRefs(appStore);


</script>
<template>
    <v-dialog v-model="openStore">
        <v-card>
            <v-card-title>Open a store</v-card-title>
        </v-card>
    </v-dialog>
</template>