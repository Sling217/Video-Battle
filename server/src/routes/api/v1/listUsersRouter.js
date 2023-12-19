import express from 'express';
import { User } from '../../../models/index.js';
import listUsersSerializer from '../../../services/serializeListUsers.js';

const listUsersRouter = new express.Router()

listUsersRouter.get('/', async (req, res) => {
    const { user } = req
    if (!user) {
        return res.status(401).json({ errors: "You must be logged in to do that." })
    }
    if (user.role !== 'admin') {
        return res.status(401).json({ errors: "You must be an admin to do that." })
    }
    try {
        const users = listUsersSerializer(await User.query())
        res.status(200).json({ users: users })
    } catch (err) {
        res.status(500).json({ errors: err.message })
    }
})

export default listUsersRouter