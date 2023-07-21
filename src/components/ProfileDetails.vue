<script setup lang="ts">
import { useNostrStore } from "@/store";
import { storeToRefs } from "pinia";
const nostrStore = useNostrStore();
const { user } = storeToRefs(nostrStore);
</script>
<template>
  <v-sheet class="bg-accent">
    <p>{{ user.profile?.about }}</p>
    <p>{{ user.profile?.nip05 }}</p>
    <p>{{ user.profile?.website }}</p>
  </v-sheet>
</template>
