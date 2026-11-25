document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.getElementById('toggle-enabled');
    const statusPill = document.getElementById('status-pill');
    const controlDesc = document.getElementById('control-desc');
    const ytDot = document.getElementById('yt-dot');
    const ytText = document.getElementById('yt-text');
    const ytmDot = document.getElementById('ytm-dot');
    const ytmText = document.getElementById('ytm-text');

    function renderEnabledState(enabled) {
        toggle.checked = enabled;
        statusPill.textContent = enabled ? 'Active' : 'Off';
        statusPill.className = `pill ${enabled ? 'pill-active' : 'pill-inactive'}`;
        controlDesc.textContent = enabled
            ? 'Music syncs with video playback'
            : 'Automation is currently paused';
    }

    function renderTabStatus(dotEl, textEl, state) {
        if (state === 'playing') {
            dotEl.className = 'dot dot-playing';
            textEl.textContent = 'Playing';
        } else if (state === 'paused') {
            dotEl.className = 'dot dot-paused';
            textEl.textContent = 'Paused';
        } else {
            dotEl.className = 'dot dot-idle';
            textEl.textContent = 'Not open';
        }
    }

    async function refreshState() {
        try {
            const state = await chrome.runtime.sendMessage({
                type: 'GET_POPUP_STATE',
            });
            renderEnabledState(state.enabled);
            renderTabStatus(ytDot, ytText, state.ytState);
            renderTabStatus(ytmDot, ytmText, state.ytmState);
        } catch {
            renderEnabledState(false);
        }
    }

    toggle.addEventListener('change', async () => {
        const enabled = toggle.checked;
        renderEnabledState(enabled);
        await chrome.runtime.sendMessage({
            type: 'SET_ENABLED',
            enabled,
        });
    });

    await refreshState();

    const pollInterval = setInterval(refreshState, 1500);
    window.addEventListener('unload', () => clearInterval(pollInterval));
});
