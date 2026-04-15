const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

// API Routes
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
      console.log('Build triggered successfully for:', appName);
      res.status(200).json({ 
        message: 'Build triggered successfully',
        appName,
        packageName,
        webUrl
      });
    } else {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      const errorMessage = response.status === 401 
        ? 'Authentication failed: Invalid GITHUB_TOKEN'
        : response.status === 404
        ? 'Repository not found. Verify pwa-native-shell exists and GITHUB_TOKEN has access'
        : response.status === 422
        ? 'Repository dispatch trigger failed. Ensure pwa-native-shell has a build workflow'
        : `Build trigger failed with status ${response.status}`;
      
      res.status(500).json({ 
        message: errorMessage,
        status: response.status,
        details: errorText 
      });
    }
  } catch (error) {
    console.error('Build request error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = app;
