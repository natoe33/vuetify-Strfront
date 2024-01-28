<script setup lang="ts">
import { useAppStore } from "@/store/app";
import { storeToRefs } from "pinia";
const appStore = useAppStore();
// const { user } = storeToRefs(appStore);
</script>
<template>
  <v-sheet color="primary-lighten-2">
    <p>{{ appStore.nostrProvider.ndk.activeUser?.profile?.about }}</p>
    <p>{{ appStore.nostrProvider.ndk.activeUser?.profile?.nip05 }}</p>
    <p>{{ appStore.nostrProvider.ndk.activeUser?.profile?.website }}</p>
  </v-sheet>
</template>
