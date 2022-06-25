<template>
  <div id="table" :style="{'display': !inspected ? 'hidden': 'visible'}"  ref="table">
    <div class="d-inline-flex" v-for="(posts, index) in tablePosts" :key="index">
      <div  v-for="(post, i) in posts" :key="i" >
        <ImageCard :title="post.title" :post-id="post.id" :images="post.images" @loaded="postCount" type="detail" />  
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
import DisplayImagesVue, {Data} from '@/mixin/DisplayImages.vue';
export default {
    data(): {title: string} {
    return {
      title: ''
    }
    }, 
    mixins: [DisplayImagesVue],
    mounted: function() { 
      this.$forceUpdate();
      const load = this.load as typeof DisplayImagesVue.methods.load;
      console.log('check', this.$route )
      load(`/api/post?id=${this.$route?.params?.id || '' }`, 'detail')
    },
}
</script>