import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const BeatAnalyzer = ({ track, onAnalysisComplete }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Fonctions d'analyse (reprises du composant précédent)
  const detectBPM = (channelData, sampleRate) => {
    // ... code de détection BPM
  };

  const detectKey = (channelData, sampleRate) => {
    // ... code de détection de clé
  };

  const analyzeAudio = async () => {
    if (!audioFile) return;
    setIsAnalyzing(true);

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);

      // eslint-disable-next-line no-undef
      const analysis = await performCompleteAnalysis(audioBuffer, context);
      setAnalysisResults(analysis);
      
      // Envoyer les résultats au composant parent
      if (onAnalysisComplete) {
        onAnalysisComplete({
          ...analysis,
          trackInfo: track
        });
      }

    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="beat-analyzer">
      {/* Interface d'upload et d'analyse */}
      <div className="upload-section">
        <h3>Analyse locale des beats</h3>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files[0])}
          className="file-input"
        />
        {audioFile && (
          <button onClick={analyzeAudio} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyse...' : 'Analyser le fichier'}
          </button>
        )}
      </div>

      {/* Lecteur audio */}
      {audioFile && (
        <div className="audio-player">
          <audio
            ref={audioRef}
            src={audioFile ? URL.createObjectURL(audioFile) : ''}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          />
          <button onClick={() => {
            if (isPlaying) {
              audioRef.current.pause();
            } else {
              audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
          }}>
            {isPlaying ? '⏸️' : '▶️'}
          </button>
        </div>
      )}

      {/* Résultats d'analyse */}
      {analysisResults && (
        <div className="analysis-results">
          <div className="main-results">
            <div className="result-item">
              <span className="label">BPM Détecté:</span>
              <span className="value">{analysisResults.bpm}</span>
            </div>
            <div className="result-item">
              <span className="label">Clé:</span>
              <span className="value">{analysisResults.key}</span>
            </div>
          </div>
          
          {/* Graphiques */}
          <div className="charts">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analysisResults.spectralAnalysis}>
                <Line dataKey="magnitude" stroke="#8884d8" />
                <XAxis dataKey="frequency" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeatAnalyzer;