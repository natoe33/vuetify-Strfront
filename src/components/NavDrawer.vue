<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/store/app";
import { storeToRefs } from "pinia";

const appStore = useAppStore();
const { getSortedTags, setTagandLoading, setLoggedIn } =
  appStore;
const { drawer, loggingIn, loggedIn, user, nip07, nsec, npub } =
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
  if (nip07.value) nip07.value = false;
  user.value = undefined;
  nsec.value = npub.value = '';
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

watch(user, (newval) => {
  // TODO: Update ndk here instead of MainView
  console.log(newval);
  if (newval && appStore.getUser?.profile?.image){
    image.value = appStore.getUser.profile.image
  } else {
    image.value = '';
  }
});

watch(group, () => {
  drawer.value = false;
});

onMounted(async () => {
  console.log(appStore.getUser?.profile?.image);
  console.log(user.value?.profile?.image);
  if (appStore.getUser?.profile?.image){
    console.log(appStore.getUser.profile.image);
    image.value = appStore.getUser.profile.image
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
            <template v-if="!user || !user?.profile?.image">
              <v-icon icon="mdi-account-circle"></v-icon>
            </template>
            <template v-else>
              <v-img :src="image" :alt="user.profile?.nip05"></v-img>
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
