const serializeVideoQueue = (videoObjectArray) => {
    const videoQueue = videoObjectArray.map(videoObject => {
        return ({
            fullUrl: videoObject.fullUrl,
            updatedAt: videoObject.updatedAt,
            duration: videoObject.duration
        })
    })
    return videoQueue
}

export default serializeVideoQueue