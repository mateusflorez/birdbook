import { Router } from "express"
import UsersController from "../controllers/UsersController"

const userRoutes = Router()

userRoutes.post("/user", UsersController.register)
userRoutes.post("/login", UsersController.login)

export { userRoutes }
