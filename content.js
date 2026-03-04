// Returns true only for individual job POSTING pages, not listing/search/landing pages.
function isJobPage() {
    const url = window.location.href;
    const urlLower = url.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    // ── HARD EXCLUSIONS: general listing, search, or landing pages ─────────
    const exclusions = [
        /linkedin\.com\/jobs\/?([?#]|$)/i,          // LinkedIn jobs tab root/search
        /linkedin\.com\/jobs\/search/i,
        /indeed\.com\/?([?#]|$)/i,                   // Indeed homepage
        /indeed\.com\/(jobs|companies)\/?([?#]|$)/i, // Indeed job list
        /glassdoor\.com\/Job\/?([?#]|$)/i,
        /glassdoor\.com\/Jobs\//i,                   // Glassdoor listing pages
        /\/careers\/?([?#]|$)/i,                     // Generic /careers landing
        /\/jobs\/?([?#]|$)/i,                        // Generic /jobs landing
        /\/careers\/search/i,
        /\/jobs\/search/i,
        /\/careers\/explore/i,
        /\/careers\/all/i,
        /\/careers#/i,
        /\/open-roles\/?([?#]|$)/i,
    ];
    if (exclusions.some(r => r.test(url))) return false;

    // ── KNOWN ATS PLATFORMS: specific URL patterns for individual postings ──
    const atsPatterns = [
        /boards\.greenhouse\.io\/[^/]+\/jobs\/\d+/i,
        /greenhouse\.io\/.*\/jobs\/\d+/i,
        /jobs\.lever\.co\/[^/]+\/[a-f0-9-]{20,}/i,
        /lever\.co\/[^/]+\/[a-f0-9-]{20,}/i,
        /myworkdayjobs\.com\/.*\/job\//i,
        /smartrecruiters\.com\/[^/]+\/[Jj]ob\//i,
        /jobs\.ashbyhq\.com\/[^/]+\/[a-f0-9-]{20,}/i,
        /ashbyhq\.com\/[^/]+\/.*\/[a-f0-9-]{20,}/i,
        /linkedin\.com\/jobs\/(view|collections\/recommended)\/\d+/i,
        /indeed\.com\/viewjob/i,
        /glassdoor\.com\/job-listing\/.*-\d{5,}/i,
        /careers\.google\.com\/jobs\/results\/\d+/i,
        /amazon\.jobs\/.*\/\d+/i,
        /careers\.microsoft\.com\/.*\/job\/\d+/i,
        /jobs\.apple\.com\/.*\/details\/\d+/i,
        /icims\.com\/jobs\/\d+/i,
        /jobvite\.com\/.*\/job\//i,
        /taleo\.net\/careersection.*requisitionId=\d+/i,
        /workable\.com\/j\//i,
        /recruitee\.com\/o\//i,
        /bamboohr\.com\/jobs\/view\.php/i,
        /wellfound\.com\/jobs\//i,
        /ycombinator\.com\/jobs\/[^/]+\/apply/i,
        /rippling\.com\/jobs\/[^?#]+\/[a-f0-9-]{20,}/i,
        /workday\.com\/.*job\.htmld/i,
    ];
    if (atsPatterns.some(r => r.test(url))) return true;

    // ── GENERIC DETECTION: keyword + depth + ID + apply button ─────────────
    const jobKeywords = ['/job/', '/jobs/', '/career/', '/careers/', '/apply', '/vacancy/', '/position/', '/posting/'];
    const hasJobKeyword = jobKeywords.some(k => urlLower.includes(k));
    // URL must have a specific ID (numeric or UUID) — rules out generic landing pages
    const hasJobId = /[\/=]\d{4,}(\/|$|\?)/.test(url) || /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}/.test(url);
    // Path must be deep enough (e.g. /careers/engineer-role-12345, not just /careers)
    const hasDepth = pathname.split('/').filter(p => p.length > 3).length >= 2;

    if (hasJobKeyword && (hasJobId || hasDepth)) {
        return hasApplyButton();
    }

    return false;
}

// Secondary signal: checks if page has an apply-type button, confirming it's a job posting
function hasApplyButton() {
    const applyPhrases = ['apply now', 'apply for this', 'apply online', 'submit application', 'apply to this', 'easy apply', 'quick apply', 'start application'];
    const els = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="submit"]'));
    return els.some(el => applyPhrases.some(phrase => (el.textContent || el.value || '').toLowerCase().includes(phrase)));
}

// Function to inject the overlay
function injectTrackerOverlay() {
    // ONLY inject overlay in the top-level frame
    if (window !== window.top) return;
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
        <h3 style="margin: 0; font-size: 16px; color: #1e293b;">Job Detected</h3>
    </div>
    <p style="margin: 0 0 16px 0; color: #64748b; font-weight: 600; font-size: 14px;" title="${pageTitle}">${displayTitle}</p>
    <div class="actions">
      <button class="btn-ignore">Did Not Apply</button>
      <button class="btn-track">Yes, I Applied</button>
    </div>
  `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.close-btn');
    const ignoreBtn = overlay.querySelector('.btn-ignore');
    const trackBtn = overlay.querySelector('.btn-track');

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

        // Handle native select elements
        if (el.tagName === 'SELECT') {
            const options = Array.from(el.options);
            const bestMatch = options.find(opt =>
                opt.text.toLowerCase().includes(val.toLowerCase()) ||
                opt.value.toLowerCase().includes(val.toLowerCase())
            );
            if (bestMatch) {
                el.value = bestMatch.value;
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return;
        }

        // Handle search-dropdowns (like School/Location)
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));

        // Trigger keys to open dropdown
        el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 13 }));
        await new Promise(r => setTimeout(r, 400)); // wait for dropdown

        // click first result
        const results = document.querySelectorAll(
            '.select2-results__option, ' +
            '.autocomplete-result, ' +
            '[role="option"], ' +
            '.search-result, ' +
            '.sr-result, ' +
            '.suggestions-list li, ' +
            '.tt-suggestion'
        );
        if (results.length > 0) {
            results[0].click();
        }

        await new Promise(r => setTimeout(r, 100));
        el.blur();
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
    const allInputs = Array.from(document.querySelectorAll('input, textarea, select'));

    for (const input of allInputs) {
        if (['hidden', 'submit', 'button', 'search', 'checkbox', 'radio'].includes(input.type)) continue;

        // Don't skip if it has a placeholder-like value or common dummy text
        if (input.value && input.value.trim().length > 1 && input.tagName !== 'SELECT') {
            const val = input.value.toLowerCase();
            if (!val.includes('e.g.') && !val.includes('example') && val.length > 3) continue;
        }

        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
        const dataQa = (input.getAttribute('data-qa') || '').toLowerCase();
        const dataQaValue = (input.getAttribute('data-qa-value') || '').toLowerCase();

        let labelTextRaw = '';
        if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) labelTextRaw = label.innerText;
        }
        if (!labelTextRaw) {
            const parentLabel = input.closest('label');
            if (parentLabel) labelTextRaw = parentLabel.innerText;
        }

        // Merge all context for matching
        const context = (name + ' ' + id + ' ' + placeholder + ' ' + ariaLabel + ' ' + dataQa + ' ' + dataQaValue + ' ' + (labelTextRaw || '')).toLowerCase();

        let matched = false;
        for (const [key, keywords] of Object.entries(personalMappings)) {
            const val = dataSource[key];
            if (val && keywords.some(kw => context.includes(kw))) {
                await setVal(input, val);
                fillCount++;
                matched = true;
                break;
            }
        }

        if (!matched && profile.custom_responses) {
            const cleanLabel = (labelTextRaw || '').replace(/\*/g, '').toLowerCase().trim();
            for (const [learntQ, learntA] of Object.entries(profile.custom_responses)) {
                if (cleanLabel.includes(learntQ) || learntQ.includes(cleanLabel) || context.includes(learntQ)) {
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
            if (input.value && input.tagName !== 'SELECT') continue;
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

    // 1. Title Extraction
    const titleSelectors = [
        'h1',
        '.app-title',
        '.job-title',
        '.header-container h1',
        '[data-qa="job-title"]',
        '.job-header h2',
        'title'
    ];
    for (const s of titleSelectors) {
        const el = s === 'title' ? document.title : document.querySelector(s)?.textContent;
        if (el && el.trim()) {
            title = clean(el);
            if (s === 'title') title = title.split('|')[0].split('-')[0].trim();
            break;
        }
    }

    // 2. Description Extraction — platform-specific selectors first, then smart fallback
    // Try to expand "Show more" on LinkedIn before grabbing text
    const showMoreBtn = document.querySelector(
        '.jobs-description__footer-button, .show-more-less-html__button--more, [aria-label*="more"], button.show-more'
    );
    if (showMoreBtn && showMoreBtn.offsetParent !== null) {
        try { showMoreBtn.click(); } catch (e) { }
    }

    const descSelectors = [
        // ── LinkedIn ──────────────────────────────────────────────────────────
        '.jobs-description__content .jobs-box__html-content',
        '.jobs-description-content__text',
        '.jobs-description__container',
        '.show-more-less-html__markup',
        '.jobs-box__html-content',

        // ── Indeed ────────────────────────────────────────────────────────────
        '#jobDescriptionText',
        '.jobsearch-JobComponent-description',
        '[data-testid="jobsearch-JobComponent-description"]',
        '.jobsearch-jobDescriptionText',

        // ── Greenhouse ────────────────────────────────────────────────────────
        '#content .job-post-body',
        '.job-post-body',
        '#content div[class*="description"]',
        '#app_body',
        '#app',

        // ── Lever ─────────────────────────────────────────────────────────────
        '.section-wrapper',
        '.posting-categories + div',
        '.posting-page .posting',

        // ── Workday ───────────────────────────────────────────────────────────
        '[data-automation-id="jobPostingDescription"]',
        '[data-automation-id="job-posting-details"]',

        // ── Ashby ─────────────────────────────────────────────────────────────
        '[class*="JobPosting_description"]',
        '[class*="jobPosting-description"]',
        '[class*="JobPostingDescription"]',
        '.ashby-job-posting-brief-description',

        // ── SmartRecruiters ───────────────────────────────────────────────────
        '.job-description-content',
        '.job-sections',
        '[class*="JobDescription"]',

        // ── Rippling ──────────────────────────────────────────────────────────
        '[class*="JobContent"]',
        '[class*="JobPostingContent"]',
        '[class*="job-posting-content"]',

        // ── BambooHR ──────────────────────────────────────────────────────────
        '#BambooHR-ATS',
        '.BambooHR-ATS .description',

        // ── Wellfound / AngelList ─────────────────────────────────────────────
        '[class*="JobListingDescription"]',
        '[data-test="job-description"]',

        // ── Generic ATS attribute wildcards ──────────────────────────────────
        '[id*="job-description"]',
        '[id*="jobDescription"]',
        '[id*="job_description"]',
        '[class*="job-description"]',
        '[class*="jobDescription"]',
        '[class*="job_description"]',
        '[data-qa="job-description"]',
        '[data-automation="job-description"]',
        '[aria-label*="job description"]',

        // ── Generic fallbacks (broad but ordered carefully) ───────────────────
        '#description',
        '.description-body',
        '.job-details-content',
        '.job-detail',
        'article',
    ];

    let candidates = [];
    const seenEls = new Set();
    for (const selector of descSelectors) {
        let els;
        try { els = document.querySelectorAll(selector); } catch (e) { continue; }
        for (const el of els) {
            if (seenEls.has(el)) continue;
            seenEls.add(el);
            const text = el.innerText?.trim() || '';
            if (text.length > 150) {
                candidates.push({ el, html: el.innerHTML, text, length: text.length });
            }
        }
    }

    // Smart fallback: scan all large text blocks, require job-related keywords
    if (candidates.length === 0) {
        const jobKeywords = /responsibilit|qualif|requirement|experience|skill|role|position|about the (job|role|team)|what you.ll|who you are|we.re looking/i;
        const allBlocks = document.querySelectorAll('div, section');
        for (const el of allBlocks) {
            // Skip common noise elements
            if (el.closest('nav, header, footer, aside, [role="navigation"], [role="banner"]')) continue;
            const text = el.innerText?.trim() || '';
            if (text.length > 300 && jobKeywords.test(text)) {
                candidates.push({ el, html: el.innerHTML, text, length: text.length });
            }
        }
    }

    if (candidates.length > 0) {
        // Prefer the most specific (smallest qualifying) match — avoids grabbing entire page
        candidates.sort((a, b) => a.length - b.length);
        // But must be at least 200 chars
        const best = candidates.find(c => c.length >= 200) || candidates[0];
        description = best.html;

        // --- Salary Extraction from description text (extended patterns) ---
        const bodyText = best.text;
        // Matches: $120,000 - $150,000/yr | $45/hr | $120K–$150K | 120,000 - 150,000 USD
        const salaryPatterns = [
            /\$\s*[\d,]+(?:\.\d+)?\s*[kK]?\s*[-–—to]+\s*\$\s*[\d,]+(?:\.\d+)?\s*[kK]?\s*(?:\/|per\s+)?(?:hr|hour|yr|year|annually|annum)?/i,
            /\$\s*[\d,]+(?:\.\d+)?\s*[kK]?\s*(?:\/|per\s+)?(?:hr|hour|yr|year|annually)/i,
            /[\d,]+\s*[kK]?\s*[-–—]\s*[\d,]+\s*[kK]?\s*(?:USD|CAD|GBP|EUR)/i,
            /(?:salary|compensation|pay|base)\s*[:\-]?\s*\$?\s*[\d,]+\s*[kK]?\s*[-–—to]+\s*\$?\s*[\d,]+\s*[kK]?/i,
        ];
        for (const pattern of salaryPatterns) {
            const match = bodyText.match(pattern);
            if (match) { salary = match[0].trim(); break; }
        }

        // Also check full page text for salary if not found in description
        if (salary === 'N/A') {
            const fullText = document.body.innerText;
            for (const pattern of salaryPatterns) {
                const match = fullText.match(pattern);
                if (match) { salary = match[0].trim(); break; }
            }
        }
    }

    // 3. Location & Type
    const locSelectors = [
        '.location', '[data-qa="job-location"]', '.job-header p',
        '[class*="location"]', '[data-automation-id="locations"]',
        '.jobs-unified-top-card__bullet', // LinkedIn
        '[data-testid*="location"]',
    ];
    for (const s of locSelectors) {
        const el = document.querySelector(s);
        if (el && el.innerText.trim() && el.innerText.trim().length < 80) {
            location = clean(el.innerText);
            break;
        }
    }

    if (location === 'N/A' || location === '') {
        const metaLoc = document.querySelector('meta[name*="location"], meta[property*="location"]');
        if (metaLoc) location = metaLoc.content;
        else if (document.body.innerText.match(/\bremote\b/i)) location = 'Remote';
    }

    return { title, location, salary, jobType, description };
}

function parseCompany(hostname, pathname) {
    const cleanUrlPart = (p) => p ? p.charAt(0).toUpperCase() + p.slice(1) : '';

    // Specialized SmartRecruiters check
    if (hostname.includes('smartrecruiters.com')) {
        const parts = pathname.split('/').filter(p => p);
        const companyIdx = parts.indexOf('company');
        if (companyIdx !== -1 && parts[companyIdx + 1]) {
            return cleanUrlPart(parts[companyIdx + 1]);
        }
    }

    // Specialized Greenhouse check
    if (hostname.includes('greenhouse.io') || hostname.includes('boards.greenhouse.io')) {
        const parts = pathname.split('/').filter(p => p);
        if (parts.length > 0) {
            return cleanUrlPart(parts[0]);
        }
    }

    // Heuristic for subdomains
    let parts = hostname.split('.');
    if (parts.length > 2 && !['www', 'jobs', 'careers'].includes(parts[0])) {
        return cleanUrlPart(parts[0]);
    }

    if (parts[0] === 'www') parts.shift();
    return cleanUrlPart(parts[0]);
}

const personalMappings = {
    'full_name': ['full name', 'fullname'],
    'first_name': ['first name', 'firstname', 'given name', 'preferred first name', 'given-name', 'first-name', 'first_name'],
    'last_name': ['last name', 'lastname', 'family name', 'surname', 'preferred last name', 'family-name', 'last-name', 'last_name'],
    'email': ['email', 'email address', 'confirm email', 'confirm your email', 'email-address', 'confirm-email'],
    'phone': ['phone', 'mobile', 'telephone', 'tel', 'phone number', 'phone-number', 'mobile-phone'],
    'linkedin': ['linkedin'],
    'portfolio': ['portfolio', 'website', 'personal site'],
    'github': ['github'],
    'address': ['address', 'street', 'location'],
    'city': ['city', 'town'],
    'state': ['state', 'province', 'region'],
    'zip': ['zip', 'postal', 'postcode']
};

if (isJobPage()) {
    chrome.storage.local.get(['savedJobs', 'ignoredUrls'], (result) => {
        const currentUrl = window.location.href;
        if (!result.savedJobs?.some(j => j.url === currentUrl) && !result.ignoredUrls?.includes(currentUrl)) {
            setTimeout(injectTrackerOverlay, 2500);
        }
    });
}

// Global Listener: Must be outside isJobPage so iframes (which might have different URLs) still listen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "executeAutofill") {
        autofillForm(message.profile);
    }
});
