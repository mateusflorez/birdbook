import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function createUser(username: string, email: string, password: string) {
    return await prisma.user.create({
        data: {
            username,
            email,
            password
        }
    })
}

async function getUser(data: object) {
    return await prisma.user.findUnique({ where: data })
}

export default { createUser, getUser }
