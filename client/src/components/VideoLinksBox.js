import React from 'react'
import { useState, useEffect } from 'react'

const VideoLinksBox = (props) => {
    const [videoLinks, setVideoLinks] = useState([])
    useEffect(() => {
        setVideoLinks([ ...videoLinks, `${props.videoLink}\n`])
    }, [props.videoLink])

    const socket = new WebSocket('ws://localhost:8080')

    socket.addEventListener('message', (event) => {
        console.log("received: ", event.data )
        setVideoLinks([ ...videoLinks, `${event.data}\n` ])
    })

    console.log("video Links is: ",videoLinks)

    return(
        <textArea rows="6">
            {videoLinks}
        </textArea>
    )
}

export default VideoLinksBox