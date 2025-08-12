// src/components/BeatAnalyzer.js

import React, { useState, useEffect } from 'react';
import Meyda from 'meyda';

// Fonction utilitaire pour trouver la valeur la plus fréquente dans un tableau (le mode)
const findMode = (arr) => {
  if (arr.length === 0) return null;
  return arr.sort((a,b) =>
        arr.filter(v => v===a).length
      - arr.filter(v => v===b).length
  ).pop();
};

const BeatAnalyzer = ({ track, onAnalysisComplete }) => {
  const [analysisState, setAnalysisState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true; // Pour suivre l'état de montage du composant
    let audioContext;

    const analyzeAudio = async (audioUrl) => {
      try {
        if (!isMounted) return; // Ne pas démarrer si le composant est déjà démonté
        setAnalysisState('analyzing');
        setErrorMessage('');

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`Le chargement de l'audio a échoué: ${response.statusText}`);
        
        const arrayBuffer = await response.arrayBuffer();
        if (!isMounted) return; // Vérifier à nouveau après l'opération asynchrone

        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        if (!isMounted) return;

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Variables pour une analyse plus robuste
        const bpmCandidates = [];
        const loudnessSamples = [];
        const rmsSamples = [];

        const analyzer = Meyda.createMeydaAnalyzer({
          audioContext: audioContext,
          source: source,
          bufferSize: 4096,
          featureExtractors: ['bpm', 'loudness', 'rms'],
          callback: (features) => {
            // Collecter toutes les estimations de BPM valides
            if (features.bpm && features.bpm.bpm > 0) {
              bpmCandidates.push(Math.round(features.bpm.bpm));
            }
            if (features.loudness) {
              loudnessSamples.push(features.loudness.total);
            }
            if (features.rms) {
              rmsSamples.push(features.rms);
            }
          },
        });

        source.onended = () => {
          analyzer.stop();

          // Calculer les résultats finaux de manière plus fiable
          const finalBpm = findMode(bpmCandidates) || 0;
          const averageLoudness = loudnessSamples.length ? loudnessSamples.reduce((a, b) => a + b, 0) / loudnessSamples.length : 0;
          const averageRms = rmsSamples.length ? rmsSamples.reduce((a, b) => a + b, 0) / rmsSamples.length : 0;
          
          if (isMounted) {
            const analysisResult = {
              bpm: finalBpm,
              loudness: averageLoudness,
              rms: averageRms, // On ajoute le RMS, utile pour l'énergie !
              key: 'N/A',
            };
            onAnalysisComplete(analysisResult);
            setAnalysisState('success');
          }
          
          if (audioContext.state !== 'closed') audioContext.close();
        };

        analyzer.start();
        source.start(0);

      } catch (error) {
        if (isMounted) {
          console.error("Erreur détaillée lors de l'analyse:", error);
          setErrorMessage(error.message || "Une erreur inconnue est survenue.");
          setAnalysisState('error');
        }
        if (audioContext && audioContext.state !== 'closed') audioContext.close();
      }
    };

    if (track && track.preview_url) {
      analyzeAudio(track.preview_url);
    }

    // Fonction de nettoyage
    return () => {
      isMounted = false; // Marquer le composant comme démonté
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [track, onAnalysisComplete]);

  // Le JSX d'affichage ne change pas
  return (
    <div className="beat-analyzer">
      {/* ... (le même JSX que précédemment) ... */}
    </div>
  );
};

export default BeatAnalyzer;