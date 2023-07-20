<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore, useNostrStore } from "@/store";
import { watch, ref } from "vue";

const appStore = useAppStore();
const { loggingIn } = storeToRefs(appStore);
const nostrStore = useNostrStore();
const { getNpub } = nostrStore;
const {npub} = storeToRefs(nostrStore);
const dialog = ref(false);
const key = ref("");
const lnpub = ref('');

function closeDialog() {
  loggingIn.value = !loggingIn.value;
}

function attemptNip07Login() {
  console.log("Attempting NIP-07 Login");
  appStore.nostrProvider.attemptLoginWithNip07();
}

function attemptKeyLogin() {
  console.log("Attempting login with key");
  appStore.nostrProvider.attemptLoginUsingPrivateOrPubKey(key.value);
}

watch(npub, (newval) => {
  
});

watch(loggingIn, (newVal) => {
  console.log(`LoginDialog watch triggered: ${newVal}, ${getNpub}`);
  if (newVal && getNpub === "") {
    dialog.value = newVal;
  } else {
    dialog.value = newVal;
  }
});
</script>
<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent width="1024">
      <v-card>
        <v-card-title>
          <span class="text-h5">Login</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row dense>
              <v-col cols="12">
                <v-card color="#385F73" theme="dark">
                  <v-card-title>Nip-07 Extension (Recommended) 🔐</v-card-title>
                  <v-card-subtitle>
                    Secure login requires a NIP-07 extension. Don't have a
                    NIP-07 extension? Refer to
                    <a
                      href="https://github.com/nostr-protocol/nips/blob/master/07.md#implementation"
                      target="_blank"
                      >this page</a
                    >
                  </v-card-subtitle>
                  <v-card-text>Not working yet</v-card-text>
                  <v-card-actions>
                    <v-btn variant="text" @click="attemptNip07Login">
                      Log In
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-col cols="12">
                <v-card color="#1F7087" theme="dark">
                  <v-card-title>Alternate Login 🗝️</v-card-title>
                  <v-card-subtitle
                    >Key starting with nsec(for read+write) or
                    npub(read-only)</v-card-subtitle
                  >
                  <v-row class="mx-1">
                    <v-col cols="10">
                      <v-text-field
                        label="nsec or npub"
                        type="password"
                        variant="underlined"
                        prepend-inner-icon="mdi-form-textbox-password"
                        v-model="key"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="1">
                      <v-btn variant="text" @click="attemptKeyLogin"
                        >Log In</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDialog">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
