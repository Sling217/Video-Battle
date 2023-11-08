import React from 'react'
import { useState, useEffect } from 'react'
import VideoEmbed from './VideoEmbed'
import VideoLinksBox from './VideoLinksBox'
import UserList from './UserList'
import Chat from './Chat'

const Home = (props) => {
    const [videoLinks, setVideoLinks] = useState([{
        fullUrl: "",
        updatedAt: new Date()
    }])
    const [queueMode, setQueueMode] = useState(true)
    const [videoQueue, setVideoQueue] = useState([{
        fullUrl: "",
        updatedAt: new Date()
    }])
    const [videoQueueFirstVideo, setVideoQueueFirstVideo] = useState({
        fullUrl: "",
        updatedAt: new Date()
    })
    const [networkSeekTime, setNetworkSeekTime] = useState(0)
    const [socket, setSocket] = useState(null)
    const [playing, setPlaying] = useState(true)
    const [muted, setMuted] = useState(true)
    const [userList, setUserList] = useState([])
    const [chatHistory, setChatHistory] = useState([])

    const readNewMessage = (event) => {
        const receivedData = JSON.parse(event.data)
        if (receivedData.type === "videoLink") {
            setQueueMode(false)
            setVideoLinks((videoLinks) => [ ...videoLinks, receivedData.content ])
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
            setQueueMode(receivedData.content.queueMode)
        } else if (receivedData.type === "userList") {
            setUserList(receivedData.content)
        } else if (receivedData.type === "videoQueue") {
            setQueueMode(true)
            setVideoQueue(receivedData.content)
        } else if (receivedData.type === "chat") {
            const newChat = {
                username: receivedData.username,
                content: receivedData.content,
                id: receivedData.id
            }
            setChatHistory((chatHistory) => [ ...chatHistory, newChat ])
        } else if (receivedData.type === "queueModeSwitch") {
            setQueueMode(receivedData.content)
        }
    }

    useEffect(() => {
        const socket = new WebSocket('wss://video-battle-7eb93638f816.herokuapp.com')
        // const socket = new WebSocket('ws://localhost:3000')
        socket.addEventListener('message', readNewMessage)
        setSocket(socket)
        return(() => {
            socket.close()
        })
    },[])

    useEffect(() => {
        if (
            videoQueueFirstVideo.fullUrl !== videoQueue[0].fullUrl ||
            videoQueueFirstVideo.updatedAt !== videoQueue[0].updatedAt
            ) {
                setVideoQueueFirstVideo(videoQueue[0])
        }
    }, [videoQueue])
 
    const currentlyPlaying = queueMode ? videoQueueFirstVideo : videoLinks[videoLinks.length-1]

    return (
        <div id="homeComponent" tabIndex="0" className="grid-container">
            <div className="grid-x">
                <div className="cell small-6">
                    <VideoEmbed
                        currentlyPlaying = {currentlyPlaying}
                        networkSeekTime={networkSeekTime}
                        socket={socket}
                        playing={playing}
                        muted={muted}
                        queueMode={queueMode}
                        setVideoQueue={setVideoQueue}
                        setVideoLinks={setVideoLinks}
                    />
                    <VideoLinksBox
                        videoLinks={videoLinks}
                        videoQueue={videoQueue}
                        queueMode={queueMode}
                    />
                </div>
                <div className="cell small-4 small-offset-2">
                <UserList userList={userList} />
                <Chat 
                    chatHistory={chatHistory}
                    setChatHistory={setChatHistory}
                    user={props.user}
                />
                </div>
            </div>
        </div>
    )
}
export default Home