<script setup lang="ts">
import { onMounted } from "vue";
import { defineAsyncComponent } from "vue";
import { useAppStore } from "@/store/app";
const ProfileMain = defineAsyncComponent(
  () => import("@/components/ProfileMain.vue")
);

const appStore = useAppStore();

onMounted(() => {
  console.log(appStore.nostrProvider.ndk);
})
</script>
<template>
  <Suspense>
    <v-container>
      <ProfileMain />
    </v-container>
  </Suspense>
</template>
