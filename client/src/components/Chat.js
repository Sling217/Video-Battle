import React, { useEffect } from "react";
import { useState } from "react";

const Chat = (props) => {

    const [chatContent, setChatContent] = useState("")

    const postChat = async () => {
        try {
            const chatSubmissionBody = {
                content: chatContent
            }
            await fetch("api/v1/chats", {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify(chatSubmissionBody)
            })
        } catch(err) {
            console.error("Error in fetch", err.message)
        }
    }

    const getChat = async () => {
        try {
            const response = await fetch("api/v1/chats")
            const responseBody = await response.json()
            if (!response.ok) {
                throw new Error(`${response.status} (${response.statusText})`)
            }
            props.setChatHistory(responseBody.chatContents)
        } catch (err) {
            console.error("Error in fetch", err.message)
        }
    }

    useEffect(() => {
        getChat()
    },[])

    const handleSubmit = (event) => {
        event.preventDefault()
        postChat()
    }

    const handleInputChange = (event) => {
        setChatContent(event.currentTarget.value)
    }

    const chatDisplay = props.chatHistory.map(chat => {
        return (
        <div key={chat.id}>
            {chat.username}: {chat.content}{`\n`}
        </div>
        )
    })

    const hideClass = props.user ? "" : "hide"

    return(
        <div>
            Chat
            <div className="callout">
                {chatDisplay}
            </div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="chatContent">
                <input
                    className={hideClass}
                    type="text"
                    name="chatContent"
                    onChange={handleInputChange}
                    value={chatContent}
                />
                </label>
                <input className={hideClass} type="submit" value="Send Chat" />
            </form>
        </div>
    )
}

export default Chat