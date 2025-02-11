
const express = require('express');
const router = express.Router();
const sessions = {};
const users = new Set();

router.post('/session', (req, res) => {
  const { username } = req.body;

  if (username === 'dog') {
    return res.status(403).json({ error: 'Invalid username' });
  }

  const sessionId = Math.random().toString(36).substring(2, 10);
  sessions[sessionId] = username;
  users.add(username);

  res.cookie('sid', sessionId, { httpOnly: true });
  res.status(200).json({ username });
});

router.delete('/session', (req, res) => {
  const sessionId = req.cookies.sid;
  const username = sessions[sessionId];

  if (username) {
    delete sessions[sessionId];
    if (!Object.values(sessions).includes(username)) {
      users.delete(username);
    }
  }

  res.clearCookie('sid');
  res.status(200).send();
});

router.get('/', (req, res) => {
  res.json([...users]);
});

module.exports = router;
