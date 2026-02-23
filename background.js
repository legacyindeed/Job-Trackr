// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("Job Tracker Extension Installed");
  chrome.storage.local.set({ savedJobs: [], ignoredUrls: [] });
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateToken") {
    chrome.storage.local.set({
      firebaseToken: request.token,
      firebaseEmail: request.email
    });
    console.log("Auth token and email updated");
    return;
  }

  if (request.action === "syncToSheet") {
    // 1. Sync to Google Sheet (Existing)
    chrome.storage.sync.get(['webhookUrl'], (result) => {
      const url = result.webhookUrl;
      if (url) {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.job)
        }).catch(err => console.error('Error syncing to sheet:', err));
      }
    });

    // 2. Sync to Portal (Production)
    chrome.storage.local.get(['firebaseToken'], (result) => {
      const token = result.firebaseToken;

      fetch('https://job-trackr-ten.vercel.app/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(request.job)
      })
        .then(response => {
          if (!response.ok) throw new Error('Portal API failed');
          console.log('Synced successfully to Portal');
        })
        .catch(err => console.error('Error syncing to portal. Are you logged in?', err));
    });
    return;
  }

  if (request.action === "saveJob") {
    console.log("Job saved:", request.data);
    sendResponse({ status: "success" });
  }

  if (request.action === "getProfile") {
    chrome.storage.local.get(['firebaseToken'], async (result) => {
      const token = result.firebaseToken;
      if (!token) {
        sendResponse({ error: 'Not logged in' });
        return;
      }

      // Try local dev first if applicable, then production
      const PROD_URL = 'https://job-trackr-ten.vercel.app/api/user/profile';
      const LOCAL_URL = 'http://localhost:3000/api/user/profile';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        // We attempt to detect if we're in a dev environment or just try production
        // For now, let's try production with better error handling.
        const res = await fetch(PROD_URL, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Server Error: ${res.status}`);
        }

        const data = await res.json();
        sendResponse({ profile: data });
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Profile fetch error:', err);

        // If production fails, and it's a network error, maybe try local?
        // But for "Stuck on Fetching", it's usually because sendResponse wasn't called.
        sendResponse({ error: err.message || 'Failed to fetch profile' });
      }
    });
    return true; // Keep channel open
  }
});
