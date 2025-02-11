const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

const sessions = {};
const users = new Set();
const messages = [];

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const requireAuth = (req, res, next) => {
    const { sid } = req.cookies;
    if (!sessions[sid]) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

app.post('/api/v1/users/session', (req, res) => {
    const { username } = req.body;
    const validateUsername = (username) => /^[a-zA-Z0-9_]+$/.test(username);

    if (username === 'dog') {
        return res.status(403).json({ error: 'Forbidden username' });
    }

    if (!validateUsername(username)) {
        return res.status(400).json({ error: 'Invalid username format' });
    }

    const sessionId = Math.random().toString(36).slice(2, 10);
    sessions[sessionId] = username;
    users.add(username);

    res.cookie('sid', sessionId, { httpOnly: true });
    res.status(200).json({ username });
});

app.delete('/api/v1/users/session', (req, res) => {
    const sessionId = req.cookies.sid;
    if (sessionId) {
        delete sessions[sessionId];
        res.clearCookie('sid');
        return res.sendStatus(204);
    }
    res.status(400).json({ error: 'Session ID not found' });
});

app.use('/api/v1/messages', requireAuth);
app.use('/api/v1/users', requireAuth);

app.get('/api/v1/users', (req, res) => res.json([...users]));

app.get('/api/v1/messages', (req, res) => res.json(messages));

app.post('/api/v1/messages', requireAuth, (req, res) => {
    const { content } = req.body;
    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Message content cannot be empty' });
    }
    const message = { username: sessions[req.cookies.sid], content };
    messages.push(message);
    res.status(201).json(message);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
