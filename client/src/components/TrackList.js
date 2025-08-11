import React from 'react';

const TrackList = ({ tracks, onTrackSelect, selectedTrack }) => {
  if (!tracks.length) {
    return (
      <div className="tracks-placeholder">
        <p>Recherchez des pistes pour voir les résultats</p>
      </div>
    );
  }

  return (
    <div className="tracks-list">
      <h3>Résultats de recherche ({tracks.length})</h3>
      {tracks.map((track) => (
        <div 
          key={track.id}
          className={`track-item ${selectedTrack?.id === track.id ? 'selected' : ''}`}
          onClick={() => onTrackSelect(track)}
        >
          <img 
            src={track.album.images[2]?.url || '/placeholder.png'} 
            alt={track.album.name}
            className="track-image"
          />
          <div className="track-info">
            <div className="track-name">{track.name}</div>
            <div className="track-artist">
              {track.artists.map(artist => artist.name).join(', ')}
            </div>
            <div className="track-album">{track.album.name}</div>
          </div>
          <div className="track-duration">
            {Math.floor(track.duration_ms / 60000)}:
            {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackList;