import express from "express"
import { VideoLink, MainChannelQueue } from "../../../models/index.js"
import { ValidationError } from "objection"
import cleanUserInput from "../../../services/cleanUserInput.js"
import app from "../../../app.js"
import WebSocket from 'ws'

const videoLinksRouter = new express.Router()

videoLinksRouter.get("/", async (req, res) => {
    try {
        const videoFullUrl = await VideoLink.query().orderBy("updatedAt", 'desc').limit(1).first()
        res.status(200).json({ videoLink: videoFullUrl })
    } catch(err) {
        res.status(500).json( {errors: err.message } )
    }
})

videoLinksRouter.post("/", async (req, res) => {
    try {
        const { body } = req
        console.log(body)
        const cleanedInput = cleanUserInput(body)
        const newVideoLinkObject = {
            fullUrl: cleanedInput.videoLink,
        }
        if (req.user) {
            newVideoLinkObject.userId = req.user.id
        } else {
            newVideoLinkObject.anonymousSubmission = true
        }
        const videoLink = await VideoLink.query().insertAndFetch(newVideoLinkObject)
        const wss = app.wss
        if (cleanedInput.queueMode === false) {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    const messageObject = {
                        type: "videoLink",
                        content: videoLink.fullUrl
                    }
                    client.send(JSON.stringify(messageObject))
                }
            })
        } else {
            await MainChannelQueue.query().insert(newVideoLinkObject)
            const videoLinkQueue =  await MainChannelQueue.query().orderBy("updatedAt")
            console.log("what does videolInkQueue looks like", videoLinkQueue)
        }
        
        const emitterObject = {
            timeSeekReceived: new Date(),
            queueMode: cleanedInput.queueMode
        }
        app.videoLinkProcessed.emit('videoLinkPostData', emitterObject)
        
        res.set({"Content-Type": "application/json"}).status(201).json({ videoLink: videoLink })
    } catch(err) {
        if (err instanceof ValidationError) {
            res.status(422).json({ errors: err.data })
        } else {
            console.error(err.message)
            res.status(500).json({ errors: err.message })
        }
    }
})

export default videoLinksRouter