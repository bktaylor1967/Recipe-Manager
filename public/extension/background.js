// ReciMe Background Service Worker (Manifest V3)
chrome.runtime.onInstalled.addListener(() => {
  // Create right-click context menu
  chrome.contextMenus.create({
    id: 'recime-save-recipe',
    title: 'Save Recipe to ReciMe',
    contexts: ['page', 'link', 'selection', 'image'],
  });

  // Default app configuration
  chrome.storage.sync.get(['recimeAppUrl', 'recimeUserId'], (res) => {
    if (!res.recimeAppUrl) {
      chrome.storage.sync.set({
        recimeAppUrl: 'https://ais-dev-scj5pgubkupcfms2zgcgze-532176244662.us-east1.run.app',
      });
    }
  });
});

// Handle right-click context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'recime-save-recipe' && tab?.id) {
    chrome.action.openPopup?.();
  }
});
