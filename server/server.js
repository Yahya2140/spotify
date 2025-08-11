const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS pour autoriser les requêtes du frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Middleware pour parser le JSON des requêtes
app.use(express.json());

// Configuration de l'API Spotify
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

// Route pour obtenir l'URL d'authentification de Spotify
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

// Route de callback pour échanger le code contre un token d'accès
app.post('/auth/callback', async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Le code d\'autorisation est manquant.' });
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;
    
    // Il est préférable de ne pas setter les tokens globalement si le serveur gère plusieurs utilisateurs.
    // Le token est renvoyé au client, qui le fournira à chaque requête.
    
    res.json({
      access_token,
      refresh_token,
      expires_in
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error.body || error);
    res.status(400).json({ error: 'Erreur d\'authentification avec Spotify.' });
  }
});

// Route pour rechercher des pistes
app.get('/search/:query', async (req, res) => {
  const { query } = req.params;
  const { access_token } = req.headers;
  
  if (!access_token) {
    return res.status(401).json({ error: 'Token d\'accès requis.' });
  }
  
  spotifyApi.setAccessToken(access_token);
  
  try {
    const searchResults = await spotifyApi.searchTracks(query, { limit: 20 });
    res.json(searchResults.body.tracks.items);
  } catch (error) {
    console.error('Erreur lors de la recherche sur Spotify:', error.body || error);
    
    // Si le token est expiré ou invalide, l'API Spotify renvoie un code 401.
    // On renvoie ce code au frontend pour qu'il puisse gérer la déconnexion.
    if (error.statusCode === 401) {
      return res.status(401).json({ error: 'Token Spotify invalide ou expiré.' });
    }
    
    // Pour les autres erreurs, on renvoie un code 400.
    res.status(400).json({ error: 'Erreur lors de la recherche sur Spotify.' });
  }
});

// Route pour obtenir les audio features d'une piste
app.get('/audio-features/:trackId', async (req, res) => {
  const { trackId } = req.params;
  const { access_token } = req.headers;
  
  if (!access_token) {
    return res.status(401).json({ error: 'Token d\'accès requis.' });
  }
  
  spotifyApi.setAccessToken(access_token);
  
  try {
    const data = await spotifyApi.getAudioFeaturesForTrack(trackId);
    res.json(data.body);
  } catch (error) {
    console.error('Erreur lors de la récupération des audio features:', error.body || error);

    if (error.statusCode === 401) {
      return res.status(401).json({ error: 'Token Spotify invalide ou expiré.' });
    }

    res.status(400).json({ error: 'Erreur lors de la récupération des audio features.' });
  }
});

// Route pour obtenir les audio features de plusieurs pistes
app.post('/audio-features-multiple', async (req, res) => {
  const { trackIds } = req.body;
  const { access_token } = req.headers;
  
  if (!access_token) {
    return res.status(401).json({ error: 'Token d\'accès requis.' });
  }
  
  spotifyApi.setAccessToken(access_token);
  
  try {
    const data = await spotifyApi.getAudioFeaturesForTracks(trackIds);
    res.json(data.body.audio_features);
  } catch (error) {
    console.error('Erreur lors de la récupération des audio features multiples:', error.body || error);
    
    if (error.statusCode === 401) {
      return res.status(401).json({ error: 'Token Spotify invalide ou expiré.' });
    }
    
    res.status(400).json({ error: 'Erreur lors de la récupération des audio features.' });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Serveur démarré sur http://127.0.0.1:${PORT}`);
});