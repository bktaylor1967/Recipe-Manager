import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Ensure data storage directory exists
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.resolve(DATA_DIR, 'users_db.json');

// Password hashing utility with PBKDF2/scrypt
function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const computed = crypto.scryptSync(password, salt, 64).toString('hex');
  return computed === expectedHash;
}

// User Record Interface
interface UserRecord {
  id: string;
  userId: string; // unique handle e.g. "bktaylor"
  name: string;
  avatarUrl: string;
  bio: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
  data: {
    recipes: any[];
    cookbooks: any[];
    mealPlan: any[];
    groceryItems: any[];
    settings?: any;
  };
}

// Initial seed dataset
const SEED_COOKBOOKS = [
  {
    id: 'weeknight-20',
    title: 'Weeknight 20-Min Dinners',
    description: 'Fast, foolproof, and low-mess meals for busy evenings.',
    recipeCount: 2,
    isCustom: false,
  },
  {
    id: 'instagram-saves',
    title: 'Saved from Instagram',
    description: 'Viral reels and chef creations saved directly to ReciMe.',
    recipeCount: 3,
    isCustom: false,
  },
  {
    id: 'high-protein',
    title: 'High Protein Staples',
    description: '35g+ protein per serving to fuel active recovery.',
    recipeCount: 2,
    isCustom: false,
  },
  {
    id: 'sweet-treats',
    title: 'Sunday Baking & Sweets',
    description: 'Elevated desserts and afternoon bakes.',
    recipeCount: 1,
    isCustom: false,
  },
];

const SEED_RECIPES = [
  {
    id: 'recipe-tuscan-salmon',
    title: 'Crispy Skin Creamy Tuscan Salmon',
    description:
      'Pan-seared Atlantic salmon fillets with shatteringly crisp skin, simmered in a velvety garlic, sun-dried tomato, and baby spinach cream sauce.',
    author: 'Carolina Gelen',
    sourceUrl: 'https://instagram.com/reel/C8x9123TuscanSalmon',
    sourcePlatform: 'instagram',
    imageUrl: '/src/assets/images/creamy_tuscan_salmon_1794058991512.jpg',
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 18,
    difficulty: 'Easy',
    cuisine: 'Italian',
    calories: 520,
    proteinGrams: 42,
    tags: ['High-Protein', 'Keto', 'Under 30 Min', 'Gluten-Free', 'Date Night'],
    cookbookIds: ['weeknight-20', 'instagram-saves', 'high-protein'],
    isFavorite: true,
    rating: 4.9,
    createdAt: '2026-11-01T12:00:00Z',
    notes:
      'Ensure the salmon skin is completely patted bone-dry with paper towels before placing in the hot skillet.',
    ingredients: [
      {
        id: 'ing-1',
        item: 'Salmon fillets (skin-on)',
        quantity: 2,
        unit: 'fillets',
        category: 'Meat & Seafood',
        originalText: '2 wild-caught salmon fillets (approx. 180g each, skin-on)',
      },
      {
        id: 'ing-2',
        item: 'Olive oil',
        quantity: 2,
        unit: 'tbsp',
        category: 'Pantry',
        originalText: '2 tbsp extra virgin olive oil',
      },
      {
        id: 'ing-3',
        item: 'Garlic cloves',
        quantity: 4,
        unit: 'cloves',
        category: 'Produce',
        originalText: '4 garlic cloves, thinly sliced',
      },
      {
        id: 'ing-4',
        item: 'Sun-dried tomatoes in oil',
        quantity: 0.5,
        unit: 'cups',
        category: 'Pantry',
        originalText: '½ cup sun-dried tomatoes, drained and sliced',
      },
      {
        id: 'ing-5',
        item: 'Heavy whipping cream',
        quantity: 0.75,
        unit: 'cups',
        category: 'Dairy & Eggs',
        originalText: '¾ cup heavy whipping cream',
      },
      {
        id: 'ing-6',
        item: 'Baby spinach',
        quantity: 3,
        unit: 'cups',
        category: 'Produce',
        originalText: '3 cups fresh baby spinach leaves',
      },
    ],
    instructions: [
      {
        step: 1,
        instruction: 'Pat salmon fillets dry with paper towels and season with kosher salt and cracked black pepper.',
      },
      {
        step: 2,
        instruction: 'Sear salmon skin-side down in a hot skillet for 5 minutes until crispy and golden.',
        timerMinutes: 5,
      },
      {
        step: 3,
        instruction: 'Flip and cook for 2 minutes, then remove to plate.',
        timerMinutes: 2,
      },
      {
        step: 4,
        instruction: 'Simmer cream, garlic, sun-dried tomatoes, and spinach until velvety. Nestle salmon back in and serve.',
        timerMinutes: 3,
      },
    ],
  },
  {
    id: 'recipe-chili-noodles',
    title: '10-Minute Spicy Scallion Chili Crisp Noodles',
    description:
      'Springy artisanal wheat noodles tossed in a sizzling garlic, scallion, and Sichuan chili crisp oil with toasted sesame seeds and a jammy egg.',
    author: 'Chef Jon Kung',
    sourceUrl: 'https://tiktok.com/@jonkung/video/739182390192',
    sourcePlatform: 'tiktok',
    imageUrl: '/src/assets/images/crispy_chili_noodles_1794058994201.jpg',
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 5,
    difficulty: 'Easy',
    cuisine: 'Chinese',
    calories: 460,
    proteinGrams: 16,
    tags: ['Quick', 'Vegetarian', 'Under 15 Min', 'Late Night', 'Comfort Food'],
    cookbookIds: ['weeknight-20', 'instagram-saves'],
    isFavorite: true,
    rating: 4.8,
    createdAt: '2026-11-03T18:30:00Z',
    ingredients: [
      {
        id: 'ing-cn-1',
        item: 'Handmade fresh wheat or ramen noodles',
        quantity: 150,
        unit: 'g',
        category: 'Pantry',
        originalText: '150g fresh knife-cut or ramen wheat noodles',
      },
      {
        id: 'ing-cn-2',
        item: 'Chili crisp oil',
        quantity: 2,
        unit: 'tbsp',
        category: 'Pantry',
        originalText: '2 tbsp Sichuan chili crisp oil with crunchy bits',
      },
      {
        id: 'ing-cn-3',
        item: 'Scallions (green onions)',
        quantity: 3,
        unit: 'stalks',
        category: 'Produce',
        originalText: '3 scallions, finely sliced',
      },
    ],
    instructions: [
      { step: 1, instruction: 'Boil noodles for 3-4 minutes until al dente.', timerMinutes: 4 },
      { step: 2, instruction: 'Pour hot oil over garlic, scallions, and chili crisp.' },
      { step: 3, instruction: 'Toss noodles until glossy and top with soft-boiled egg.' },
    ],
  },
];

const SEED_GROCERY = [
  {
    id: 'groc-1',
    recipeId: 'recipe-tuscan-salmon',
    recipeTitle: 'Crispy Skin Creamy Tuscan Salmon',
    name: 'Salmon fillets (skin-on)',
    quantity: 2,
    unit: 'fillets',
    category: 'Meat & Seafood',
    checked: false,
    addedAt: '2026-11-06T10:00:00Z',
  },
  {
    id: 'groc-2',
    recipeId: 'recipe-tuscan-salmon',
    recipeTitle: 'Crispy Skin Creamy Tuscan Salmon',
    name: 'Baby spinach',
    quantity: 3,
    unit: 'cups',
    category: 'Produce',
    checked: false,
    addedAt: '2026-11-06T10:00:00Z',
  },
];

// Load or initialize Database
let usersDb: Record<string, UserRecord> = {};

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      usersDb = JSON.parse(content);
    } else {
      // Seed initial default users
      const user1Hash = hashPassword('recime123');
      const user2Hash = hashPassword('recime123');

      usersDb['bktaylor'] = {
        id: 'usr-bktaylor',
        userId: 'bktaylor',
        name: 'Brian Taylor',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=bktaylor',
        bio: 'Home chef loving weeknight quick pasta & high-protein seafood.',
        salt: user1Hash.salt,
        passwordHash: user1Hash.hash,
        createdAt: '2026-11-01T00:00:00Z',
        data: {
          recipes: SEED_RECIPES,
          cookbooks: SEED_COOKBOOKS,
          mealPlan: [],
          groceryItems: SEED_GROCERY,
        },
      };

      usersDb['chef_elena'] = {
        id: 'usr-chef_elena',
        userId: 'chef_elena',
        name: 'Elena Rostova',
        avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena',
        bio: 'Pastry chef & Sunday baker. Exploring artisanal Italian desserts.',
        salt: user2Hash.salt,
        passwordHash: user2Hash.hash,
        createdAt: '2026-11-02T00:00:00Z',
        data: {
          recipes: [SEED_RECIPES[0]],
          cookbooks: [SEED_COOKBOOKS[0], SEED_COOKBOOKS[3]],
          mealPlan: [],
          groceryItems: [],
        },
      };

      saveDb();
    }
  } catch (err) {
    console.error('Error loading users DB:', err);
    usersDb = {};
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(usersDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users DB:', err);
  }
}

loadDb();

// Active server sessions map (token -> userId)
const sessions = new Map<string, string>();

// Recipe Schema for structured output
const recipeResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Clear, enticing title of the recipe' },
    description: { type: Type.STRING, description: '1-2 sentence appetizing description' },
    author: { type: Type.STRING, description: 'Creator, chef, or food blog name if known' },
    servings: { type: Type.INTEGER, description: 'Standard number of servings (e.g. 2, 4)' },
    prepMinutes: { type: Type.INTEGER, description: 'Preparation time in minutes' },
    cookMinutes: { type: Type.INTEGER, description: 'Active cooking time in minutes' },
    difficulty: { type: Type.STRING, description: 'Easy, Medium, or Hard' },
    cuisine: { type: Type.STRING, description: 'e.g. Italian, Japanese, Mexican, Mediterranean, American, etc.' },
    calories: { type: Type.INTEGER, description: 'Estimated calories per serving' },
    protein: { type: Type.INTEGER, description: 'Estimated protein in grams per serving' },
    proteinGrams: { type: Type.INTEGER, description: 'Estimated protein in grams per serving' },
    carbs: { type: Type.INTEGER, description: 'Estimated carbohydrates in grams per serving' },
    fat: { type: Type.INTEGER, description: 'Estimated total fat in grams per serving' },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Dietary & meal tags like High-Protein, Weeknight, Quick, Gluten-Free, Dairy-Free',
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: 'Name of the ingredient (e.g. olive oil, boneless salmon)' },
          quantity: { type: Type.NUMBER, description: 'Numeric quantity (e.g. 2, 0.5, 250)' },
          unit: { type: Type.STRING, description: 'Unit (e.g. tbsp, tsp, cups, g, ml, cloves, fillets, pinch)' },
          category: {
            type: Type.STRING,
            description: 'One of: Produce, Meat & Seafood, Dairy & Eggs, Pantry, Bakery, Spices & Seasonings, Other',
          },
          originalText: { type: Type.STRING, description: 'Full line as presented' },
        },
        required: ['item', 'quantity', 'unit', 'category', 'originalText'],
      },
    },
    instructions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER, description: 'Sequential step number' },
          instruction: { type: Type.STRING, description: 'Clear, concise cooking action' },
          timerMinutes: { type: Type.INTEGER, description: 'Timer duration in minutes if applicable' },
        },
        required: ['step', 'instruction'],
      },
    },
    notes: { type: Type.STRING, description: 'Pro cooking tips, substitutions, or storage advice' },
  },
  required: ['title', 'description', 'servings', 'prepMinutes', 'cookMinutes', 'difficulty', 'cuisine', 'tags', 'ingredients', 'instructions'],
};

// ==========================================
// AUTHENTICATION & USER PROFILE ENDPOINTS
// ==========================================

// Register a new user profile
app.post('/api/auth/register', (req, res) => {
  try {
    const { userId, password, name, avatarUrl, bio } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and password are required' });
    }

    const cleanUserId = userId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUserId.length < 3) {
      return res.status(400).json({ error: 'User ID must be at least 3 characters (letters, numbers, underscores)' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    if (usersDb[cleanUserId]) {
      return res.status(409).json({ error: `User ID "${cleanUserId}" is already taken. Please choose another.` });
    }

    const { salt, hash } = hashPassword(password);
    const chosenAvatar =
      avatarUrl ||
      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(cleanUserId)}`;

    const newRecord: UserRecord = {
      id: `usr-${Date.now()}`,
      userId: cleanUserId,
      name: (name && name.trim()) || cleanUserId,
      avatarUrl: chosenAvatar,
      bio: (bio && bio.trim()) || 'Passionate home cook exploring recipes on ReciMe.',
      salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      data: {
        recipes: SEED_RECIPES,
        cookbooks: SEED_COOKBOOKS,
        mealPlan: [],
        groceryItems: [],
      },
    };

    usersDb[cleanUserId] = newRecord;
    saveDb();

    // Create session token
    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, cleanUserId);

    return res.json({
      success: true,
      token,
      user: {
        id: newRecord.id,
        userId: newRecord.userId,
        name: newRecord.name,
        avatarUrl: newRecord.avatarUrl,
        bio: newRecord.bio,
        createdAt: newRecord.createdAt,
      },
      data: newRecord.data,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and password are required' });
    }

    const cleanUserId = userId.trim().toLowerCase();
    const record = usersDb[cleanUserId];

    if (!record) {
      return res.status(401).json({ error: `User ID "${cleanUserId}" not found. Would you like to create an account?` });
    }

    const isValid = verifyPassword(password, record.salt, record.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, cleanUserId);

    return res.json({
      success: true,
      token,
      user: {
        id: record.id,
        userId: record.userId,
        name: record.name,
        avatarUrl: record.avatarUrl,
        bio: record.bio,
        createdAt: record.createdAt,
      },
      data: record.data,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Get profiles list (for easy switching/demo)
app.get('/api/auth/profiles', (_req, res) => {
  const profiles = Object.values(usersDb).map((u) => ({
    userId: u.userId,
    name: u.name,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    recipeCount: u.data?.recipes?.length || 0,
  }));
  return res.json({ profiles });
});

// Get current user profile and data by token or header
app.get('/api/user/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/, '');
  const targetUserId = (req.query.userId as string) || (token ? sessions.get(token) : null);

  if (!targetUserId || !usersDb[targetUserId.toLowerCase()]) {
    // Return default bktaylor profile if no session
    const defaultUser = usersDb['bktaylor'];
    if (defaultUser) {
      return res.json({
        user: {
          id: defaultUser.id,
          userId: defaultUser.userId,
          name: defaultUser.name,
          avatarUrl: defaultUser.avatarUrl,
          bio: defaultUser.bio,
          createdAt: defaultUser.createdAt,
        },
        data: defaultUser.data,
      });
    }
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const record = usersDb[targetUserId.toLowerCase()];
  return res.json({
    user: {
      id: record.id,
      userId: record.userId,
      name: record.name,
      avatarUrl: record.avatarUrl,
      bio: record.bio,
      createdAt: record.createdAt,
    },
    data: record.data,
  });
});

// Update user data (recipes, cookbooks, meal plan, grocery list)
app.put('/api/user/data', (req, res) => {
  const { userId, data } = req.body;
  if (!userId || !data) {
    return res.status(400).json({ error: 'User ID and data payload are required' });
  }

  const cleanUserId = userId.toLowerCase();
  if (!usersDb[cleanUserId]) {
    return res.status(404).json({ error: 'User not found' });
  }

  usersDb[cleanUserId].data = {
    ...usersDb[cleanUserId].data,
    ...data,
  };
  saveDb();

  return res.json({ success: true });
});

// Update profile metadata (name, bio, avatar)
app.put('/api/user/profile', (req, res) => {
  const { userId, name, bio, avatarUrl } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const cleanUserId = userId.toLowerCase();
  if (!usersDb[cleanUserId]) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) usersDb[cleanUserId].name = name.trim();
  if (bio !== undefined) usersDb[cleanUserId].bio = bio.trim();
  if (avatarUrl) usersDb[cleanUserId].avatarUrl = avatarUrl;
  saveDb();

  return res.json({
    success: true,
    user: {
      id: usersDb[cleanUserId].id,
      userId: usersDb[cleanUserId].userId,
      name: usersDb[cleanUserId].name,
      avatarUrl: usersDb[cleanUserId].avatarUrl,
      bio: usersDb[cleanUserId].bio,
      createdAt: usersDb[cleanUserId].createdAt,
    },
  });
});

// ==========================================
// BROWSER EXTENSION API ENDPOINTS
// ==========================================

// Save recipe from browser extension
app.post('/api/extension/save-recipe', (req, res) => {
  try {
    const { userId, cookbookId, recipe } = req.body;
    const cleanUserId = (userId || 'bktaylor').toLowerCase();

    const user = usersDb[cleanUserId] || usersDb['bktaylor'];
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const assignedCookbookIds: string[] = [];
    if (cookbookId && cookbookId !== 'all') {
      assignedCookbookIds.push(cookbookId);
    } else {
      assignedCookbookIds.push('weeknight-20');
    }

    const newRecipe = {
      id: `recipe-ext-${Date.now()}`,
      title: recipe.title || 'Saved Web Recipe',
      description: recipe.description || 'Saved with ReciMe Browser Extension.',
      author: recipe.author || 'Web Recipe',
      sourceUrl: recipe.sourceUrl || '',
      sourcePlatform: recipe.sourcePlatform || 'web',
      imageUrl: recipe.imageUrl || '/src/assets/images/honey_halloumi_bowl_1794058992953.jpg',
      servings: recipe.servings || 2,
      prepMinutes: recipe.prepMinutes || 10,
      cookMinutes: recipe.cookMinutes || 20,
      difficulty: recipe.difficulty || 'Easy',
      cuisine: recipe.cuisine || 'International',
      calories: recipe.calories !== undefined ? recipe.calories : 450,
      protein: recipe.protein !== undefined ? recipe.protein : (recipe.proteinGrams !== undefined ? recipe.proteinGrams : 22),
      proteinGrams: recipe.proteinGrams !== undefined ? recipe.proteinGrams : (recipe.protein !== undefined ? recipe.protein : 22),
      carbs: recipe.carbs !== undefined ? recipe.carbs : undefined,
      fat: recipe.fat !== undefined ? recipe.fat : undefined,
      tags: recipe.tags || ['Saved from Web', 'Browser Extension'],
      cookbookIds: assignedCookbookIds,
      isFavorite: false,
      rating: 5.0,
      createdAt: new Date().toISOString(),
      ingredients: (recipe.ingredients || []).map((ing: any, i: number) => ({
        id: `ing-ext-${Date.now()}-${i}`,
        item: typeof ing === 'string' ? ing : ing.item || 'Ingredient',
        quantity: typeof ing.quantity === 'number' ? ing.quantity : 1,
        unit: ing.unit || 'unit',
        category: ing.category || 'Pantry',
        originalText: typeof ing === 'string' ? ing : ing.originalText || ing.item || 'Ingredient',
      })),
      instructions: (recipe.instructions || []).map((step: any, i: number) => ({
        step: i + 1,
        instruction: typeof step === 'string' ? step : step.instruction || 'Step instruction',
      })),
      notes: 'Imported via ReciMe 1-Click Browser Extension.',
    };

    user.data.recipes = [newRecipe, ...(user.data.recipes || [])];
    saveDb();

    return res.json({
      success: true,
      message: 'Recipe saved to ReciMe!',
      recipe: newRecipe,
    });
  } catch (err: any) {
    console.error('Extension save error:', err);
    return res.status(500).json({ error: 'Failed to save recipe from extension' });
  }
});

// Get user cookbooks for extension dropdown
app.get('/api/extension/cookbooks', (req, res) => {
  const userId = ((req.query.userId as string) || 'bktaylor').toLowerCase();
  const user = usersDb[userId] || usersDb['bktaylor'];
  if (!user) {
    return res.json({ cookbooks: SEED_COOKBOOKS });
  }
  return res.json({ cookbooks: user.data?.cookbooks || SEED_COOKBOOKS });
});

// Download Chrome Extension ZIP bundle
app.get('/api/extension/download-zip', async (req, res) => {
  try {
    const extDir = path.resolve(__dirname, 'public', 'extension');
    const zip = new JSZip();

    const files = ['manifest.json', 'content.js', 'background.js', 'popup.html', 'popup.js', 'icon-48.png'];

    for (const f of files) {
      const filePath = path.join(extDir, f);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        zip.file(f, content);
      }
    }

    // Add a README.md explaining installation
    zip.file(
      'README.md',
      `# ReciMe Chrome & Edge Extension\n\n` +
      `### How to install in Google Chrome / Brave / Microsoft Edge:\n\n` +
      `1. Open Google Chrome and go to: chrome://extensions\n` +
      `2. Enable "Developer mode" using the toggle in the top-right corner.\n` +
      `3. Click the "Load unpacked" button in the top-left corner.\n` +
      `4. Select this unzipped folder.\n` +
      `5. Done! You will now see the ReciMe icon in your extensions toolbar.\n` +
      `\nBrowse to any recipe on Instagram, TikTok, NYT Cooking, or food blogs and click the icon to save recipes into your account in 1 click!\n`
    );

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="recime-chrome-extension.zip"');
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error('Error generating extension zip:', err);
    return res.status(500).json({ error: 'Failed to generate extension zip' });
  }
});

// ==========================================
// RECIPE PARSING & AI ENGINE
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    registeredUsers: Object.keys(usersDb).length,
    timestamp: new Date().toISOString(),
  });
});

// Parse / Import Recipe
app.post('/api/recipe/parse', async (req, res) => {
  try {
    const { type, payload, mimeType } = req.body;

    if (!payload) {
      return res.status(400).json({ error: 'Payload is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        fallbackAvailable: true,
      });
    }

    let contents: any;

    if (type === 'image') {
      const base64Data = payload.replace(/^data:image\/\w+;base64,/, '');
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: 'Transcribe and format this recipe photo/screenshot into a clean, structured ReciMe recipe. Standardize aisle categories into Produce, Meat & Seafood, Dairy & Eggs, Pantry, Spices & Seasonings, Bakery, Other.',
          },
        ],
      };
    } else if (type === 'url') {
      contents = `You are the ReciMe recipe extraction engine. Extract or reconstruct the complete, high-quality recipe from this link or video post URL: "${payload}". Standardize aisle categories and include any cooking timers.`;
    } else if (type === 'text') {
      contents = `You are the ReciMe recipe keeper engine. Convert this unstructured recipe notes into a clean structured recipe:
"""
${payload}
"""`;
    } else if (type === 'prompt') {
      contents = `You are an elite culinary chef for ReciMe. Create an inspiring, restaurant-quality yet approachable home recipe matching this request: "${payload}".`;
    } else {
      return res.status(400).json({ error: 'Invalid parsing type specified' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction:
          'You are ReciMe, the world\'s cleanest recipe organizer. Transform messy social media captions, food blog URLs, handwritten notes, and photos into immaculate structured recipes. Always categorize ingredients accurately into Produce, Meat & Seafood, Dairy & Eggs, Pantry, Spices & Seasonings, Bakery, or Other.',
        responseMimeType: 'application/json',
        responseSchema: recipeResponseSchema,
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({ success: true, recipe: parsedData });
  } catch (error: any) {
    console.error('Error parsing recipe with Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process recipe with Gemini AI',
      fallbackAvailable: true,
    });
  }
});

// Setup Vite middleware in dev / serve static in prod
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReciMe full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
