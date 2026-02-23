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
    chrome.storage.local.get(['firebaseToken'], (result) => {
      const token = result.firebaseToken;
      if (!token) {
        sendResponse({ error: 'Not logged in. Please log in to the portal first.' });
        return;
      }

      const API_URL = 'https://job-trackr-ten.vercel.app/api/user/profile';

      fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => sendResponse({ profile: data }))
        .catch(err => {
          console.error('Profile fetch error:', err);
          sendResponse({ error: 'Failed to fetch profile' });
        });
    });
    return true; // Keep channel open
  }
});
