import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const IntegratedAnalysis = ({ spotifyFeatures, localAnalysis }) => {
  if (!spotifyFeatures || !localAnalysis) return null;

  const comparisonData = [
    {
      feature: 'BPM',
      spotify: spotifyFeatures.tempo,
      local: localAnalysis.bpm,
      unit: 'BPM'
    },
    {
      feature: 'Key',
      spotify: spotifyFeatures.key,
      local: convertKeyToNumber(localAnalysis.key),
      unit: 'Key Number'
    },
    {
      feature: 'Loudness',
      spotify: spotifyFeatures.loudness,
      local: localAnalysis.loudness,
      unit: 'dB'
    }
  ];

  const audioFeaturesComparison = [
    {
      feature: 'Energy',
      spotify: spotifyFeatures.energy,
      local: calculateLocalEnergy(localAnalysis),
      max: 1
    },
    {
      feature: 'Danceability',
      spotify: spotifyFeatures.danceability,
      local: calculateLocalDanceability(localAnalysis),
      max: 1
    }
  ];

  return (
    <div className="integrated-analysis">
      <h3>Comparaison Spotify API vs Analyse Locale</h3>
      
      {/* Métriques principales */}
      <div className="metrics-comparison">
        {comparisonData.map((item) => (
          <div key={item.feature} className="metric-item">
            <h4>{item.feature}</h4>
            <div className="values">
              <div className="spotify-value">
                <span className="label">Spotify:</span>
                <span className="value">{item.spotify} {item.unit}</span>
              </div>
              <div className="local-value">
                <span className="label">Local:</span>
                <span className="value">{item.local} {item.unit}</span>
              </div>
              <div className="difference">
                <span className="label">Diff:</span>
                <span className="value">
                  {Math.abs(item.spotify - item.local).toFixed(1)} {item.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique de comparaison */}
      <div className="comparison-chart">
        <h4>Comparaison des caractéristiques audio</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={audioFeaturesComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="feature" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Bar dataKey="spotify" fill="#1db954" name="Spotify API" />
            <Bar dataKey="local" fill="#8884d8" name="Analyse Locale" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Analyse détaillée */}
      <div className="detailed-analysis">
        <h4>Analyse détaillée</h4>
        <div className="analysis-grid">
          <div className="analysis-item">
            <h5>Précision BPM</h5>
            <p>
              Différence: {Math.abs(spotifyFeatures.tempo - localAnalysis.bpm).toFixed(1)} BPM
              {Math.abs(spotifyFeatures.tempo - localAnalysis.bpm) < 5 ? 
                ' ✅ Très précis' : 
                ' ⚠️ Écart significatif'
              }
            </p>
          </div>
          
          <div className="analysis-item">
            <h5>Détection de clé</h5>
            <p>
              Spotify: {getKeyName(spotifyFeatures.key)} | 
              Local: {localAnalysis.key}
              {spotifyFeatures.key === convertKeyToNumber(localAnalysis.key) ? 
                ' ✅ Match parfait' : 
                ' ⚠️ Différence détectée'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fonctions utilitaires
const convertKeyToNumber = (keyString) => {
  const keyMap = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  return keyMap[keyString] || 0;
};

const getKeyName = (keyNumber) => {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return keys[keyNumber] || 'Unknown';
};

const calculateLocalEnergy = (analysis) => {
  // Calculer un équivalent d'énergie basé sur l'analyse locale
  return Math.min(analysis.rms * 10, 1);
};

const calculateLocalDanceability = (analysis) => {
  // Calculer un équivalent de danceability
  const bpmFactor = analysis.bpm > 90 && analysis.bpm < 140 ? 1 : 0.5;
  return Math.min(analysis.rms * bpmFactor * 2, 1);
};

export default IntegratedAnalysis;