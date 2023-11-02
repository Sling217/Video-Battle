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

    const chatDisplay = props.chatHistory.map(chat => {
        return (
        <div key={chat.id}>
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

    const hideClass = props.user ? "" : "hide"

    return(
        <div>
            Chat
            <div className="chat-container callout">
                {chatDisplay}
                <div
                    style={{ float: "left", clear: "both" }}
                    ref={messagesEndRef}
                />
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
                <ErrorList errors={fetchErrors} />
                <input className={hideClass} type="submit" value="Send Chat" />
            </form>
        </div>
    )
}

export default Chat