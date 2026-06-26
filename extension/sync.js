// Sync Supabase session from web app (localhost) to Chrome Extension storage
function syncSession() {
  const sbKey = 'sb-uffxmfvvppeqgbpytfys-auth-token';
  try {
    const session = localStorage.getItem(sbKey);
    if (session) {
      chrome.storage.local.set({ [sbKey]: session }, () => {
        console.log('Internship Tracker Clipper: Session synced successfully.');
      });
    } else {
      chrome.storage.local.remove([sbKey], () => {
        console.log('Internship Tracker Clipper: Session cleared.');
      });
    }
  } catch (err) {
    console.error('Internship Tracker Clipper: Error syncing session:', err);
  }
}

// Run on page load
syncSession();

// Listen for storage changes
window.addEventListener('storage', (e) => {
  if (e.key === 'sb-uffxmfvvppeqgbpytfys-auth-token') {
    syncSession();
  }
});
