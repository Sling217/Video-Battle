import express from "express"
import { VideoLink, MainChannelQueue } from "../../../models/index.js"
import { ValidationError } from "objection"
import cleanUserInput from "../../../services/cleanUserInput.js"
import serializeVideoQueue from "../../../services/serializeVideoQueue.js"
import getDuration from "../../../services/getVideoDuration.js"
import app from "../../../app.js"
import WebSocket from 'ws'

const videoLinksRouter = new express.Router()

videoLinksRouter.get("/", async (req, res) => {
    try {
        const videoFullUrl = await VideoLink.query().orderBy("updatedAt", 'desc').limit(1).first()
        const videoQueue = await MainChannelQueue.query().orderBy("updatedAt")
        const responseObject = {
            videoLink: videoFullUrl,
            videoQueue: serializeVideoQueue(videoQueue)
        }
        res.status(200).json(responseObject)
    } catch(err) {
        res.status(500).json( {errors: err.message } )
    }
})

videoLinksRouter.post("/", async (req, res) => {
    try {
        const { body } = req
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
        if (cleanedInput.changeToQueueMode === false) {
            const messageObject = {
                type: "videoLink",
                content: {
                    fullUrl: videoLink.fullUrl,
                    updatedAt: new Date()
                }
            }
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageObject))
                }
            })
        } else {
            const videoDuration = await getDuration(cleanedInput.videoLink)
            if (videoDuration === NaN) {
                newVideoLinkObject.duration = 100 * 60 * 60
            } else if (videoDuration instanceof Error) {
                return res.status(500)
            } else {
                newVideoLinkObject.duration = videoDuration
            }
            
            await MainChannelQueue.query().insert(newVideoLinkObject)
            const videoObjectArray =  await MainChannelQueue.query().orderBy("updatedAt")
            const videoQueue = serializeVideoQueue(videoObjectArray)
            const messageObject = {
                type: "videoQueue",
                content: videoQueue
            }
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageObject))
                }
            })
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