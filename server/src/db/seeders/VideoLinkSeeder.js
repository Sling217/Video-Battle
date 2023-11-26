import { VideoLink } from "../../models/index.js"

class VideoLinkSeeder {
    static async seed() {
        const videoLink = {
            fullUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
            title: "Me at the zoo",
            userId: null,
            anonymousSubmission: true
        }
        const inDB = await VideoLink.query().findOne(videoLink)
        if (!inDB) {
            await VideoLink.query().insert(videoLink)
        }
    }
}

export default VideoLinkSeeder