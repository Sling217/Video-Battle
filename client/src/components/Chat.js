import React, { useEffect, useRef } from "react";
import { useState } from "react";
import translateServerErrors from "../services/translateServerErrors";
import ErrorList from "./layout/ErrorList";

const Chat = (props) => {
    const [fetchErrors, setFetchErrors] = useState({})
    const [chatContent, setChatContent] = useState("")

    const postChat = async () => {
        try {
            const chatSubmissionBody = {
                content: chatContent
            }
            const response = await fetch("api/v1/chats", {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json"
                }),
                body: JSON.stringify(chatSubmissionBody)
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
        setChatContent("")
    }

    const handleInputChange = (event) => {
        setChatContent(event.currentTarget.value)
    }

    const chatDisplay = props.chatHistory.map((chat, index) => {
        return (
        <div key={index}>
            {chat.username}: {chat.content}{`\n`}
        </div>
        )
    })

    //https://stackoverflow.com/questions/37620694/how-to-scroll-to-bottom-in-react
    const messagesEndRef = useRef(null)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    useEffect(() => {
        scrollToBottom()
    }, [props.chatHistory])

    const hideClass = props.user ? "chat-submit" : "chat-submit hide"

    return(
        <div>
            Chat
            <div className="chat-display callout">
                {chatDisplay}
                <div
                    style={{ float: "left", clear: "both" }}
                    ref={messagesEndRef}
                />
            </div>
            <form onSubmit={handleSubmit} className={hideClass}>
                <label htmlFor="chatContent">
                    <input
                        className={hideClass}
                        type="text"
                        name="chatContent"
                        onChange={handleInputChange}
                        value={chatContent}
                    />
                </label>
                <ErrorList errors={fetchErrors} />
                <button type="submit"> 
                    &#x1F4E9;
                </button>
            </form>
        </div>
    )
}

export default Chat