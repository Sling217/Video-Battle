import React from 'react'
import { useEffect, useRef } from 'react'

const VideoLinksBox = (props) => {
    const videoQueueDisplay = props.videoQueue.map((video, index) => {
        let returnString = video.fullUrl
        if (index === 0) {
            returnString = <b>{video.fullUrl}</b>
        }
        return(
            <div key={index}>
                {returnString}
            </div>
        )
    })
    const videoLinksDisplay = props.videoLinks.map((videoLink, index, videoLinksDisplay) => {
        let returnString = videoLink.fullUrl
        if (index === videoLinksDisplay.length-1) {
            returnString = <b>{videoLink.fullUrl}</b>
        } else if (index === videoLinksDisplay.length-2) {
            returnString = <div>{videoLink.fullUrl}</div>
        } else if (index === videoLinksDisplay.length-3) {
            returnString = <div className="dark-gray">{videoLink.fullUrl}</div>
        } else {
            returnString = <div className="light-gray">{videoLink.fullUrl}</div>
        }
        return (
            <div key={index}>
                {returnString}
            </div>
        )
    })

    const messagesEndRef = useRef(null)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    useEffect(() => {
        scrollToBottom()
    }, [props.videoLinks])

    return(
        <div>
            <h6>
                {props.queueMode && "Video queue"} 
                {!props.queueMode && "Battle mode video history"} 
            </h6>
            <div className={`${!props.queueMode && `hide`} video-links-box callout`}>
                {props.queueMode && videoQueueDisplay}
            </div>
            <div className={`${props.queueMode && `hide`} video-links-box callout`}>
                {!props.queueMode && videoLinksDisplay}
                <div
                    style={{ float: "left", clear: "both" }}
                    ref={messagesEndRef}
                />
            </div>
        </div>
    )
}

export default VideoLinksBox