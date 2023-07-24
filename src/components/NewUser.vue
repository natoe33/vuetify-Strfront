<script setup lang="ts">
import { ref, type PropType } from "vue";
import { useClipboard } from "@vueuse/core";
import { useNostrStore, useAppStore } from "@/store";
import { NewCredential } from "@/utils/login";
import { storeToRefs } from "pinia";

const props = defineProps({
    newUser: {
        type: Object as PropType<NewCredential>,
        required: true
    }
})

const nostrStore = useNostrStore();
const appStore = useAppStore();

const { loggingIn } = storeToRefs(appStore);

const { copy } = useClipboard();
const pubkey = ref(props.newUser.pubkey);
const pubkeyicon = ref("mdi-content-copy");
const privkey = ref(props.newUser.privateKey);
const privkeyicon = ref("mdi-content-copy");

function copyPubKey(key: string) {
    copy(key);
    pubkeyicon.value = 'mdi-check';
}

function copyPrivKey(key: string) {
    copy(key);
    privkeyicon.value = 'mdi-check';
}

function newUserLogin() {
    nostrStore.nostrProvider.attemptLoginUsingPrivateOrPubKey(privkeyicon.value);
    loggingIn.value = !loggingIn.value;
}

function closeDialog() {
    loggingIn.value = !loggingIn.value;
}

</script>
<template>
  <v-card>
    <v-card-title>New Account</v-card-title>
    <v-card-subtitle>Back up your keys somewhere safe. If you lose your private key, you lose access to your account. There is no way to reset your private key.</v-card-subtitle>
    <v-card-text>
      <v-text-field
        label="Public Key"
        v-model="pubkey"
        :append-inner-icon="pubkeyicon"
        readonly
        @click:append-inner="copyPubKey(pubkey)"
      ></v-text-field>
      <v-text-field
        label="Private Key"
        v-model="privkey"
        :append-inner-icon="privkeyicon"
        readonly
        @click:append-inner="copyPrivKey(privkey)"
      ></v-text-field>
    </v-card-text>
    <v-card-actions>
        <v-btn color="blue-darken-1" variant="text" @click="closeDialog">Close</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="newUserLogin">I've Backed Up My Keys</v-btn>
    </v-card-actions>
  </v-card>
</template>
