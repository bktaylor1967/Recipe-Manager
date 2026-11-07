import React, { useState } from 'react';
import { UserProfile, Cookbook, Recipe } from '../types/recipe';
import {
  X,
  Download,
  Puzzle,
  ExternalLink,
  Check,
  Sparkles,
  Laptop,
  CheckCircle2,
  Bookmark,
  Share2,
  Clock,
  ArrowRight,
  Globe,
  Instagram,
  FolderPlus,
} from 'lucide-react';
import JSZip from 'jszip';

interface ExtensionModalProps {
  currentUser: UserProfile | null;
  cookbooks: Cookbook[];
  onClose: () => void;
  onSaveRecipe: (recipe: Recipe) => void;
}

interface MockPage {
  id: string;
  platform: 'nyt' | 'instagram' | 'tiktok' | 'sally';
  siteName: string;
  url: string;
  title: string;
  author: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  cuisine: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
}

const MOCK_PAGES: MockPage[] = [
  {
    id: 'nyt-soup',
    platform: 'nyt',
    siteName: 'NYT Cooking',
    url: 'https://cooking.nytimes.com/recipes/classic-french-onion-soup',
    title: 'Rich French Onion Soup with Melted Gruyère',
    author: 'Melissa Clark',
    prepMinutes: 15,
    cookMinutes: 45,
    servings: 4,
    cuisine: 'French',
    imageUrl: '/src/assets/images/honey_halloumi_bowl_1794058992953.jpg',
    ingredients: [
      '3 lbs yellow onions, thinly sliced',
      '4 tbsp unsalted butter',
      '½ cup dry white wine',
      '6 cups rich beef bone broth',
      '1 fresh baguette, toasted slices',
      '2 cups shredded Gruyère cheese',
    ],
    instructions: [
      'Caramelize sliced onions in melted butter over medium-low heat for 35 minutes until deeply browned.',
      'Deglaze pot with white wine, then pour in beef stock and simmer for 15 minutes.',
      'Ladle soup into oven-safe crocks, top with toasted baguette and mounds of Gruyère.',
      'Broil under high heat for 3-4 minutes until bubbling and golden.',
    ],
  },
  {
    id: 'insta-pasta',
    platform: 'instagram',
    siteName: 'Instagram Reel',
    url: 'https://instagram.com/reel/lemon-ricotta-rigatoni',
    title: 'Velvety Lemon Ricotta Rigatoni',
    author: '@carolinagelen',
    prepMinutes: 5,
    cookMinutes: 12,
    servings: 2,
    cuisine: 'Italian',
    imageUrl: '/src/assets/images/creamy_tuscan_salmon_1794058991512.jpg',
    ingredients: [
      '250g rigatoni pasta',
      '1 cup whole milk ricotta',
      'Zest and juice of 1 Meyer lemon',
      '½ cup freshly grated parmesan',
      '3 tbsp extra virgin olive oil',
      'Fresh basil leaves',
    ],
    instructions: [
      'Boil rigatoni in salted water until al dente. Reserve ½ cup pasta cooking water.',
      'In a wide serving bowl, whisk ricotta with lemon zest, lemon juice, olive oil, and parmesan.',
      'Emulsify with hot pasta water, then toss in drained pasta and fresh torn basil.',
    ],
  },
  {
    id: 'tiktok-noodles',
    platform: 'tiktok',
    siteName: 'TikTok Video',
    url: 'https://tiktok.com/@chef/sichuan-chili-noodles',
    title: 'Sizzling Garlic Chili Crisp Noodles',
    author: '@jonkung',
    prepMinutes: 5,
    cookMinutes: 5,
    servings: 1,
    cuisine: 'Asian Fusion',
    imageUrl: '/src/assets/images/crispy_chili_noodles_1794058994201.jpg',
    ingredients: [
      '150g fresh wheat noodles',
      '2 tbsp Lao Gan Ma chili crisp',
      '3 scallions, chopped',
      '3 cloves garlic, minced',
      '1.5 tbsp soy sauce',
      '1 soft-boiled egg',
    ],
    instructions: [
      'Cook noodles for 3 minutes and drain.',
      'Place aromatics in bowl and pour smoking hot avocado oil directly on top.',
      'Toss noodles in sauce and serve with jammy egg.',
    ],
  },
];

export const ExtensionModal: React.FC<ExtensionModalProps> = ({
  currentUser,
  cookbooks,
  onClose,
  onSaveRecipe,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'download' | 'guide'>('simulator');
  const [selectedMock, setSelectedMock] = useState<MockPage>(MOCK_PAGES[0]);
  const [selectedCookbookId, setSelectedCookbookId] = useState<string>(cookbooks[0]?.id || 'weeknight-20');
  const [isSimulatingSave, setIsSimulatingSave] = useState(false);
  const [simulatedSaved, setSimulatedSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Download Chrome Extension ZIP bundle
  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      // Fetch ZIP from server endpoint or generate client-side
      const res = await fetch('/api/extension/download-zip');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recime-chrome-extension.zip';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Server download failed, generating fallback bundle');
      }
    } catch (err) {
      console.warn('Fallback zip generation:', err);
      // Fallback with JSZip
      const zip = new JSZip();
      zip.file(
        'manifest.json',
        JSON.stringify(
          {
            manifest_version: 3,
            name: 'ReciMe - Save Recipe from Anywhere',
            version: '1.0.0',
            action: { default_popup: 'popup.html' },
            permissions: ['activeTab', 'storage'],
          },
          null,
          2
        )
      );
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recime-chrome-extension.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  // Simulate clicking the extension popup "Save to ReciMe"
  const handleSimulatedSave = () => {
    setIsSimulatingSave(true);
    setTimeout(() => {
      const newRecipe: Recipe = {
        id: `recipe-ext-${Date.now()}`,
        title: selectedMock.title,
        description: `Saved from ${selectedMock.siteName} (${selectedMock.author}) via ReciMe Extension.`,
        author: selectedMock.author,
        sourceUrl: selectedMock.url,
        sourcePlatform:
          selectedMock.platform === 'instagram'
            ? 'instagram'
            : selectedMock.platform === 'tiktok'
            ? 'tiktok'
            : 'web',
        imageUrl: selectedMock.imageUrl,
        servings: selectedMock.servings,
        prepMinutes: selectedMock.prepMinutes,
        cookMinutes: selectedMock.cookMinutes,
        difficulty: 'Easy',
        cuisine: selectedMock.cuisine,
        tags: ['Saved with Extension', selectedMock.siteName],
        cookbookIds: [selectedCookbookId],
        isFavorite: false,
        rating: 5.0,
        createdAt: new Date().toISOString(),
        ingredients: selectedMock.ingredients.map((text, idx) => ({
          id: `ing-ext-${Date.now()}-${idx}`,
          item: text,
          quantity: 1,
          unit: 'unit',
          category: 'Pantry',
          originalText: text,
        })),
        instructions: selectedMock.instructions.map((text, idx) => ({
          step: idx + 1,
          instruction: text,
        })),
        notes: `Imported with ReciMe 1-Click Extension from ${selectedMock.url}`,
      };

      onSaveRecipe(newRecipe);
      setIsSimulatingSave(false);
      setSimulatedSaved(true);
      setTimeout(() => setSimulatedSaved(false), 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#FAF8F5] dark:bg-stone-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5A1F] text-white flex items-center justify-center shadow-sm">
              <Puzzle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                  Recipe Keeper Browser Extension
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold">
                  Manifest V3 Ready
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Save any recipe from Instagram, TikTok, food blogs, or YouTube with 1 click
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Packaging...' : 'Download Extension (.zip)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 pb-2 bg-stone-100/60 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'simulator'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Live Extension Simulator
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            3-Step Installation Guide
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Simulator instruction banner */}
              <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-stone-800 dark:text-stone-200">
                  <Sparkles className="w-4 h-4 text-[#FF5A1F]" />
                  <span>
                    Try the extension right now: Pick a sample food blog below and click <strong>"Save to ReciMe"</strong> in the extension popup to watch it import live into your account!
                  </span>
                </div>
              </div>

              {/* Sample Webpages Picker */}
              <div>
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
                  1. Choose a simulated webpage:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MOCK_PAGES.map((page) => {
                    const isSelected = selectedMock.id === page.id;
                    return (
                      <button
                        key={page.id}
                        onClick={() => setSelectedMock(page)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-white dark:bg-stone-800 border-[#FF5A1F] shadow-sm ring-2 ring-[#FF5A1F]/20'
                            : 'bg-white/60 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                          <span className="font-semibold text-[#FF5A1F]">
                            {page.siteName}
                          </span>
                          <span>{page.cuisine}</span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                          {page.title}
                        </h4>
                        <span className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                          By {page.author}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Split View: Webpage Mockup (Left) + Extension Popup Mockup (Right) */}
              <div>
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
                  2. Browser extension detecting recipe on the active tab:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left: Simulated Web Browser Tab */}
                  <div className="md:col-span-7 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/90 overflow-hidden shadow-xs">
                    {/* Browser Chrome Header */}
                    <div className="px-3 py-2 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center gap-2 text-[11px] text-stone-500">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex-1 bg-white dark:bg-stone-900 px-3 py-1 rounded-md text-stone-600 dark:text-stone-300 truncate font-mono text-[10px]">
                        {selectedMock.url}
                      </div>
                    </div>

                    {/* Page Content */}
                    <div className="p-4 space-y-3">
                      <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-stone-100">
                        <img
                          src={selectedMock.imageUrl}
                          alt={selectedMock.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
                          {selectedMock.siteName}
                        </span>
                        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                          {selectedMock.title}
                        </h3>
                        <span className="text-xs text-stone-500">
                          By {selectedMock.author} · {selectedMock.servings} Servings · {selectedMock.prepMinutes + selectedMock.cookMinutes} mins
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1">
                        <span className="font-bold block text-[11px] uppercase tracking-wide text-stone-400">
                          Ingredients Preview:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-stone-500">
                          {selectedMock.ingredients.slice(0, 3).map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                          <li className="text-stone-400 italic">
                            + {selectedMock.ingredients.length - 3} more ingredients...
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right: The ReciMe Extension Popup */}
                  <div className="md:col-span-5 rounded-2xl border-2 border-orange-300 dark:border-orange-800 bg-[#FAF8F5] dark:bg-stone-900 p-4 shadow-xl space-y-4">
                    {/* Extension Top Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#FF5A1F] text-white flex items-center justify-center font-bold text-xs">
                          R
                        </div>
                        <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100">
                          ReciMe Saver
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEEFEA] dark:bg-orange-950 text-[#FF5A1F] font-bold">
                        @{currentUser?.userId || 'bktaylor'}
                      </span>
                    </div>

                    {/* Detected Recipe Card */}
                    <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Recipe Schema Auto-Detected</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-tight">
                        {selectedMock.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500">
                        <Clock className="w-3 h-3" />
                        <span>{selectedMock.prepMinutes + selectedMock.cookMinutes} min</span>
                        <span>·</span>
                        <span>{selectedMock.ingredients.length} ingredients</span>
                      </div>
                    </div>

                    {/* Choose Cookbook Selector */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Save to Cookbook:
                      </label>
                      <select
                        value={selectedCookbookId}
                        onChange={(e) => setSelectedCookbookId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
                      >
                        {cookbooks.map((cb) => (
                          <option key={cb.id} value={cb.id}>
                            {cb.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CTA Button */}
                    {simulatedSaved ? (
                      <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 animate-in zoom-in-95">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Saved to ReciMe Collection!</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleSimulatedSave}
                        disabled={isSimulatingSave}
                        className="w-full py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-bold shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <span>{isSimulatingSave ? 'Saving to ReciMe...' : 'Save to ReciMe'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100">
                  How to Install in Chrome, Brave, Edge & Opera
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Takes less than 30 seconds using Chrome's built-in Developer extension loader.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#FF5A1F] font-bold text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Download and Unzip the Extension Bundle
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                      Click the <strong>"Download Extension (.zip)"</strong> button above or below. Once downloaded, extract / unzip the folder onto your computer.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#FF5A1F] font-bold text-sm flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Open Extensions & Turn on Developer Mode
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                      In Google Chrome, navigate to{' '}
                      <code className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 font-mono text-[11px]">
                        chrome://extensions
                      </code>
                      . In the top-right corner, toggle on <strong>"Developer mode"</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#FF5A1F] font-bold text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Click "Load unpacked" & Select Folder
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                      Click the <strong>"Load unpacked"</strong> button in the top-left and select the unzipped <code>recime-chrome-extension</code> folder. The orange ReciMe icon will appear in your browser toolbar!
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="px-6 py-3 rounded-2xl bg-[#FF5A1F] hover:bg-[#E84E15] text-white text-xs font-bold shadow-md shadow-orange-600/25 inline-flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Extension (.zip) Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
