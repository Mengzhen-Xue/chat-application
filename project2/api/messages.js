const express = require('express');
const router = express.Router();

module.exports = (sessions, messages) => {

    router.get('/', (req, res) => {
        const sessionId = req.cookies.sid;
        if (!sessions[sessionId]) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.json(messages);
    });

    router.post('/', (req, res) => {
        const sessionId = req.cookies.sid;
        const username = sessions[sessionId];

        if (!username) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { content } = req.body;
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Message content cannot be empty' });
        }

        const newMessage = { username, content };
        messages.push(newMessage);
        res.status(201).json(newMessage);
    });
    return router;
}
