import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Box, IconButton, Paper, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Forward10Icon from '@mui/icons-material/Forward10';
import Replay10Icon from '@mui/icons-material/Replay10';

function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Define proper YouTube Player interface for mini player
declare global {
    interface Window {
        YT: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Player: any;
            PlayerState: {
                PLAYING: number;
                PAUSED: number;
                ENDED: number;
                BUFFERING: number;
            };
        };
        onYouTubeIframeAPIReady: () => void;
    }
}

interface YTPlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlayerState: () => number;
    destroy: () => void;
}

interface MiniPlayerProps {
    videoId: string;
    visible: boolean;
    onClose: () => void;
    currentTime?: number;
}

interface MiniPlayerApiRef {
    play: () => void;
    pause: () => void;
    getCurrentTime: () => number;
    seekTo: (time: number) => void;
    isPlaying: () => boolean;
}

export const MiniPlayer = forwardRef<MiniPlayerApiRef, MiniPlayerProps>(({
    videoId,
    visible,
    onClose,
    currentTime = 0
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerInstanceRef = useRef<YTPlayer | null>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [ytApiLoaded, setYtApiLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [playerTime, setPlayerTime] = useState(currentTime);
    const playerReadyRef = useRef(false);
    const timeUpdateIntervalRef = useRef<number | null>(null);

    // Load YouTube API on first render
    useEffect(() => {
        if (!window.YT) {
            // Only load API if it's not already loaded
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';

            // Define callback for when API is ready
            window.onYouTubeIframeAPIReady = () => {
                console.log('YouTube iframe API ready');
                setYtApiLoaded(true);
            };

            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        } else {
            setYtApiLoaded(true);
        }

        // Clean up any existing interval on unmount
        return () => {
            if (timeUpdateIntervalRef.current) {
                window.clearInterval(timeUpdateIntervalRef.current);
                timeUpdateIntervalRef.current = null;
            }
        };
    }, []);

    // Toggle play/pause
    const togglePlayPause = () => {
        if (!playerInstanceRef.current || !playerReadyRef.current) return;

        try {
            if (isPlaying) {
                playerInstanceRef.current.pauseVideo();
            } else {
                playerInstanceRef.current.playVideo();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.error("Error toggling play/pause:", error);
        }
    };

    // Skip forward 10 seconds
    const skipForward = () => {
        if (!playerInstanceRef.current || !playerReadyRef.current) return;

        try {
            const newTime = playerTime + 10;
            playerInstanceRef.current.seekTo(newTime, true);
            setPlayerTime(newTime);
        } catch (error) {
            console.error("Error skipping forward:", error);
        }
    };

    // Skip backward 10 seconds
    const skipBackward = () => {
        if (!playerInstanceRef.current || !playerReadyRef.current) return;

        try {
            const newTime = Math.max(0, playerTime - 10);
            playerInstanceRef.current.seekTo(newTime, true);
            setPlayerTime(newTime);
        } catch (error) {
            console.error("Error skipping backward:", error);
        }
    };

    // Setup time update interval
    const setupTimeUpdateInterval = useCallback(() => {
        // Clear any existing interval
        if (timeUpdateIntervalRef.current) {
            window.clearInterval(timeUpdateIntervalRef.current);
            timeUpdateIntervalRef.current = null;
        }

        // Only set up interval if player is ready and playing
        if (playerInstanceRef.current && playerReadyRef.current && isPlaying) {
            console.log("Setting up time update interval with player:", playerInstanceRef.current);

            timeUpdateIntervalRef.current = window.setInterval(() => {
                try {
                    // Double-check player still exists and is ready before calling methods
                    if (playerInstanceRef.current &&
                        playerReadyRef.current &&
                        typeof playerInstanceRef.current.getCurrentTime === 'function') {

                        setPlayerTime(playerInstanceRef.current.getCurrentTime());
                    } else {
                        // If player isn't ready or getCurrentTime isn't a function, clear the interval
                        if (timeUpdateIntervalRef.current) {
                            console.warn("Player not ready in interval, clearing...");
                            window.clearInterval(timeUpdateIntervalRef.current);
                            timeUpdateIntervalRef.current = null;
                        }
                    }
                } catch (error) {
                    console.error("Error updating time:", error);
                    // Clear interval on error
                    if (timeUpdateIntervalRef.current) {
                        window.clearInterval(timeUpdateIntervalRef.current);
                        timeUpdateIntervalRef.current = null;
                    }
                }
            }, 1000);
        }
    }, [isPlaying]);

    // Update interval when playing state changes
    useEffect(() => {
        setupTimeUpdateInterval();
        return () => {
            if (timeUpdateIntervalRef.current) {
                window.clearInterval(timeUpdateIntervalRef.current);
                timeUpdateIntervalRef.current = null;
            }
        };
    }, [isPlaying, setupTimeUpdateInterval]);

    // Handle minimizing/maximizing state
    useEffect(() => {
        // When going from minimized to not minimized, we need to reinitialize the player
        // if it doesn't exist or was destroyed
        if (!minimized && !playerInstanceRef.current && ytApiLoaded && visible) {
            initializePlayer();
        }
    }, [minimized, ytApiLoaded, visible]);

    // Add this useEffect to handle minimizing state to preserve playback
    useEffect(() => {
        // When minimizing, we need to keep track of the playing state
        // but the player container is removed from DOM
        if (minimized && playerInstanceRef.current && playerReadyRef.current) {
            // Store current state but don't stop playback
            // The audio will continue playing even though video is hidden
            console.log("Player minimized but continuing playback");
        }
    }, [minimized]);

    // Initialize the player
    const initializePlayer = useCallback(() => {
        if (!playerContainerRef.current || !videoId || !visible || !ytApiLoaded) return;

        // Clear previous player
        if (playerInstanceRef.current) {
            playerInstanceRef.current.destroy();
            playerInstanceRef.current = null;
            playerReadyRef.current = false;
        }

        console.log("Initializing YouTube player with container:", playerContainerRef.current);
        playerContainerRef.current.innerHTML = '';

        // Create div for player
        const playerDiv = document.createElement('div');
        playerDiv.id = 'mini-youtube-player';
        playerContainerRef.current.appendChild(playerDiv);

        // Set iframe dimensions directly
        playerDiv.style.width = '100%';
        playerDiv.style.height = '100%';

        // Create player
        if (window.YT && window.YT.Player) {
            // Cast to any to bypass TypeScript restrictions
            const playerOptions = {
                videoId,
                width: '300',
                height: '169',
                playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    autoplay: 0, // Don't autoplay
                    controls: 1,
                    disablekb: 1,
                    fs: 0,
                    start: Math.floor(currentTime)
                },
                events: {
                    onReady: (event: { target: YTPlayer }) => {
                        console.log('Mini player ready');
                        playerInstanceRef.current = event.target;
                        playerReadyRef.current = true;
                        event.target.seekTo(currentTime, true);
                        setPlayerTime(currentTime);
                    },
                    onStateChange: (event: { data: number }) => {
                        const isPlayerPlaying = event.data === window.YT.PlayerState.PLAYING;
                        setIsPlaying(isPlayerPlaying);
                    },
                    onError: () => {
                        console.error('Mini player error occurred');
                    }
                }
            };

            try {
                console.log("Creating new YouTube player");
                playerInstanceRef.current = new window.YT.Player(
                    'mini-youtube-player',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    playerOptions as any
                );
            } catch (error) {
                console.error("Error creating YouTube player:", error);
            }
        } else {
            console.error('YouTube API not available for mini player');
        }
    }, [videoId, currentTime, ytApiLoaded, visible]);

    // Initialize player when component mounts or dependencies change
    useEffect(() => {
        // Still initialize player when visible, regardless of minimized state
        if (!visible || !ytApiLoaded) return;

        initializePlayer();

        return () => {
            // Cleanup player on unmount or when dependencies change
            if (playerInstanceRef.current) {
                playerInstanceRef.current.destroy();
                playerInstanceRef.current = null;
                playerReadyRef.current = false;
            }
        };
    }, [videoId, visible, ytApiLoaded, initializePlayer]);

    // Update current time when prop changes
    useEffect(() => {
        if (currentTime !== undefined && playerInstanceRef.current && playerReadyRef.current) {
            try {
                playerInstanceRef.current.seekTo(currentTime, true);
                setPlayerTime(currentTime);
            } catch (error) {
                console.error('Error seeking to time:', error);
            }
        }
    }, [currentTime]);

    useImperativeHandle(ref, () => ({
        play: () => {
            // If minimized, we need to un-minimize first to show the player
            if (minimized) {
                setMinimized(false);
                // We'll need to wait for the player to initialize
                setTimeout(() => {
                    if (playerInstanceRef.current && playerReadyRef.current) {
                        try {
                            playerInstanceRef.current.playVideo();
                            setIsPlaying(true);
                        } catch (error) {
                            console.error("Error playing video:", error);
                        }
                    }
                }, 500); // Give some time for the player to initialize
            } else if (playerInstanceRef.current && playerReadyRef.current) {
                try {
                    playerInstanceRef.current.playVideo();
                    setIsPlaying(true);
                } catch (error) {
                    console.error("Error playing video:", error);
                }
            }
        },
        pause: () => {
            if (playerInstanceRef.current && playerReadyRef.current) {
                try {
                    playerInstanceRef.current.pauseVideo();
                    setIsPlaying(false);
                } catch (error) {
                    console.error("Error pausing video:", error);
                }
            }
        },
        getCurrentTime: () => {
            if (playerInstanceRef.current && playerReadyRef.current) {
                try {
                    return playerInstanceRef.current.getCurrentTime();
                } catch (error) {
                    console.error("Error getting current time:", error);
                }
            }
            return playerTime;
        },
        seekTo: (time: number) => {
            // Force mini player to be visible when seeking
            if (!visible || !playerContainerRef.current) {
                console.log("Making mini player visible for seeking to:", time);
                // Tell parent component to show mini player again
                if (onClose) {
                    // This is a hack - we call onClose with a special parameter that parent can check
                    // The parent component should check for this and NOT close the player
                    // @ts-expect-error - we're adding a parameter that's not in the function signature
                    onClose({ reopenForSeek: true, time });
                }
                return;
            }

            // If minimized, we need to un-minimize first to show the player
            if (minimized) {
                setMinimized(false);
                // Wait for the player to initialize before seeking
                setTimeout(() => {
                    if (playerInstanceRef.current && playerReadyRef.current) {
                        try {
                            playerInstanceRef.current.seekTo(time, true);
                            setPlayerTime(time);
                        } catch (error) {
                            console.error("Error seeking to time:", error);
                        }
                    } else {
                        console.warn("Player still not ready after un-minimizing, retrying...");
                        // Try to reinitialize and seek again
                        initializePlayer();
                        setTimeout(() => {
                            if (playerInstanceRef.current && playerReadyRef.current) {
                                try {
                                    playerInstanceRef.current.seekTo(time, true);
                                    setPlayerTime(time);
                                } catch (error) {
                                    console.error("Error seeking on retry:", error);
                                }
                            }
                        }, 1000);
                    }
                }, 500); // Give some time for the player to initialize
                return;
            }

            if (!playerInstanceRef.current || !playerReadyRef.current) {
                console.warn("Cannot seek: player not ready, attempting to initialize");
                // Try to initialize the player first
                initializePlayer();

                // Then try seeking after a delay
                setTimeout(() => {
                    if (playerInstanceRef.current && playerReadyRef.current) {
                        try {
                            playerInstanceRef.current.seekTo(time, true);
                            setPlayerTime(time);
                        } catch (error) {
                            console.error("Error seeking after initialization:", error);
                        }
                    } else {
                        console.error("Failed to initialize player for seeking");
                    }
                }, 1000);
                return;
            }

            if (typeof playerInstanceRef.current.seekTo !== 'function') {
                console.error("seekTo is not a function on player instance:", playerInstanceRef.current);
                return;
            }

            try {
                playerInstanceRef.current.seekTo(time, true);
                setPlayerTime(time);
            } catch (error) {
                console.error("Error seeking to time:", error, "Player instance:", playerInstanceRef.current);
            }
        },
        isPlaying: () => {
            return isPlaying;
        },
    }), [isPlaying, playerTime, minimized, visible, initializePlayer, onClose]);

    // Modify the toggleMinimize function to preserve playback
    const toggleMinimize = () => {
        // Remember if we were playing before toggle
        const wasPlaying = isPlaying;

        // Toggle minimized state
        setMinimized(!minimized);

        // If we're un-minimizing and was playing, make sure we keep playing
        if (minimized && wasPlaying) {
            // We need to wait a bit for the player container to be added back to the DOM
            setTimeout(() => {
                if (playerInstanceRef.current && playerReadyRef.current) {
                    try {
                        playerInstanceRef.current.playVideo();
                    } catch (error) {
                        console.error("Error resuming video after un-minimizing:", error);
                    }
                }
            }, 300); // Wait for DOM update
        }
    };

    if (!visible) return null;

    return (
        <Paper
            elevation={4}
            sx={{
                position: 'fixed',
                bottom: 70,
                right: 16,
                width: minimized ? '280px' : '320px',
                height: minimized ? '60px' : '180px',
                zIndex: 1000,
                overflow: 'hidden',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
            }}
            ref={containerRef}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    zIndex: 1001,
                    display: 'flex',
                    gap: '4px',
                    bgcolor: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                }}
            >
                <IconButton
                    size="small"
                    onClick={toggleMinimize}
                    sx={{
                        color: 'white',
                        padding: '4px',
                        '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.7)',
                        }
                    }}
                >
                    {minimized ? <OpenInFullIcon fontSize="small" /> : <MinimizeIcon fontSize="small" />}
                </IconButton>
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{
                        color: 'white',
                        padding: '4px',
                        '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.7)',
                        }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Video Container - always present but hidden when minimized */}
            <Box
                ref={playerContainerRef}
                sx={{
                    flexGrow: 1,
                    bgcolor: 'black',
                    position: 'relative',
                    height: minimized ? 0 : '100%',
                    overflow: 'hidden',
                    visibility: minimized ? 'hidden' : 'visible',
                    transition: 'height 0.3s ease'
                }}
            />

            {/* Minimized controls - show only when minimized */}
            {minimized && (
                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: 'black',
                        px: 2,
                        justifyContent: 'space-between'
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton
                            onClick={skipBackward}
                            sx={{
                                color: 'white',
                                p: 1
                            }}
                        >
                            <Replay10Icon />
                        </IconButton>

                        <IconButton
                            onClick={togglePlayPause}
                            sx={{
                                color: 'white',
                                p: 1
                            }}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>

                        <IconButton
                            onClick={skipForward}
                            sx={{
                                color: 'white',
                                p: 1
                            }}
                        >
                            <Forward10Icon />
                        </IconButton>
                    </Stack>

                    <Box
                        sx={{
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: 'medium'
                        }}
                    >
                        {formatTime(playerTime)}
                    </Box>
                </Stack>
            )}
        </Paper>
    );
});

MiniPlayer.displayName = 'MiniPlayer';

export default MiniPlayer; 