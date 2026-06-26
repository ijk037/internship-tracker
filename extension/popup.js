// Popup script for Internship Tracker Job Clipper

const supabaseUrl = 'https://uffxmfvvppeqgbpytfys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZnhtZnZ2cHBlcWdicHl0ZnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzU3MTYsImV4cCI6MjA5ODA1MTcxNn0.-JyL0YlfwKYS9g0lKepc9LMlMzoMc-arIWYneeqLtlA';

// Custom storage adapter for Supabase to persist auth state in Chrome Extension storage
const chromeStorageAdapter = {
  getItem: (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  },
  setItem: (key, value) => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  },
  removeItem: (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        resolve();
      });
    });
  }
};

// Initialize Supabase Client
const client = supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

let currentUser = null;
let currentJobUrl = '';
let hasFullSchema = true;

// UI Elements
const loginView = document.getElementById('login-view');
const clipperView = document.getElementById('clipper-view');
const loginForm = document.getElementById('login-form');
const clipperForm = document.getElementById('clipper-form');
const alertBox = document.getElementById('alert-box');
const userEmailText = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const saveBtn = document.getElementById('save-btn');
const loginBtn = document.getElementById('login-btn');

// Start extension popup
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkSession();
});

function setupEventListeners() {
  loginForm.addEventListener('submit', handleLogin);
  clipperForm.addEventListener('submit', handleSaveJob);
  logoutBtn.addEventListener('click', handleLogout);
}

// Show alert messages in popup
function showAlert(message, type = 'error') {
  alertBox.className = `alert alert-${type}`;
  alertBox.innerHTML = message;
  alertBox.classList.remove('hidden');
}

function hideAlert() {
  alertBox.classList.add('hidden');
}

// Check if user is authenticated
async function checkSession() {
  const { data: { session }, error } = await client.auth.getSession();
  if (error || !session) {
    showLoginView();
  } else {
    currentUser = session.user;
    showClipperView();
    await requestJobScraping();
  }
}

function showLoginView() {
  loginView.classList.remove('hidden');
  clipperView.classList.add('hidden');
  hideAlert();
}

function showClipperView() {
  loginView.classList.add('hidden');
  clipperView.classList.remove('hidden');
  userEmailText.textContent = currentUser.email;
  hideAlert();
}

// Handle login submission
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  loginBtn.disabled = true;
  loginBtn.innerHTML = '<span class="spinner"></span> <span>Signing In...</span>';
  hideAlert();

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    currentUser = data.user;
    showClipperView();
    await requestJobScraping();
  } catch (err) {
    showAlert(err.message || 'Login failed. Please check credentials.', 'error');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
}

// Handle logout
async function handleLogout() {
  await client.auth.signOut();
  currentUser = null;
  showLoginView();
}

// Request scraping from content script
async function requestJobScraping() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) return;
    
    const activeTab = tabs[0];
    
    // Check if we are on supported pages
    const isLinkedIn = activeTab.url.includes('linkedin.com');
    const isIndeed = activeTab.url.includes('indeed.com');
    
    if (!isLinkedIn && !isIndeed) {
      showAlert('Open a job post on LinkedIn or Indeed to auto-fill details.', 'info');
      currentJobUrl = activeTab.url;
      return;
    }

    chrome.tabs.sendMessage(activeTab.id, { action: 'scrapeJob' }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script might not be injected yet
        console.warn('Content script not reachable:', chrome.runtime.lastError.message);
        showAlert('Refresh the page or open a job to auto-fill.', 'info');
        currentJobUrl = activeTab.url;
      } else if (response) {
        document.getElementById('job-title').value = response.title || '';
        document.getElementById('job-company').value = response.company || '';
        document.getElementById('job-location').value = response.location || '';
        currentJobUrl = response.url || activeTab.url;
      }
    });
  });
}

// Save job details to Supabase
async function handleSaveJob(e) {
  e.preventDefault();
  hideAlert();
  
  const title = document.getElementById('job-title').value;
  const company = document.getElementById('job-company').value;
  const location = document.getElementById('job-location').value;
  const salary = document.getElementById('job-salary').value;
  const status = document.getElementById('job-status').value;
  const notes = document.getElementById('job-notes').value;

  if (!title || !company) {
    showAlert('Title and Company are required.', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span> <span>Saving Job...</span>';

  // Construct payload
  const payload = {
    user_id: currentUser.id,
    company: company.trim(),
    role: title.trim(),
    status: status
  };

  // Add extra fields if table supports them
  if (hasFullSchema) {
    if (location.trim()) payload.location = location.trim();
    if (salary.trim()) payload.salary = salary.trim();
    if (currentJobUrl) payload.job_url = currentJobUrl;
    if (notes.trim()) payload.notes = notes.trim();
  }

  try {
    let responseError;
    const { error } = await client
      .from('applications')
      .insert([payload]);
    
    responseError = error;

    if (responseError) {
      // Fallback if client doesn't support the full schema yet (missing columns)
      if (responseError.code === 'PGRST204' && hasFullSchema) {
        hasFullSchema = false;
        
        // Strip the extra columns and try saving basic payload
        const basicPayload = {
          user_id: currentUser.id,
          company: company.trim(),
          role: title.trim(),
          status: status
        };
        
        const { error: retryError } = await client
          .from('applications')
          .insert([basicPayload]);
          
        if (retryError) throw retryError;
        showAlert('Job saved! (Basic columns only - run migrations to unlock full fields)', 'success');
      } else {
        throw responseError;
      }
    } else {
      showAlert('Job successfully added to your tracker!', 'success');
    }
  } catch (err) {
    showAlert(err.message || 'Error occurred while saving job.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save to Tracker';
  }
}
