import { FastifyInstance } from "fastify";
import ShortUniqueId from "short-unique-id";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { userRoutes } from "./user";

export async function poolRoutes(fastify: FastifyInstance) {
    fastify.get('/pools/count', async () => {
        const count = await prisma.pool.count()

        return { count }
    })

    fastify.post('/pools', async (request, reply) => {
        const generator = new ShortUniqueId({ length: 6 })
        const PoolRequestBody = z.object({
            title: z.string()
        })

        const code = String(generator()).toUpperCase();
        const { title } = PoolRequestBody.parse(request.body);

        try {
            await request.jwtVerify()

            await prisma.pool.create({
                data: {
                    code,
                    title,
                    ownerId: request.user.sub,

                    participants: {
                        create: {
                            userId: request.user.sub
                        }
                    }
                }
            })
        } catch {
            await prisma.pool.create({
                data: {
                    code,
                    title
                }
            })
        }

        return reply.status(201).send({ code })
    })
}