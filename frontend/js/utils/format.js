export const CATEGORIES = ['Noise', 'Trash', 'Parking', 'Safety', 'Maintenance', 'Other'];
export const STATUSES = ['open', 'acknowledged', 'resolved'];

export const categoryCopy = {
  Noise: 'Late nights, loud music, and street sound.',
  Trash: 'Overflow, dumping, and missed pickups.',
  Parking: 'Blocked lanes, sidewalks, and hydrants.',
  Safety: 'Lighting, hazards, and unsafe corners.',
  Maintenance: 'Potholes, leaks, and broken fixtures.',
  Other: 'Anything else the block should see.',
};

export const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const formatDay = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

export const timeAgo = (value) => {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const trendLabel = (n) => `${n >= 0 ? '+' : ''}${n}%`;
