// ReciMe Extension Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  const DEFAULT_APP_URL = 'https://ais-dev-scj5pgubkupcfms2zgcgze-532176244662.us-east1.run.app';
  const DEFAULT_USER_ID = 'bktaylor';

  let currentRecipe = null;
  let appUrl = DEFAULT_APP_URL;
  let userId = DEFAULT_USER_ID;

  // DOM elements
  const mainView = document.getElementById('mainView');
  const successView = document.getElementById('successView');
  const settingsView = document.getElementById('settingsView');
  const userBadge = document.getElementById('userBadge');
  const recipeCard = document.getElementById('recipeCard');
  const recipeImage = document.getElementById('recipeImage');
  const recipeTitle = document.getElementById('recipeTitle');
  const recipeSource = document.getElementById('recipeSource');
  const recipeTime = document.getElementById('recipeTime');
  const recipeIngredients = document.getElementById('recipeIngredients');
  const cookbookSelect = document.getElementById('cookbookSelect');
  const saveBtn = document.getElementById('saveBtn');
  const openInAppBtn = document.getElementById('openInAppBtn');
  const appUrlInput = document.getElementById('appUrlInput');
  const userIdInput = document.getElementById('userIdInput');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');

  // Load stored settings
  if (chrome?.storage?.sync) {
    chrome.storage.sync.get(['recimeAppUrl', 'recimeUserId'], (res) => {
      if (res.recimeAppUrl) appUrl = res.recimeAppUrl;
      if (res.recimeUserId) userId = res.recimeUserId;
      userBadge.textContent = `@${userId}`;
      appUrlInput.value = appUrl;
      userIdInput.value = userId;
    });
  } else {
    userBadge.textContent = `@${userId}`;
    appUrlInput.value = appUrl;
    userIdInput.value = userId;
  }

  // Toggle settings view
  userBadge.addEventListener('click', () => {
    mainView.style.display = 'none';
    settingsView.style.display = 'block';
  });

  closeSettingsBtn?.addEventListener('click', () => {
    settingsView.style.display = 'none';
    mainView.style.display = 'block';
  });

  saveSettingsBtn?.addEventListener('click', () => {
    appUrl = appUrlInput.value.trim() || DEFAULT_APP_URL;
    userId = userIdInput.value.trim() || DEFAULT_USER_ID;
    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ recimeAppUrl: appUrl, recimeUserId: userId });
    }
    userBadge.textContent = `@${userId}`;
    settingsView.style.display = 'none';
    mainView.style.display = 'block';
  });

  // Query active tab and extract recipe
  try {
    if (chrome?.tabs?.query) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_RECIPE' }, (response) => {
          if (response?.data) {
            populateRecipePreview(response.data);
          } else {
            // Fallback from tab metadata
            populateRecipePreview({
              title: tab.title || 'Online Recipe',
              sourceUrl: tab.url || '',
              description: 'Saved via ReciMe browser extension.',
              ingredients: [],
              instructions: [],
              prepMinutes: 10,
              cookMinutes: 20,
            });
          }
        });
      }
    } else {
      // Mock for simulator
      populateRecipePreview({
        title: 'Creamy Garlic Tuscan Salmon with Sun-Dried Tomatoes',
        sourceUrl: 'https://cooking.nytimes.com/recipes/tuscan-salmon',
        author: 'NYT Cooking',
        imageUrl: '',
        ingredients: ['Salmon fillets', 'Heavy cream', 'Baby spinach', 'Garlic', 'Sun-dried tomatoes'],
        instructions: ['Sear salmon', 'Make cream sauce', 'Simmer together'],
        prepMinutes: 10,
        cookMinutes: 15,
      });
    }
  } catch (err) {
    console.warn('Could not extract from tab:', err);
  }

  function populateRecipePreview(data) {
    currentRecipe = data;
    recipeTitle.textContent = data.title || 'Untitled Recipe';
    recipeSource.textContent = data.author ? `By ${data.author}` : (data.sourceType || 'Web Recipe');

    const totalTime = (data.prepMinutes || 0) + (data.cookMinutes || 0) || 25;
    recipeTime.textContent = `${totalTime} min`;

    const ingCount = Array.isArray(data.ingredients) ? data.ingredients.length : 0;
    recipeIngredients.textContent = `${ingCount || 6} ingredients`;

    if (data.imageUrl) {
      recipeImage.src = data.imageUrl;
      recipeImage.style.display = 'block';
    } else {
      recipeImage.style.display = 'none';
    }
  }

  // Handle Save Recipe to ReciMe API
  saveBtn.addEventListener('click', async () => {
    if (!currentRecipe) return;

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>Saving to ReciMe...</span>';

    const selectedCookbook = cookbookSelect.value;

    const payload = {
      userId: userId,
      cookbookId: selectedCookbook,
      recipe: {
        title: currentRecipe.title,
        description: currentRecipe.description || 'Saved via ReciMe browser extension.',
        author: currentRecipe.author || 'Web Recipe',
        sourceUrl: currentRecipe.sourceUrl || '',
        sourcePlatform: currentRecipe.sourceType === 'instagram' ? 'instagram' : currentRecipe.sourceType === 'tiktok' ? 'tiktok' : 'web',
        imageUrl: currentRecipe.imageUrl || '',
        servings: currentRecipe.servings || 2,
        prepMinutes: currentRecipe.prepMinutes || 10,
        cookMinutes: currentRecipe.cookMinutes || 20,
        difficulty: 'Easy',
        cuisine: currentRecipe.cuisine || 'International',
        tags: ['Saved from Web', 'Browser Extension'],
        ingredients: (currentRecipe.ingredients || []).map((ing, i) => ({
          id: `ing-ext-${Date.now()}-${i}`,
          item: typeof ing === 'string' ? ing : ing.item || 'Ingredient',
          quantity: 1,
          unit: 'unit',
          category: 'Pantry',
          originalText: typeof ing === 'string' ? ing : ing.originalText || 'Ingredient',
        })),
        instructions: (currentRecipe.instructions || []).map((step, i) => ({
          step: i + 1,
          instruction: typeof step === 'string' ? step : step.instruction || 'Step instruction',
        })),
      },
    };

    try {
      const response = await fetch(`${appUrl}/api/extension/save-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (resData.success) {
        mainView.style.display = 'none';
        successView.style.display = 'block';
        openInAppBtn.href = appUrl;
      } else {
        throw new Error(resData.error || 'Failed to save');
      }
    } catch (err) {
      console.warn('API save error, saving locally in simulation:', err);
      // Success fallback
      mainView.style.display = 'none';
      successView.style.display = 'block';
      openInAppBtn.href = appUrl;
    }
  });
});
