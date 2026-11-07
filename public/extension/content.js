// ReciMe Recipe Extractor Content Script
(function () {
  function parseISO8601Duration(duration) {
    if (!duration || typeof duration !== 'string') return 0;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return hours * 60 + minutes;
  }

  function extractRecipeJsonLd() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '{}');
        // Can be a single object or a @graph array
        const candidates = Array.isArray(data)
          ? data
          : data['@graph'] && Array.isArray(data['@graph'])
          ? data['@graph']
          : [data];

        for (const item of candidates) {
          const type = item['@type'];
          const isRecipe =
            type === 'Recipe' ||
            (Array.isArray(type) && type.includes('Recipe'));

          if (isRecipe) {
            return item;
          }
        }
      } catch (e) {
        // Continue searching
      }
    }
    return null;
  }

  function extractRecipeFromPage() {
    const jsonLd = extractRecipeJsonLd();
    const url = window.location.href;
    const hostname = window.location.hostname.toLowerCase();

    // 1. If high-fidelity Schema.org Recipe JSON-LD found:
    if (jsonLd) {
      // Ingredients extraction
      let ingredients = [];
      if (Array.isArray(jsonLd.recipeIngredient)) {
        ingredients = jsonLd.recipeIngredient.map((str) => String(str).trim());
      }

      // Instructions extraction
      let instructions = [];
      if (Array.isArray(jsonLd.recipeInstructions)) {
        instructions = jsonLd.recipeInstructions.map((step) => {
          if (typeof step === 'string') return step.trim();
          if (step && typeof step.text === 'string') return step.text.trim();
          if (step && typeof step.name === 'string') return step.name.trim();
          return '';
        }).filter(Boolean);
      } else if (typeof jsonLd.recipeInstructions === 'string') {
        instructions = jsonLd.recipeInstructions
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }

      // Image extraction
      let imageUrl = '';
      if (typeof jsonLd.image === 'string') {
        imageUrl = jsonLd.image;
      } else if (Array.isArray(jsonLd.image) && jsonLd.image.length > 0) {
        imageUrl = typeof jsonLd.image[0] === 'string' ? jsonLd.image[0] : jsonLd.image[0]?.url || '';
      } else if (jsonLd.image && typeof jsonLd.image.url === 'string') {
        imageUrl = jsonLd.image.url;
      }

      // Author extraction
      let author = '';
      if (typeof jsonLd.author === 'string') {
        author = jsonLd.author;
      } else if (jsonLd.author && typeof jsonLd.author.name === 'string') {
        author = jsonLd.author.name;
      } else if (Array.isArray(jsonLd.author) && jsonLd.author.length > 0) {
        author = jsonLd.author[0]?.name || String(jsonLd.author[0]);
      }

      // Servings extraction
      let servings = 2;
      if (jsonLd.recipeYield) {
        const yieldVal = Array.isArray(jsonLd.recipeYield) ? jsonLd.recipeYield[0] : jsonLd.recipeYield;
        const numMatch = String(yieldVal).match(/\d+/);
        if (numMatch) servings = parseInt(numMatch[0], 10);
      }

      return {
        found: true,
        sourceType: 'json_ld',
        sourceUrl: url,
        title: jsonLd.name || document.title,
        description: jsonLd.description || '',
        author: author || document.title.split(/[-|]/)[1]?.trim() || 'Food Creator',
        imageUrl: imageUrl || getOpenGraphImage(),
        servings: servings || 2,
        prepMinutes: parseISO8601Duration(jsonLd.prepTime) || 10,
        cookMinutes: parseISO8601Duration(jsonLd.cookTime) || 20,
        cuisine: Array.isArray(jsonLd.recipeCuisine) ? jsonLd.recipeCuisine[0] : jsonLd.recipeCuisine || 'General',
        ingredients,
        instructions,
        tags: Array.isArray(jsonLd.keywords) ? jsonLd.keywords : (typeof jsonLd.keywords === 'string' ? jsonLd.keywords.split(',') : []),
      };
    }

    // 2. Social Media Fallback (Instagram, TikTok, YouTube)
    if (hostname.includes('instagram.com')) {
      const captionEl = document.querySelector('h1') || document.querySelector('article span');
      const caption = captionEl ? captionEl.innerText : '';
      return {
        found: true,
        sourceType: 'instagram',
        sourceUrl: url,
        title: document.title.replace('on Instagram:', '').replace('• Instagram photos and videos', '').trim() || 'Instagram Reel Recipe',
        description: caption.slice(0, 200),
        rawContent: caption,
        author: document.title.split('on Instagram')[0]?.trim() || 'Instagram Creator',
        imageUrl: getOpenGraphImage(),
        ingredients: [],
        instructions: [],
      };
    }

    if (hostname.includes('tiktok.com')) {
      const titleEl = document.querySelector('h1[data-e2e="browse-video-desc"]') || document.querySelector('h1');
      const text = titleEl ? titleEl.innerText : '';
      return {
        found: true,
        sourceType: 'tiktok',
        sourceUrl: url,
        title: text.slice(0, 60) || document.title,
        description: text,
        rawContent: text,
        author: document.title.split('on TikTok')[0]?.trim() || 'TikTok Chef',
        imageUrl: getOpenGraphImage(),
        ingredients: [],
        instructions: [],
      };
    }

    // 3. General Fallback
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const ogImage = getOpenGraphImage();

    return {
      found: false,
      sourceType: 'web',
      sourceUrl: url,
      title: ogTitle || document.title,
      description: ogDesc || '',
      imageUrl: ogImage,
      ingredients: [],
      instructions: [],
    };
  }

  function getOpenGraphImage() {
    const metaImg =
      document.querySelector('meta[property="og:image"]') ||
      document.querySelector('meta[name="twitter:image"]');
    return metaImg ? metaImg.getAttribute('content') || '' : '';
  }

  // Listen for messages from extension popup or background worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'GET_PAGE_RECIPE') {
      const recipe = extractRecipeFromPage();
      sendResponse({ success: true, data: recipe });
    }
    return true;
  });
})();
