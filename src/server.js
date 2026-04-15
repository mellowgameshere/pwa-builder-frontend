const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*', // Allows requests from any frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

// Add a simple test route to verify connection
app.get('/api/test', (req, res) => {
  res.json({ status: 'Backend is connected!' });
});

app.post('/api/build', async (req, res) => {
  try {
    const { appName, packageName, webUrl } = req.body;

    console.log('Build request received:', { appName, packageName, webUrl });

    if (!appName || !packageName || !webUrl) {
      return res.status(400).json({ message: 'Missing required fields: appName, packageName, webUrl' });
    }

    // Trigger the GitHub Action in your 'pwa-native-shell' repo
    const response = await fetch(`https://api.github.com/repos/mellowgameshere/pwa-native-shell/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        event_type: 'build-request',
        client_payload: { appName, packageName, webUrl }
      })
    });

    console.log('GitHub API response status:', response.status);

    if (response.ok) {
      res.status(200).json({ message: 'Build triggered successfully' });
    } else {
      const errorText = await response.text();
      console.error('GitHub API error:', errorText);
      res.status(500).json({ message: 'Failed to trigger build', details: errorText });
    }
  } catch (error) {
    console.error('Build request error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*', // Allows requests from any frontend
  methods: ['POST', 'GET']
}));
app.use(express.json());

// Add a simple test route to verify connection
app.get('/api/test', (req, res) => {
  res.json({ status: 'Backend is connected!' });
});

app.post('/api/build', async (req, res) => {
  const { appName, packageName, webUrl } = req.body;

  // Trigger the GitHub Action in your 'pwa-native-shell' repo
  const response = await fetch(`https://api.github.com/repos/mellowgameshere/pwa-native-shell/dispatches`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      event_type: 'build-request',
      client_payload: { appName, packageName, webUrl }
    })
  });

  if (response.ok) {
    res.status(200).json({ message: 'Build triggered successfully' });
  } else {
    res.status(500).json({ message: 'Failed to trigger build' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
