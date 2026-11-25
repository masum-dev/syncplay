(() => {
    function getPlayerElements() {
        const video =
            document.querySelector('video.html5-main-video') ||
            document.querySelector('video');
        const playPauseBtn = document.querySelector('#play-pause-button');
        return { video, playPauseBtn };
    }

    function hasLoadedTrack(video) {
        return Boolean(video && (video.src || video.readyState > 0));
    }

    function pauseMusic() {
        const { video, playPauseBtn } = getPlayerElements();
        if (!video || video.paused) return;

        if (playPauseBtn) {
            playPauseBtn.click();
        } else {
            video.pause();
        }
    }

    function playMusic() {
        const { video, playPauseBtn } = getPlayerElements();
        if (!hasLoadedTrack(video) || !video.paused) return;

        if (playPauseBtn) {
            playPauseBtn.click();
        } else {
            video.play().catch(() => {});
        }
    }

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message.type === 'PAUSE_MUSIC') {
            pauseMusic();
            sendResponse({ ok: true });
            return;
        }

        if (message.type === 'PLAY_MUSIC') {
            playMusic();
            sendResponse({ ok: true });
            return;
        }

        if (message.type === 'GET_STATUS') {
            const { video } = getPlayerElements();
            const isPlaying = Boolean(video && !video.paused && !video.ended);
            sendResponse({ state: isPlaying ? 'playing' : 'paused' });
        }
    });
})();
