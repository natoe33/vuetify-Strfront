<script setup lang="ts">
import { useAppStore } from "@/store/app";
import { storeToRefs } from "pinia";
import { useTheme } from "vuetify";
import { ref, defineAsyncComponent } from "vue";

// import components
const ProfileDetails = defineAsyncComponent(
  () => import("@/components/ProfileDetails.vue")
);
const StoreProfile = defineAsyncComponent(
  () => import("@/components/StoreProfile.vue")
);

const appStore = useAppStore();
const { user } = storeToRefs(appStore);
const tab = ref(null);
</script>
<template>
  <v-card>
    <v-img
      :src="user.profile?.banner"
      class="align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      cover
    >
      <v-avatar
        class="border-accent"
        :image="user.profile?.image"
        size="x-large"
      ></v-avatar>
      <v-card-title class="text-white">{{
        user.profile?.displayName
      }}</v-card-title>
    </v-img>

    <v-card-subtitle>{{ user.profile?.nip05 }}</v-card-subtitle>
    <v-tabs v-model="tab">
      <v-tab value="details">Details</v-tab>
      <v-tab value="settings">Settings</v-tab>
      <v-tab value="store">My Stores</v-tab>
      <v-tab value="purchases">My Purchases</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item key="details" value="details">
        <ProfileDetails />
      </v-window-item>
      <v-window-item key="settings" value="settings">Settings</v-window-item>
      <v-window-item key="store" value="store">
        <StoreProfile />
      </v-window-item>
      <v-window-item key="purchases" value="purchases">Purchases</v-window-item>
    </v-window>
  </v-card>
</template>
