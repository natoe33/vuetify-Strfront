<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/store";
import { storeToRefs } from "pinia";
const appStore = useAppStore();
const { getSortedTags, setTagandLoading, clearTagandLoading } = appStore;
const { loggingIn, npub, user } = storeToRefs(appStore);

const drawer = ref(false);
const group = ref(null);
const router = useRouter();

function loadWithTags(tag: string) {
  setTagandLoading(tag);
}

async function goHome() {
  clearTagandLoading();
  router.push({ name: "home" });
}

function setLoggingIn() {
  loggingIn.value = !loggingIn.value;
}

function goToProfile() {}

watch(group, () => {
  drawer.value = false;
});
//TODO: Fix tag loading
const items = await getSortedTags;
const links = ["Dashboard", "Messages", "Profile", "Updates"];
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
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item
        title="Profile"
        @click="npub === '' ? setLoggingIn : goToProfile"
      >
        <template v-slot:prepend>
          <v-avatar>
            <template v-if="npub === ''">
              <v-icon icon="mdi-account-circle"></v-icon>
            </template>
            <template v-else>
              <v-img
                :src="user.profile?.image"
                :alt="user.profile?.nip05"
              ></v-img>
            </template>
          </v-avatar>
        </template>
      </v-list-item>
      <v-list-item
        v-for="(link, i) in links"
        :key="i"
        :title="link"
        :value="link"
      ></v-list-item>
    </v-list>
    <v-list>
      <v-list-group value="Tags">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" title="Filter by Tag"></v-list-item>
        </template>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :title="item"
          :value="item"
          @click="loadWithTags(item)"
        ></v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
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
