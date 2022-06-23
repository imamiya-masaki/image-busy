const client_manifest = {
  "node_modules/nuxt/dist/app/entry.mjs": {
    "file": "entry-e6e3ef18.mjs",
    "src": "node_modules/nuxt/dist/app/entry.mjs",
    "isEntry": true,
    "dynamicImports": [
      "pages/TaskList.vue",
      "pages/[id].vue",
      "pages/index.vue"
    ],
    "css": [
      "entry.cca7acda.css"
    ]
  },
  "pages/TaskList.vue": {
    "file": "TaskList-0d883398.mjs",
    "src": "pages/TaskList.vue",
    "isDynamicEntry": true,
    "imports": [
      "node_modules/nuxt/dist/app/entry.mjs"
    ]
  },
  "pages/[id].vue": {
    "file": "_id_-2efe3d5c.mjs",
    "src": "pages/[id].vue",
    "isDynamicEntry": true,
    "imports": [
      "_DisplayImages-1887380f.mjs",
      "node_modules/nuxt/dist/app/entry.mjs"
    ]
  },
  "_DisplayImages-1887380f.mjs": {
    "file": "DisplayImages-1887380f.mjs",
    "imports": [
      "node_modules/nuxt/dist/app/entry.mjs"
    ]
  },
  "pages/index.vue": {
    "file": "index-3099539c.mjs",
    "src": "pages/index.vue",
    "isDynamicEntry": true,
    "imports": [
      "_DisplayImages-1887380f.mjs",
      "node_modules/nuxt/dist/app/entry.mjs"
    ]
  }
};

export { client_manifest as default };
//# sourceMappingURL=client.manifest.mjs.map
