export type AdventureLevel = {
  level: number;
  words: string[];
};

/** 300 keyboard-typable words, grouped into 30 levels (level 1 = easiest → level 30 = hardest). */
const HARD_POOL = [
  "extraordinary", "programmers", "javascript", "typescript", "butterflies", "playground",
  "watermelon", "basketball", "volleyball", "strawberry", "blueberry", "chocolate",
  "hamburger", "pineapple", "cucumber", "cauliflower", "broccoli", "asparagus",
  "avocado", "pomegranate", "grapefruit", "tangerine", "calculator", "photograph",
  "landscape", "seascape", "skyline", "spaceship", "astronaut", "inventor",
  "scientist", "engineer", "architect", "sculptor", "journalist", "detective",
  "corporate", "industry", "warehouse", "boutique", "magnifying", "navigation",
  "coordinate", "longitude", "latitude", "acceleration", "magnetism", "electricity",
  "microscope", "telescope", "experiment", "laboratory", "classified", "shareholder",
  "investment", "accounting", "enchanting", "formidable", "remarkable", "tremendous",
  "wonderland", "friendship", "leadership", "membership", "partnership", "championship",
  "background", "foreground", "throughout", "themselves", "everything", "everywhere",
  "somewhere", "nowhere", "keyboard", "challenge", "discovery", "education",
  "knowledge", "lightning", "sunflower", "football", "spaghetti", "quesadilla",
  "jalapeno", "cinnamon", "vanilla", "sandwich", "burrito", "enchilada",
  "quartets", "quizzes", "jazziest", "quickly", "quacked", "jumbled",
  "fixable", "mixing", "boxing", "foxes", "jumps", "lazy",
];

const MED_POOL = [
  "quick", "wind", "type", "over", "purple", "planet", "galaxy", "quantum",
  "physics", "chemistry", "biology", "history", "culture", "language", "literature",
  "poetry", "music", "guitar", "violin", "trumpet", "saxophone", "flute", "piano",
  "circle", "square", "triangle", "pyramid", "cylinder", "sphere", "compass",
  "computer", "monitor", "printer", "scanner", "router", "network", "internet",
  "website", "browser", "server", "database", "storage", "memory", "processor",
  "graphics", "animation", "cartoon", "superhero", "villain", "wizard", "dragon",
  "unicorn", "phoenix", "crystal", "diamond", "emerald", "sapphire", "silver",
  "golden", "bronze", "copper", "steel", "metal", "stone", "brick", "highway",
  "railway", "airport", "harbor", "fortress", "castle", "palace", "temple",
  "statue", "monument", "trophy", "medal", "ribbon", "banner", "shield", "rocket",
  "satellite", "explorer", "pioneer", "designer", "artist", "painter", "writer",
  "author", "editor", "reporter", "camera", "picture", "portrait", "sunset",
  "sunrise", "rainbow", "thunder", "tornado", "blizzard", "glacier", "desert",
  "jungle", "meadow", "valley", "canyon", "plateau", "island", "capital", "village",
  "avenue", "bridge", "tunnel", "station", "platform", "passport", "luggage",
  "backpack", "wallet", "market", "factory", "startup", "founder", "profit",
  "revenue", "expense", "budget", "finance", "lawyer", "mission", "secret",
  "document", "summary", "analysis", "research", "survey", "spectrum", "velocity",
  "momentum", "gravity", "proton", "neutron", "molecule", "particle", "amplitude",
  "learning", "thinking", "teaching", "building", "creating", "running", "jumping",
  "climbing", "swimming", "fishing", "cooking", "baking", "reading", "writing",
  "typing", "practicing", "training", "working", "playing", "singing", "dancing",
  "smiling", "laughing", "helping", "sharing", "caring", "loving", "hoping",
  "dreaming", "planning", "trying", "winning", "losing", "starting", "ending",
];

const EASY_POOL = [
  "cat", "dog", "sun", "fun", "run", "play", "book", "tree", "star", "moon",
  "bird", "fish", "frog", "duck", "lion", "bear", "wolf", "deer", "nest", "leaf",
  "rain", "snow", "wind", "fire", "lake", "hill", "road", "path", "game", "love",
  "hope", "jump", "kick", "ball", "kite", "ship", "boat", "desk", "hand", "foot",
  "head", "eyes", "nose", "milk", "cake", "rice", "corn", "bean", "meat", "song",
  "read", "type", "code", "keys", "home", "work", "help", "open", "good", "best",
  "fast", "slow", "high", "low", "big", "red", "blue", "pink", "gold", "gray",
  "one", "two", "four", "five", "six", "seven", "eight", "nine", "ten", "boy",
  "girl", "baby", "zoo", "box", "cup", "pen", "map", "car", "bus", "jet",
  "air", "sea", "sky", "day", "warm", "cool", "cold", "hot", "wet", "dry",
  "new", "old", "yes", "eat", "sit", "bat", "bit", "fit", "hit", "lit",
  "fig", "dig", "pig", "log", "fog", "hog", "jog", "tag", "bag", "rag",
  "gap", "lap", "tap", "nap", "cap", "mop", "pop", "top", "hop", "dot",
  "lot", "not", "got", "pot", "job", "rod", "nod", "jot", "cog", "fox",
  "mix", "fix", "box", "six", "wax", "max", "tax", "fax", "hex", "vex",
  "ace", "ice", "age", "ale", "ape", "arc", "ark", "arm", "art", "ash",
  "ask", "ate", "awe", "axe", "bad", "bag", "ban", "bar", "bat", "bay",
  "bed", "bee", "beg", "bet", "bid", "big", "bin", "bit", "bow", "box",
  "boy", "bud", "bug", "bun", "bus", "but", "buy", "cab", "can", "cap",
  "car", "cat", "cop", "cot", "cow", "cry", "cub", "cup", "cut", "dab",
  "dad", "dam", "day", "den", "dew", "did", "die", "dig", "dim", "din",
  "dip", "dog", "dot", "dry", "dub", "dud", "due", "dug", "dye", "ear",
  "eat", "egg", "elf", "elk", "elm", "end", "era", "eve", "eye", "fan",
  "far", "fat", "fax", "fed", "fee", "few", "fig", "fin", "fir", "fit",
  "fix", "fly", "foe", "fog", "for", "fox", "fry", "fun", "fur", "gag",
  "gap", "gas", "gel", "gem", "get", "gig", "gin", "god", "got", "gum",
  "gun", "gut", "guy", "gym", "had", "ham", "has", "hat", "hay", "hem",
  "hen", "her", "hex", "hid", "him", "hip", "his", "hit", "hog", "hop",
  "hot", "how", "hub", "hue", "hug", "hum", "hut", "ice", "icy", "ill",
  "imp", "ink", "inn", "ion", "irk", "its", "ivy", "jab", "jag", "jam",
  "jar", "jaw", "jay", "jet", "jig", "job", "jog", "jot", "joy", "jug",
];

function uniqueWords(words: string[]): string[] {
  return [...new Set(words.map((w) => w.toLowerCase()))];
}

function chunkWords(pool: string[], size: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < pool.length; i += size) {
    chunks.push(pool.slice(i, i + size));
  }
  return chunks;
}

function buildAdventureLevels(): AdventureLevel[] {
  const hard = uniqueWords(HARD_POOL).sort((a, b) => a.length - b.length);
  const med = uniqueWords(MED_POOL)
    .filter((w) => !hard.includes(w))
    .sort((a, b) => a.length - b.length);
  const easy = uniqueWords(EASY_POOL)
    .filter((w) => !hard.includes(w) && !med.includes(w))
    .sort((a, b) => a.length - b.length);

  const hardChunks = chunkWords(hard, 10);
  const medChunks = chunkWords(med, 10);
  const easyChunks = chunkWords(easy, 10);

  const levels: AdventureLevel[] = [];
  let levelNum = 1;

  for (const chunk of easyChunks.slice(0, 10)) {
    if (chunk.length === 10) levels.push({ level: levelNum++, words: chunk });
  }
  for (const chunk of medChunks.slice(0, 10)) {
    if (chunk.length === 10) levels.push({ level: levelNum++, words: chunk });
  }
  for (const chunk of hardChunks.slice(0, 10)) {
    if (chunk.length === 10) levels.push({ level: levelNum++, words: chunk });
  }

  while (levels.length < 30) {
    const idx = levels.length;
    levels.push({
      level: idx + 1,
      words: easy.slice(idx * 10, idx * 10 + 10).length === 10
        ? easy.slice(idx * 10, idx * 10 + 10)
        : ["cat", "dog", "sun", "fun", "run", "play", "book", "tree", "star", "moon"],
    });
  }

  return levels.slice(0, 30);
}

export const ADVENTURE_LEVELS = buildAdventureLevels();
export const ADVENTURE_LEVEL_COUNT = ADVENTURE_LEVELS.length;
export const ADVENTURE_WORDS_PER_LEVEL = 10;

/** @deprecated Use ADVENTURE_LEVELS */
export const ADVENTURE_WORDS = ADVENTURE_LEVELS.flatMap((l) => l.words);
