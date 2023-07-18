<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAppStore } from "@/store";
import { storeToRefs } from "pinia";
const appStore = useAppStore();
const { clearTagandLoading } = appStore;
const { drawer } = storeToRefs(appStore);

const router = useRouter();

async function goHome() {
  clearTagandLoading();
  router.push({ name: "home" });
}
</script>
<template>
  <!-- color="teal-darken-4"-->
  <v-app-bar flat density="prominent">
    <template v-slot:prepend>
      <v-app-bar-nav-icon
        class="me-1"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
    </template>
    <v-container class="fill-height d-flex ms-0">
      <v-img
        src="@/assets/logo-no-background.svg"
        height="64"
        width="25%"
        @click="goHome"
        class="float-left"
        justify="start"
      />
    </v-container>
  </v-app-bar>
</template>
<style scoped>
.logo {
  position: relative;
  left: 0;
  flex-grow: unset;
  flex-shrink: unset;
  flex-basis: unset;
}
</style>
