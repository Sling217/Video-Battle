import React from "react";

const UserList = (props) => {
    const userList = props.userList.join('\n')
    return (
        <div>
            <h6>
                Online users:
            </h6>
            <textarea rows="6" value={userList} />
        </div>
    )
}

export default UserList