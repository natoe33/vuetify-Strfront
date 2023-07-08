<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import { Product } from "@/models/Product";
// import { NostrProviderService } from "@/utils/nostrProvider";

const appStore = useAppStore()
const { getProduct } = storeToRefs(appStore)
// const nostrProvider: NostrProviderService = inject<NostrProviderService>(
//   "nostr",
//   new NostrProviderService()
// );

const props = defineProps({
  id: {
    type: String,
    required: true,
  }
});

const product = ref(Product);

onMounted(() => {
  // product = nostrProvider.fetchProductEvent(props.id)
  product.value = getProduct.value(props.id)
});
</script>
<template>
  <p>{{ props.id }}</p>
</template>
