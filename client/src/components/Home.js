import React from 'react'
import { useState, useEffect } from 'react'
import VideoEmbed from './VideoEmbed'
import VideoLinksBox from './VideoLinksBox'

const Home = (props) => {
    const [videoLinks, setVideoLinks] = useState([])
    const [networkSeekTime, setNetworkSeekTime] = useState(0)
    const [socket, setSocket] = useState(null)
    const [playing, setPlaying] = useState(true)
    
    const readNewMessage = (event) => {
        const receivedData = JSON.parse(event.data)
        if (receivedData.type === "videoLink") {
            setVideoLinks((videoLinks) => [ ...videoLinks, `${receivedData.content}` ])
        } else if (receivedData.type === "seekTime") {
            setNetworkSeekTime(receivedData.content)
        } else if (receivedData.type === "pause") {
            setPlaying(receivedData.content)
        }
    }

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080')
        socket.addEventListener('message', readNewMessage)
        setSocket(socket)
        return(() => {
            socket.close()
        })
    },[])
    
    return (
        <div>
            <VideoEmbed
                videoLinks={videoLinks}
                networkSeekTime={networkSeekTime}
                playing={playing}
                socket={socket}
            />
            <VideoLinksBox videoLinks={videoLinks} />
        </div>
    )
}
export default Home