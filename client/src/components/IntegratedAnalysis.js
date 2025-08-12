// src/components/IntegratedAnalysis.js

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Fonctions utilitaires (peuvent être dans un fichier séparé)
const getKeyName = (keyNumber) => {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return keys[keyNumber] || 'Inconnu';
};

// Fonction pour calculer l'énergie locale à partir du RMS
// Le RMS est généralement entre 0 et 1. On peut l'ajuster pour qu'il corresponde mieux à l'échelle de l'énergie Spotify.
const calculateLocalEnergy = (analysis) => {
    if (!analysis || typeof analysis.rms !== 'number') return 0;
    // On peut multiplier par un facteur pour étirer la plage de valeurs
    // et s'assurer que le résultat ne dépasse pas 1.
    return Math.min(analysis.rms * 2.5, 1);
};

// Fonction pour calculer la "danceability" locale
const calculateLocalDanceability = (analysis) => {
    if (!analysis || !analysis.bpm || !analysis.rms) return 0;
    // Un tempo "dansant" est souvent entre 100 et 140 BPM.
    const bpmFactor = (analysis.bpm > 100 && analysis.bpm < 140) ? 1 : 0.7;
    // La régularité du rythme (difficile à mesurer) et l'énergie (RMS) sont des facteurs clés.
    const stabilityFactor = 1; // Placeholder
    return Math.min(calculateLocalEnergy(analysis) * bpmFactor * stabilityFactor, 1);
};


const IntegratedAnalysis = ({ spotifyFeatures, localAnalysis }) => {
  if (!localAnalysis) return <p>Aucune analyse locale disponible.</p>;

  // Affichage des résultats locaux uniquement
  if (!spotifyFeatures) {
    return (
      <div className="local-analysis-results">
        <h3>Analyse Locale</h3>
        <div className="feature-item"><span className="feature-label">BPM:</span><span className="feature-value">{localAnalysis.bpm.toFixed(1)}</span></div>
        <div className="feature-item"><span className="feature-label">Loudness (moyenne):</span><span className="feature-value">{localAnalysis.loudness.toFixed(2)}</span></div>
        <div className="feature-item"><span className="feature-label">Énergie (RMS moyen):</span><span className="feature-value">{localAnalysis.rms.toFixed(3)}</span></div>
      </div>
    );
  }

  // Comparaison complète
  const comparisonData = [
    {
      feature: 'Énergie',
      spotify: spotifyFeatures.energy,
      local: calculateLocalEnergy(localAnalysis),
    },
    {
      feature: 'Dansabilité',
      spotify: spotifyFeatures.danceability,
      local: calculateLocalDanceability(localAnalysis),
    },
  ];

  return (
    <div className="integrated-analysis">
      <h3>Comparaison Spotify API vs. Analyse Locale</h3>
      
      <div className="metrics-comparison">
        <div className="metric-item">
          <h4>BPM</h4>
          <p>Spotify: {spotifyFeatures.tempo.toFixed(0)} | Local: {localAnalysis.bpm.toFixed(0)}</p>
          <p>Différence: {Math.abs(spotifyFeatures.tempo - localAnalysis.bpm).toFixed(1)}</p>
        </div>
        <div className="metric-item">
          <h4>Clé</h4>
          <p>Spotify: {getKeyName(spotifyFeatures.key)} | Local: {localAnalysis.key}</p>
        </div>
      </div>

      <div className="comparison-chart">
        <h4>Comparaison des caractéristiques</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="feature" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="spotify" fill="#1db954" name="Spotify API" />
            <Bar dataKey="local" fill="#8884d8" name="Analyse Locale" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IntegratedAnalysis;