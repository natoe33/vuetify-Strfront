<script setup lang="ts">
import { defineAsyncComponent } from "vue";
const ProfileMain = defineAsyncComponent(
  () => import("@/components/ProfileMain.vue")
);
</script>
<template>
  <Suspense>
    <v-container>
      <ProfileMain />
    </v-container>
  </Suspense>
</template>
