import React from "react";

const UserList = (props) => {
    const userList = props.userList.map((user, index) => {
        return(
            <div key={index}>
                {user}
            </div>
        )
    })
    return (
        <div>
            <h6>
                Online users:
            </h6>
            <div className="users-list callout">
                {userList}
            </div>
        </div>
    )
}

export default UserList