<script setup lang="ts">
import { NDKUser } from "@/ndk";
import { useNostrStore } from "@/store";
import { onMounted, ref, defineAsyncComponent } from "vue";
const ProfileMain = defineAsyncComponent(
  () => import("@/components/ProfileMain.vue")
);

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
    </v-container>
  </Suspense>
</template>
