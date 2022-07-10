import { prismaClient } from "../../../prisma/script"
import {Post, Image} from "@prisma/client";
import { useBody, useCookies, useQuery } from 'h3'

export default (req) => {
const id = useQuery(req).id;
const imgType = ".webp"
const findManyOption: {orderBy?: [{[key: string]: string}], where?: {[key: string]: number}, include?: {[key: string]: boolean} } = {
  orderBy:[{
    updatedAt: 'desc'
  }],
  include: { image: true }
}
if (id) {
  findManyOption.where = {id: Number(id)};
}
return prismaClient.post.findMany(findManyOption).then(res => {
  const output = res.map(r => {return {
    id: r.id,
    createdAt: r.createdAt,
    title: r.title,
    updatedAt: r.updatedAt,
    images: (r as Post & {image: Image[]}).image.map(r => r.uri + imgType)
  }});
  return output;
  }).catch(e => {
    throw e;
  })
}