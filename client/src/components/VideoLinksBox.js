import React from 'react'

const VideoLinksBox = (props) => {
    const boxText = props.videoLinks.join('\n')

    return(
        <div>
            <h6>
                New videos received
            </h6>
            <textarea rows="6" value={boxText} />
        </div>
    )
}

export default VideoLinksBox