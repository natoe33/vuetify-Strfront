<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppStore } from "@/store";
import { storeToRefs } from "pinia";
const appStore = useAppStore();
const { getSortedTags, setTagandLoading } = appStore;
const { drawer, loggingIn, npub, user, loggedIn } = storeToRefs(appStore);

const group = ref(null);

function loadWithTags(tag: string) {
  setTagandLoading(tag);
}
function profileHandler() {
  if (!loggedIn.value) {
    loggingIn.value = !loggingIn.value;
  } else {
    goToProfile();
  }
}

function goToProfile() {}

watch(group, () => {
  drawer.value = false;
});
//TODO: Fix tag loading
const items = await getSortedTags;
const links = ["Dashboard", "Messages", "Updates"];
</script>
<template>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item title="Profile" @click="profileHandler">
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
      <!-- <v-list-item
        v-for="(link, i) in links"
        :key="i"
        :title="link"
        :value="link"
      ></v-list-item> -->
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
