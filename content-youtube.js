(() => {
    const PAUSE_DEBOUNCE_MS = 350;
    const attachedVideos = new WeakSet();
    let pauseDebounceTimer = null;

    function isVideoPage() {
        const { pathname } = window.location;
        return pathname.startsWith('/watch') || pathname.startsWith('/shorts');
    }

    function getMainVideo() {
        return document.querySelector('video.html5-main-video');
    }

    function clearPauseTimer() {
        if (pauseDebounceTimer) {
            clearTimeout(pauseDebounceTimer);
            pauseDebounceTimer = null;
        }
    }

    function safeSendMessage(payload) {
        try {
            chrome.runtime.sendMessage(payload).catch(() => {});
        } catch {
            // Extension context invalidated after reload
        }
    }

    function notifyPlaying() {
        clearPauseTimer();
        safeSendMessage({ type: 'YT_PLAYING' });
    }

    function notifyPaused() {
        clearPauseTimer();
        safeSendMessage({ type: 'YT_PAUSED' });
    }

    function attachListeners(video) {
        if (!video || attachedVideos.has(video)) return;
        attachedVideos.add(video);

        video.addEventListener('play', () => {
            if (!isVideoPage()) return;
            notifyPlaying();
        });

        video.addEventListener('pause', () => {
            if (!isVideoPage()) return;

            clearPauseTimer();
            pauseDebounceTimer = setTimeout(() => {
                if (video.paused && !video.seeking) {
                    safeSendMessage({ type: 'YT_PAUSED' });
                }
            }, PAUSE_DEBOUNCE_MS);
        });

        video.addEventListener('ended', () => {
            if (!isVideoPage()) return;
            notifyPaused();
        });

        // Catch videos that started autoplaying before this script attached
        if (isVideoPage() && !video.paused && !video.ended) {
            notifyPlaying();
        }
    }

    function scanForVideo() {
        const video = getMainVideo();
        if (video) {
            attachListeners(video);
        }
    }

    const observer = new MutationObserver(() => {
        scanForVideo();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });

    window.addEventListener('yt-navigate-finish', () => {
        scanForVideo();
        if (!isVideoPage()) {
            notifyPaused();
        }
    });

    window.addEventListener('beforeunload', () => {
        clearPauseTimer();
    });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message.type === 'GET_STATUS') {
            const video = getMainVideo();
            const isPlaying = Boolean(
                isVideoPage() && video && !video.paused && !video.ended,
            );
            sendResponse({ state: isPlaying ? 'playing' : 'paused' });
        }
    });

    scanForVideo();
})();
