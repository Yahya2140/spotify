import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchComponent from './components/SearchComponent';
import AudioFeaturesChart from './components/AudioFeaturesChart';
import TrackList from './components/TrackList';
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:5000';

function App() {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('spotify_access_token')
  );
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier si on revient du callback Spotify
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !accessToken) {
      handleAuthCallback(code);
    }
  }, [accessToken]);

  const handleAuthCallback = async (code) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/callback`, { code });
      const { access_token } = response.data;
      
      setAccessToken(access_token);
      localStorage.setItem('spotify_access_token', access_token);
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, "/");
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/login`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!accessToken || !query.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/search/${encodeURIComponent(query)}`, {
        headers: { access_token: accessToken }
      });
      setTracks(response.data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      if (error.response?.status === 401) {
        setAccessToken(null);
        localStorage.removeItem('spotify_access_token');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSelect = async (track) => {
    setSelectedTrack(track);
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/audio-features/${track.id}`, {
        headers: { access_token: accessToken }
      });
      setAudioFeatures(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des audio features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem('spotify_access_token');
    setTracks([]);
    setSelectedTrack(null);
    setAudioFeatures(null);
  };

  if (!accessToken) {
    return (
      <div className="App">
        <div className="login-container">
          <h1>Spotify Audio Features Analyzer</h1>
          <p>Connectez-vous à Spotify pour analyser les caractéristiques audio de vos pistes préférées</p>
          <button onClick={handleLogin} className="login-button">
            Se connecter avec Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Audio Features Analyzer</h1>
        <button onClick={handleLogout} className="logout-button">
          Déconnexion
        </button>
      </header>
      
      <main className="App-main">
        <SearchComponent onSearch={handleSearch} loading={loading} />
        
        <div className="content-container">
          <div className="tracks-section">
            <TrackList 
              tracks={tracks}
              onTrackSelect={handleTrackSelect}
              selectedTrack={selectedTrack}
            />
          </div>
          
          {selectedTrack && audioFeatures && (
            <div className="features-section">
              <h3>Audio Features: {selectedTrack.name}</h3>
              <AudioFeaturesChart 
                audioFeatures={audioFeatures}
                trackName={selectedTrack.name}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;