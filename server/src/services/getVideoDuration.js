import ytdl from 'youtube-dl-exec'
import { VideoInfo } from '../models/index.js'

const durationParse = (duration) => {
    const MinSecParts = duration.split(':')
    if (MinSecParts.length == 0) {
        return
    } else if (MinSecParts.length == 1) {
        return parseInt(MinSecParts[0])
    } else if (MinSecParts.length == 2) {
        const min = parseInt(MinSecParts[0])
        const sec = parseInt(MinSecParts[1])
        return min*60 + sec
    } else if (MinSecParts.length == 3) {
        const hour = parseInt(MinSecParts[0])
        const min = parseInt(MinSecParts[1])
        const sec = parseInt(MinSecParts[2])
        return hour*60*60 + min*60 + sec
    } else {
        return
    }
}

const getDuration = async (fullUrl) => {
    try {
        const videoInfo = await VideoInfo.query().findOne('fullUrl', fullUrl)
        if (videoInfo) {
            if (videoInfo.duration) {
                return videoInfo.duration
            } else {
                return NaN // TODO: logic to re-check if live has finished, has duration
            }
        }
        const durationCmd = await ytdl.exec(fullUrl, { getDuration: true })
        const duration = durationCmd.stdout
        let regex = /^(\d{1,2}:)?(\d{1,2}:)?\d{1,2}$/;
        if (regex.test(duration)){
            const durationSeconds = durationParse(duration)
            const videoInfoObject = {
                fullUrl: fullUrl,
                duration: durationSeconds
            }
            await VideoInfo.query().insert(videoInfoObject)
            return durationSeconds
        } else {
            return NaN
        }
    } catch(err) {
        return err
    }
}

export default getDuration