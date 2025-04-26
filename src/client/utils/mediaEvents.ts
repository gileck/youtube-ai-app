/**
 * Media Event Bus
 * This provides a central communication system for media playback actions
 * across different components without creating direct dependencies between UI components.
 */

// Define the callback type for timestamp jump events
type TimestampCallback = (timestamp: number) => void;

// Media events singleton
export const mediaEvents = {
    timestampCallbacks: new Set<TimestampCallback>(),

    // Method to request jumping to a specific timestamp
    jumpToTimestamp: (timestamp: number) => {
        mediaEvents.timestampCallbacks.forEach(callback => callback(timestamp));
    },

    // Method to subscribe to timestamp jump events
    onTimestampJump: (callback: TimestampCallback) => {
        mediaEvents.timestampCallbacks.add(callback);
        return () => {
            mediaEvents.timestampCallbacks.delete(callback);
        };
    }
}; 