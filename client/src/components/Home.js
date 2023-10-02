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
    
    const readNewMessage = (event) => {
        const receivedData = JSON.parse(event.data)
        if (receivedData.type === "videoLink") {
            setVideoLinks((videoLinks) => [ ...videoLinks, `${receivedData.content}` ])
            setNetworkSeekTime(0)
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
        }
    }

    useEffect(() => {
        const socket = new WebSocket('ws://video-battle-7eb93638f816.herokuapp.com:8080')
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
                socket={socket}
                playing={playing}
                muted={muted}
            />
            <VideoLinksBox videoLinks={videoLinks} />
            <UserList userList={userList} />
        </div>
    )
}
export default Home