<script setup lang="ts">
import { NDKUser } from "@/ndk";
import { useNostrStore } from "@/store";
import { onMounted, ref } from "vue";

const nostrStore = useNostrStore();
const { getUser } = nostrStore;
const _user = ref(new NDKUser({}));

onMounted(() => {
_user.value = getUser;
})
</script>
<template>
    <Suspense>
        <v-container>
            
        </v-container>
    </Suspense>
</template>