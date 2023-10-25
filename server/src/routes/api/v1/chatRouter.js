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
        const chatsContents = await MainChannelChat.query().insertAndFetch(cleanedInput)
    }
    catch (err){
    }
})

export default chatRouter