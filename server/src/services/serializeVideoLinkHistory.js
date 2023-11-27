const serializeVideoLinkHistory = (videoObjectArray) => {
    const videoLinkHistory = videoObjectArray.map(videoObject => {
        return ({
            fullUrl: videoObject.fullUrl,
            title: videoObject.title
        })
    })
    return videoLinkHistory
}

export default serializeVideoLinkHistory