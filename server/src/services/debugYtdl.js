import ytdl from 'youtube-dl-exec'
import { VideoInfo } from '../models/index.js'

const debugYtdl = async() => {
    const fullUrl = "https://www.youtube.com/watch?v=gCNeDWCI0vo"
        try {
            const videoInfoRaw = await ytdl.exec(fullUrl, { j: true })
            const videoInfoJson = JSON.parse(videoInfoRaw.stdout)
            const newVideoInfo = {
                fullUrl: fullUrl,
                duration: videoInfoJson.duration,
                title: videoInfoJson.title
            }
            console.log("The video Info Object:", videoInfoJson)
            return videoInfoJson
        } catch (err) {
            console.error("Error in ytdl: ", err)
            return err
        }
}

export default debugYtdl