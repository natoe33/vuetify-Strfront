<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/store";
import { storeToRefs } from "pinia";
const appStore = useAppStore();
const { getSortedTags, setTagandLoading, clearTagandLoading } = appStore;
const { loggingIn, npub } = storeToRefs(appStore);

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
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </template>
    <v-container class="fill-height d-flex d-sm-none">
      <v-img
        src="@/assets/logo-no-background.svg"
        height="64"
        width="25%"
        @click="goHome"
        class="float-left"
        justify="start"
      />
    </v-container>
    <!-- <v-container class="fill-height d-flex align-center"> -->
    <v-container
      justify="start"
      class="align-center fill-height d-none d-sm-flex"
    >
      <v-img
        src="@/assets/logo-no-background.svg"
        height="64"
        width="25%"
        @click="goHome"
        class="float-left"
        justify="start"
      />
      <!-- <template>
        <v-btn icon>
          <v-avatar color="brown" size="large">
            <span class="text-h5">NF</span>
          </v-avatar>
        </v-btn>
      </template> -->
      <!-- <v-avatar color="info">
        <v-icon icon="mdi-account-circle"></v-icon>
      </v-avatar> -->
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <v-avatar
            v-bind="props"
            :color="isHovering ? 'primary' : undefined"
            @click="setLoggingIn"
          >
            <template v-if="npub === ''">
              <v-icon icon="mdi-account-circle"></v-icon>
            </template>
            <template v-else>
              <v-img
                src="https://cdn.vuetifyjs.com/images/john.jpg"
                alt="John"
              ></v-img>
            </template>
          </v-avatar>
        </template>
      </v-hover>
      <v-btn v-for="link in links" :key="link" variant="text">
        {{ link }}
      </v-btn>
    </v-container>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list class="d-block d-sm-none">
      <v-list-item
        v-for="(link, i) in links"
        :key="i"
        :title="link"
        :value="link"
        ></v-list-item
      >
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
