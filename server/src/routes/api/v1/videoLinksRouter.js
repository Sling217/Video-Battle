import express from "express"
import { VideoLink } from "../../../models/index.js"
import { ValidationError } from "objection"
import cleanUserInput from "../../../services/cleanUserInput.js"

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
        const cleanedInput = cleanUserInput(body.videoLink)
        let userId 
        if (req.user) {
            userId = req.user.id
        } else {
            userId = 1
        }
        const newVideoLinkObject = {
            fullUrl: cleanedInput,
            userId: userId
        }
        const videoLink = await VideoLink.query().insertAndFetch(newVideoLinkObject)
        res.set({"Content-Type": "application/json"}).status(201).json({ videoLink: videoLink })
    } catch(err) {
        if (err instanceof ValidationError) {
            res.status(422).json({ errors: err.data })
        } else {
            res.status(500).json({ errors: err.message })
        }
    }
})

export default videoLinksRouter