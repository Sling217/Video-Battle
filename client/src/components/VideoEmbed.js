import React from 'react';
import ReactPlayer from 'react-player'
import { useState } from 'react';

const VideoEmbed = (props) => {
    const [url, setUrl] = useState("https://www.youtube.com/watch?v=NT5-XrNlVNE")
    const [videoLink, setVideoLink] = useState("")

    const handleInputChange = (event) => {
        setVideoLink(    
            event.currentTarget.value
        )
    }
    const handleSubmit = (event) => {
        event.preventDefault()
        setUrl(videoLink)
    }

    return (
        <div>
            <ReactPlayer url={url} />
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