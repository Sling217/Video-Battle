const serializeVideoQueue = (videoObjectArray) => {
    const videoQueue = videoObjectArray.map(videoObject => {
        return ({
            fullUrl: videoObject.fullUrl,
            updatedAt: videoObject.updatedAt
        })
    })
    return videoQueue
}

export default serializeVideoQueue