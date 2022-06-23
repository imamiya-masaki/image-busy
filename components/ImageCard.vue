<script lang="ts" setup>

type Props = {
  postId: Number;
  title: string;
  images: string[];
  type: Type;
};

type Type = 'root' | 'detail';

const { postId, title, images, type } = defineProps<Props>();
const emit = defineEmits<(e: "loaded", value: Number) => void>();
let overed = ref(false);
const mouseover = () => overed.value = true;
const mouseout = () => overed.value = false;
const goto = () => {
  if (type == 'root') {
    location.href = `${location.origin}/${postId}`
  }
}
const displayText = () => {
  if (type == 'root') {
    return title;
  } else {
    return postId;
  }
}
</script>

<template>
  <div class="card" style="height: 20rem; width: 20rem;" v-on:mouseover="mouseover" v-on:mouseout="mouseout" :class="{'overed': overed}" @click="goto">
    <b-button class="images-count__right" variant="primary" v-if="type==='root'">画像数: <b-badge variant="light">{{images.length}}</b-badge>
    </b-button>
    <img class="card-img-top img-size" alt="..." :src="`/images/${images?.[0] || ''}`" loading="eager" v-on:load="() => emit('loaded', postId)">
    <div class="card-body">
      <h6 class="card-title">{{ displayText() }}</h6>
    </div>
  </div>
</template>

<style scpoed>
.img-size {
  overflow:auto;
  width:100%;
  height: 100%;
}
.overed {
  border-color: red;
  border-width: 0.25rem;
  transition: 0.5s ;
}
.images-count__right {
    position: absolute;
    right: 0;
}
</style>