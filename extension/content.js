// Content script for scraping job details on LinkedIn & Indeed

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeJob') {
    const jobData = scrapeJobDetails();
    sendResponse(jobData);
  }
  return true; // Keep message channel open for async response if needed
});

function scrapeJobDetails() {
  const url = window.location.href;
  let title = '';
  let company = '';
  let location = '';

  if (url.includes('linkedin.com')) {
    // LinkedIn Scraper
    // Try multiple selector patterns for Job Title
    const titleSelectors = [
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      'h1.t-24',
      '.jobs-details-sidebar__title',
      'h1'
    ];
    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        title = el.innerText.trim();
        break;
      }
    }

    // Try multiple selector patterns for Company Name
    const companySelectors = [
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name',
      '.jobs-details-sidebar__company-name',
      'span.jobs-unified-top-card__company-name'
    ];
    for (const selector of companySelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        // Strip out rating numbers or reviews if any
        company = el.innerText.trim().replace(/\n.*/g, '');
        break;
      }
    }

    // Try multiple selector patterns for Location
    const locationSelectors = [
      '.job-details-jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__workplace-type',
      '.jobs-details-sidebar__bullet'
    ];
    for (const selector of locationSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        location = el.innerText.trim();
        break;
      }
    }
  } else if (url.includes('indeed.com')) {
    // Indeed Scraper
    // Try selectors for Job Title
    const titleSelectors = [
      'h1.jobsearch-JobInfoHeader-title',
      '.jobsearch-JobInfoHeader-title-container h1',
      'h1'
    ];
    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        title = el.innerText.trim().replace('- job post', '');
        break;
      }
    }

    // Try selectors for Company
    const companySelectors = [
      'div[data-company-name="true"]',
      '.jobsearch-CompanyInfoContainer a',
      '.jobsearch-InlineCompanyRating a',
      '.jobsearch-InlineCompanyRating',
      '[class*="InlineCompanyRating"]'
    ];
    for (const selector of companySelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        company = el.innerText.trim().replace(/\n.*/g, '');
        break;
      }
    }

    // Try selectors for Location
    const locationSelectors = [
      '.jobsearch-JobInfoHeader-companyLocation',
      'div[data-testid="inline-header-companyLocation"]',
      '[class*="companyLocation"]'
    ];
    for (const selector of locationSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText.trim()) {
        location = el.innerText.trim();
        break;
      }
    }
  }

  return {
    title: title || '',
    company: company || '',
    location: location || '',
    url: url
  };
}
