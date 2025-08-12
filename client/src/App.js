// src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchComponent from './components/SearchComponent';
import TrackList from './components/TrackList';
import AudioFeaturesChart from './components/AudioFeaturesChart';
import BeatAnalyzer from './components/BeatAnalyzer';
import IntegratedAnalysis from './components/IntegratedAnalysis';
import LocalFileUploader from './components/LocalFileUploader'; // Assurez-vous d'importer ce nouveau composant
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:5000';

function App() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('spotify_access_token'));
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [localAnalysis, setLocalAnalysis] = useState(null);
  const [localFile, setLocalFile] = useState(null);
  const [activeTab, setActiveTab] = useState('local'); // Par défaut sur un onglet neutre
  const [loading, setLoading] = useState(false);

  // Gérer le callback d'authentification Spotify
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
    setLocalFile(null);
    setActiveTab('local');
  };

  const handleSearch = async (query) => {
    if (!accessToken || !query.trim()) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/search/${encodeURIComponent(query)}`, {
        headers: { access_token: accessToken }
      });
      setTracks(response.data);
      // Réinitialiser la sélection locale si une recherche est effectuée
      setLocalFile(null);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Gérer la sélection d'une piste Spotify
  const handleTrackSelect = async (track) => {
    setSelectedTrack(track);
    setLocalFile(null); // Réinitialiser le fichier local
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

  // NOUVEAU: Gérer la sélection d'un fichier local
  const handleFileSelect = (file) => {
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      const pseudoTrack = {
        name: file.name,
        preview_url: fileUrl, // BeatAnalyzer utilisera cette URL
        artists: [{ name: "Fichier local" }],
        album: { images: [{ url: '/default-album-art.png' }] } // Image par défaut
      };
      
      setLocalFile(file);
      setSelectedTrack(pseudoTrack);
      setAudioFeatures(null); // Aucune donnée Spotify pour un fichier local
      setLocalAnalysis(null);
      setTracks([]); // Vider la liste de recherche Spotify
      setActiveTab('beats'); // Aller directement à l'analyseur local
    }
  };
  
  const handleLocalAnalysisComplete = (analysis) => {
    setLocalAnalysis(analysis);
    setActiveTab('compare'); // Passer à la vue de comparaison/résultats
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Analyseur Audio (Spotify + Local)</h1>
        <div className="header-controls">
          <div className="tab-buttons">
            <button
              className={activeTab === 'spotify' ? 'active' : ''}
              onClick={() => setActiveTab('spotify')}
              disabled={!audioFeatures} // Actif seulement si on a des données Spotify
            >
              API Spotify
            </button>
            <button
              className={activeTab === 'beats' ? 'active' : ''}
              onClick={() => setActiveTab('beats')}
              disabled={!selectedTrack}
            >
              Analyseur Local
            </button>
            <button
              className={activeTab === 'compare' ? 'active' : ''}
              onClick={() => setActiveTab('compare')}
              disabled={!localAnalysis} // Actif dès qu'une analyse locale est faite
            >
              Résultats / Comparaison
            </button>
          </div>
          {accessToken && (
            <button onClick={handleLogout} className="logout-button">Déconnexion</button>
          )}
        </div>
      </header>

      <main className="App-main">
        {/* SECTION GAUCHE: Sélection de la source */}
        <div className="source-selection-section">
          <div className="local-analysis-box">
            <h2>1. Analyser un fichier local</h2>
            <LocalFileUploader onFileSelect={handleFileSelect} disabled={loading} />
          </div>

          <div className="separator-text">OU</div>

          <div className="spotify-analysis-box">
            <h2>2. Analyser depuis Spotify</h2>
            {!accessToken ? (
              <div className="login-container-small">
                <button onClick={handleLogin} className="login-button">
                  Se connecter avec Spotify
                </button>
              </div>
            ) : (
              <>
                <SearchComponent onSearch={handleSearch} loading={loading} />
                <TrackList
                  tracks={tracks}
                  onTrackSelect={handleTrackSelect}
                  selectedTrack={selectedTrack}
                />
              </>
            )}
          </div>
        </div>

        {/* SECTION DROITE: Affichage de l'analyse */}
        <div className="analysis-section">
          {loading && <p>Chargement...</p>}

          {!selectedTrack && !loading && (
            <p className="no-selection">
              Veuillez téléverser un fichier ou sélectionner une piste Spotify pour commencer.
            </p>
          )}

          <div style={{ display: activeTab === 'spotify' ? 'block' : 'none' }}>
            {audioFeatures && selectedTrack && (
              <>
                <h3>Spotify Audio Features: {selectedTrack.name}</h3>
                <AudioFeaturesChart audioFeatures={audioFeatures} trackName={selectedTrack.name} />
              </>
            )}
          </div>

          <div style={{ display: activeTab === 'beats' ? 'block' : 'none' }}>
            {selectedTrack && (
              <>
                <h3>Analyse locale en cours...</h3>
                <BeatAnalyzer track={selectedTrack} onAnalysisComplete={handleLocalAnalysisComplete} />
              </>
            )}
          </div>

          <div style={{ display: activeTab === 'compare' ? 'block' : 'none' }}>
            {localAnalysis && (
              <>
                <h3>Résultats de l'analyse</h3>
                <IntegratedAnalysis spotifyFeatures={audioFeatures} localAnalysis={localAnalysis} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;