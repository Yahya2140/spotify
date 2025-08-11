const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS
// Configuration CORS
app.use(cors({
  origin: 'http://127.0.0.1:3000',
  credentials: true
}));

app.use(express.json());

// Configuration Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

// Route pour obtenir l'URL d'authentification
app.get('/auth/login', (req, res) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-top-read',
    'playlist-read-private'
  ];
  
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state');
  res.json({ url: authorizeURL });
});

// Route pour échanger le code d'autorisation contre un token
app.post('/auth/callback', async (req, res) => {
  const { code } = req.body;
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;
    
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    
    res.json({
      access_token,
      refresh_token,
      expires_in
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    res.status(400).json({ error: 'Erreur d\'authentification' });
  }
});

// Route pour rechercher des pistes
app.get('/search/:query', async (req, res) => {
  const { query } = req.params;
  const { access_token } = req.headers;
  
  if (!access_token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }
  
  spotifyApi.setAccessToken(access_token);
  
  try {
    const searchResults = await spotifyApi.searchTracks(query, { limit: 20 });
    res.json(searchResults.body.tracks.items);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(400).json({ error: 'Erreur lors de la recherche' });
  }
});

// Route pour obtenir les audio features d'une piste
app.get('/audio-features/:trackId', async (req, res) => {
  const { trackId } = req.params;
  const { access_token } = req.headers;
  
  if (!access_token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }
  
  spotifyApi.setAccessToken(access_token);
  
  try {
    const audioFeatures = await spotifyApi.getAudioFeaturesForTrack(trackId);
    res.json(audioFeatures.body);
  } catch (error) {
    console.error('Erreur lors de la récupération des audio features:', error);
    res.status(400).json({ error: 'Erreur lors de la récupération des audio features' });
  }
});

// Route pour obtenir les audio features de plusieurs pistes
app.post('/audio-features-multiple', async (req, res) => {
  const { trackIds } = req.body;
  const { access_token } = req.headers;
  
  if (!access_token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }
  
  spotifyApi.setAccessToken(access_token);
  
  try {
    const audioFeatures = await spotifyApi.getAudioFeaturesForTracks(trackIds);
    res.json(audioFeatures.body.audio_features);
  } catch (error) {
    console.error('Erreur lors de la récupération des audio features:', error);
    res.status(400).json({ error: 'Erreur lors de la récupération des audio features' });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Serveur démarré sur http://127.0.0.1:${PORT}`);
});