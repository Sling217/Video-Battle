const listUsersSerializer = (users) => {
    return users.map((user) => {
        return {
            email: user.email,
            username: user.username,
            role: user.role,
        };
    });
}

export default listUsersSerializer;