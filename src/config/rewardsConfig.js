/**
 * Belohnungs-Konfiguration.
 * Videos liegen auf https://tbe20.com/rechenapp/videos/
 * Jeder bestandene Test (≥90% richtig) schaltet das nächste Video frei.
 * Die Videos werden in der Reihenfolge (order) freigeschaltet.
 */
const VIDEO_BASE = 'https://tbe20.com/rechenapp/videos';

const rewardsConfig = [
  {
    id: 'reward-1',
    title: 'Billie Begrüßung',
    videoUrl: `${VIDEO_BASE}/billie-begruessung.mp4`,
    order: 1,
  },
  {
    id: 'reward-2',
    title: 'Billie Baum - Folge 1',
    videoUrl: `${VIDEO_BASE}/billie-baum-1.mp4`,
    order: 2,
  },
  {
    id: 'reward-3',
    title: 'Billie Baum - Folge 2',
    videoUrl: `${VIDEO_BASE}/billie-baum-2.mp4`,
    order: 3,
  },
  {
    id: 'reward-4',
    title: 'Billie Baum - Folge 3',
    videoUrl: `${VIDEO_BASE}/billie-baum-3.mp4`,
    order: 4,
  },
  {
    id: 'reward-5',
    title: 'Billie Baum - Folge 4',
    videoUrl: `${VIDEO_BASE}/billie-baum-4.mp4`,
    order: 5,
  },
  {
    id: 'reward-6',
    title: 'Billie Baum - Folge 5',
    videoUrl: `${VIDEO_BASE}/billie-baum-5.mp4`,
    order: 6,
  },
  {
    id: 'reward-7',
    title: 'Billie Baum - Folge 6',
    videoUrl: `${VIDEO_BASE}/billie-baum-6.mp4`,
    order: 7,
  },
  {
    id: 'reward-8',
    title: 'Billie Laden',
    videoUrl: `${VIDEO_BASE}/billie-laden.mp4`,
    order: 8,
  },
];

export default rewardsConfig;
