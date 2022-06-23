import { p as prismaClient } from './script.mjs';
import { defineEventHandler } from 'h3';
import '@prisma/client';

const index = defineEventHandler((event) => {
  prismaClient.post.findMany({}).then((res) => {
    return res;
  }).catch((e) => {
    throw e;
  });
});

export { index as default };
//# sourceMappingURL=index2.mjs.map
