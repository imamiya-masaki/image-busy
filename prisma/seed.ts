
import { PrismaClient, Prisma, Post } from '@prisma/client';
import seed_json from './json/post.json' assert { type: "json" };

type ImagePost = Post & {
    images: string[]
  };
  
const prisma = new PrismaClient()
async function main() {
    const promises: Prisma.Prisma__PostClient<Post>[] = [];
    // @ts-ignore
    const prismaInsertPostData = seed_json.map((seed,i) => {
        return {
            id: i + 1,
            title: seed.title
        }
    })
    // @ts-ignore
    promises.push(prisma.post.createMany({data: prismaInsertPostData}))
    const prismaInsertImageData = [];
    // @ts-ignore
    for (let i = 0; i < seed_json.length; i++) {
      prismaInsertImageData.push(...seed_json[i].images.map((image,j) => {
        return {
          postId: i + 1,
          id: j,
          uri: image
        }
      }))
    }
     // @ts-ignore
    promises.push(prisma.image.createMany({data: prismaInsertImageData}))
    return Promise.all(promises)
        .then(res => {
            console.log("inserted", res.length);
        })
        .catch(e => {
            console.error(e);
        }) 
}
main()