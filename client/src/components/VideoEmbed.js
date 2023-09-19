import React from 'react'
import ReactPlayer from 'react-player'
import { format } from 'date-fns'
import { useState, useEffect, useRef } from 'react'

const VideoEmbed = (props) => {
    const [video, setVideo] = useState({
        fullUrl: "",
        updatedAt: new Date()
    })
    const [initialVideo, setInitialVideo] = useState("")
    const [videoLink, setVideoLink] = useState("")
    const [initialSeekTime, setInitialSeekTime] = useState(0)
    const [played, setPlayed] = useState(0)
    const [seeking, setSeeking] = useState(false)

    const playerRef = useRef()

    const getVideoLink = async () => {
        try {
            const response = await fetch("/api/v1/videoLinks")
            const responseBody = await response.json()
            if (!response.ok) {
                throw new Error(`${response.status} (${response.statusText})`)
            }
            const videoObject = {
                fullUrl: responseBody.videoLink.fullUrl,
                updatedAt: new Date(responseBody.videoLink.updatedAt)
            }
            setVideo(videoObject)
            setInitialVideo(responseBody.videoLink.fullUrl)
            const videoTime = new Date(responseBody.videoLink.updatedAt)
            const currentTime = new Date()
            const timeElapsed = (currentTime - videoTime) / 1000
            setInitialSeekTime(timeElapsed)
        } catch(err) {
            console.error("Error in fetch", err.message)
        }
    }

    const postNewVideoLink = async () => {
        try {
            const response = await fetch("api/v1/videoLinks", {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify( {videoLink: videoLink})
            })
            if (!response.ok) {
                const errorMessage = await response.json()
                throw new Error(errorMessage)
            }
            setVideoLink("")
        } catch(err) {
            console.error("Error in fetch", err.message)
        }
    }
    const formattedTime = format(video.updatedAt, 'MMMM dd, yyyy HH:mm')

    useEffect(() => {
        getVideoLink()
    }, [])
    
    useEffect(() => {
        if(playerRef.current) {
            playerRef.current.seekTo(props.networkSeekTime, "fraction")
        }
    }, [props.networkSeekTime])
    
    useEffect(() => {
        setVideo({
            updatedAt: new Date(), 
            fullUrl: props.videoLinks[props.videoLinks.length - 1]
        })
        setPlayed(0)
        setInitialSeekTime(0)
        playerRef.current.seekTo(0)

    }, [props.videoLinks])
    
    const setStart = () => {
        const videoLength = playerRef.current.getDuration()
        playerRef.current.seekTo(initialSeekTime % videoLength )
    }

    const handleInputChange = (event) => {
        setVideoLink(    
            event.currentTarget.value
        )
    }
        
    const handleSubmit = (event) => {
        event.preventDefault()
        postNewVideoLink()
    }

    const handleSeekMouseDown = (event) => {
        setSeeking(true)
    }

    const handleSeekChange = (event) => {
        setPlayed(parseFloat(event.target.value))
    }
    
    const handleSeekMouseUp = (event) => {
        setSeeking(false)
        setPlayed(parseFloat(event.target.value))
        const messageObject = {
            type: "seekTime",
            content: parseFloat(event.target.value)
        }
        props.socket.send(JSON.stringify(messageObject))
    }

    const handleProgress = (state) => {
        if (!seeking) {
            setPlayed(state.played)
        }
    }

    const handlePauseButton = () => {
        const messageObject = {
            type: "pause",
            content: !props.playing
        }
        props.socket.send(JSON.stringify(messageObject))
    }

    const handleMuteButton = () => {
        const messageObject = {
            type: "mute",
            content: !props.muted
        }
        props.socket.send(JSON.stringify(messageObject))
    }

    return (
        <div>
            <div className="player-container">
                <ReactPlayer
                    ref={playerRef}
                    controls={true}
                    volume={null}
                    loop={true}
                    playing={props.playing}
                    muted={props.muted}
                    url={video.fullUrl}
                    onProgress={handleProgress}
                    onStart={setStart}
                />
                <h5>
                    Video Submission Time: {formattedTime}
                </h5>
            </div>
            <div className="callout">
                <h6>
                    Networked video controls
                </h6>
                <h6>
                    Synchronized Seek Time
                </h6>
                <input
                    className="seek-bar"
                    type="range" min={0} max={0.999999} step="any"
                    value={played}
                    onMouseDown={handleSeekMouseDown}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekMouseUp}
                />
                <form onSubmit={handleSubmit}>
                    <label htmlFor='videoLink'>
                        Video Link
                        <input
                            type="text"
                            name="videoLink"
                            onChange={handleInputChange}
                            value={videoLink}
                        />
                    </label>
                    <input type="submit" value="Submit" />
                    <input type="button" value={props.muted ? "Unmute" : "  Mute  "} onClick={handleMuteButton} />
                    <input type="button" value={props.playing ? "  Pause  " : "Unpause"} onClick={handlePauseButton} />
                </form>
            </div>
            First video link: {initialVideo}
        </div>
    )
}

export default VideoEmbed