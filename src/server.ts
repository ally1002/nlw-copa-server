import Fastify from 'fastify'
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import ShortUniqueId from 'short-unique-id'

const prisma = new PrismaClient({
    log: ['query'],
})

async function bootstrap() {
    const fastify = Fastify({ logger: true })

    await fastify.register(cors, {
        origin: true
    })

    fastify.get('/pools/count', async () => {
        const count = await prisma.pool.count()

        return { count }
    })

    fastify.get('/guesses/count', async () => {
        const count = await prisma.guess.count()

        return { count }
    })

    fastify.get('/users/count', async () => {
        const count = await prisma.user.count()

        return { count }
    })

    fastify.post('/pools', async (request, reply) => {
        const generator = new ShortUniqueId({ length: 6 })
        const PoolRequestBody = z.object({
            title: z.string()
        })

        const code = String(generator()).toUpperCase();
        const { title } = PoolRequestBody.parse(request.body);

        await prisma.pool.create({
            data: {
                code,
                title
            }
        })

        return reply.status(201).send({ code })
    })

    await fastify.listen({ port: 3333 })
}

bootstrap();