import React from 'react'
import { useState, useEffect } from 'react'

const VideoLinksBox = (props) => {
    console.log("video Links is: ",props.videoLinks)

    return(
        <textArea rows="6">
            {props.videoLink}
            {props.videoLinks}
        </textArea>
    )
}

export default VideoLinksBox