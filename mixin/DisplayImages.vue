<script lang="ts">
import { Post } from "@prisma/client";
import { ComputedRef } from "vue";
import _ from "lodash";
import { isElement } from "@/utils/userGuard";
import { convertHTMLCollectionToElements } from "@/utils/elementUtil"
type Data = {
  posts: ImagePost[];
  inspected: boolean;
  tablePosts: ImagePost[][];
  loadPosted: boolean[];
};
type ImagePost = Post & {
  images: string[];
};
type LoadedData = {
  loaded: boolean;
  title?: string;
};
type Type = "root" | "detail";
export { Data, ImagePost, Type, LoadedData };
export default {
  data(): Data {
    return {
      posts: null,
      inspected: false,
      tablePosts: [[]],
      loadPosted: [],
    };
  },
  methods: {
    load: function (path: string, type: Type) {
      useFetch<Post[]>(path)
        .then((res) => {
          const { data: posts } = res;
          const promises = posts.value.map((p) =>
            useFetch<string[]>(`/api/post/image?postId=${p.id}`)
          );
          this.posts = posts;
          return Promise.all(promises).then((res2) => {
            for (const [i, { data: val }] of res2.entries()) {
              switch (type) {
                case "detail":
                  const PostInfo = { ...(this?.posts?.[0] || {}) };
                  const posts = [];
                  for (const [j, uri] of val.value.entries()) {
                    const addPost: ImagePost = {
                      id: j + 1,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      title: PostInfo.title,
                      images: [uri],
                    };
                    posts.push(addPost);
                    this.posts = posts;
                  }
                  break;
                case "root":
                  this.posts[i].images = val;
                  break;
              }
            }
            this.tablePosts = [[..._.cloneDeep(this.posts)]];
            this.loadPosted = [];
            this.inspected = false;
            return nextTick(() => {
              this.inspectRow();
              this.visibleOpacity();
            });
          });
        })
        .catch((err: Error) => {
          return err;
        });
    },
    getTitle: function (): string {
      return this.loadedData.title || "";
    },
    inspectRow: function () {
      this.$forceUpdate();
      this.inspected = false;
      const exampleRow: Element = isElement(
        this?.$refs?.table?.firstChild.nextElementSibling
      )
        ? this.$refs.table.firstChild.nextElementSibling
        : undefined;
      const children: Element[] = convertHTMLCollectionToElements(exampleRow.children)
      if (!children) {
        return;
      }
      let inspectPostCounter = 0;
      const insertTablePosts: ImagePost[][] = [];
      let tmpWidth: number[] = [];
      let c = 0;
      for (const element of children) {
        c++;
        const width = element.getBoundingClientRect().width;
        if (
          tmpWidth.length > 0 &&
          document.body.clientWidth <
            width + tmpWidth.reduce((sum, width) => sum + width, 0)
        ) {
          insertTablePosts.push(
            this.posts.slice(inspectPostCounter, inspectPostCounter + tmpWidth.length)
          );
          inspectPostCounter += tmpWidth.length;
          tmpWidth = [width];
        } else {
          tmpWidth.push(width);
        }
      }
      // 初めの画像たちは再レンダリングされないので、v-on:loadが取れない
      if (insertTablePosts.length > 0) {
        for (let i = 0; i < insertTablePosts[0].length; i++) {
          const post = insertTablePosts[0][i];
          this.loadPosted[post.id] = true;
        }
      }
      insertTablePosts.push(
        this.posts.slice(inspectPostCounter, inspectPostCounter + tmpWidth.length)
      );
      this.tablePosts = insertTablePosts;
    },
    reInspectRow: function () {
      if (!this.inspected) {
        return;
      }
      this.loadPosted = [];
      this.tablePosts = [[..._.cloneDeep(this.posts)]];
      this.inspected = false;
      nextTick(() => {
        this.inspectRow();
      });
    },
    postCount: function (postId: number) {
      this.loadPosted[postId] = true;
      let bool = true;
      for (const i of this.posts.map((p) => p.id)) {
        if (!this.loadPosted[i]) bool = false;
      }
      if (bool) {
        return nextTick(() => {
          this.inspected = true;
          this.visibleOpacity();
          window.addEventListener("resize", this.reInspectRow);
          window.addEventListener("scroll", this.visibleOpacity);
        });
      }
    },
    visibleOpacity: function () {
      const table: Element[] = convertHTMLCollectionToElements(this.$el.nextElementSibling.children)
      const handleEffect = function (el: Element){
        // 参考: https://qiita.com/shoheihei/items/58ddfae8fcd52caf310a
        const t_height = el.clientHeight;
        let t_classN = el.className
        const offsetY = el.getBoundingClientRect().top
        const screenHeight = window.outerHeight
        const t_position = offsetY - screenHeight
        if(-screenHeight<=(t_position+ t_height) && t_position<0) { // 画面内
          if(t_classN.indexOf('fadeIn') == -1) { // fadeInなし
            t_classN = t_classN + ' fadeIn'      // fadeInクラス追加
          }else if(t_classN.indexOf('fadeOut') !== -1) {
            t_classN = t_classN.replace(/fadeOut/g, 'fadeIn') // fadeInに置き換え
          }
        } else { // 画面外
          if(t_classN.indexOf('fadeOut') == -1) { // fadeoutなし
            t_classN = t_classN + ' fadeOut'
          }else if(t_classN.indexOf('fadeIn') !== -1) {
            t_classN = t_classN.replace(/fadeIn/g, 'fadeOut') 
          }
        }
        el.className = t_classN
      }
      if (table !== undefined) {
        for (const row of table) {
          // const elements
          const elements: Element[] = convertHTMLCollectionToElements(row.children)
          for (const c of elements) {
            handleEffect(c);
          }
        }
      }
    },
  },
};
</script>
