import express from "express"
import { MainChannelChat } from "../../../models/index.js"
import { ValidationError } from "objection"
import cleanUserInput from "../../../services/cleanUserInput.js"
import app from "../../../app.js"
import WebSocket from "ws"

const chatRouter = new express.Router()

chatRouter.post("/", async (req, res) => {
    try {
        const { body } = req 
        const cleanedInput = cleanUserInput(body)
        cleanedInput.username = req.user.username
        cleanedInput.userId = req.user.id
        const chatsContents = await MainChannelChat.query().insertAndFetch(cleanedInput)
        console.log("chatsContent is: ", chatsContents)
        res.status(201)
    }
    catch (err) {
        res.status(500).json({ errors: err.message })
    }
})

chatRouter.get("/", async (req, res) => {
    try {
        const chatContents = await MainChannelChat.query()
        const responseObject = {
            chatContents: chatContents
        }
        res.status(200).json(responseObject)
    } catch (err) {
        res.status(500).json({ errors: err.message }) 
    }
}) 

export default chatRouter