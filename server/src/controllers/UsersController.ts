import { Request, Response, NextFunction } from "express"
import Joi from "joi"
import bcrypt from "bcrypt"
import UsersService from "../services/UsersService"
import { sign } from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const jsonSecretKey: string = process.env.JSON_SECRET ?? ""

const registerUserScheme = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
})

const loginUserSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, email, password } = req.body

        const { error } = registerUserScheme.validate(req.body)
        if (error) {
            return res.json({
                status: false,
                message: "error." + error.details[0].context?.label
            })
        }

        if (await UsersService.getUser({ username: username }))
            return res.json({ message: "validation.usedusername", status: false })

        if (await UsersService.getUser({ email: email }))
            return res.json({ message: "validation.usedemail", status: false })

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await UsersService.createUser(username, email, hashedPassword)

        const { id } = user;

        return res.status(201).json({
            status: true,
            user: {
                id,
                username,
                email
            }
        })
    } catch (err) {
        next(err)
    }
}

async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, password } = req.body

        const { error } = loginUserSchema.validate(req.body);

        if (error) {
            return res.json({
                status: false,
                message: "error." + error.details[0].context?.label
            });
        }

        const user = await UsersService.getUser({ username: username })

        if (!user)
            return res.json({ message: "validation.incorrect", status: false })

        const passwordCheck = await bcrypt.compare(password, user.password)
        if (!passwordCheck)
            return res.json({ message: "validation.incorrect", status: false })

        if (jsonSecretKey == "")
            throw new Error("couldn't generate access token")

        const accessToken = sign({
            id: user.id,
            email: user.email
        }, jsonSecretKey, {
            expiresIn: 86400
        })

        return res.status(200).json({
            status: true,
            accessToken
        })
    } catch (err) {
        next(err)
    }
}

export default { register, login }
