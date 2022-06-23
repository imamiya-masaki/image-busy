globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import 'node-fetch-native/polyfill';
import { Server as Server$1 } from 'http';
import { Server } from 'https';
import destr from 'destr';
import { defineEventHandler, handleCacheHeaders, createEvent, eventHandler, createError, createApp, createRouter, lazyEventHandler } from 'h3';
import { createFetch as createFetch$1, Headers } from 'ohmyfetch';
import { createRouter as createRouter$1 } from 'radix3';
import { createCall, createFetch } from 'unenv/runtime/fetch/index';
import { createHooks } from 'hookable';
import { snakeCase } from 'scule';
import { hash } from 'ohash';
import { parseURL, withQuery, withLeadingSlash, withoutTrailingSlash } from 'ufo';
import { createStorage } from 'unstorage';
import { promises } from 'fs';
import { resolve, dirname } from 'pathe';
import { fileURLToPath } from 'url';

const _runtimeConfig = {"app":{"baseURL":"/","buildAssetsDir":"/_nuxt/","cdnURL":""},"nitro":{"routes":{},"envPrefix":"NUXT_"},"public":{}};
const ENV_PREFIX = "NITRO_";
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_";
const getEnv = (key) => {
  const envKey = snakeCase(key).toUpperCase();
  return destr(process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey]);
};
function isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function overrideConfig(obj, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey);
    if (isObject(obj[key])) {
      if (isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
      }
      overrideConfig(obj[key], subKey);
    } else {
      obj[key] = envValue ?? obj[key];
    }
  }
}
overrideConfig(_runtimeConfig);
const config = deepFreeze(_runtimeConfig);
const useRuntimeConfig = () => config;
function deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

const globalTiming = globalThis.__timing__ || {
  start: () => 0,
  end: () => 0,
  metrics: []
};
function timingMiddleware(_req, res, next) {
  const start = globalTiming.start();
  const _end = res.end;
  res.end = (data, encoding, callback) => {
    const metrics = [["Generate", globalTiming.end(start)], ...globalTiming.metrics];
    const serverTiming = metrics.map((m) => `-;dur=${m[1]};desc="${encodeURIComponent(m[0])}"`).join(", ");
    if (!res.headersSent) {
      res.setHeader("Server-Timing", serverTiming);
    }
    _end.call(res, data, encoding, callback);
  };
  next();
}

const _assets = {

};

function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

const storage = createStorage({});

const useStorage = () => storage;

storage.mount('/assets', assets$1);

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro";
  const name = opts.name || fn.name || "_";
  const integrity = hash([opts.integrity, fn, opts]);
  async function get(key, resolver) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    const entry = await useStorage().getItem(cacheKey) || {};
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl;
    const _resolve = async () => {
      if (!pending[key]) {
        entry.value = void 0;
        entry.integrity = void 0;
        entry.mtime = void 0;
        entry.expires = void 0;
        pending[key] = Promise.resolve(resolver());
      }
      entry.value = await pending[key];
      entry.mtime = Date.now();
      entry.integrity = integrity;
      delete pending[key];
      useStorage().setItem(cacheKey, entry).catch((error) => console.error("[nitro] [cache]", error));
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (opts.swr && entry.value) {
      _resolvePromise.catch(console.error);
      return Promise.resolve(entry);
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const key = (opts.getKey || getKey)(...args);
    const entry = await get(key, () => fn(...args));
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length ? hash(args, {}) : "";
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const _opts = {
    ...opts,
    getKey: (event) => {
      return decodeURI(parseURL(event.req.originalUrl || event.req.url).pathname).replace(/\/$/, "/index");
    },
    group: opts.group || "nitro/handlers",
    integrity: [
      opts.integrity,
      handler
    ]
  };
  const _cachedHandler = cachedFunction(async (incomingEvent) => {
    const reqProxy = cloneWithProxy(incomingEvent.req, { headers: {} });
    const resHeaders = {};
    const resProxy = cloneWithProxy(incomingEvent.res, {
      statusCode: 200,
      getHeader(name) {
        return resHeaders[name];
      },
      setHeader(name, value) {
        resHeaders[name] = value;
        return this;
      },
      getHeaderNames() {
        return Object.keys(resHeaders);
      },
      hasHeader(name) {
        return name in resHeaders;
      },
      removeHeader(name) {
        delete resHeaders[name];
      },
      getHeaders() {
        return resHeaders;
      }
    });
    const event = createEvent(reqProxy, resProxy);
    event.context = incomingEvent.context;
    const body = await handler(event);
    const headers = event.res.getHeaders();
    headers.Etag = `W/"${hash(body)}"`;
    headers["Last-Modified"] = new Date().toUTCString();
    const cacheControl = [];
    if (opts.swr) {
      if (opts.maxAge) {
        cacheControl.push(`s-maxage=${opts.maxAge}`);
      }
      if (opts.staleMaxAge) {
        cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
      } else {
        cacheControl.push("stale-while-revalidate");
      }
    } else if (opts.maxAge) {
      cacheControl.push(`max-age=${opts.maxAge}`);
    }
    if (cacheControl.length) {
      headers["Cache-Control"] = cacheControl.join(", ");
    }
    const cacheEntry = {
      code: event.res.statusCode,
      headers,
      body
    };
    return cacheEntry;
  }, _opts);
  return defineEventHandler(async (event) => {
    const response = await _cachedHandler(event);
    if (event.res.headersSent || event.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["Last-Modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.res.statusCode = response.code;
    for (const name in response.headers) {
      event.res.setHeader(name, response.headers[name]);
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const plugins = [
  
];

function hasReqHeader(req, header, includes) {
  const value = req.headers[header];
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  return hasReqHeader(event.req, "accept", "application/json") || hasReqHeader(event.req, "user-agent", "curl/") || hasReqHeader(event.req, "user-agent", "httpie/") || event.req.url?.endsWith(".json") || event.req.url?.includes("/api/");
}
function normalizeError(error) {
  const cwd = process.cwd();
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Route Not Found" : "Internal Server Error");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler = (async function errorhandler(_error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(_error);
  const errorObject = {
    url: event.req.url,
    statusCode,
    statusMessage,
    message,
    description: "",
    data: _error.data
  };
  event.res.statusCode = errorObject.statusCode;
  event.res.statusMessage = errorObject.statusMessage;
  if (errorObject.statusCode !== 404) {
    console.error("[nuxt] [request error]", errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (isJsonRequest(event)) {
    event.res.setHeader("Content-Type", "application/json");
    event.res.end(JSON.stringify(errorObject));
    return;
  }
  const url = withQuery("/__nuxt_error", errorObject);
  const html = await $fetch(url).catch((error) => {
    console.error("[nitro] Error while generating error response", error);
    return errorObject.statusMessage;
  });
  event.res.setHeader("Content-Type", "text/html;charset=UTF-8");
  event.res.end(html);
});

const assets = {
  "/index.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"164-BpHp5MQTh4z9cAsHacQWfc27gT4\"",
    "mtime": "2022-06-21T18:48:16.161Z",
    "path": "../public/index.html"
  },
  "/200/index.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"164-BpHp5MQTh4z9cAsHacQWfc27gT4\"",
    "mtime": "2022-06-21T18:48:16.162Z",
    "path": "../public/200/index.html"
  },
  "/404/index.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"164-BpHp5MQTh4z9cAsHacQWfc27gT4\"",
    "mtime": "2022-06-21T18:48:16.163Z",
    "path": "../public/404/index.html"
  },
  "/_nuxt/DisplayImages-1887380f.mjs": {
    "type": "application/javascript",
    "etag": "\"2d83-TUraCHz3F7OLR3Ryn/hN010nWPc\"",
    "mtime": "2022-06-21T18:48:14.775Z",
    "path": "../public/_nuxt/DisplayImages-1887380f.mjs"
  },
  "/_nuxt/TaskList-0d883398.mjs": {
    "type": "application/javascript",
    "etag": "\"96-v02mGU5AelNs1RilHt5uQ48oRCk\"",
    "mtime": "2022-06-21T18:48:14.774Z",
    "path": "../public/_nuxt/TaskList-0d883398.mjs"
  },
  "/_nuxt/_id_-2efe3d5c.mjs": {
    "type": "application/javascript",
    "etag": "\"383-qY9tI8OziPmcYftK0VrWghzBuGU\"",
    "mtime": "2022-06-21T18:48:14.772Z",
    "path": "../public/_nuxt/_id_-2efe3d5c.mjs"
  },
  "/_nuxt/entry-e6e3ef18.mjs": {
    "type": "application/javascript",
    "etag": "\"31f2a-ff+bnoI7j927ruwWi2BM61r+ZEU\"",
    "mtime": "2022-06-21T18:48:14.771Z",
    "path": "../public/_nuxt/entry-e6e3ef18.mjs"
  },
  "/_nuxt/entry.cca7acda.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5b43f-7+nn/BFVQwjk875tbDzRUPzMTGM\"",
    "mtime": "2022-06-21T18:48:14.770Z",
    "path": "../public/_nuxt/entry.cca7acda.css"
  },
  "/_nuxt/index-3099539c.mjs": {
    "type": "application/javascript",
    "etag": "\"2d7-riRap8gKeDcWx1lnvkOd7GIIPaU\"",
    "mtime": "2022-06-21T18:48:14.765Z",
    "path": "../public/_nuxt/index-3099539c.mjs"
  },
  "/_nuxt/manifest.json": {
    "type": "application/json",
    "etag": "\"450-eywnrsAd8AIErCnX44Pd8F8sJoU\"",
    "mtime": "2022-06-21T18:48:14.764Z",
    "path": "../public/_nuxt/manifest.json"
  },
  "/images/animal-1846462.jpg": {
    "type": "image/jpeg",
    "etag": "\"1e2efc-OWk+Me2+O+j/n5cekpaDc4PfdvQ\"",
    "mtime": "2022-06-21T18:48:14.862Z",
    "path": "../public/images/animal-1846462.jpg"
  },
  "/images/animal-7154059.jpg": {
    "type": "image/jpeg",
    "etag": "\"13eb65-LUOWdw09lJZhS0FmrrOtiSKecbc\"",
    "mtime": "2022-06-21T18:48:14.860Z",
    "path": "../public/images/animal-7154059.jpg"
  },
  "/images/archive-1850170.jpg": {
    "type": "image/jpeg",
    "etag": "\"19b13f-0wT06KTaBMGAhYoq1B4Y1dVvANw\"",
    "mtime": "2022-06-21T18:48:14.858Z",
    "path": "../public/images/archive-1850170.jpg"
  },
  "/images/arm-1284248.jpg": {
    "type": "image/jpeg",
    "etag": "\"18e062-uvaAJnO7CNNdKtlhzq4OWXKp8NM\"",
    "mtime": "2022-06-21T18:48:14.855Z",
    "path": "../public/images/arm-1284248.jpg"
  },
  "/images/audience-1866738.jpg": {
    "type": "image/jpeg",
    "etag": "\"3b726f-LSKlFsMkhx6wRfCZlSB0SJbPKJE\"",
    "mtime": "2022-06-21T18:48:14.853Z",
    "path": "../public/images/audience-1866738.jpg"
  },
  "/images/bear-7195751.jpg": {
    "type": "image/jpeg",
    "etag": "\"38adb0-UJo59PtWFJaQpNk4fc48FIHMQ1M\"",
    "mtime": "2022-06-21T18:48:14.848Z",
    "path": "../public/images/bear-7195751.jpg"
  },
  "/images/bird-6564285.jpg": {
    "type": "image/jpeg",
    "etag": "\"6567a-Wh2bg2+hkpB1lx8LyxiEuzil40A\"",
    "mtime": "2022-06-21T18:48:14.844Z",
    "path": "../public/images/bird-6564285.jpg"
  },
  "/images/bird-6781956.jpg": {
    "type": "image/jpeg",
    "etag": "\"1344cd-2CAR2lnboy2usFjfIOtSD6x/rDM\"",
    "mtime": "2022-06-21T18:48:14.843Z",
    "path": "../public/images/bird-6781956.jpg"
  },
  "/images/bird-7233900.jpg": {
    "type": "image/jpeg",
    "etag": "\"11d158-VVGdrTkDf0SidtKdrmxvHK8s7Lo\"",
    "mtime": "2022-06-21T18:48:14.842Z",
    "path": "../public/images/bird-7233900.jpg"
  },
  "/images/code-1839406.jpg": {
    "type": "image/jpeg",
    "etag": "\"fe5a8-whRhmd0qQvmo2vx7/HqrEs+JqSk\"",
    "mtime": "2022-06-21T18:48:14.840Z",
    "path": "../public/images/code-1839406.jpg"
  },
  "/images/ducklings-7242762.jpg": {
    "type": "image/jpeg",
    "etag": "\"8becf1-HkYtNmRgHox/Gq5uovqs2Zz1ABs\"",
    "mtime": "2022-06-21T18:48:14.838Z",
    "path": "../public/images/ducklings-7242762.jpg"
  },
  "/images/fox-7206538.jpg": {
    "type": "image/jpeg",
    "etag": "\"41a222-i2dHpJS8Omd4+GZWsCfc8FrUDtM\"",
    "mtime": "2022-06-21T18:48:14.826Z",
    "path": "../public/images/fox-7206538.jpg"
  },
  "/images/katz-2821316.jpg": {
    "type": "image/jpeg",
    "etag": "\"18a1ed-Tx4LodtLDctSySzP+E6tbQ8DgoI\"",
    "mtime": "2022-06-21T18:48:14.820Z",
    "path": "../public/images/katz-2821316.jpg"
  },
  "/images/key-5105878.jpg": {
    "type": "image/jpeg",
    "etag": "\"1d7130-MAN5hV4qVyL5OFfnvlzdR5nKhis\"",
    "mtime": "2022-06-21T18:48:14.814Z",
    "path": "../public/images/key-5105878.jpg"
  },
  "/images/otter-7228458.jpg": {
    "type": "image/jpeg",
    "etag": "\"244a34-Rc7sjKpqVpCjNXgSF1RFAI+Fvno\"",
    "mtime": "2022-06-21T18:48:14.811Z",
    "path": "../public/images/otter-7228458.jpg"
  },
  "/images/owl-3649048.jpg": {
    "type": "image/jpeg",
    "etag": "\"23bc38-GaNkMelxQKyDRSs5hJ2roPNDFkE\"",
    "mtime": "2022-06-21T18:48:14.808Z",
    "path": "../public/images/owl-3649048.jpg"
  },
  "/images/rabbit-4038246.jpg": {
    "type": "image/jpeg",
    "etag": "\"42faf9-BY3Q/OK+MLQSGajDqkLZCdLDS30\"",
    "mtime": "2022-06-21T18:48:14.797Z",
    "path": "../public/images/rabbit-4038246.jpg"
  },
  "/images/rain-7230604.jpg": {
    "type": "image/jpeg",
    "etag": "\"5ac2b-WhHDZuwEmcYNA2i+N7a0Vv9zW5Y\"",
    "mtime": "2022-06-21T18:48:14.792Z",
    "path": "../public/images/rain-7230604.jpg"
  },
  "/images/river-7242735.jpg": {
    "type": "image/jpeg",
    "etag": "\"50beac-l7w/13JnJ4IXKCcOThYTKB1PLq0\"",
    "mtime": "2022-06-21T18:48:14.790Z",
    "path": "../public/images/river-7242735.jpg"
  },
  "/images/sea-5382487.jpg": {
    "type": "image/jpeg",
    "etag": "\"1c988c-L5nfJn7oqaGUw0FDgx3r+Kqo8ZE\"",
    "mtime": "2022-06-21T18:48:14.783Z",
    "path": "../public/images/sea-5382487.jpg"
  },
  "/images/temple-7228340.jpg": {
    "type": "image/jpeg",
    "etag": "\"151be7-W5/FbYqpL7r/0HUcMXZWdXdZIO0\"",
    "mtime": "2022-06-21T18:48:14.780Z",
    "path": "../public/images/temple-7228340.jpg"
  }
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = ["/_nuxt"];

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return
  }
  for (const base of publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = ["HEAD", "GET"];
const _152570 = eventHandler(async (event) => {
  if (event.req.method && !METHODS.includes(event.req.method)) {
    return;
  }
  let id = decodeURIComponent(withLeadingSlash(withoutTrailingSlash(parseURL(event.req.url).pathname)));
  let asset;
  for (const _id of [id, id + "/index.html"]) {
    const _asset = getAsset(_id);
    if (_asset) {
      asset = _asset;
      id = _id;
      break;
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = event.req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    event.res.statusCode = 304;
    event.res.end("Not Modified (etag)");
    return;
  }
  const ifModifiedSinceH = event.req.headers["if-modified-since"];
  if (ifModifiedSinceH && asset.mtime) {
    if (new Date(ifModifiedSinceH) >= new Date(asset.mtime)) {
      event.res.statusCode = 304;
      event.res.end("Not Modified (mtime)");
      return;
    }
  }
  if (asset.type) {
    event.res.setHeader("Content-Type", asset.type);
  }
  if (asset.etag) {
    event.res.setHeader("ETag", asset.etag);
  }
  if (asset.mtime) {
    event.res.setHeader("Last-Modified", asset.mtime);
  }
  const contents = await readAsset(id);
  event.res.end(contents);
});

const _lazy_991298 = () => import('../index.mjs');
const _lazy_361930 = () => import('../image.mjs');
const _lazy_132004 = () => import('../index2.mjs');
const _lazy_406934 = () => import('../hello.mjs');
const _lazy_512187 = () => import('../handlers/renderer.mjs');

const handlers = [
  { route: '', handler: _152570, lazy: false, middleware: true, method: undefined },
  { route: '/api/post', handler: _lazy_991298, lazy: true, middleware: false, method: undefined },
  { route: '/api/post/image', handler: _lazy_361930, lazy: true, middleware: false, method: undefined },
  { route: '/api', handler: _lazy_132004, lazy: true, middleware: false, method: undefined },
  { route: '/api/hello', handler: _lazy_406934, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_512187, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_512187, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const h3App = createApp({
    debug: destr(false),
    onError: errorHandler
  });
  h3App.use(config.app.baseURL, timingMiddleware);
  const router = createRouter();
  const routerOptions = createRouter$1({ routes: config.nitro.routes });
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    const referenceRoute = h.route.replace(/:\w+|\*\*/g, "_");
    const routeOptions = routerOptions.lookup(referenceRoute) || {};
    if (routeOptions.swr) {
      handler = cachedEventHandler(handler, {
        group: "nitro/routes"
      });
    }
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(/\/+/g, "/");
      h3App.use(middlewareBase, handler);
    } else {
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router);
  const localCall = createCall(h3App.nodeHandler);
  const localFetch = createFetch(localCall, globalThis.fetch);
  const $fetch = createFetch$1({ fetch: localFetch, Headers, defaults: { baseURL: config.app.baseURL } });
  globalThis.$fetch = $fetch;
  const app = {
    hooks,
    h3App,
    localCall,
    localFetch
  };
  for (const plugin of plugins) {
    plugin(app);
  }
  return app;
}
const nitroApp = createNitroApp();

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, nitroApp.h3App.nodeHandler) : new Server$1(nitroApp.h3App.nodeHandler);
const port = destr(process.env.NITRO_PORT || process.env.PORT || 8888) || 3e3;
const hostname = process.env.NITRO_HOST || process.env.HOST || "0.0.0.0";
server.listen(port, hostname, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  console.log(`Listening on ${protocol}://${hostname}:${port}${useRuntimeConfig().app.baseURL}`);
});
{
  process.on("unhandledRejection", (err) => console.error("[nitro] [dev] [unhandledRejection] " + err));
  process.on("uncaughtException", (err) => console.error("[nitro] [dev] [uncaughtException] " + err));
}
const nodeServer = {};

export { nodeServer as n, useRuntimeConfig as u };
//# sourceMappingURL=node-server.mjs.map
