function renderJobs(jobs) {
    const list = document.getElementById('job-list');
    const emptyState = document.getElementById('empty-state');
    const countSpan = document.getElementById('count');

    list.innerHTML = '';
    countSpan.textContent = `${jobs.length} Jobs`;

    if (jobs.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Sort jobs by date descending (most recent first)
    const sortedJobs = [...jobs].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedJobs.forEach((job) => {
        const li = document.createElement('li');
        li.className = 'job-item';
        if (!job.synced) li.classList.add('new-job'); // Blue border for unsynced

        const originalIndex = jobs.indexOf(job);

        const dateObj = new Date(job.date);
        const dateFormatted = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        li.innerHTML = `
      <div class="job-info">
        <a href="${job.url}" target="_blank" class="job-title" title="${job.title}">${job.title || 'Unknown Role'}</a>
        <div class="job-meta">
          <span style="font-weight: 500;">${job.company || 'Unknown'}</span>
          <span style="color:#d1d5db">•</span>
          <span>${dateFormatted}</span>
          ${job.synced ? '<span class="status-badge synced">Synced</span>' : '<span class="status-badge">Local</span>'}
        </div>
      </div>
      <button class="delete-btn" title="Remove">&times;</button>
    `;

        li.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteJob(originalIndex);
        });

        list.appendChild(li);
    });
}

function deleteJob(index) {
    chrome.storage.local.get(['savedJobs'], (result) => {
        const jobs = result.savedJobs || [];
        jobs.splice(index, 1);
        chrome.storage.local.set({ savedJobs: jobs }, () => {
            renderJobs(jobs);
        });
    });
}

// Simulating Authentication
function checkAuth() {
    chrome.storage.local.get(['firebaseToken', 'firebaseEmail'], (result) => {
        const token = result.firebaseToken;
        const email = result.firebaseEmail;
        const indicator = document.getElementById('sync-indicator');
        const statusText = document.getElementById('sync-text');
        const loginBtn = document.getElementById('login-btn');
        const syncBtn = document.getElementById('sync-now-btn');
        const emailDisplay = document.getElementById('user-email');

        if (token) {
            // Logged In
            indicator.style.backgroundColor = '#10b981'; // Green
            statusText.innerHTML = '<span class="sync-dot connected"></span> Connected';
            if (emailDisplay) emailDisplay.textContent = email ? `(${email})` : '';
            loginBtn.style.display = 'none';
            syncBtn.style.display = 'block';
        } else {
            // Logged Out
            indicator.style.backgroundColor = '#ef4444'; // Red
            statusText.innerHTML = '<span class="sync-dot"></span> Not Connected';
            if (emailDisplay) emailDisplay.textContent = '';
            loginBtn.style.display = 'block';
            syncBtn.style.display = 'none';
        }
    });
}

async function login() {
    // Open the portal sign-up page
    chrome.tabs.create({ url: 'https://job-trackr-ten.vercel.app/signup' });

    // The auth-sync.js content script will automatically capture the token 
    // when the user logs in on the portal and send it to the background script.

    // For visual feedback in the popup, we'll just wait for the storage to update
    setTimeout(checkAuth, 2000);
}

async function syncNow() {
    const btn = document.getElementById('sync-now-btn');
    btn.textContent = "Syncing...";

    chrome.storage.local.get(['savedJobs', 'firebaseToken'], async (result) => {
        let jobs = result.savedJobs || [];
        const token = result.firebaseToken;

        if (!token) {
            alert("No auth token found. Please sign in to the portal.");
            btn.textContent = "Sync Now";
            return;
        }

        let successCount = 0;

        for (const job of jobs) {
            if (job.synced) continue;

            try {
                const res = await fetch('https://job-trackr-ten.vercel.app/api/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(job)
                });

                if (res.ok) {
                    job.synced = true;
                    successCount++;
                }
            } catch (e) {
                console.error("Sync failed for job", job.title, e);
            }
        }

        // Save status back
        chrome.storage.local.set({ savedJobs: jobs }, () => {
            renderJobs(jobs);
            btn.textContent = "Sync Now";
            if (successCount > 0) alert(`Synced ${successCount} jobs to Cloud Portal!`);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['savedJobs'], (result) => {
        renderJobs(result.savedJobs || []);
    });

    checkAuth();

    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('sync-now-btn').addEventListener('click', syncNow);
    document.getElementById('clear-all').addEventListener('click', () => {
        if (confirm("Clear local history?")) {
            chrome.storage.local.set({ savedJobs: [] }, () => renderJobs([]));
        }
    });
    document.getElementById('open-portal').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://job-trackr-ten.vercel.app' });
    });

    // Local Export
    document.getElementById('export-local').addEventListener('click', () => {
        chrome.storage.local.get(['savedJobs'], (result) => {
            const jobs = result.savedJobs || [];
            if (jobs.length === 0) { alert("No jobs."); return; }

            const headers = "Date,Role,Company,Location,Salary,Type,Status,URL";
            const rows = jobs.map(j => [
                `"${new Date(j.date).toLocaleDateString()}"`,
                `"${(j.title || '').replace(/"/g, '""')}"`,
                `"${(j.company || '').replace(/"/g, '""')}"`,
                `"${(j.location || '').replace(/"/g, '""')}"`,
                `"${(j.salary || '').replace(/"/g, '""')}"`,
                `"${(j.jobType || '').replace(/"/g, '""')}"`,
                `"${(j.status || 'Applied').replace(/"/g, '""')}"`,
                `"${j.url}"`
            ].join(","));

            const csv = [headers, ...rows].join("\n");
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `local_jobs_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        });
    });
});
