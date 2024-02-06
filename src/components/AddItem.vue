<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store/app";
import { newStall, newShipping, TProduct } from "@/models";
import { useDisplay } from "vuetify";
import { NDKEvent } from "@nostr-dev-kit/ndk";

const appStore = useAppStore();
const { addItem, userStores, utils, nip07, nsec, nostrProvider } = storeToRefs(appStore);
const stores = ref([] as newStall[]);
const shippings = ref([] as newShipping[]);
const storeList = ref(new Set());
const images = ref([] as File[]);
const shipIds = ref([] as string[]);
const categories = ref([] as string[]);
const { xs, sm } = useDisplay();

//TODO: Add product tags

const prodProfile = ref({
  product_id: '',
  stall_id: '',
  name: '',
  description: '',
  images: [] as string[],
  currency: '',
  price: 0,
  quantity: 0,
  tags: [] as string[][],
  shipping: [] as newShipping[],
} as TProduct);

function addImage() {
  console.log(images.value)
  images.value.forEach(async image => {
    const url = await utils.value.uploadImage(image);
    console.log(url);
    if (url) prodProfile.value.images.push(url);
  });
}

async function createItem() {
  const product: TProduct = {
    product_id: utils.value.generateUUID().replaceAll('-',''),
    stall_id: prodProfile.value.stall_id,
    name: prodProfile.value.name,
    description: prodProfile.value.description,
    images: prodProfile.value.images,
    currency: stores.value.find(store => store.id === prodProfile.value.stall_id)?.currency || 'SAT',
    price: prodProfile.value.price,
    quantity: prodProfile.value.quantity,
    shipping: getShipping(),
    tags: processTags(),
  }
  const retEvent: NDKEvent = await appStore.nostrProvider.createProduct(product);
  console.log(retEvent);
}

function getShipping(): newShipping[] {
  const retShips = [] as newShipping[];
  shipIds.value.forEach(ship => {
    const shipping = shippings.value.find(ships => ships.id === ship);
    if (shipping) retShips.push(shipping);
  })
  return retShips;
}

function processTags(): string[][] {
  let tags: string[][] = [];
  tags.push(['d', prodProfile.value.product_id]);
  categories.value.forEach(tag => {
    tags.push(['t', tag])
  })
  return tags;
}

function loadShippingZones() {
  console.log('Store selected');
  console.log(prodProfile.value);
  const store = stores.value.find(store => store.id === prodProfile.value.stall_id);
  console.log(store);
  if (store){
    shippings.value = store.shipping;
  }
}

watch(addItem, (newval) => {
  if (newval) {
    stores.value = [] as newStall[];
    console.log(userStores.value);
    userStores.value.forEach((store) => {
      const stall: newStall = JSON.parse(store.content);
      // TODO: Deduplicate stores
      stores.value.push(stall);
    })
  }
})

watch(prodProfile, (newval, oldval) => {
  console.log('prodProfile updated', newval)
  shippings.value = newval.shipping;
  if (newval.stall_id !== oldval.stall_id) {
    shippings.value = newval.shipping;
  }
})

onMounted(async () => {
  // This is stupid to do it here, but it's the only place pinia is loaded
  if (nip07.value) {
    await nostrProvider.value.reloadNip07();
  }
  // console.log(nsec.value);
  if (nsec.value) {
    await nostrProvider.value.reloadPrivPubKey(nsec.value);
  }

  const tempStore = await appStore.getUserMerchantEvents;
  if (tempStore && tempStore.size > 0) {
    storeList.value = tempStore;
  }
});
</script>
<template>
  <v-dialog v-model="addItem">
    <v-card>
      <v-card-title>Add Item</v-card-title>
      <v-divider></v-divider>
      <v-form>
        <v-container>
          <v-row :no-gutters="xs ? true : false">
            <v-col :cols="xs ? 12 : sm ? 6 : 4">
              <v-select density="compact" v-model="prodProfile.stall_id" label="Create in store" :items="stores" item-title="name"
                item-value="id" @update:model-value="loadShippingZones()"/>
            </v-col>
            <v-col :cols="xs ? 12 : sm ? 6 : 4">
              <!-- <v-select v-model="prodProfile.shipping" label="Shipping zones" :items="shippings" item-title="name" item-value="id" multiple /> 
               -->
               <v-select density="compact" v-model="shipIds" label="Shipping zones" :items="shippings" :item-props="true" item-title="name" item-value="id" multiple /> 
            </v-col>
            <v-col :cols="xs ? 12 : sm ? 12 : 4">
              <v-text-field density="compact" v-model="prodProfile.name" label="Item Name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea v-model="prodProfile.description" label="Item Description" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-file-input density="compact" v-model="images" label="Add Pictures" accept="image/png, image/jpeg, image/bmp" multiple
                show-size counter chips prepend-icon="mdi-cloud-upload" @change="addImage" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field density="compact" v-model="prodProfile.price" label="Item Price" />
            </v-col>
            <v-col>
              <v-text-field density="compact" v-model="prodProfile.quantity" label="Number Available" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
            <v-combobox density="compact" v-model="categories" chips clearable multiple label="Enter your product categories">
              <template>
                <v-chip>
                </v-chip>
              </template>
            </v-combobox>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-card-actions>
        <v-btn @click="createItem">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
