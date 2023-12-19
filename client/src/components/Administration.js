import React from "react"
import { useState, useEffect } from "react"

const Administration = (props) => {

    const [userList, setUserList] = useState([])

    const fetchUserList = async () => {
        try {
            const response = await fetch("/api/v1/listUsers")
            if (!response.ok) {
                const errorMessage = `${response.status} (${response.statusText})`
                const error = new Error(errorMessage)
                throw(error)
            }
            const responseBody = await response.json()
            setUserList(responseBody.users)
        } catch(err) {
            console.error(`Error in fetch: ${err.message}`)
        }
    }

    useEffect(() => {
        fetchUserList()
    }, [])

    const userRows = userList.map((user, index) => {
        return (
            <tr key={index}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
            </tr>
        )
    })

    return (
        <div className="grid-container">
            <div className="grid-x grid-margin-x">
                <div className="cell small-12">
                    <h1>Administration</h1>
                    <h2>Users</h2>
                    <table> 
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                            {userRows}
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Administration