<script setup lang="ts">
import { NDKUser } from "@nostr-dev-kit/ndk";
import { useAppStore } from "@/store/app";

const appStore = useAppStore();
// const nostrStore = useNostrStore();
const { setLoggedIn, getLoggedIn, setUser } = appStore;
// const { setNpub } = nostrStore;

function Logout() {
  // setNpub("");
  setUser(new NDKUser({}));
  setLoggedIn(false);
}
</script>
<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
    </template>
    <v-list>
      <template v-if="getLoggedIn">
        <v-list-item title="Sign Out" @click="Logout">
          <template v-slot:prepend>
            <v-icon icon="mdi-close-circle-outline"></v-icon>
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>
