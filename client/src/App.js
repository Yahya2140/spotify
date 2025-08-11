import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchComponent from './components/SearchComponent';
import TrackList from './components/TrackList';
import AudioFeaturesChart from './components/AudioFeaturesChart';
import BeatAnalyzer from './components/BeatAnalyzer';
import IntegratedAnalysis from './components/IntegratedAnalysis';
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:5000';

function App() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('spotify_access_token'));
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [localAnalysis, setLocalAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('spotify'); // 'spotify' | 'beats' | 'compare'
  const [loading, setLoading] = useState(false);

  // Au chargement, si code dans URL, gérer callback auth Spotify
  useEffect(() => {
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

  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem('spotify_access_token');
    setTracks([]);
    setSelectedTrack(null);
    setAudioFeatures(null);
    setLocalAnalysis(null);
    setActiveTab('spotify');
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
        // Token expiré ou invalide
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSelect = async (track) => {
    setSelectedTrack(track);
    setAudioFeatures(null);
    setLocalAnalysis(null);
    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/audio-features/${track.id}`, {
        headers: { access_token: accessToken }
      });
      setAudioFeatures(response.data);
      setActiveTab('spotify');
    } catch (error) {
      console.error('Erreur lors de la récupération des audio features:', error);
      setAudioFeatures(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalAnalysisComplete = (analysis) => {
    setLocalAnalysis(analysis);
    if (activeTab !== 'compare') {
      setActiveTab('compare');
    }
  };

  if (!accessToken) {
    return (
      <div className="App">
        <div className="login-container">
          <h1>Spotify Audio Features + Beat Analyzer</h1>
          <p>Analysez vos pistes avec l'API Spotify ET votre propre analyseur de beats</p>
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
        <h1>Spotify + Beat Analyzer</h1>
        <div className="header-controls">
          <div className="tab-buttons">
            <button
              className={activeTab === 'spotify' ? 'active' : ''}
              onClick={() => setActiveTab('spotify')}
              disabled={!selectedTrack}
            >
              Spotify API
            </button>
            <button
              className={activeTab === 'beats' ? 'active' : ''}
              onClick={() => setActiveTab('beats')}
              disabled={!selectedTrack}
            >
              Beat Analyzer
            </button>
            {audioFeatures && localAnalysis && (
              <button
                className={activeTab === 'compare' ? 'active' : ''}
                onClick={() => setActiveTab('compare')}
              >
                Comparaison
              </button>
            )}
          </div>
          <button onClick={handleLogout} className="logout-button">
            Déconnexion
          </button>
        </div>
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

          <div className="analysis-section">
            {activeTab === 'spotify' && selectedTrack && audioFeatures && (
              <>
                <h3>Spotify Audio Features: {selectedTrack.name}</h3>
                <AudioFeaturesChart audioFeatures={audioFeatures} trackName={selectedTrack.name} />
              </>
            )}

            {activeTab === 'beats' && selectedTrack && (
              <>
                <h3>Analyseur de Beats Local</h3>
                <BeatAnalyzer track={selectedTrack} onAnalysisComplete={handleLocalAnalysisComplete} />
              </>
            )}

            {activeTab === 'compare' && audioFeatures && localAnalysis && (
              <>
                <h3>Comparaison des analyses</h3>
                <IntegratedAnalysis spotifyFeatures={audioFeatures} localAnalysis={localAnalysis} />
              </>
            )}

            {!selectedTrack && (
              <p className="no-selection">Veuillez sélectionner une piste pour afficher les analyses.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
