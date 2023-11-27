import express from "express"
import { VideoLink, MainChannelQueue } from "../../../models/index.js"
import { ValidationError } from "objection"
import cleanUserInput from "../../../services/cleanUserInput.js"
import serializeVideoQueue from "../../../services/serializeVideoQueue.js"
import getVideoInfo from "../../../services/getVideoInfo.js"
import app from "../../../app.js"
import WebSocket from 'ws'

const videoLinksRouter = new express.Router()

videoLinksRouter.get("/", async (req, res) => {
    try {
        const videoLinkHistory = (await VideoLink.query().orderBy("updatedAt", 'desc').limit(5)).reverse()
        const videoQueue = await MainChannelQueue.query().orderBy("updatedAt")
        const responseObject = {
            videoLinkHistory: videoLinkHistory,
            videoQueue: serializeVideoQueue(videoQueue)
        }
        res.status(200).json(responseObject)
    } catch(err) {
        res.status(500).json({ errors: err.message })
    }
})

videoLinksRouter.post("/", async (req, res) => {
    try {
        const { body } = req
        const cleanedInput = cleanUserInput(body)
        const videoInfo = await getVideoInfo(cleanedInput.videoLink)
        if (videoInfo instanceof Error) {
            return res.status(500)
        }
        const newVideoLinkObject = {
            fullUrl: cleanedInput.videoLink,
            title: videoInfo.title
        }
        if (req.user) {
            newVideoLinkObject.userId = req.user.id
        } else {
            newVideoLinkObject.anonymousSubmission = true
        }
        const wss = app.wss
        console.log("cleanedInput: ", cleanedInput)
        if (cleanedInput.changeToQueueMode === false) {
            await VideoLink.query().insertAndFetch(newVideoLinkObject)
            const messageObject = {
                type: "videoLink",
                content: {
                    fullUrl: newVideoLinkObject.fullUrl,
                    updatedAt: new Date(),
                    title: videoInfo.title
                }
            }
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageObject))
                }
            })
        } else {
            if (videoInfo.duration === undefined) {
                newVideoLinkObject.duration = 100 * 60 * 60 // TODO fix for live videos
            } else {
                newVideoLinkObject.duration = videoInfo.duration
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
            queueMode: cleanedInput.changeToQueueMode
        }
        app.videoLinkProcessed.emit('videoLinkPostData', emitterObject)
        
        res.set({"Content-Type": "application/json"}).status(201).json({ message: "submission successful" })
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