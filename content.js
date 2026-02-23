// Check if current page is likely a job application
function isJobPage() {
    const url = window.location.href.toLowerCase();
    const knownDomains = [
        'linkedin.com/jobs', 'indeed.com', 'glassdoor.com', 'monster.com',
        'ziprecruiter.com', 'greenhouse.io', 'lever.co', 'workday.com',
        'myworkdayjobs.com', 'ashby.hq', 'ashbyhq.com', 'smartrecruiters.com',
        'breezy.hr', 'applytojob.com', 'careers.google.com', 'careers.microsoft.com',
        'jobs.apple.com', 'amazon.jobs', 'facebook.com/careers', 'netflix.com/jobs',
        'icims.com', 'jobvite.com', 'taleo.net', 'brassring.com', 'avature.net',
        'oraclecloud.com', 'successfactors.com', 'recruitee.com', 'workable.com',
        'bamboohr.com', 'fountain.com', 'hired.com', 'ycombinator.com/jobs',
        'wellfound.com', 'remotive.com', 'weworkremotely.com', 'arc.dev',
        'himalayas.app', 'otta.com', 'lifeattiktok.com', 'workforcenow.adp.com',
        'adp.com', 'pinpointhq.com', 'rippling.com', 'societegenerale.com'
    ];

    const keywords = [
        '/job/', '/jobs/', '/career/', '/careers/', '/apply',
        '/vacancy/', '/position/', '/posting/', '/job-offers/'
    ];

    const domainMatch = knownDomains.some(domain => url.includes(domain));
    const keywordMatch = keywords.some(keyword => url.includes(keyword));
    const isTikTok = url.includes('lifeattiktok.com/search/');

    return domainMatch || keywordMatch || isTikTok;
}

// Function to inject the overlay
function injectTrackerOverlay() {
    if (document.getElementById('job-tracker-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'job-tracker-overlay';

    const details = extractJobDetails();
    const pageTitle = document.title || 'Unknown Job';
    let displayTitle = details.title || pageTitle.split('-')[0].split('|')[0].trim();

    const prefixes = ['Job Application for', 'Application for', 'Apply for', 'Careers at'];
    const prefixPattern = new RegExp(`^(${prefixes.join('|')})\\s+`, 'i');
    displayTitle = displayTitle.replace(prefixPattern, '').trim();

    overlay.innerHTML = `
    <button class="close-btn">&times;</button>
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span style="font-size: 24px;">💼</span>
        <h3 style="margin: 0; font-size: 16px; color: #1e293b;">Job Application Detected</h3>
    </div>
    <p style="margin: 0 0 16px 0; color: #64748b; font-weight: 600; font-size: 14px;" title="${pageTitle}">${displayTitle}</p>
    <div class="actions">
      <button class="btn-autofill">Autofill Application</button>
      <button class="btn-ignore">Did Not Apply</button>
      <button class="btn-track">Yes, I Applied</button>
    </div>
  `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.close-btn');
    const ignoreBtn = overlay.querySelector('.btn-ignore');
    const trackBtn = overlay.querySelector('.btn-track');
    const autofillBtn = overlay.querySelector('.btn-autofill');

    autofillBtn.addEventListener('click', () => {
        autofillBtn.textContent = 'Fetching...';
        chrome.runtime.sendMessage({ action: "getProfile" }, async (response) => {
            const profile = response?.profile;
            const hasData = profile && typeof profile === 'object' && Object.keys(profile).length > 0;

            if (response && !response.error && hasData) {
                const count = await autofillForm(profile);
                if (count > 0) {
                    autofillBtn.textContent = `Autofilled ${count} fields!`;
                    autofillBtn.style.backgroundColor = '#10b981';
                } else {
                    autofillBtn.textContent = 'No matching fields';
                    autofillBtn.style.backgroundColor = '#f59e0b';
                }

                setTimeout(() => {
                    autofillBtn.textContent = 'Autofill Application';
                    autofillBtn.style.backgroundColor = '';
                }, 3000);
            } else {
                autofillBtn.textContent = response?.error === 'Not logged in' ? 'Login to Portal' : 'No Data Found';
                autofillBtn.style.backgroundColor = '#ef4444';
                setTimeout(() => {
                    autofillBtn.textContent = 'Autofill Application';
                    autofillBtn.style.backgroundColor = '';
                }, 3000);
            }
        });
    });

    closeBtn.addEventListener('click', () => overlay.remove());

    // --- AI Learning ---
    const handleInputLearn = (e) => {
        const input = e.target;
        if (!input.value || input.value.length < 2) return;

        let labelText = '';
        if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) labelText = label.innerText;
        }
        if (!labelText) {
            const parentLabel = input.closest('label');
            if (parentLabel) labelText = parentLabel.innerText;
        }

        if (labelText && labelText.length > 3) {
            chrome.runtime.sendMessage({
                action: "learnResponse",
                question: labelText.replace(/\*/g, '').trim(),
                answer: input.value
            });
        }
    };

    document.addEventListener('blur', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            handleInputLearn(e);
        }
    }, true);

    ignoreBtn.addEventListener('click', () => {
        chrome.storage.local.get(['ignoredUrls'], (result) => {
            const ignored = result.ignoredUrls || [];
            ignored.push(window.location.href);
            chrome.storage.local.set({ ignoredUrls: ignored }, () => overlay.remove());
        });
    });

    trackBtn.addEventListener('click', () => {
        const details = extractJobDetails();
        let finalTitle = details.title || pageTitle.split('-')[0].split('|')[0].trim();
        const prefixes = ['Job Application for', 'Application for', 'Apply for', 'Careers at'];
        const prefixPattern = new RegExp(`^(${prefixes.join('|')})\\s+`, 'i');
        finalTitle = finalTitle.replace(prefixPattern, '').trim();

        const jobData = {
            title: finalTitle,
            url: window.location.href,
            company: details.company || parseCompany(window.location.hostname, window.location.pathname),
            location: details.location,
            salary: details.salary,
            jobType: details.jobType,
            description: details.description || '',
            date: new Date().toISOString(),
            status: 'Applied'
        };

        chrome.storage.local.get(['savedJobs'], (result) => {
            const jobs = result.savedJobs || [];
            if (jobs.some(j => j.url === jobData.url)) {
                trackBtn.textContent = 'Already Applied';
                setTimeout(() => overlay.remove(), 2000);
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const isContentDuplicate = jobs.some(j => {
                const sameTitle = (j.title || '').toLowerCase().trim() === (jobData.title || '').toLowerCase().trim();
                const sameCompany = (j.company || '').toLowerCase().trim() === (jobData.company || '').toLowerCase().trim();
                return sameTitle && sameCompany && (j.date || '').split('T')[0] === today;
            });

            if (isContentDuplicate) {
                if (!confirm(`Duplicate detected for "${jobData.title}" today. Save anyway?`)) {
                    overlay.remove();
                    return;
                }
            }

            jobs.push(jobData);
            chrome.storage.local.set({ savedJobs: jobs }, () => {
                trackBtn.textContent = 'Applied!';
                trackBtn.disabled = true;
                setTimeout(() => overlay.remove(), 2000);
                chrome.runtime.sendMessage({ action: "syncToSheet", job: jobData });
            });
        });
    });
}

async function autofillForm(profile) {
    if (!profile) return 0;

    const setVal = async (el, val) => {
        if (!el || !val) return;
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 150));

        // Handle search-dropdowns (like School/Location)
        // Many ATS use libraries that listen for specific keystrokes
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));

        // Trigger a 'keyup' or similar to open the dropdown
        el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 13 }));
        await new Promise(r => setTimeout(r, 300)); // wait for dropdown

        // If it's a known Greenhouse dropdown, try to click the first result
        const results = document.querySelectorAll('.select2-results__option, .autocomplete-result, [role="option"]');
        if (results.length > 0) {
            results[0].click();
        }

        await new Promise(r => setTimeout(r, 100));
        el.blur();
    };

    const personalMappings = {
        'full_name': ['full name', 'fullname'],
        'first_name': ['first name', 'firstname', 'given name'],
        'last_name': ['last name', 'lastname', 'family name', 'surname'],
        'email': ['email', 'email address'],
        'phone': ['phone', 'mobile', 'telephone', 'tel'],
        'linkedin': ['linkedin'],
        'portfolio': ['portfolio', 'website', 'personal site'],
        'github': ['github'],
        'address': ['address', 'street', 'location'],
        'city': ['city', 'town'],
        'state': ['state', 'province', 'region'],
        'zip': ['zip', 'postal', 'postcode']
    };

    const names = (profile.full_name || '').split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';
    const locParts = (profile.location || '').split(',').map(p => p.trim());

    const dataSource = {
        ...profile,
        first_name: firstName,
        last_name: lastName,
        address: profile.location,
        city: locParts[0] || '',
        state: locParts[1] || '',
        zip: locParts[2] || ''
    };

    let fillCount = 0;
    const allInputs = Array.from(document.querySelectorAll('input, textarea'));

    for (const input of allInputs) {
        if (['hidden', 'submit', 'button', 'search', 'checkbox', 'radio'].includes(input.type)) continue;
        if (input.value && input.value.trim().length > 0) continue;

        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();

        let labelTextRaw = '';
        if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) labelTextRaw = label.innerText;
        }
        if (!labelTextRaw) {
            const parentLabel = input.closest('label');
            if (parentLabel) labelTextRaw = parentLabel.innerText;
        }
        const labelText = labelTextRaw.toLowerCase();

        let matched = false;
        for (const [key, keywords] of Object.entries(personalMappings)) {
            const val = dataSource[key];
            if (val && keywords.some(kw => name.includes(kw) || id.includes(kw) || placeholder.includes(kw) || ariaLabel.includes(kw) || labelText.includes(kw))) {
                await setVal(input, val);
                fillCount++;
                matched = true;
                break;
            }
        }

        if (!matched && profile.custom_responses) {
            const cleanLabel = labelTextRaw.replace(/\*/g, '').toLowerCase().trim();
            for (const [learntQ, learntA] of Object.entries(profile.custom_responses)) {
                if (cleanLabel.includes(learntQ) || learntQ.includes(cleanLabel)) {
                    await setVal(input, learntA);
                    fillCount++;
                    break;
                }
            }
        }
    }

    if (profile.work_history?.length > 0) {
        const latest = profile.work_history[0];
        const workMappings = { 'company': ['company', 'employer'], 'title': ['title', 'role'] };
        for (const input of allInputs) {
            if (input.value) continue;
            const context = (input.name + input.id + input.placeholder + (input.closest('label')?.innerText || '')).toLowerCase();
            for (const [key, keywords] of Object.entries(workMappings)) {
                if (keywords.some(kw => context.includes(kw)) && latest[key]) {
                    await setVal(input, latest[key]);
                    fillCount++;
                }
            }
        }
    }
    return fillCount;
}

function extractJobDetails() {
    let location = 'N/A', salary = 'N/A', title = null, jobType = 'N/A', description = '';
    const clean = (text) => text ? text.replace(/\s+/g, ' ').trim() : '';

    const titleSelectors = ['h1', '.app-title', '.job-title', '.header-container h1'];
    for (const s of titleSelectors) {
        const el = document.querySelector(s);
        if (el) {
            title = clean(el.textContent);
            break;
        }
    }

    const descSelectors = [
        '#jobDescriptionText',
        '.show-more-less-html__markup',
        '.jobs-description__container',
        '[data-automation-id="jobPostingDescription"]',
        '#content',
        '.job-description',
        '#description',
        '.description'
    ];
    for (const selector of descSelectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText.trim().length > 50) {
            description = el.innerHTML;
            break;
        }
    }
    return { title, location, salary, jobType, description };
}

function parseCompany(hostname, pathname) {
    // Specialized Greenhouse check
    if (hostname.includes('greenhouse.io')) {
        const parts = pathname.split('/').filter(p => p);
        if (parts.length > 0) {
            // e.g. /doordashusa/jobs/7644873 -> doordashusa
            return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        }
    }

    let parts = hostname.split('.');
    if (parts[0] === 'www') parts.shift();
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
}

if (isJobPage()) {
    chrome.storage.local.get(['savedJobs', 'ignoredUrls'], (result) => {
        const currentUrl = window.location.href;
        if (!result.savedJobs?.some(j => j.url === currentUrl) && !result.ignoredUrls?.includes(currentUrl)) {
            setTimeout(injectTrackerOverlay, 2500);
        }
    });
}
