import { prismaClient } from "../../../prisma/script"

import { useBody, useCookies, useQuery } from 'h3'

export default (req) => {
const id = useQuery(req).id;
const findManyOption: {orderBy?: [{[key: string]: string}], where?: {[key: string]: number}} = {
  orderBy:[{
    updatedAt: 'desc'
  }]
}
if (id) {
  findManyOption.where = {id: Number(id)};
}
return prismaClient.post.findMany(findManyOption).then(res => {
    return res;
  }).catch(e => {
    throw e;
  })
}