<template>
  <div id="table" :style="{'display': !inspected ? 'hidden': 'visible' }"  ref="table">
    <div class="d-inline-flex" v-for="(posts, index) in tablePosts" :key="index">
      <div  v-for="(post, i) in posts" :key="i" >
        <ImageCard :title="post.title" :post-id="post.id" :images="post.images" @loaded="postCount" type="root" />
      </div>
    </div>
  </div>
  <template/>
</template>

<script lang="ts">
import {  Post } from '@prisma/client';
import { ComputedRef } from 'vue';
import _ from 'lodash';
import {isElement } from '@/utils/userGuard';
import DisplayImagesVue from '@/mixin/DisplayImages.vue';
type Data = {
  posts: ImagePost[],
  inspected: boolean,
  tablePosts: ImagePost[][],
  loadPosted: boolean[]
}
type ImagePost = Post & {
  images: string[]
};

export default {
    mixins: [DisplayImagesVue],
    mounted: function() {
      const load = this.load as typeof DisplayImagesVue.methods.load;
      load(`/api/post`, 'root');
    }
}
</script>