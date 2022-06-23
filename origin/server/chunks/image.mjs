import { p as prismaClient } from './script.mjs';
import { useQuery } from 'h3';
import '@prisma/client';

const image = (req) => {
  const imgType = ".jpg";
  const postId = useQuery(req).postId;
  return prismaClient.image.findMany({
    where: {
      postId: Number(postId)
    },
    orderBy: [{
      id: "asc"
    }]
  }).then((res) => {
    const output = res.map((r) => r.uri + imgType);
    return output;
  }).catch((e) => {
    return e;
  });
};

export { image as default };
//# sourceMappingURL=image.mjs.map
