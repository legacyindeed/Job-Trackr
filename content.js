// Check if current page is likely a job application
function isJobPage() {
    const url = window.location.href.toLowerCase();
    const knownDomains = [
        'linkedin.com/jobs',
        'indeed.com',
        'glassdoor.com',
        'monster.com',
        'ziprecruiter.com',
        'greenhouse.io',
        'lever.co',
        'workday.com',
        'myworkdayjobs.com',
        'ashby.hq',
        'ashbyhq.com',
        'smartrecruiters.com',
        'breezy.hr',
        'applytojob.com', // JazzHR
        'careers.google.com',
        'careers.microsoft.com',
        'jobs.apple.com',
        'amazon.jobs',
        'facebook.com/careers',
        'netflix.com/jobs',
        'icims.com',
        'jobvite.com',
        'taleo.net',
        'brassring.com',
        'avature.net',
        'oraclecloud.com',
        'successfactors.com',
        'recruitee.com',
        'workable.com',
        'bamboohr.com',
        'fountain.com',
        'hired.com',
        'ycombinator.com/jobs',
        'wellfound.com',
        'remotive.com',
        'weworkremotely.com',
        'arc.dev',
        'himalayas.app',
        'otta.com',
        'lifeattiktok.com',
        'workforcenow.adp.com',
        'adp.com',
        'pinpointhq.com',
        'rippling.com',
        'societegenerale.com'
    ];

    const keywords = [
        '/job/', '/jobs/', '/career/', '/careers/', '/apply',
        '/vacancy/', '/position/', '/posting/', '/job-offers/'
    ];

    // Check known domains
    const domainMatch = knownDomains.some(domain => url.includes(domain));

    // Check keywords in path
    const keywordMatch = keywords.some(keyword => url.includes(keyword));

    // Special check for TikTok
    const isTikTok = url.includes('lifeattiktok.com/search/');

    return domainMatch || keywordMatch || isTikTok;
}

// Function to inject the overlay
function injectTrackerOverlay() {
    if (document.getElementById('job-tracker-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'job-tracker-overlay';

    // Extract rudimentary details
    const details = extractJobDetails();
    const pageTitle = document.title || 'Unknown Job';

    // Use extracted title if it exists, otherwise fall back to cleaned page title
    let displayTitle = details.title || pageTitle.split('-')[0].split('|')[0].trim();

    // Clean common prefixes for the preview too
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

    // Event Listeners
    const closeBtn = overlay.querySelector('.close-btn');
    const ignoreBtn = overlay.querySelector('.btn-ignore');
    const trackBtn = overlay.querySelector('.btn-track');
    const autofillBtn = overlay.querySelector('.btn-autofill');

    autofillBtn.addEventListener('click', () => {
        autofillBtn.textContent = 'Fetching...';
        chrome.runtime.sendMessage({ action: "getProfile" }, (response) => {
            if (response && response.profile && Object.keys(response.profile).length > 0) {
                const count = autofillForm(response.profile);
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

    closeBtn.addEventListener('click', () => {
        overlay.remove();
    });

    ignoreBtn.addEventListener('click', () => {
        // Add logic to ignore this URL temporarily or permanently
        chrome.storage.local.get(['ignoredUrls'], (result) => {
            const ignored = result.ignoredUrls || [];
            ignored.push(window.location.href);
            chrome.storage.local.set({ ignoredUrls: ignored }, () => {
                overlay.remove();
            });
        });
    });

    trackBtn.addEventListener('click', () => {
        const details = extractJobDetails();
        // Use extracted title if available and cleaner, otherwise fallback to pageTitle
        // We prefer details.title because it comes from H1 or Schema which is usually just the role.
        let finalTitle = details.title || pageTitle.split('-')[0].split('|')[0].trim();

        // Clean prefixes
        const prefixes = [
            'Job Application for', 'Application for', 'Apply for',
            'Job Application', 'Application', 'Apply', 'Careers at'
        ];

        // Sort by length desc to match longest prefixes first
        // Create regex for case-insensitive matching at start of string
        // e.g. /^(Job Application for|Application for|...)\s+/i
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
            status: 'Applied' // Default status
        };

        chrome.storage.local.get(['savedJobs'], (result) => {
            const jobs = result.savedJobs || [];

            // 1. Check for URL duplicate (Exact Match)
            if (jobs.some(j => j.url === jobData.url)) {
                trackBtn.textContent = 'Already Applied';
                setTimeout(() => overlay.remove(), 2000);
                return;
            }

            // 2. Check for Content Duplicate (Same Title + Company + Date)
            const today = new Date().toISOString().split('T')[0];
            const isContentDuplicate = jobs.some(j => {
                // Normalize for comparison
                const sameTitle = (j.title || '').toLowerCase().trim() === (jobData.title || '').toLowerCase().trim();
                const sameCompany = (j.company || '').toLowerCase().trim() === (jobData.company || '').toLowerCase().trim();
                const sameDate = (j.date || '').split('T')[0] === today;

                return sameTitle && sameCompany && sameDate;
            });

            if (isContentDuplicate) {
                const confirmed = confirm(`You have already applied for "${jobData.title}" at ${jobData.company} today. Is this a new role?`);
                if (!confirmed) {
                    trackBtn.textContent = 'Cancelled';
                    setTimeout(() => overlay.remove(), 2000);
                    return;
                }
            }

            // Save if unique or confirmed
            jobs.push(jobData);
            chrome.storage.local.set({ savedJobs: jobs }, () => {
                trackBtn.textContent = 'Applied!';
                trackBtn.disabled = true;
                trackBtn.style.backgroundColor = '#2563eb';
                setTimeout(() => overlay.remove(), 2000);

                // Sync to Google Sheet if configured
                if (chrome.runtime?.id) {
                    chrome.runtime.sendMessage({ action: "syncToSheet", job: jobData });
                }
            });
        });
    });
}

function autofillForm(profile) {
    if (!profile) return;

    // Helper to set value and trigger events properly for React/Vue listeners
    const setVal = (el, val) => {
        if (!el || !val) return;
        el.focus();
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.blur();
    };

    // Advanced fuzzy mapping
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

    // Extract names and address parts
    const names = (profile.full_name || '').split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    // Parse location (e.g., "San Francisco, CA, 94105")
    const locParts = (profile.location || '').split(',').map(p => p.trim());
    const city = locParts[0] || '';
    const state = locParts[1] || '';
    const zip = locParts[2] || '';

    // Data source for mappings
    const dataSource = {
        ...profile,
        first_name: firstName,
        last_name: lastName,
        address: profile.location, // Fallback to full location for street address field
        city: city,
        state: state,
        zip: zip
    };

    // 1. Map simple text inputs
    let fillCount = 0;
    const allInputs = document.querySelectorAll('input, textarea');

    allInputs.forEach(input => {
        // Skip hidden, button, or search
        if (['hidden', 'submit', 'button', 'search', 'checkbox', 'radio'].includes(input.type)) return;

        // Skip if already filled
        if (input.value && input.value.trim().length > 0) return;

        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();

        // Find associated label text
        let labelText = '';
        if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) labelText = label.innerText.toLowerCase();
        }
        if (!labelText) {
            const parentLabel = input.closest('label');
            if (parentLabel) labelText = parentLabel.innerText.toLowerCase();
        }

        // Try keywords
        for (const [key, keywords] of Object.entries(personalMappings)) {
            const val = dataSource[key];
            if (!val) continue;

            const isMatch = keywords.some(kw =>
                name.includes(kw) ||
                id.includes(kw) ||
                placeholder.includes(kw) ||
                ariaLabel.includes(kw) ||
                labelText.includes(kw)
            );

            if (isMatch) {
                setVal(input, val);
                fillCount++;
                break;
            }
        }
    });

    // 2. Work History (latest role)
    if (profile.work_history && profile.work_history.length > 0) {
        const latest = profile.work_history[0];
        const workMappings = {
            'company': ['company', 'employer', 'organization'],
            'title': ['title', 'role', 'position']
        };

        allInputs.forEach(input => {
            if (input.value) return;

            const context = (input.name + input.id + input.placeholder + (input.closest('label')?.innerText || '')).toLowerCase();

            for (const [key, keywords] of Object.entries(workMappings)) {
                if (keywords.some(kw => context.includes(kw)) && latest[key]) {
                    setVal(input, latest[key]);
                    fillCount++;
                }
            }
        });
    }

    return fillCount;
}

function extractJobDetails() {
    let location = 'N/A';
    let salary = 'N/A';
    let title = null;
    let jobType = 'N/A';
    let description = '';

    // Helper text cleaner
    const clean = (text) => text ? text.replace(/\s+/g, ' ').trim() : '';

    // 1. Try to find JSON-LD (Structured Data) - Most reliable if present
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
        try {
            const data = JSON.parse(script.textContent);
            // Check for JobPosting type
            const jobPosting = Array.isArray(data) ? data.find(d => d['@type'] === 'JobPosting') : (data['@type'] === 'JobPosting' ? data : null);

            if (jobPosting) {
                // Title
                if (jobPosting.title) {
                    title = clean(jobPosting.title);
                }

                // Location
                if (jobPosting.jobLocation) {
                    if (Array.isArray(jobPosting.jobLocation)) {
                        location = jobPosting.jobLocation.map(l => l.address?.addressLocality || l.address?.addressRegion).join(', ');
                    } else if (jobPosting.jobLocation.address) {
                        const addr = jobPosting.jobLocation.address;
                        const parts = [addr.addressLocality, addr.addressRegion].filter(Boolean);
                        if (parts.length > 0) location = parts.join(', ');
                    }
                }

                // Salary
                if (jobPosting.baseSalary) {
                    const val = jobPosting.baseSalary.value;
                    if (val) {
                        if (val.minValue && val.maxValue) {
                            const currency = val.currency || '$';
                            salary = `${currency}${val.minValue} - ${currency}${val.maxValue}`;
                            if (val.unitText) salary += ` / ${val.unitText}`;
                        } else if (val.value) {
                            const currency = val.currency || '$';
                            salary = `${currency}${val.value}`;
                            if (val.unitText) salary += ` / ${val.unitText}`;
                        }
                    }
                }

                // Job Type
                if (jobPosting.employmentType) {
                    jobType = Array.isArray(jobPosting.employmentType)
                        ? jobPosting.employmentType.join(', ').replace(/_/g, ' ').toLowerCase()
                        : jobPosting.employmentType.replace(/_/g, ' ').toLowerCase();
                    // Capitalize
                    jobType = jobType.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                }

                // Description
                if (jobPosting.description) {
                    description = jobPosting.description;
                }

                // If found everything, return early
                if (title && location !== 'N/A' && salary !== 'N/A' && jobType !== 'N/A' && description) return { title, location, salary, jobType, description };
            }
        } catch (e) {
            // ignore parse errors
        }
    }

    // 1.2. Specific Workday or ATS Checks BEFORE generic return
    if (window.location.hostname.includes('myworkdayjobs.com')) {
        const wdTitle = document.querySelector('[data-automation-id="jobPostingHeader"]') ||
            document.querySelector('h2') ||
            document.querySelector('.GCW0012D-TITLE');
        if (wdTitle) title = clean(wdTitle.textContent);
    }

    // 1.2. Specific Taleo Logic
    if (window.location.hostname.includes('taleo.net')) {
        // Taleo is notoriously difficult with dynamic IDs
        const taleoTitle = document.querySelector('[id*="reqTitle"]') ||
            document.querySelector('.jobTitle') ||
            document.querySelector('h1.contentcolumn');
        if (taleoTitle) title = clean(taleoTitle.textContent);

        const taleoLoc = document.querySelector('[id*="reqLocation"]') ||
            document.querySelector('.jobLocation') ||
            document.querySelector('[id*="location"]');
        if (taleoLoc) location = clean(taleoLoc.textContent);

        const taleoType = document.querySelector('[id*="reqEmploymentStatus"]') ||
            document.querySelector('[id*="jobtype"]');
        if (taleoType) jobType = clean(taleoType.textContent);
    }

    // 1.3. Specific Societe Generale Logic
    if (window.location.hostname.includes('societegenerale.com')) {
        const sgTitle = document.querySelector('h1') || document.querySelector('.job-title');
        if (sgTitle) title = clean(sgTitle.textContent);

        // Location is often in a specific div or metadata
        const sgLoc = document.querySelector('.job-location') || document.querySelector('.location');
        if (sgLoc) location = clean(sgLoc.textContent);
    }

    // 1.4. Specific iCIMS Logic
    if (window.location.hostname.includes('icims.com')) {
        const icimsTitle = document.querySelector('.iCIMS_JobHeader .iCIMS_Header h1') ||
            document.querySelector('.iCIMS_JobHeader h1') ||
            document.querySelector('.iCIMS_Header h1');
        if (icimsTitle) title = clean(icimsTitle.textContent);

        const icimsLoc = document.querySelector('.iCIMS_JobHeader .iCIMS_JobHeaderGroup dl') ||
            document.querySelector('.iCIMS_JobHeaderTag');
        if (icimsLoc) {
            // Usually looks like \"Location | US-NY-New York\"
            const locText = clean(icimsLoc.textContent);
            if (locText.includes('|')) {
                location = clean(locText.split('|')[1]);
            } else {
                location = locText;
            }
        }
    }


    // 1.5. Specific Jobvite Logic (since it often fails generic checks)
    if (window.location.hostname.includes('jobvite.com')) {
        const jvTitle = document.querySelector('.jv-header') || document.querySelector('.jv-job-detail-header h2');
        if (jvTitle) title = clean(jvTitle.textContent);

        const jvLocation = document.querySelector('.jv-job-detail-meta');
        if (jvLocation) {
            const locText = clean(jvLocation.textContent);
            // often looks like "Location: San Francisco, CA | Type: Full-Time"
            const locMatch = locText.match(/Location:\s*([^|]+)/i);
            if (locMatch) location = locMatch[1].trim();
            else location = locText; // fallback

            const typeMatch = locText.match(/Type:\s*([^|]+)/i);
            if (typeMatch) jobType = typeMatch[1].trim();
        }
    }

    // 2. ADP Specific Logic (workforcenow.adp.com)
    if (window.location.hostname.includes('adp.com')) {
        // ADP is tricky, dynamic SPA. Elements might not be ready immediately or have obscure IDs.
        // Common classes: .job-description-title, .job-description-data, .job-description-worker-catergory

        const adpTitle = document.querySelector('.job-description-title') || document.querySelector('.job-detail-title');
        if (adpTitle) title = clean(adpTitle.textContent);

        // Location often in a subtitle or data block
        const adpLoc = document.querySelector('.job-description-subtitle') || document.querySelector('.job-description-location');
        if (adpLoc) location = clean(adpLoc.textContent);

        // Job Type
        const adpType = document.querySelector('.job-description-worker-category');
        if (adpType) jobType = clean(adpType.textContent);

        // Company Name override (since URL parsing returns generic "ADP-Hosted Job")
        // Sometimes company name is in the logo alt text or a header
        const adpLogo = document.querySelector('.client-logo-image');
        if (adpLogo && adpLogo.alt) {
            let cName = adpLogo.alt;
            if (cName.toLowerCase() === 'client logo') cName = ''; // useless
            if (cName) {
                // Update the logic to return this company name somehow? 
                // We can't update parseCompany from here easily without refactoring.
                // But we can store it in a way that the caller uses it?
                // No, extractJobDetails returns { title, location, salary, jobType, company? }
                // Let's add company to return object.
                // We need to update the caller to accept company from here too.
                return { title, location, salary, jobType, company: clean(cName) };
            }
        }
    }

    // 2.5. Pinpoint HQ Logic
    if (window.location.hostname.includes('pinpointhq.com')) {
        const pinTitle = document.querySelector('h1') || document.querySelector('.postings-title') || document.querySelector('h2');
        if (pinTitle) {
            let t = clean(pinTitle.textContent);
            if (t.toLowerCase() !== 'apply' && t.toLowerCase() !== 'new application') {
                title = t.replace('New Application |', '').trim();
            }
        }

        if (!title || title.toLowerCase() === 'apply') {
            title = clean(document.title.replace('New Application |', '').split('|')[0]);
        }

        // Location is usually in a list or meta
        const pinLoc = document.querySelector('.pinpoint-job-location') || document.querySelector('.job-location');
        if (pinLoc) location = clean(pinLoc.textContent);

        // Job Type
        const pinType = document.querySelector('.pinpoint-job-type') || document.querySelector('.job-type');
        if (pinType) jobType = clean(pinType.textContent);
    }

    // 2.6. Rippling Logic
    if (window.location.hostname.includes('rippling.com')) {
        try {
            const nextData = document.getElementById('__NEXT_DATA__');
            if (nextData) {
                const data = JSON.parse(nextData.textContent);
                const apiData = data?.props?.pageProps?.apiData || data?.props?.apiData;
                const jobPost = apiData?.jobPost;
                const jobBoard = apiData?.jobBoard;

                if (jobPost) {
                    if (jobPost.jobPostName) title = clean(jobPost.jobPostName);
                    if (jobPost.workLocations && jobPost.workLocations.length > 0) {
                        location = clean(jobPost.workLocations[0].name || jobPost.workLocations[0].city);
                    }
                    if (jobPost.employmentType) {
                        jobType = clean(jobPost.employmentType);
                    }
                }

                if (jobBoard && jobBoard.slug) {
                    company = capitalizeFirstLetter(jobBoard.slug);
                }
            }
        } catch (e) {
            console.log("Rippling __NEXT_DATA__ parse failed", e);
        }

        // Fallback selectors
        if (!title) {
            const ripTitle = document.querySelector('h1') || document.querySelector('[data-testid="job-post-name"]');
            if (ripTitle) title = clean(ripTitle.textContent);
        }
    }

    // 2. Heuristic Search
    const bodyText = document.body.innerText;

    // Title Heuristic: Look for H1 if structured data failed
    if (!title) {
        const h1 = document.querySelector('h1');
        if (h1) {
            title = clean(h1.textContent);
        }
    }

    // Location Heuristic
    if (location === 'N/A') {
        const locationKeywords = ['Location', 'Workplace', 'Job location'];
        // Try meta tags first
        const metaLocation = document.querySelector('meta[name="twitter:data2"]') ||
            document.querySelector('meta[property="og:description"]') ||
            document.querySelector('meta[name="description"]');

        // Very basic text proximity is hard without structure, so we rely on meta or common classes
        // Fallback to "Remote" detection
        if (bodyText.match(/\bRemote\b/i) || bodyText.match(/\bWork from home\b/i)) {
            // check if it's the only location or part of it
            location = "Remote / Unknown";
        }
    }

    // Job Type Heuristic (Keywords)
    if (jobType === 'N/A') {
        if (bodyText.match(/\bFull-?time\b/i)) jobType = "Full-Time";
        else if (bodyText.match(/\bPart-?time\b/i)) jobType = "Part-Time";
        else if (bodyText.match(/\bContract\b/i)) jobType = "Contract";
        else if (bodyText.match(/\bInternship\b/i)) jobType = "Internship";
    }

    // Salary/Pay Range Heuristic
    if (salary === 'N/A') {
        // Look for "Pay Range", "Salary", "Compensation", "$..."
        // Regex for currency ranges: $50,000 - $80,000 or $50k-$80k or $20/hr
        const salaryRegex = /\$[\d,]+(?:k)?\s*-\s*\$[\d,]+(?:k)?(?:\s*\/|\s+per\s+)(?:yr|year|hr|hour|annually)?/i;
        const strictSalaryRegex = /\$[\d,]+(?:k)?\s*-\s*\$[\d,]+(?:k)?/i;

        // Find visible text nodes that contain "Pay" or "Salary"
        // This is expensive, so let's try a regex on body text window around matches

        // Simple scan for the regex
        const match = bodyText.match(salaryRegex) || bodyText.match(strictSalaryRegex);
        if (match) {
            salary = match[0];
        } else {
            // Check specific keywords + numbers
            const payRangeRegex = /(?:Pay|Salary|Compensation|Target)\s*Range:?\s*([\$\d,\.\s\-k]+(?:yr|year|hr|hour)?)/i;
            const rangeMatch = bodyText.match(payRangeRegex);
            if (rangeMatch && rangeMatch[1] && rangeMatch[1].length < 50) { // sanity check length
                salary = rangeMatch[1].trim();
            }
        }
    }

    // --- Description Scraper Logic ---
    if (!description) {
        const descSelectors = [
            '#jobDescriptionText', // Indeed
            '.show-more-less-html__markup', // LinkedIn
            '.jobs-description__container', // LinkedIn
            '[data-automation-id="jobPostingDescription"]', // Workday
            '#content.job-description', // Greenhouse
            '.job-description', // Greenhouse/Generic
            '[id*="requisitionDescription"]', // Taleo
            '[id*="jobDescription"]', // Taleo
            '.editablesection', // Taleo
            '.iCIMS_JobDescription', // iCIMS
            '.iCIMS_JobContent', // iCIMS
            '.ashby-job-description', // Ashby
            '.ashby-job-description-content', // Ashby
            '[class*="ashby-job-description"]', // Ashby fuzzy match
            '[data-testid="job-description"]', // Ashby/Generic
            '.job-description', // Generic
            '#main', // Greenhouse/Generic
            '#content', // Greenhouse/Generic
            '.job-body', // Generic
            '.pos-description', // Jobvite
            '.job-detail-description', // Pinpoint
            '.jd-container', // Generic
            'article', // Semantic fallback
            '.main-content', // Generic
            'main' // Last resort
        ];

        for (const selector of descSelectors) {
            const el = document.querySelector(selector);
            if (el && el.innerText.trim().length > 50) {
                // Ensure it's not just a tiny label but actual content
                description = el.innerHTML;
                break;
            }
        }

        // Final fallback: Use meta tags if DOM selection failed
        if (!description) {
            // Check for any element with a class containing 'description' and pick the LARGEST one
            const elements = Array.from(document.querySelectorAll('[class*="description"], [class*="postings-description"], [class*="job-details"]'));
            const largest = elements.sort((a, b) => b.innerText.length - a.innerText.length)[1] || elements[0];
            // Note: sometimes a parent wrapper has more text than the actual JD, but we want the JD.
            // Actually, Greenhouse #main might be very large.

            const bestMatch = elements.sort((a, b) => b.innerText.length - a.innerText.length)[0];
            if (bestMatch && bestMatch.innerText.trim().length > 200) {
                description = bestMatch.innerHTML;
            }
        }

        if (!description) {
            const metaDesc = document.querySelector('meta[property="og:description"]') ||
                document.querySelector('meta[name="description"]');
            if (metaDesc) description = metaDesc.content;
        }
    }

    // --- Post-Extraction Cleanup ---
    // If we captured HTML, let's strip out application forms, inputs, and buttons
    if (description && description.includes('<')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;

        // Remove common "junk" elements found in job postings
        const junkSelectors = [
            'form', '#application', '.application', 'input', 'button', 'select', 'textarea',
            '.apply-container', '.apply-button', 'footer', 'header', 'nav',
            'script', 'style', 'iframe', '.social-share', '.similar-jobs'
        ];

        junkSelectors.forEach(s => {
            tempDiv.querySelectorAll(s).forEach(junk => junk.remove());
        });

        description = tempDiv.innerHTML.trim();
    }

    return { title, location, salary, jobType, description };
}

function parseCompany(hostname, pathname) {
    const customMappings = {
        'societegenerale.com': 'Societe Generale',
        'linkedin.com': 'LinkedIn',
        'glassdoor.com': 'Glassdoor',
        'indeed.com': 'Indeed',
        'google.com': 'Google',
        'microsoft.com': 'Microsoft',
        'amazon.com': 'Amazon',
        'apple.com': 'Apple',
        'facebook.com': 'Meta',
        'meta.com': 'Meta',
        'tiktok.com': 'TikTok',
        'adp.com': 'ADP'
    };

    // Check custom mappings first
    for (const [domain, name] of Object.entries(customMappings)) {
        if (hostname.includes(domain)) return name;
    }

    // Handle specific ATS subdomains
    if (hostname.includes('myworkdayjobs.com')) {
        return capitalizeFirstLetter(hostname.split('.')[0]);
    }

    // Handle Path-based ATS
    if (hostname.includes('greenhouse.io') || hostname.includes('boards.greenhouse.io')) {
        // typically /companyname/jobs/...
        const pathParts = pathname.split('/').filter(p => p);
        if (pathParts.length > 0) return capitalizeFirstLetter(pathParts[0]);
    }

    if (hostname.includes('lever.co')) {
        // jobs.lever.co/companyname
        const pathParts = pathname.split('/').filter(p => p);
        if (pathParts.length > 0 && hostname.includes('jobs.lever.co')) {
            return capitalizeFirstLetter(pathParts[0]);
        }
    }

    if (hostname.includes('ashby.hq') || hostname.includes('ashbyhq.com')) {
        // jobs.ashbyhq.com/companyname or ashby.hq/jobs/companyname
        // e.g. https://jobs.ashbyhq.com/reddit/d2...
        if (hostname.includes('jobs.')) {
            const pathParts = pathname.split('/').filter(p => p);
            if (pathParts.length > 0) return capitalizeFirstLetter(pathParts[0]);
        }
    }

    // Jobvite
    if (hostname.includes('jobvite.com')) {
        // jobs.jobvite.com/companyname
        const pathParts = pathname.split('/').filter(p => p);
        if (pathParts.length > 0 && hostname.includes('jobs.jobvite.com')) {
            return capitalizeFirstLetter(pathParts[0]);
        }
    }

    // TikTok
    if (hostname.includes('lifeattiktok.com')) {
        return 'TikTok';
    }

    // ADP
    if (hostname.includes('adp.com')) {
        // usually format is: https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=...
        // The company name is often hidden in the CID or not easily parseable from URL.
        // We will try to rely on the page title or specific element later.
        // For now, return generic or try to find a company header in the page via heuristic in extractJobDetails
        // But here we only have hostname/pathname.
        return 'ADP-Hosted Job'; // Placeholder, extraction logic should improve this if possible
    }

    // SmartRecruiters (Company often in path for jobs.smartrecruiters.com)
    if (hostname.includes('smartrecruiters.com')) {
        if (hostname.startsWith('jobs.')) {
            const pathParts = pathname.split('/').filter(p => p);
            if (pathParts.length > 0) return capitalizeFirstLetter(pathParts[0]);
        }
    }

    // iCIMS (Company often in subdomain: careers-companyname.icims.com)
    if (hostname.includes('icims.com')) {
        const sub = parts[0];
        if (sub.startsWith('careers-')) return capitalizeFirstLetter(sub.replace('careers-', ''));
        return capitalizeFirstLetter(sub);
    }

    // Pinpoint HQ
    if (hostname.includes('pinpointhq.com')) {
        // e.g. icario.pinpointhq.com
        return capitalizeFirstLetter(hostname.split('.')[0]);
    }

    // Rippling
    if (hostname.includes('rippling.com')) {
        // e.g. ats.rippling.com/mykaarma/jobs/...
        const pathParts = pathname.split('/').filter(p => p);
        if (pathParts.length > 0) return capitalizeFirstLetter(pathParts[0]);
    }

    // Standard heuristic
    let parts = hostname.split('.');

    // Remove 'www'
    if (parts[0] === 'www') parts.shift();

    // Taleo specific: tas-company.taleo.net or company.taleo.net
    if (hostname.includes('taleo.net')) {
        let taleoPart = parts[0];
        if (taleoPart.startsWith('tas-')) taleoPart = taleoPart.replace('tas-', '');
        return capitalizeFirstLetter(taleoPart);
    }

    if (parts.length > 2) {
        // e.g. company.smartrecruiters.com -> company
        if (hostname.includes('smartrecruiters.com') && !hostname.startsWith('jobs.')) {
            return capitalizeFirstLetter(parts[0]);
        }

        if (hostname.includes('breezy.hr') ||
            hostname.includes('workable.com') ||
            hostname.includes('lever.co') ||
            hostname.includes('bamboohr.com')) {
            return capitalizeFirstLetter(parts[0]);
        }

        // e.g. amazon.co.uk
        if (parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'com') {
            // check if it's 3 or 4 parts
            // e.g. amazon.co.uk -> amazon
            if (parts.length >= 3) {
                return capitalizeFirstLetter(parts[parts.length - 3]);
            }
        }
    }

    // Fallback: take the second to last part (domain name)
    if (parts.length >= 2) {
        return capitalizeFirstLetter(parts[parts.length - 2]);
    }

    return capitalizeFirstLetter(parts[0]);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Main Logic
if (isJobPage()) {
    // Check if already saved or ignored
    chrome.storage.local.get(['savedJobs', 'ignoredUrls'], (result) => {
        const jobs = result.savedJobs || [];
        const ignored = result.ignoredUrls || [];
        const currentUrl = window.location.href;

        const isSaved = jobs.some(j => j.url === currentUrl);
        const isIgnored = ignored.includes(currentUrl);

        if (!isSaved && !isIgnored) {
            // Delay slightly to ensure page load stabilizes - some sites like Taleo need more time
            setTimeout(injectTrackerOverlay, 2500);
        }
    });
}
