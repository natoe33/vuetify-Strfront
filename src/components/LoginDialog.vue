<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store/app";
import { watch, ref, onMounted, defineAsyncComponent } from "vue";

const NewUser = defineAsyncComponent(() => import("@/components/NewUser.vue"));

const appStore = useAppStore();
const { loggingIn } = storeToRefs(appStore);
const { getNpub } = appStore;

const dialog = ref(false);
const key = ref("");
const token = ref("");
const winnostr = ref(false);
const step = ref(1);
const pubkey = ref("");
const privkey = ref("");
const newUser = ref();

function closeDialog() {
  loggingIn.value = !loggingIn.value;
}

function attemptNip07Login() {
  console.log("Attempting NIP-07 Login");
  appStore.nostrProvider.attemptLoginWithNip07();
}

function attemptNip46Login() {
  console.log("Attempting NIP-46 Login");
  appStore.nostrProvider.attemptLoginWithNip46(token.value);
}

async function attemptKeyLogin() {
  console.log("Attempting login with key");
  await appStore.nostrProvider.attemptLoginUsingPrivateOrPubKey(key.value);
  key.value = '';
}

function attemptGenerateNewCredential() {
  // const newUser = appStore.nostrProvider.createNewNostrUser();
  newUser.value = appStore.nostrProvider.createNewNostrUser();
  console.log(newUser.value);
  pubkey.value = newUser.value.pubkey;
  privkey.value = newUser.value.privateKey;
  step.value++;
}

watch(loggingIn, (newVal) => {
  console.log(`LoginDialog watch triggered: ${newVal}, ${getNpub}`);
  dialog.value = newVal;
  // if (newVal && getNpub === "") {
  //   dialog.value = newVal;
  // } else {
  //   dialog.value = newVal;
  // }
});

onMounted(() => {
  if (window.nostr) {
    winnostr.value = true;
  }
});
</script>
<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" scrollable persistent width="1024">
      <v-window v-model="step">
        <v-window-item :value="1">
          <v-card>
            <v-card-title>
              <span class="text-h5">Login</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row dense>
                  <v-col cols="12">
                    <v-card color="accent">
                      <v-card-title>New to Nostr</v-card-title>
                      <v-card-subtitle>Create a new Nostr account</v-card-subtitle>
                      <v-card-actions>
                        <v-btn variant="text" @click="attemptGenerateNewCredential">Create Account</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="12">
                    <v-card color="#385F73" theme="dark">
                      <v-card-title>Nip-07 Extension (Recommended) 🔐</v-card-title>
                      <v-card-subtitle>
                        Secure login requires a NIP-07 extension. Don't have a
                        NIP-07 extension? Refer to
                        <a href="https://github.com/nostr-protocol/nips/blob/master/07.md#implementation"
                          target="_blank">this page</a>
                      </v-card-subtitle>
                      <v-card-actions>
                        <template v-if="winnostr">
                          <v-btn variant="text" @click="attemptNip07Login">
                            Log In
                          </v-btn>
                        </template>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                  <!-- <v-col cols="12">
                    <v-card color="#385F73" theme="dark">
                      <v-card-title>NIP-46 Token (e.g. nsecBunker) 🔐</v-card-title>
                      <v-card-subtitle>Log in using a NIP-46 token. Refer to <a
                          href="https://github.com/nostr-protocol/nips/blob/master/46.md#implementation"
                          target="_blank">this page</a></v-card-subtitle>
                      <v-row class="mx-1">
                        <v-col cols="10">
                          <v-text-field label="nsecBunker token" type="text" variant="underlined"
                            prepend-inner-icon="mdi-form-textbox-password" v-model="token"></v-text-field>
                        </v-col>
                        <v-col cols="1">
                          <v-btn variant="text" @click="attemptNip46Login">Log In</v-btn>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col> -->
                  <v-col cols="12">
                    <v-card color="#1F7087" theme="dark">
                      <v-card-title>Alternate Login 🗝️</v-card-title>
                      <v-card-subtitle>Key starting with nsec(for read+write) or
                        npub(read-only)</v-card-subtitle>
                      <v-row class="mx-1">
                        <v-col cols="10">
                          <v-text-field label="nsec or npub" type="password" variant="underlined"
                            prepend-inner-icon="mdi-form-textbox-password" v-model="key"></v-text-field>
                        </v-col>
                        <v-col cols="1">
                          <v-btn variant="text" @click="attemptKeyLogin">Log In</v-btn>
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
        </v-window-item>
        <v-window-item :value="2">
          <NewUser :newUser="newUser" />
        </v-window-item>
      </v-window>
    </v-dialog>
  </v-row>
</template>
