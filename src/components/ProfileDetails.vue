<script setup lang="ts">
import { useAppStore } from "@/store/app";
import { storeToRefs } from "pinia";
const appStore = useAppStore();
const { user } = storeToRefs(appStore);
</script>
<template>
  <v-sheet class="bg-accent">
    <p>{{ user.profile?.about }}</p>
    <p>{{ user.profile?.nip05 }}</p>
    <p>{{ user.profile?.website }}</p>
  </v-sheet>
</template>
