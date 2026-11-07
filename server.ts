import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
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
    proteinGrams: { type: Type.INTEGER, description: 'Estimated protein in grams per serving' },
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
          originalText: { type: Type.STRING, description: 'Full line as presented (e.g. 2 tbsp extra virgin olive oil)' },
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
          timerMinutes: { type: Type.INTEGER, description: 'Timer duration in minutes if this step has an active wait/cook time, or 0 if none' },
        },
        required: ['step', 'instruction'],
      },
    },
    notes: { type: Type.STRING, description: 'Pro cooking tips, ingredient substitutions, or storage advice' },
  },
  required: ['title', 'description', 'servings', 'prepMinutes', 'cookMinutes', 'difficulty', 'cuisine', 'tags', 'ingredients', 'instructions'],
};

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// API: Parse / Import Recipe
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
      // Photo OCR / Recipe screenshot parsing
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
            text: 'Transcribe and format this recipe photo/screenshot into a clean, structured ReciMe recipe. Extract exact ingredients with standardized aisle categories (Produce, Meat & Seafood, Dairy & Eggs, Pantry, Spices & Seasonings, Bakery, Other), quantities, units, and sequential instructions with cooking timers.',
          },
        ],
      };
    } else if (type === 'url') {
      contents = `You are the ReciMe recipe extraction engine. Extract or reconstruct the complete, high-quality recipe from this link or video post URL: "${payload}". 
Identify the dish, author or creator if mentioned, complete ingredients with measurements, aisle categories, prep/cook times, and crystal-clear step-by-step instructions. If specific minutes are mentioned in instructions (e.g. "simmer for 10 minutes"), set timerMinutes accordingly.`;
    } else if (type === 'text') {
      contents = `You are the ReciMe recipe keeper engine. Convert this unstructured recipe notes, message, or caption into a clean structured recipe:
"""
${payload}
"""
Normalize ingredients into clean numeric quantities, units, and categorized supermarket aisles. Break instructions into clear actionable steps.`;
    } else if (type === 'prompt') {
      contents = `You are an elite culinary chef for ReciMe. Create an inspiring, restaurant-quality yet approachable home recipe matching this request: "${payload}". Include exact ingredients with aisle categories, times, and clear steps with timers.`;
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

// Vite middleware in dev, static serving in prod
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
