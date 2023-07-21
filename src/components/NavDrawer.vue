<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppStore, useNostrStore } from "@/store";
import { storeToRefs } from "pinia";
import { NDKUser } from "@/ndk";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
const appStore = useAppStore();
const nostrStore = useNostrStore();
const { getSortedTags, setTagandLoading } = appStore;
const { drawer, loggingIn, loggedIn } = storeToRefs(appStore);
const { getNpub, setNpub, getUser, setUser } = nostrStore;
const { npub, user } = storeToRefs(nostrStore);

const router = useRouter();
const group = ref(null);
const lnpub = ref("");
const image = ref("");

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

function goToProfile() {
  router.push({ name: "profile" });
}

watch(npub, (newval) => {
  lnpub.value = newval;
});

watch(user, (newval) => {
  if (newval.profile?.image) image.value = newval.profile?.image;
});

watch(group, () => {
  drawer.value = false;
});

onMounted(() => {
  if (user.value.profile?.image) image.value = user.value.profile?.image;
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
            <template v-if="!user.profile?.image || user.profile?.image === ''">
              <v-icon icon="mdi-account-circle"></v-icon>
            </template>
            <template v-else>
              <v-img :src="image" :alt="user.profile?.nip05"></v-img>
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
