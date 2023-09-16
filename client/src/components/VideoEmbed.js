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
            playerRef.current.seekTo(initialSeekTime)
        }
    }, [initialSeekTime])

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
    }, [props.videoLinks])
    
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

    return (
        <div>
            <div className="player-container">
                <ReactPlayer
                    ref={playerRef}
                    controls={true}
                    volume={null}
                    muted={true}
                    playing={true}
                    url={video.fullUrl}
                    onProgress={handleProgress}
                />
                <h5>
                    Video Submission Time: {formattedTime}
                </h5>
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
            </div>

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
            </form>
            First video link: {initialVideo}
        </div>
    )
}

export default VideoEmbed