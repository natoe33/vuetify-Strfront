<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/store";
const appStore = useAppStore();
const { getSortedTags, setTagandLoading, clearTagandLoading } = appStore;

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

watch(group, () => {
  drawer.value = false;
});
const items = await getSortedTags;
const links = ["Dashboard", "Messages", "Profile", "Updates"];
</script>
<template>
  <v-app-bar color="teal-darken-4" flat>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-container class="fill-height d-flex mx-2 align-left">
      <v-img
        src="@/assets/logo-no-background.svg"
        height="32"
        @click="goHome"
      />
    </v-container>
    <!-- <v-container class="fill-height d-flex mx-2">
      <v-img src="@/assets/logo-no-background.svg" height="64" width="30" class="float-left"/>
      <v-avatar class="me-10 ms-4" color="grey-darken-1" size="32"></v-avatar>
      <v-btn @click="goHome">Home</v-btn>
      <v-btn v-for="link in links" :key="link" variant="text">
        {{ link }}
      </v-btn>
    </v-container> -->
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" temporary>
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
