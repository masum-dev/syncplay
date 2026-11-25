const DEFAULT_ENABLED = true;
const YT_URL_PATTERN = '*://www.youtube.com/*';
const YTM_URL_PATTERN = '*://music.youtube.com/*';

async function isEnabled() {
    const { enabled } = await chrome.storage.local.get({
        enabled: DEFAULT_ENABLED,
    });
    return Boolean(enabled);
}

async function clearBadge() {
    // Keeps the toolbar icon completely unobstructed; use "•" here if you ever want a minimal dot
    await chrome.action.setBadgeText({ text: '' });
}

async function getPlayingYtTabs() {
    const { playingYtTabs } = await chrome.storage.session.get({
        playingYtTabs: [],
    });
    return new Set(playingYtTabs);
}

async function setPlayingYtTabs(tabSet) {
    await chrome.storage.session.set({
        playingYtTabs: Array.from(tabSet),
    });
}

async function sendCommandToYtMusic(type) {
    const ytmTabs = await chrome.tabs.query({ url: YTM_URL_PATTERN });

    await Promise.all(
        ytmTabs.map(async (tab) => {
            if (!tab.id) return;
            try {
                await chrome.tabs.sendMessage(tab.id, { type });
            } catch {
                // Content script may not be injected yet if tab hasn't been reloaded
            }
        }),
    );
}

async function removePlayingYtTab(tabId) {
    const playingTabs = await getPlayingYtTabs();
    if (!playingTabs.has(tabId)) return;

    playingTabs.delete(tabId);
    await setPlayingYtTabs(playingTabs);

    if (playingTabs.size === 0 && (await isEnabled())) {
        await sendCommandToYtMusic('PLAY_MUSIC');
    }
}

async function queryGroupStatus(urlPattern) {
    const tabs = await chrome.tabs.query({ url: urlPattern });
    if (tabs.length === 0) return 'not_open';

    for (const tab of tabs) {
        if (!tab.id) continue;
        try {
            const response = await chrome.tabs.sendMessage(tab.id, {
                type: 'GET_STATUS',
            });
            if (response?.state === 'playing') {
                return 'playing';
            }
        } catch {
            // Ignore tabs without an active content script
        }
    }

    return 'paused';
}

chrome.runtime.onInstalled.addListener(async () => {
    const enabled = await isEnabled();
    await chrome.storage.local.set({ enabled });
    await clearBadge();
});

chrome.runtime.onStartup.addListener(async () => {
    await clearBadge();
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    await removePlayingYtTab(tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (
        changeInfo.url &&
        !changeInfo.url.startsWith('https://www.youtube.com/')
    ) {
        await removePlayingYtTab(tabId);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        switch (message.type) {
            case 'YT_PLAYING': {
                if (sender.tab?.id) {
                    const playingTabs = await getPlayingYtTabs();
                    playingTabs.add(sender.tab.id);
                    await setPlayingYtTabs(playingTabs);
                }

                if (await isEnabled()) {
                    await sendCommandToYtMusic('PAUSE_MUSIC');
                }
                sendResponse({ ok: true });
                break;
            }

            case 'YT_PAUSED': {
                if (sender.tab?.id) {
                    await removePlayingYtTab(sender.tab.id);
                } else if (await isEnabled()) {
                    await sendCommandToYtMusic('PLAY_MUSIC');
                }
                sendResponse({ ok: true });
                break;
            }

            case 'SET_ENABLED': {
                const enabled = Boolean(message.enabled);
                await chrome.storage.local.set({ enabled });
                await clearBadge();
                sendResponse({ enabled });
                break;
            }

            case 'GET_POPUP_STATE': {
                const [enabled, ytState, ytmState] = await Promise.all([
                    isEnabled(),
                    queryGroupStatus(YT_URL_PATTERN),
                    queryGroupStatus(YTM_URL_PATTERN),
                ]);
                sendResponse({ enabled, ytState, ytmState });
                break;
            }

            default:
                sendResponse({ ok: false });
        }
    })();

    return true;
});
