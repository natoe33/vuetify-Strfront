<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { useAppStore } from "@/store/app";
import { storeToRefs } from "pinia";
// import { NostrProviderService } from "@/utils";

const appStore = useAppStore();
const { getSortedTags, setTagandLoading, setLoggedIn } =
  appStore;
const { drawer, loggingIn, loggedIn } =
  storeToRefs(appStore);

const router = useRouter();
const group = ref(null);
const image = ref("");

function loadWithTags(tag: string) {
  setTagandLoading(tag);
}

function Logout() {
  // setNpub("");
  // setUser(new NDKUser({}));
  setLoggedIn(false);
}

function profileHandler() {
  if (!loggedIn.value) {
    loggingIn.value = !loggingIn.value;
  } else {
    goToProfile();
  }
}

function goToProfile() {
  router.push({ name: "profile" });
}

// watch(appStore.nostrProvider.ndk.activeUser?.npub, (newval) => {
//   if (newval !== "") {
//     console.log('NavDrawer npub updated')
//     nostrProvider.value = new NostrProviderService();
//   }
// });

watch(loggedIn, (newval) => {
  // TODO: Update ndk here instead of MainView
  console.log(appStore.nostrProvider.ndk.activeUser?.profile?.image);
  if (newval && appStore.nostrProvider.ndk.activeUser?.profile?.image){
    image.value = appStore.nostrProvider.ndk.activeUser?.profile?.image
  }
});

watch(group, () => {
  drawer.value = false;
});

onMounted(() => {
  if (appStore.nostrProvider.ndk.activeUser?.profile?.image){
    image.value = appStore.nostrProvider.ndk.activeUser.profile.image
  }  
});
//TODO: Fix tag loading
const items = await getSortedTags;
// const links = ["Dashboard", "Messages", "Updates"];
</script>
<template>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item title="Profile" @click="profileHandler">
        <template v-slot:prepend>
          <v-avatar>
            <template v-if="!appStore.nostrProvider.ndk.activeUser?.profile?.image || appStore.nostrProvider.ndk.activeUser?.profile?.image">
              <v-icon icon="mdi-account-circle"></v-icon>
            </template>
            <template v-else>
              <v-img :src="image" :alt="appStore.nostrProvider.ndk.activeUser.profile?.nip05"></v-img>
            </template>
          </v-avatar>
        </template>
      </v-list-item>
      <v-list-item title="Marketplace"></v-list-item>
      <v-list-item title="Classifieds"></v-list-item>
      <template v-if="loggedIn">
        <v-list-item title="Sign Out" @click="Logout">
          <template v-slot:prepend>
            <v-icon icon="mdi-location-exit"></v-icon>
          </template>
        </v-list-item>
      </template>
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
