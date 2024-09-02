import { Request, Response, Router } from "express";
import { copyS3Folder } from "./aws";
import prisma from "../../prisma";
import jwt from 'jsonwebtoken'
import { User } from "@prisma/client";

export const initRouter = Router();

initRouter.post("/project", async (req: Request, res: Response) => {
    const { replId, language } = req.body;
    // let user:{username:string}|null=null;
    // try {
        // const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {username: string};
        // user=decoded;
    // } catch (error) {
    //     res.status(400).json({ error: 'Invalid token.' });
    // }
    // if(!user) return res.status(404).json({"message": "User not found"})
    const repl = await prisma.repl.findFirst({
        where: {
            name: replId
        }
    })
    if (repl) res.status(409).json({ error: 'Repl with the given ID already exists.' });

    await prisma.repl.create({
        data: {
            // userId: user.username,
            name: replId
        }
    })

    if (!replId) {
        res.status(400).send("Bad request");
        return;
    }
    console.log("Copying")
    await copyS3Folder(`base/${language}`, `code/${replId}`);

    res.status(201).send("Project created");
});
