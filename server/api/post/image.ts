import { prismaClient } from "../../../prisma/script"

import { useQuery } from 'h3'


export default (req) => {
    const imgType = ".jpg"
    const postId = useQuery(req).postId;
    return prismaClient.image.findMany({
        where: {
            postId: Number(postId)
        },
      orderBy:[{
            id: 'asc'
      }]
      }).then(res => {
            const output =  res.map(r => r.uri + imgType);
            return output;
      }).catch(e => {
            return e;
      })
}