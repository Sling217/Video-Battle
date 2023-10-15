import React from 'react'

const VideoLinksBox = (props) => {
    let boxText
    if (props.queueMode) {
        boxText = props.videoQueue.join('\n')
    } else {
        boxText = props.videoLinks.join('\n')
    }

    return(
        <div>
            <h6>
                {props.queueMode && "Video queue"} 
                {!props.queueMode && "New videos received"} 
            </h6>
            <textarea rows="6" value={boxText} />
        </div>
    )
}

export default VideoLinksBox