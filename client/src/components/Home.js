import React from 'react'
import { useState, useEffect } from 'react'
import VideoEmbed from './VideoEmbed'
import VideoLinksBox from './VideoLinksBox'

const Home = (props) => {
    const [videoLinks, setVideoLinks] = useState([])
    
    const readNewMessage = (event) => {
        setVideoLinks((videoLinks) => [ ...videoLinks, `${event.data}` ])
    }

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080')
        socket.addEventListener('message', readNewMessage)
        return(() => {
            socket.close()
        })
    },[])
    
    return (
        <div>
            <VideoEmbed videoLinks={videoLinks} />
            <VideoLinksBox videoLinks={videoLinks} />
        </div>
    )
}
export default Home