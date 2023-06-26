import { NextFunction, Request, Response } from "express"
import dotenv from "dotenv"
import { JwtPayload, decode, verify } from "jsonwebtoken"

dotenv.config()

const jsonSecretKey: string = process.env.JSON_SECRET ?? ""

interface CustomRequest extends Request {
    userId?: string;
    userEmail?: string;
}

module.exports = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization ?? ""

    if (!token) {
        return res.status(401).send('Missing access token')
    }

    const [, accessToken] = token.split(" ")

    if (!accessToken) {
        return res.status(401).send('Invalid access token')
    }

    try {
        if (jsonSecretKey == "")
            return res.status(500).send("couldn't generate access token")

        verify(accessToken, jsonSecretKey)

        let decodedToken: string | JwtPayload | null
        
        decodedToken = decode(accessToken);

        if (!decodedToken || typeof decodedToken === "string") {
            throw new Error("Invalid token payload");
        }

        const { id, email } = decodedToken;

        req.userId = id
        req.userEmail = email

        return next()
    } catch (error) {
        return res.status(401).send("Unauthorized user")
    }
}
