import { MapBranch, BranchMicroCheck } from '../types';

/**
 * Derives or returns a child-friendly curiosity hook question for a map branch
 * Replaces academic jargon with an everyday mystery to engage student curiosity before headings
 */
export function getCuriosityHook(branch: MapBranch, branchIndex: number): string {
  if (branch.curiosityHook && branch.curiosityHook.trim().length > 0) {
    return branch.curiosityHook;
  }

  const name = branch.branchName.toLowerCase();
  const analogy = (branch.analogy || '').toLowerCase();

  // Water Cycle & Weather specific hooks
  if (name.includes('evaporat') || analogy.includes('puddle') || analogy.includes('porch')) {
    return 'Why do rain puddles disappear on sunny afternoons?';
  }
  if (name.includes('transpirat') || name.includes('plant') || analogy.includes('drinking straw')) {
    return 'How do giant leafy trees drink gallons without a mouth?';
  }
  if (name.includes('condensat') || name.includes('cloud') || analogy.includes('soda') || analogy.includes('sweat')) {
    return 'Why does your cold soda glass sweat on a warm day?';
  }
  if (name.includes('precipitat') || name.includes('rain') || analogy.includes('sponge')) {
    return "Why can't heavy clouds hold their water forever?";
  }
  if (name.includes('runoff') || name.includes('aquifer') || name.includes('collect') || analogy.includes('driveway')) {
    return 'Where does all the rainwater go when it sinks into the dirt?';
  }

  // Indus Valley & History hooks
  if (name.includes('drain') || name.includes('sanitat') || analogy.includes('sewage')) {
    return 'How did an ancient city stay spotless without electric pumps?';
  }
  if (name.includes('bath') || analogy.includes('pool')) {
    return 'Why did ancient builders seal a giant pool with black tar?';
  }
  if (name.includes('town') || name.includes('grid') || analogy.includes('chessboard') || analogy.includes('planned')) {
    return 'Why were streets laid out like a giant chessboard 4,500 years ago?';
  }
  if (name.includes('trade') || name.includes('seal') || name.includes('weight')) {
    return 'How did traders do business thousands of miles away without cash?';
  }

  // Biology & Chemistry & Physics hooks
  if (name.includes('photosynthes') || analogy.includes('kitchen') || analogy.includes('cooking')) {
    return 'How do green leaves cook food out of thin air and sunlight?';
  }
  if (name.includes('circuit') || name.includes('current') || analogy.includes('switch') || analogy.includes('bulb')) {
    return 'How does flipping a tiny switch make a bulb light up instantly?';
  }
  if (name.includes('battery') || name.includes('voltage') || analogy.includes('pump') || analogy.includes('push')) {
    return 'What invisible force pushes electricity through a copper wire?';
  }
  if (name.includes('cell') || name.includes('organelle') || analogy.includes('factory')) {
    return 'What tiny microscopic factories keep your body alive right now?';
  }
  if (name.includes('force') || name.includes('gravity') || name.includes('motion')) {
    return "Why doesn't the moon fall straight down onto our heads?";
  }
  if (name.includes('digest') || analogy.includes('fuel')) {
    return 'How does an apple you eat turn into energy for running?';
  }

  // Generic natural fallback
  return `Mystery ${branchIndex + 1}: How does this really work in your daily life?`;
}

/**
 * Returns a high-yield, low-stakes exam micro-check question for a branch
 */
export function getBranchMicroCheck(
  branch: MapBranch,
  chapterTitle: string,
  branchIndex: number
): BranchMicroCheck {
  if (branch.microCheck && branch.microCheck.options && branch.microCheck.options.length >= 2) {
    return branch.microCheck;
  }

  const name = branch.branchName.toLowerCase();
  const analogy = (branch.analogy || '').toLowerCase();

  // High-yield curated checks for core science topics
  if (name.includes('evaporat')) {
    return {
      question: 'Which energy source powers evaporation from Earth’s oceans and lakes?',
      options: ['The Moon’s gravitational pull', 'The Sun’s solar thermal radiation', 'Wind currents alone', 'Earth’s volcanic core'],
      correctIndex: 1,
      explanation: 'The Sun provides the thermal energy that heats water molecules so they break liquid bonds and lift as vapor.',
      hint: 'Look up in the sky on a warm day! What warms up sidewalk puddles and bath towels?',
    };
  }

  if (name.includes('transpirat')) {
    return {
      question: 'Through which microscopic leaf pores do plants release water vapor into the air?',
      options: ['Bark stomata', 'Stomata', 'Chloroplast vessels', 'Root cap hairs'],
      correctIndex: 1,
      explanation: 'Stomata (singular: stoma) are the tiny microscopic pores on leaf undersides that allow gas exchange and transpiration.',
      hint: 'Remember the word that sounds like "mouths" on leaves that breathe out moisture!',
    };
  }

  if (name.includes('condensat')) {
    return {
      question: 'When a cold glass of soda "sweats" drops on the outside, what actually happened?',
      options: [
        'Liquid soda seeped through tiny holes in the glass',
        'Warm invisible vapor in the room chilled on the cold glass and turned into liquid',
        'The ice inside dissolved the glass wall',
        'Cold air created new water atoms out of nothing',
      ],
      correctIndex: 1,
      explanation: 'Warm water vapor gas in the room contacts the chilly surface, cools down to its dew point, and condenses into liquid droplets.',
      hint: 'The glass has zero holes! The water comes from invisible moisture floating right in the room.',
    };
  }

  if (name.includes('precipitat')) {
    return {
      question: 'Why does cloud moisture eventually fall to the ground as rain or snow?',
      options: [
        'The Sun pulls the droplets downward',
        'Tiny droplets merge into heavy drops until gravity pulls them down through updrafts',
        'Clouds disappear completely whenever wind blows',
        'The sky runs out of air pressure',
      ],
      correctIndex: 1,
      explanation: 'Inside clouds, microscopic droplets coalesce (bump and merge) until they are too heavy for rising updraft winds to support, and gravity pulls them down.',
      hint: 'Think of a kitchen sponge holding more and more water until it gets too heavy to hold!',
    };
  }

  if (name.includes('runoff') || name.includes('aquifer') || name.includes('collect')) {
    return {
      question: 'What happens to rainwater that infiltrates deep through porous soil and rock?',
      options: [
        'It instantly boils away underground',
        'It collects in natural subterranean aquifers as groundwater',
        'It converts into solid granite bedrock',
        'It turns into oil within days',
      ],
      correctIndex: 1,
      explanation: 'Percolating rainwater filters deep through soil and porous rock to replenish underground aquifers that supply wells and springs.',
      hint: 'Think of a natural underground water sponge that whole towns pump water from!',
    };
  }

  if (name.includes('sanitat') || name.includes('drain')) {
    return {
      question: 'What notable sanitation feature did Indus Valley homes have connected to city streets?',
      options: [
        'Open smelly ditches through living rooms',
        'Covered underground drains with removable inspection covers',
        'Electric water treatment turbines',
        'Plastic pipes imported from Europe',
      ],
      correctIndex: 1,
      explanation: 'Indus Valley cities featured covered street drains lined with baked bricks and inspection covers for regular cleaning.',
      hint: 'Think about how modern cities hide waste pipes under streets to prevent smell and sickness.',
    };
  }

  // Synthesize dynamically from takeaways or subpoints
  const mainTakeaway = branch.keyTakeaways?.[0] || branch.subPoints?.[0] || `${branch.branchName} is a fundamental concept.`;
  const cleanAnswer = mainTakeaway.replace(/\.$/, '');

  return {
    question: `Which statement best explains the key exam takeaway for "${branch.branchName}"?`,
    options: [
      cleanAnswer,
      `This process only occurs under zero gravity in deep space.`,
      `It has no relation to real-world science or everyday life.`,
      `It reverses completely without requiring any energy or mechanism.`,
    ],
    correctIndex: 0,
    explanation: `${branch.branchName} is directly aligned to this: ${mainTakeaway}`,
    hint: `Review the essential takeaway: think about the everyday analogy for ${branch.branchName}!`,
  };
}

/**
 * Storage helpers for chapter progression
 */
export function getStoredUnlockedStep(chapterId: string): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = localStorage.getItem(`cmk_fog_unlocked_${chapterId}`);
    if (raw) {
      const val = parseInt(raw, 10);
      if (!isNaN(val) && val >= 1) return val;
    }
  } catch (e) {
    // ignore
  }
  return 1; // Default: Step 0 (Big Idea) and Step 1 (First branch) are unlocked
}

export function saveStoredUnlockedStep(chapterId: string, stepIndex: number): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredUnlockedStep(chapterId);
    if (stepIndex > current) {
      localStorage.setItem(`cmk_fog_unlocked_${chapterId}`, String(stepIndex));
    }
  } catch (e) {
    // ignore
  }
}

export function getCompletedMicroChecks(chapterId: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`cmk_microchecks_${chapterId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return {};
}

export function saveCompletedMicroCheck(chapterId: string, branchIdOrIndex: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCompletedMicroChecks(chapterId);
    current[branchIdOrIndex] = true;
    localStorage.setItem(`cmk_microchecks_${chapterId}`, JSON.stringify(current));
  } catch (e) {
    // ignore
  }
}
