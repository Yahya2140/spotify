import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const AudioFeaturesChart = ({ audioFeatures, trackName }) => {
  // Préparation des données pour le graphique en barres
  const barData = [
    { name: 'Danceability', value: audioFeatures.danceability, description: 'Capacité à danser' },
    { name: 'Energy', value: audioFeatures.energy, description: 'Énergie' },
    { name: 'Speechiness', value: audioFeatures.speechiness, description: 'Présence de paroles' },
    { name: 'Acousticness', value: audioFeatures.acousticness, description: 'Acoustique' },
    { name: 'Instrumentalness', value: audioFeatures.instrumentalness, description: 'Instrumental' },
    { name: 'Liveness', value: audioFeatures.liveness, description: 'Enregistrement live' },
    { name: 'Valence', value: audioFeatures.valence, description: 'Positivité' }
  ];

  // Préparation des données pour le graphique radar
  const radarData = barData.map(item => ({
    feature: item.name,
    value: item.value * 100
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = barData.find(item => item.name === label);
      return (
        <div className="custom-tooltip">
          <p>{`${label}: ${(payload[0].value * 100).toFixed(1)}%`}</p>
          <p className="tooltip-description">{data?.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="audio-features-container">
      <div className="features-info">
        <div className="feature-item">
          <span className="feature-label">Tempo:</span>
          <span className="feature-value">{audioFeatures.tempo.toFixed(0)} BPM</span>
        </div>
        <div className="feature-item">
          <span className="feature-label">Clé:</span>
          <span className="feature-value">{audioFeatures.key}</span>
        </div>
        <div className="feature-item">
          <span className="feature-label">Mode:</span>
          <span className="feature-value">{audioFeatures.mode === 1 ? 'Majeur' : 'Mineur'}</span>
        </div>
        <div className="feature-item">
          <span className="feature-label">Signature temporelle:</span>
          <span className="feature-value">{audioFeatures.time_signature}/4</span>
        </div>
        <div className="feature-item">
          <span className="feature-label">Loudness:</span>
          <span className="feature-value">{audioFeatures.loudness.toFixed(1)} dB</span>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-section">
          <h4>Caractéristiques Audio (Graphique en barres)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis domain={[0, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#1db954" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h4>Profil Audio (Graphique radar)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="feature" />
              <PolarRadiusAxis 
                angle={60} 
                domain={[0, 100]} 
                tickCount={6}
              />
              <Radar 
                name="Audio Features" 
                dataKey="value" 
                stroke="#1db954" 
                fill="#1db954" 
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AudioFeaturesChart;