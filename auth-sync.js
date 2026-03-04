// auth-sync.js
// Runs on https://job-trackr-ten.vercel.app/*

function syncToken() {
    const token = localStorage.getItem('firebase_id_token');
    const email = localStorage.getItem('trackr_user_email');
    if (token && chrome.runtime?.id) {
        chrome.runtime.sendMessage({ action: "updateToken", token: token, email: email });
    }
}

// Initial sync
syncToken();

// Watch for changes (login/logout)
window.addEventListener('storage', (e) => {
    if (e.key === 'firebase_id_token' || e.key === 'trackr_user_email') {
        syncToken();
    }
});

// Periodically refresh token (Firebase tokens rotate)
setInterval(syncToken, 300000); // every 5 mins
