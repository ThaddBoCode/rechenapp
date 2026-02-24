import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRewardsConfig, getUserRewards, markVideoWatched } from '../../services/firestoreService';
import './RewardsScreen.css';

export default function RewardsScreen() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [unlockedRewards, setUnlockedRewards] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getRewardsConfig(), getUserRewards(user.uid)])
      .then(([rewardsData, unlocked]) => {
        setRewards(rewardsData);
        setUnlockedRewards(unlocked);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleWatchVideo = async (reward) => {
    setActiveVideo(reward);
    if (user && !unlockedRewards[reward.id]?.videoWatched) {
      await markVideoWatched(user.uid, reward.id).catch(() => {});
      setUnlockedRewards((prev) => ({
        ...prev,
        [reward.id]: { ...prev[reward.id], videoWatched: true },
      }));
    }
  };

  const isUnlocked = (rewardId) => !!unlockedRewards[rewardId];
  const isWatched = (rewardId) => unlockedRewards[rewardId]?.videoWatched;

  if (loading) {
    return (
      <div className="screen animate-fade-in">
        <div className="header"><h1>🎁 Belohnungen</h1></div>
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>Lade...</div>
      </div>
    );
  }

  return (
    <div className="screen animate-fade-in">
      <div className="header"><h1>🎁 Belohnungen</h1></div>

      {activeVideo && (
        <div className="video-modal" onClick={() => setActiveVideo(null)}>
          <div className="video-container" onClick={(e) => e.stopPropagation()}>
            <button className="video-close" onClick={() => setActiveVideo(null)}>✕</button>
            <h3 className="video-title">{activeVideo.title}</h3>
            <video
              src={activeVideo.videoUrl}
              controls
              autoPlay
              className="video-player"
            />
          </div>
        </div>
      )}

      {rewards.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Noch keine Belohnungen eingerichtet.
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
            Belohnungen werden vom Admin in Firebase konfiguriert.
          </p>
        </div>
      ) : (
        <div className="rewards-list">
          {rewards.map((reward) => {
            const unlocked = isUnlocked(reward.id);
            const watched = isWatched(reward.id);
            return (
              <div
                key={reward.id}
                className={`reward-item ${unlocked ? 'unlocked' : 'locked'} ${watched ? 'watched' : ''}`}
              >
                <div className="reward-icon">
                  {unlocked ? (watched ? '✅' : '🎬') : '🔒'}
                </div>
                <div className="reward-info">
                  <div className="reward-title">{reward.title}</div>
                  <div className="reward-desc">{reward.description}</div>
                </div>
                {unlocked && reward.videoUrl && (
                  <button
                    className="reward-play-btn"
                    onClick={() => handleWatchVideo(reward)}
                  >
                    ▶
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="card" style={{ marginTop: '16px', padding: '16px' }}>
        <div className="section-label" style={{ margin: '0 0 8px' }}>Dein Fortschritt</div>
        <div className="reward-progress-text">
          {Object.keys(unlockedRewards).length} / {rewards.length} Belohnungen freigeschaltet
        </div>
        <div className="reward-progress-bar">
          <div
            className="reward-progress-fill"
            style={{
              width: rewards.length > 0
                ? `${(Object.keys(unlockedRewards).length / rewards.length) * 100}%`
                : '0%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
