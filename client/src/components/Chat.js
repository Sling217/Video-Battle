import React from "react";
import { useState } from "react";

const Chat = (props) => {

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
        } catch(err) {
            console.error("Error in fetch", err.message)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        postChat()
    }

    const handleInputChange = (event) => {
        setChatContent(event.currentTarget.value)
    }

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="chatContent">
                Chat
                <input
                    type="text"
                    name="chatContent"
                    onChange={handleInputChange}
                    value={chatContent}
                />
                </label>
                <input type="submit" value="Send Chat" />
            </form>
        </div>
    )
}

export default Chat