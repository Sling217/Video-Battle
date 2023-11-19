import ytdl from 'youtube-dl-exec'


const getVideoInfo = async(fullUrl) => {
    const videoInfo = await VideoInfo.query().findOne('fullUrl', fullUrl)
    if (videoInfo) {
        if (videoInfo.duration) {
            return videoInfo.duration
        } else {
            return NaN // TODO: logic to re-check if live has finished, has duration
        }
    }
    
    const videoInfos = await ytdl.exec(fullUrl, { j: true })
    return JSON.parse(videoInfos.stdout)
}

export default getVideoInfo