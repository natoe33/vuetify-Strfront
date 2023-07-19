<script setup lang="ts">
import { type IProfile, Stall } from "@/models";
import { type PropType, onMounted } from "vue";

const props = defineProps({
  merchant: {
    type: Stall,
  },
  profile: {
    type: Object as PropType<IProfile>,
  },
});

onMounted(() => {
  console.log(props.merchant);
  console.log(props.profile);
});
</script>
<template>
  <v-sheet rounded="lg">
    <v-card dense class="mx-auto">
      <!--class="d-flex flex-no-wrap justify-space-between"-->
      <div>
        <template v-if="props.profile?.picture">
          <v-avatar class="ma-3" size="125" rounded="0">
            <v-img :src="props.profile.picture"></v-img>
          </v-avatar>
        </template>
        <template v-if="props.merchant?.name">
          <v-card-title>{{ props.merchant?.name }}</v-card-title>
        </template>
        <template v-else-if="props.profile?.name || props.profile?.nip05">
          <v-card-title>{{
            props.profile.nip05 ? props.profile.nip05 : props.profile.name
          }}</v-card-title>
        </template>
        <template v-if="props.merchant?.description">
          <v-card-subtitle>{{ props.merchant.description }}</v-card-subtitle>
        </template>
        <template v-else-if="props.profile?.about">
          <v-card-subtitle>{{ props.profile.about }}</v-card-subtitle>
        </template>
        <v-card-actions>
          <template v-if="props.profile?.website !== undefined">
            <v-btn
              class="ms-2"
              variant="outlined"
              size="small"
              :href="
                props.profile.website.includes('http')
                  ? props.profile.website
                  : 'https://' + props.profile.website
              "
              target="_blank"
            >
              Seller's Website
            </v-btn>
          </template>
          <template v-if="props.merchant?.pubkey || props.profile?.nip05">
            <v-btn class="ms-2" variant="outlined" size="small"
              >Contact Seller</v-btn
            >
          </template>
        </v-card-actions>
      </div>
    </v-card>
  </v-sheet>
</template>
