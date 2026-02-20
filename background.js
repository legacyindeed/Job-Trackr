// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("Job Tracker Extension Installed");
  chrome.storage.local.set({ savedJobs: [], ignoredUrls: [] });
});

// Listen for sync messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

    // 2. Sync to Local Portal (New)
    fetch('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.job)
    })
      .then(response => {
        if (!response.ok) throw new Error('Portal API failed');
        console.log('Synced successfully to Local Portal');
      })
      .catch(err => console.error('Error syncing to portal. Is it running?', err));
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
