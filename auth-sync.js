// auth-sync.js
// Runs on https://job-trackr-ten.vercel.app/*

function syncToken() {
    const token = localStorage.getItem('firebase_id_token');
    if (token) {
        chrome.runtime.sendMessage({ action: "updateToken", token: token });
    }
}

// Initial sync
syncToken();

// Watch for changes (login/logout)
window.addEventListener('storage', (e) => {
    if (e.key === 'firebase_id_token') {
        syncToken();
    }
});

// Periodically refresh token (Firebase tokens rotate)
setInterval(syncToken, 300000); // every 5 mins
