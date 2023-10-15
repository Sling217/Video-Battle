const serializeVideoQueue = (videoObjectArray) => {
    const videoQueue = videoObjectArray.map(videoObject => {
        return videoObject.fullUrl
    })
    return videoQueue
}

export default serializeVideoQueue