<script setup lang="ts">
import { NDKUser } from "@/ndk";
import { useNostrStore } from "@/store";
import { onMounted, ref, defineAsyncComponent } from "vue";
const ProfileMain = defineAsyncComponent(
  () => import("@/components/ProfileMain.vue")
);
const OpenStore = defineAsyncComponent(() => import('@/components/OpenStore.vue'))

const nostrStore = useNostrStore();
const { getUser } = nostrStore;
const _user = ref(new NDKUser({}));

onMounted(() => {
  _user.value = getUser;
});
</script>
<template>
  <Suspense>
    <v-container>
      <ProfileMain />
      <OpenStore />
    </v-container>
  </Suspense>
</template>
