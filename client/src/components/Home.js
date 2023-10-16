import React from 'react'
import { useState, useEffect } from 'react'
import VideoEmbed from './VideoEmbed'
import VideoLinksBox from './VideoLinksBox'
import UserList from './UserList'

const Home = (props) => {
    const [videoLinks, setVideoLinks] = useState([])
    const [networkSeekTime, setNetworkSeekTime] = useState(0)
    const [socket, setSocket] = useState(null)
    const [playing, setPlaying] = useState(true)
    const [muted, setMuted] = useState(true)
    const [userList, setUserList] = useState([])
    const [videoQueue, setVideoQueue] = useState([{
        fullUrl: "",
        updatedAt: new Date()
    }])
    const [queueMode, setQueueMode] = useState(false)
    const [videoLink, setVideoLink] = useState({
        fullUrl: "",
        updatedAt: new Date()
    })
    
    const readNewMessage = (event) => {
        const receivedData = JSON.parse(event.data)
        if (receivedData.type === "videoLink") {
            setQueueMode(false)
            setVideoLinks((videoLinks) => [ ...videoLinks, `${receivedData.content.fullUrl}` ])
            setNetworkSeekTime(0)
            setVideoLink(receivedData.content)
        } else if (receivedData.type === "seekTime") {
            setNetworkSeekTime(receivedData.content)
        } else if (receivedData.type === "playing") {
            setPlaying(receivedData.content)
        } else if (receivedData.type === "muted") {
            setMuted(receivedData.content)
        } else if (receivedData.type === "initial") {
            setPlaying(receivedData.content.playing)
            setMuted(receivedData.content.muted)
            setNetworkSeekTime(parseFloat(receivedData.content.networkSeekTime))
        } else if (receivedData.type === "userList") {
            setUserList(receivedData.content)
        } else if (receivedData.type === "videoQueue") {
            setQueueMode(true)
            setVideoQueue(receivedData.content)
        }
        //TODO receive play next video in queue cmd
    }

    useEffect(() => {
        // const socket = new WebSocket('wss://video-battle-7eb93638f816.herokuapp.com')
        const socket = new WebSocket('ws://localhost:3000')
        socket.addEventListener('message', readNewMessage)
        setSocket(socket)
        return(() => {
            socket.close()
        })
    },[])
    
    const currentlyPlaying = queueMode ? videoQueue[0] : videoLink

    return (
        <div>
            <VideoEmbed
                videoLinks={videoLinks}
                currentlyPlaying = {currentlyPlaying}
                networkSeekTime={networkSeekTime}
                socket={socket}
                playing={playing}
                muted={muted}
                queueMode={queueMode}
                setVideoQueue={setVideoQueue}
                setVideoLink={setVideoLink}
            />
            <VideoLinksBox
                videoLinks={videoLinks}
                videoQueue={videoQueue}
                queueMode={queueMode}
            />
            <UserList userList={userList} />
        </div>
    )
}
export default Home