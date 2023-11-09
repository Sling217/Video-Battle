import express from "express"
import { MainChannelChat } from "../../../models/index.js"
import { ValidationError } from "objection"
import cleanUserInput from "../../../services/cleanUserInput.js"
import serializeChat from "../../../services/serializeChat.js"
import app from "../../../app.js"
import WebSocket from "ws"

const chatRouter = new express.Router()

chatRouter.post("/", async (req, res) => {
    try {
        const { body } = req 
        const cleanedInput = cleanUserInput(body)
        cleanedInput.userId = req.user.id
        const chatsContents = await MainChannelChat.query().insertAndFetch(cleanedInput).withGraphFetched('user')
        const wss = app.wss
        const messageObject = {
            type: "chat",
            username: chatsContents.user.username,
            content: chatsContents.content
        }
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageObject))
            }
        })
        res.status(201).json(messageObject)
    }
    catch (err) {
        if (err instanceof ValidationError) {
            res.status(422).json({ errors: err.data })
        } else {
            console.error(err.message)
            res.status(500).json({ errors: err.message })
        }
    }
})

chatRouter.get("/", async (req, res) => {
    try {
        const chatContents = await MainChannelChat.query().withGraphFetched('user')
        const responseObject = {
            chatContents: serializeChat(chatContents)
        }
        res.status(200).json(responseObject)
    } catch (err) {
        res.status(500).json({ errors: err.message })
    }
}) 

export default chatRouter