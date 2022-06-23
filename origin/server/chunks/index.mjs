import { p as prismaClient } from './script.mjs';
import { useQuery } from 'h3';
import '@prisma/client';

const index = (req) => {
  const id = useQuery(req).id;
  const findManyOption = {
    orderBy: [{
      updatedAt: "desc"
    }]
  };
  if (id) {
    findManyOption.where = { id: Number(id) };
  }
  return prismaClient.post.findMany(findManyOption).then((res) => {
    return res;
  }).catch((e) => {
    throw e;
  });
};

export { index as default };
//# sourceMappingURL=index.mjs.map
