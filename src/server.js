const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Allows your React app to talk to this server
app.use(express.json());

app.post('/api/build', async (req, res) => {
  const { appName, packageName, webUrl } = req.body;

  // Trigger the GitHub Action in your 'pwa-native-shell' repo
  const response = await fetch(`https://api.github.com/repos/YOUR_GITHUB_USERNAME/pwa-native-shell/dispatches`, {
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
