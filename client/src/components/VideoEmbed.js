import React from 'react'
import ReactPlayer from 'react-player'
import { format } from 'date-fns'
import { useState, useEffect, useRef } from 'react'

const VideoEmbed = (props) => {
    const [video, setVideo] = useState({
        fullUrl: "",
        updatedAt: new Date()
    })
    const [videoLink, setVideoLink] = useState("")
    const [seekTime, setSeekTime] = useState(0)
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
            const videoTime = new Date(responseBody.videoLink.updatedAt)
            const currentTime = new Date()
            const timeElapsed = (currentTime - videoTime) / 1000
            setSeekTime(timeElapsed)
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
            playerRef.current.seekTo(seekTime)
        }
    }, [seekTime])
    
    const handleInputChange = (event) => {
        setVideoLink(    
            event.currentTarget.value
        )
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        postNewVideoLink()
        setVideo({ ...video, fullUrl: videoLink })
    }

    return (
        <div>
            <ReactPlayer
                ref={playerRef}
                controls={true}
                volume={null}
                muted={true}
                playing={true}
                url={video.fullUrl}
            />
            <h5>
                Video Submission Time: {formattedTime}
            </h5>
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
        </div>
    )
}

export default VideoEmbed