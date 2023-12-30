import React from 'react'
import ReactPlayer from 'react-player'
import { useState, useEffect, useRef } from 'react'
import FormError from './layout/FormError'
import translateServerErrors from '../services/translateServerErrors'
import ErrorList from './layout/ErrorList'

const VideoEmbed = (props) => {
    const [videoLink, setVideoLink] = useState("")
    const [played, setPlayed] = useState(0)
    const [seeking, setSeeking] = useState(false)
    const [errors, setErrors] = useState({})
    const [fetchErrors, setFetchErrors] = useState([])
    const [changeToQueueMode, setChangeToQueueMode] = useState(props.queueMode)
    const [playerWidth, setPlayerWidth] = useState(640)
    
    const playerRef = useRef()
    const playingRef = useRef(props.playing)
    const mutedRef = useRef(props.muted)
    const seekBarRef = useRef(null)

    const getVideoLink = async () => {
        try {
            const response = await fetch("/api/v1/videoLinks")
            const responseBody = await response.json()
            if (!response.ok) {
                throw new Error(`${response.status} (${response.statusText})`)
            }
            props.setVideoLinks(responseBody.videoLinkHistory)
            if (responseBody.videoQueue.length > 0) {
                props.setVideoQueue(responseBody.videoQueue)
            }
        } catch(err) {
            console.error("Error in fetch", err.message)
        }
    }

    const postNewVideoLink = async () => {
        try {
            const videoSubmissionBody = {
                videoLink: videoLink,
                changeToQueueMode: changeToQueueMode
            }
            const response = await fetch("api/v1/videoLinks", {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify(videoSubmissionBody)
            })
            if (!response.ok) {
                if (response.status === 422) {
                    const errorBody = await response.json()
                    const newFetchErrors = translateServerErrors(errorBody.errors)
                    return setFetchErrors(newFetchErrors)
                } else {
                    const errorMessage = await response.json()
                    throw new Error(errorMessage)
                }
            }
        } catch(err) {
            console.error("Error in fetch", err.message)
        }
    }

    useEffect(() => {
        getVideoLink()
    }, [])

    useEffect(() => {
        playingRef.current = props.playing
        mutedRef.current = props.muted
    },[props.playing, props.muted])

    useEffect(() => {
        if (!props.socket) {
            return
        }
        const homeComponent = document.getElementById('homeComponent')
        homeComponent.addEventListener("keydown",(event) => {
            if (
                event.target.name === "videoLink" 
                || event.target.name === "chatContent"
            ) {
                return
            }
            switch(event.code) {
                case "Space":
                    event.preventDefault()
                    pauseVideo(playingRef.current)
                    break
                case "KeyM" :
                    muteVideo(mutedRef.current)
                    break
                case "ArrowRight" :
                    seekRight()
                    break
                case "ArrowLeft" : 
                    seekLeft()
                    break
                default:
                    break
            }
        }) 
    }, [props.socket])

    useEffect(() => {
        if(playerRef.current) {
            // playerRef.current.seekTo(props.networkSeekTime, "seconds")
            // console.log("video's current time: ", playerRef.current.getCurrentTime())
            // playerRef.current.seekTo(0.9992, "fraction")
        }
    }, [props.networkSeekTime])
    
    useEffect(() => {
        setTimeout(() => {
            setPlayed(0)
            playerRef.current.seekTo(0)
        }, 250) // race condition
    }, [props.currentlyPlaying])
    
    const setStart = () => {
        playerRef.current.seekTo(props.networkSeekTime)
        if (!props.playing) {
            playerRef.current.getInternalPlayer().playVideo()
            setTimeout(() => playerRef.current.getInternalPlayer().pauseVideo(), 250)
        }
    }

    const handleInputChange = (event) => {
        setVideoLink(    
            event.currentTarget.value
        )
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        let newErrors = {}
        const reactPlayerCanPlay = ReactPlayer.canPlay(videoLink)
        const passesRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(videoLink)
        if(reactPlayerCanPlay && passesRegex) {
            postNewVideoLink().then(() => {
                setVideoLink("")
            })
        } else {
            newErrors = {
                ...newErrors,
                linkValidation: (reactPlayerCanPlay && !passesRegex) ? "Invalid URL. Must include http/https." : "Invalid URL."
            }
        }
        setErrors(newErrors)
        setFetchErrors([])
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
        const duration = playerRef.current.getDuration()
        const currentTime = playerRef.current.getCurrentTime()
        console.log("The duration is:", duration)
        console.log("The current  is:", currentTime)
        console.log("The difference: ", currentTime - duration)
        if (duration) {
            const seekTimeSeconds = parseFloat(event.target.value)*duration
            const messageObject = {
                type: "seekTime",
                content: seekTimeSeconds
            }
            props.socket.send(JSON.stringify(messageObject))
        }
    }
    
    const handleProgress = (state) => {
        if (!seeking && props.playing) {
            let newPlayed = state.played
            if (newPlayed === 1) {
                newPlayed = 0 // fix odd behavior of handleProgress
            }
            setPlayed(newPlayed)
        }
    }
    
    const pauseVideo = (playing) => {
        let seekTimeSeconds = playerRef.current.getCurrentTime()
        if (played === 0) {
            seekTimeSeconds = 0 // fix odd behavior of getCurrentTime
        }
        if (seekTimeSeconds !== null) {
            const messageObject = {
                type: "playing",
                content: !playing,
                seekTimeSeconds: seekTimeSeconds
            }
            props.socket.send(JSON.stringify(messageObject))
        }
    }

    const seekRight = () => {
        const seekTimeSeconds = playerRef.current.getCurrentTime() 
        if (seekTimeSeconds !== null) {
            const messageObject = {
                type: "seekTime",
                content: seekTimeSeconds + 5
            }
            props.socket.send(JSON.stringify(messageObject))
        }
    }

    const seekLeft = () => {
        const seekTimeSeconds = playerRef.current.getCurrentTime() 
        if (seekTimeSeconds !== null) {
            const messageObject = {
                type: "seekTime",
                content: seekTimeSeconds - 5
            }
            props.socket.send(JSON.stringify(messageObject))
        }
    }

    const handlePauseButton = () => {
        pauseVideo(props.playing)
    }

    const muteVideo = (muted) => {
        const messageObject = {
            type: "muted",
            content: !muted
        }
        props.socket.send(JSON.stringify(messageObject))
    }

    const handleMuteButton = () => {
        muteVideo(props.muted)
    }

    const handleQueueMode = () => {
        setChangeToQueueMode(!changeToQueueMode)
    }

    const handleQueueModeSwitch = () => {
        const messageObject = {
            type: "queueModeSwitch",
            content: !props.queueMode
        }
        props.socket.send(JSON.stringify(messageObject))
    }
    
    const handleSkipButton = () => {
        const messageObject = {
            type: "skip"
        }
        props.socket.send(JSON.stringify(messageObject))
    }

    let skipButton = ""
    if (props.queueMode) {
        skipButton = <input type="button" value="Skip" onClick={handleSkipButton} />
    }
    
    useEffect(() => {
        const handleResize = (event) => {
            if (seekBarRef.current) {
                seekBarRef.current.style.width = window.innerWidth/2-50 + 'px'
            }
            setPlayerWidth(window.innerWidth/2)
        }
        window.addEventListener('resize', handleResize)
        handleResize()
        return () => window.removeEventListener('resize', handleResize)
    })

    useEffect(() => {
        setChangeToQueueMode(props.queueMode)
    },[props.queueMode])

    const dummyFunction = () => {
        // suppress warning for read-only inputs that expect onChange handler
        return (true)
    }

    return (
        <div>
            <div className="player-container">
                <ReactPlayer
                    ref={playerRef}
                    controls={true}
                    volume={0.05}
                    loop={true}
                    playing={props.playing}
                    muted={props.muted}
                    url={props.currentlyPlaying.fullUrl}
                    onProgress={handleProgress}
                    onReady={setStart}
                    width={playerWidth}
                    height={playerWidth*9/16}
                />
            </div>
            Submit a new video! Paste the link here:
            <div className="video-link-submit">
                <form onSubmit={handleSubmit}>
                    <label htmlFor='videoLink'>
                        <input
                            type="text"
                            name="videoLink"
                            onChange={handleInputChange}
                            value={videoLink}
                        />
                    </label>
                    <button type="submit">
                        ↪️
                    </button>
                </form>
            </div>
            <ErrorList errors={fetchErrors} />
            <FormError error={errors.linkValidation} />
            Submit video in queue mode
            <input type="checkbox" checked={changeToQueueMode} onChange={handleQueueMode} />
            <div className="callout">
                <h6>
                    Networked video controls
                </h6>
                <h6>
                    Synchronized Seek Time
                </h6>
                <input
                    id="seek-bar"
                    ref={seekBarRef}
                    className="seek-bar"
                    type="range" min={0} max={0.999999} step="any"
                    value={played}
                    onMouseDown={handleSeekMouseDown}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekMouseUp}
                />
                <input type="button" value={props.muted ? "Unmute" : "  Mute  "} onClick={handleMuteButton} />
                <input type="button" value={props.playing ? "  Pause  " : "Unpause"} onClick={handlePauseButton} />
                {skipButton}
                <div>
                    <div className="switch large">
                        <input className="switch-input" type="checkbox" checked={!props.queueMode} name="queueModeSwitch" onChange={dummyFunction} />
                        <label className="switch-paddle" htmlFor="queueModeSwitch" onClick={handleQueueModeSwitch}>
                            <span className="show-for-sr">Queue Mode Switch</span>
                            <span className="switch-active" aria-hidden="true">Battle</span>
                            <span className="switch-inactive" aria-hidden="true">Queue</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoEmbed