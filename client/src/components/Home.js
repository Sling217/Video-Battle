import React from 'react'
import { useState } from 'react'
import VideoEmbed from './VideoEmbed'
import VideoLinksBox from './VideoLinksBox'


const Home = (props) => {

    const [videoLinks, setVideoLinks] = useState([])
    
    const socket = new WebSocket('ws://localhost:8080')
    
    const readNewMessage = (message) => {
        setVideoLinks([ ...videoLinks, `${message}\n` ])
    }
    socket.addEventListener('message', (event) => {
        console.log("received: ", event.data )
        readNewMessage(event.data)
    })
    
    return (
        <div>
            <VideoEmbed videoLinks={videoLinks} />
        </div>
    )
}
export default Home