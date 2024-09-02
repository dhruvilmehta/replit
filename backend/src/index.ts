import express, { Request, Response } from "express";
import dotenv from "dotenv"
import cors from "cors";
import { initRouter } from "./init-service/src";
import { serviceRouter } from "./orchestrator-simple/src";
import prisma from "./prisma";
import bcrypt, { hash } from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express();
app.use(express.json());
app.use(cors())

app.use("/init", initRouter)
app.use("/service", serviceRouter)

app.get("/getRepls", async (req: Request, res: Response) => {
    // const token = req.headers.authorization;
    // const existingUser= await prisma.user.findFirst({
    //     where:{
    //         token: token
    //     }
    // })
    // if(!existingUser) return res.status(401).send("Invalid token")
    const repls = await prisma.repl.findMany({
        select: {
            name: true
        }
    })

    const replNames = repls.map(repl => repl.name);

    return res.status(201).send(replNames)
})


app.post("/signup", async (req: Request, res: Response) => {
    const { username, password } = req.body
    const existingUser = await prisma.user.findFirst({
        where: {
            name: username
        }
    })

    if (existingUser) return res.status(409).json({ error: 'User already exists' })
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const token = jwt.sign({ username: username }, process.env.JWT_SECRET || "");
    await prisma.user.create({
        data: {
            name: username,
            password: hashedPassword,
            token: token
        }
    })

    return res.status(201).json({ token: token, message: "Registered successfully" })
})

app.post("/signin", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({
        where: {
            name: username,
        }
    })
    console.log(username, password, user)
    if (!user) return res.status(404).json({ "message": "User not found" })

    const isTrue = await bcrypt.compare(password, user.password)
    if (!isTrue) return res.status(401).json({ "message": "Wrong password" })
    return res.status(201).json({ "token": user.token, "username": user.name })
})

app.listen(process.env.PORT || 3001, () => {
    console.log("Started listening on port ", process.env.PORT)
})