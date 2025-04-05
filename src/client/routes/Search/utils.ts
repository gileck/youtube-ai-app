/**
 * Format view count with commas and abbreviate if over 1M
 */
export const formatViewCount = (viewCount: string): string => {
  const count = parseInt(viewCount.replace(/[^0-9]/g, ''), 10);
  if (isNaN(count)) return viewCount;
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  } else {
    return `${count} views`;
  }
};

/**
 * Format duration from ISO 8601 format (PT1H2M3S) to readable format (1:02:03)
 */
export const formatDuration = (duration: string): string => {
  //match this 2:19:04
  if (duration.match(/^(\d+):?(\d+):?(\d+)?/)) {
    return duration;
  }
  // Handle empty or invalid duration
  if (!duration || !duration.startsWith('PT')) return '';

  
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  
  // Extract hours
  const hoursMatch = duration.match(/(\d+)H/);
  if (hoursMatch) hours = parseInt(hoursMatch[1], 10);
  
  // Extract minutes
  const minutesMatch = duration.match(/(\d+)M/);
  if (minutesMatch) minutes = parseInt(minutesMatch[1], 10);
  
  // Extract seconds
  const secondsMatch = duration.match(/(\d+)S/);
  if (secondsMatch) seconds = parseInt(secondsMatch[1], 10);
  
  // Format the duration
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};
