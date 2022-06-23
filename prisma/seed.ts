
import { PrismaClient, Prisma, Post } from '@prisma/client';
import seed_json from './json/post.json' assert { type: "json" };

type ImagePost = Post & {
    images: string[]
  };
  
const prisma = new PrismaClient()
async function main() {
    const promises: Prisma.Prisma__PostClient<Post>[] = [];
    // @ts-ignore
    for (const seed of seed_json) {
        promises.push(
            prisma.post.create({
                data: {
                    title: seed.title,
                    image: { 
                        create: seed.images.map((s,i) => {
                            return {
                                id: i,
                                uri: s
                            }
                        })
                    }
                }
            })
        )
    } 
    return Promise.all(promises)
        .then(res => {
            console.log("inserted", res.length);
        })
        .catch(e => {
            console.error(e);
        }) 
}
main()