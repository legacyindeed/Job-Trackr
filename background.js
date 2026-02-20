// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("Job Tracker Extension Installed");
  chrome.storage.local.set({ savedJobs: [], ignoredUrls: [] });
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateToken") {
    chrome.storage.local.set({ firebaseToken: request.token });
    console.log("Auth token updated");
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
  }
});

// Optional: Badge update or other logic could go here
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveJob") {
    // Legacy support or future exp
    console.log("Job saved:", request.data);
    sendResponse({ status: "success" });
  }
});
