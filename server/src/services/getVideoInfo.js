import ytdl from 'youtube-dl-exec'
import { VideoInfo } from '../models/index.js'

const getVideoInfo = async(fullUrl) => {
    const videoInfoCached = await VideoInfo.query().findOne('fullUrl', fullUrl)
    if (videoInfoCached) {
        return videoInfoCached
    } else {
        try {
            const videoInfoRaw = await ytdl.exec(fullUrl, { j: true })
            const videoInfoJson = JSON.parse(videoInfoRaw.stdout)
            const newVideoInfo = {
                fullUrl: fullUrl,
                duration: videoInfoJson.duration,
                title: videoInfoJson.title
            }
            console.log("The video Info Object:", videoInfoJson)
            await VideoInfo.query().insert(newVideoInfo)
            return newVideoInfo
        } catch (err) {
            console.error("Error in ytdl: ", err)
            return err
        }
    }
}

export default getVideoInfo