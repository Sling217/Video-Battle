const serializeChat = (chatObjectArray) => {
    const chatArray = chatObjectArray.map(chatObject => {
        return ({
            username: chatObject.username,
            content: chatObject.content,
            id: chatObject.id
        })
    })
    return (chatArray)
}

export default serializeChat