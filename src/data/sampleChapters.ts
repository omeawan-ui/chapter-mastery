import { Chapter } from '../types';

export const initialSampleChapters: Chapter[] = [
  {
    id: 'ch_water_cycle',
    title: 'The Water Cycle & Weather Systems',
    subject: 'Science',
    grade: 6,
    examDate: '2026-11-15',
    dateAdded: '2026-10-15T08:00:00.000Z',
    lastStudied: '2026-10-18T14:30:00.000Z',
    text: `The water cycle, also known as the hydrologic cycle, describes the continuous movement of water on, above, and below the surface of the Earth. The Sun is the primary engine powering this entire system. Heat from solar radiation warms water in oceans, rivers, and lakes, converting liquid water into water vapor through evaporation. Plants also release moisture into the atmosphere through microscopic pores on their leaves, a process called transpiration. As moist air warms and rises, it expands and cools in the upper atmosphere. When cooling water vapor reaches its dew point, it condenses into microscopic water droplets around tiny dust particles (cloud condensation nuclei) to form clouds. When these droplets grow heavy through collision and coalescence, gravity pulls them down as precipitation (rain, snow, hail, or sleet). Precipitation falls onto land and bodies of water; surface runoff flows into streams, while infiltration allows water to percolate into soil and replenish deep underground aquifers. Water then flows back into lakes and oceans, ready for the cycle to begin again.`,
    sources: [
      { id: 's1', label: 'Grade 6 Science Textbook - Chapter 4', type: 'text' },
      { id: 's2', label: 'NASA Earth Observatory: The Water Cycle', type: 'link', url: 'https://earthobservatory.nasa.gov' }
    ],
    masteryScore: 78,
    xpEarned: 240,
    quizScores: [75, 88],
    reviews: [
      { date: '2026-10-16T10:00:00.000Z', score: 80, type: 'quiz' },
      { date: '2026-10-18T14:00:00.000Z', score: 85, type: 'question' }
    ],
    reviewDates: [
      { day: 2, date: '2026-10-17T08:00:00.000Z', done: true },
      { day: 3, date: '2026-10-18T08:00:00.000Z', done: true },
      { day: 7, date: '2026-10-22T08:00:00.000Z', done: false },
      { day: 21, date: '2026-11-05T08:00:00.000Z', done: false }
    ],
    map: {
      chapterTitle: 'The Water Cycle & Weather Systems',
      oneLineSummary: 'Earth\'s endless recycling system where solar heat transforms water between liquid, vapor, and ice.',
      bigIdea: 'Every drop of water we drink today was once drunk by dinosaurs millions of years ago because water never disappears — it just constantly changes form and location.',
      bigIdeaEmoji: '💧',
      bigIdeaAnalogy: 'Think of Earth as a giant sealed greenhouse with a boiling soup pot in the middle: water rises as steam, hits the cool glass roof, forms droplets, and rains back down into the soup bowl.',
      learningOutcomes: [
        'Explain how solar energy drives evaporation and transpiration',
        'Describe the process of condensation and cloud droplet formation',
        'Distinguish between precipitation, runoff, infiltration, and percolation',
        'Understand why total freshwater on Earth remains conserved'
      ],
      estimatedStudyMinutes: 25,
      branches: [
        {
          id: 'b1',
          branchName: 'The Solar Engine & Evaporation',
          branchEmoji: '☀️',
          analogy: 'Like puddles vanishing after rain when the hot midday sun bakes the sidewalk.',
          subPoints: [
            'Solar thermal radiation heats surface water molecules in oceans, rivers, and lakes.',
            'Heated molecules gain kinetic energy and break intermolecular bonds, turning into invisible water vapor.',
            'Oceans contribute over 85% of global evaporated water vapor into the atmosphere.',
            'Higher temperatures and windy conditions accelerate the rate of evaporation.'
          ],
          keyTakeaways: [
            'The Sun is the indispensable power source of the hydrologic cycle.',
            'Evaporation converts liquid water into gaseous water vapor.',
            'Oceans are the primary reservoir driving global water vapor supply.'
          ]
        },
        {
          id: 'b2',
          branchName: 'Transpiration from Plants',
          branchEmoji: '🌿',
          analogy: 'Like plants "sweating" water vapor through tiny invisible mouth-like pores after drinking from soil.',
          subPoints: [
            'Roots absorb water and dissolved soil minerals, transporting them up stems via xylem vessels.',
            'Microscopic leaf pores called stomata open for photosynthesis gas exchange and release water vapor.',
            'A single large mature tree can transpire hundreds of gallons of water on a dry, sunny day.',
            'Combined evaporation and plant transpiration is scientifically termed evapotranspiration.'
          ],
          keyTakeaways: [
            'Stomata on leaf surfaces release water vapor into the air.',
            'Transpiration cools the plant and powers upward capillary nutrient pull.',
            'Forests significantly generate their own local micro-climates and rainfall.'
          ]
        },
        {
          id: 'b3',
          branchName: 'Condensation & Cloud Birth',
          branchEmoji: '☁️',
          analogy: 'Like cold drops of water forming on the outside of a chilled soda can on a warm summer day.',
          subPoints: [
            'Warm, low-density air carrying water vapor rises into higher atmospheric layers where pressure and temperature drop.',
            'Cooling vapor slows down and condenses back into liquid or microscopic ice crystals.',
            'Condensation requires aerosol "cloud condensation nuclei" such as dust, sea salt, or smoke particles.',
            'Billions of clustered suspended droplets form visible clouds and ground-level fog.'
          ],
          keyTakeaways: [
            'Condensation is the exact reverse of evaporation (gas to liquid).',
            'Occurs when air reaches its dew point and saturation temperature.',
            'Microscopic dust nuclei are essential for droplets to nucleate upon.'
          ]
        },
        {
          id: 'b4',
          branchName: 'Precipitation & Gravity',
          branchEmoji: '🌧️',
          analogy: 'Like water collecting in a sponge until it gets so heavy that it can no longer hold the water and drips out.',
          subPoints: [
            'Inside turbulent clouds, droplets bump into each other (coalescence) and merge into larger, heavier drops.',
            'Once upward updraft winds can no longer support their weight, gravity pulls them down.',
            'Forms vary depending on atmosphere temperature: rain (liquid), snow (crystalline), sleet (ice pellets), or hail (layered frozen balls).',
            'Precipitation redistributes freshwater from skies onto mountains, forests, and farms.'
          ],
          keyTakeaways: [
            'Precipitation occurs when droplets grow too heavy for cloud updrafts.',
            'Form (rain, snow, hail) depends on atmospheric temperature gradients.',
            'Precipitation is the principal delivery mechanism of freshwater to terrestrial ecosystems.'
          ]
        },
        {
          id: 'b5',
          branchName: 'Collection, Runoff & Underground Aquifers',
          branchEmoji: '🏞️',
          analogy: 'Like water flowing down a sloped driveway into the gutter, while some seeps into the lawn soil beneath.',
          subPoints: [
            'Surface runoff travels over land surfaces into creeks, rivers, and ultimately returns to seas.',
            'Infiltration allows water to soak downward through porous soil layers and rock crevices.',
            'Percolating water recharges groundwater reservoirs and natural aquifers.',
            'Groundwater feeds mountain springs, wells, and helps sustain river flow during dry spells.'
          ],
          keyTakeaways: [
            'Runoff flows into open drainage basins and oceans.',
            'Infiltration and percolation replenish vital underground aquifers.',
            'Completes the closed loop: the cycle repeats indefinitely without water loss.'
          ]
        }
      ]
    },
    keywords: [
      {
        id: 'k1',
        word: 'Evaporation',
        type: 'process',
        childMeaning: 'When liquid water warms up and turns into invisible vapor gas in the sky.',
        example: 'Puddles drying up on the hot school road after rain.',
        memoryHook: 'E-VAPOR-ation: Vapor rises like steam from hot chai!',
        spellingTip: 'Starts with E, then VAPOR, then ATION.',
        mastered: true
      },
      {
        id: 'k2',
        word: 'Transpiration',
        type: 'process',
        childMeaning: 'Water vapor breathing out from tiny pores on green plant leaves.',
        example: 'Placing a clear plastic bag over a tree branch and seeing droplets mist inside.',
        memoryHook: 'TREES "perspire" = Transpiration! (Trees sweating).',
        spellingTip: 'TRAN - SPI - RATION. Remember "spir" like respiration.',
        mastered: true
      },
      {
        id: 'k3',
        word: 'Condensation',
        type: 'process',
        childMeaning: 'When cooling water vapor gas turns back into tiny liquid droplets.',
        example: 'Foggy mist on the bathroom mirror after a hot shower.',
        memoryHook: 'Dense means crowded — vapor crowds into dense liquid droplets!',
        spellingTip: 'CON - DEN - SA - TION. Notice the S, not C, before ation.',
        mastered: false
      },
      {
        id: 'k4',
        word: 'Precipitation',
        type: 'process',
        childMeaning: 'Any water falling from clouds down to Earth (rain, snow, hail, sleet).',
        example: 'Monsoon rains pouring down across towns and green fields.',
        memoryHook: 'Precipitation Plummets: Water drops Falling Down!',
        spellingTip: 'PRE - CIP - I - TA - TION. Two letter I\'s in the middle.',
        mastered: true
      },
      {
        id: 'k5',
        word: 'Infiltration',
        type: 'process',
        childMeaning: 'Water soaking deep down through soil and sand like through a filter.',
        example: 'Rainwater sinking into garden soil instead of sliding away.',
        memoryHook: 'Water FILTERS IN into the ground = Infiltration!',
        spellingTip: 'IN - FILTER - ATION. Just combine In + filter + ation.',
        mastered: false
      },
      {
        id: 'k6',
        word: 'Aquifer',
        type: 'noun / place',
        childMeaning: 'An underground rock or sand layer that stores pure groundwater.',
        example: 'Village tubewells pumping fresh drinking water from underground.',
        memoryHook: 'AQUA means water, FERRER means carrier: Water carrier rock!',
        spellingTip: 'A - QUI - FER. Starts with Aqui, ends with fer.',
        mastered: false
      },
      {
        id: 'k7',
        word: 'Stomata',
        type: 'noun',
        childMeaning: 'Microscopic mouth-like pores underneath plant leaves that open and breathe.',
        example: 'Under a microscope, stomata look like tiny green lips opening to let water escape.',
        memoryHook: 'STOMA sounds like stomach/mouth: tiny leaf mouths opening!',
        spellingTip: 'STO - MA - TA. Plural of stoma.',
        mastered: true
      },
      {
        id: 'k8',
        word: 'Runoff',
        type: 'noun / process',
        childMeaning: 'Water flowing across Earth\'s surface toward rivers when soil cannot absorb more.',
        example: 'Rainwater streaming down a paved street into the storm drain.',
        memoryHook: 'Water "runs off" the hills into the river basin.',
        spellingTip: 'One word, double F at the end: R-U-N-O-F-F.',
        mastered: true
      }
    ],
    questions: [
      {
        id: 'q1',
        type: 'short-answer',
        question: 'Why is the Sun considered the primary engine driving the Earth\'s water cycle?',
        modelAnswer: 'The Sun provides essential thermal solar radiation that heats surface water in oceans, lakes, and rivers. This thermal energy increases the kinetic energy of water molecules, causing liquid water to evaporate into water vapor. Without solar heat, water would remain in liquid or frozen states, halting evaporation and ending the cycle.',
        keyWordsUsed: ['solar radiation', 'thermal energy', 'evaporation', 'water vapor', 'kinetic energy'],
        marks: 3,
        studentAnswer: 'The sun gives heat to the oceans and rivers so water evaporates into the sky. Without sun, water stays cold and cannot form clouds.',
        evaluation: {
          score: 3,
          maxScore: 3,
          whatGood: 'You clearly identified the Sun\'s heat as the cause of evaporation and recognized that without it clouds could not form.',
          howToImprove: 'To make it university-grade, you can also mention that the sun supplies thermal energy and increases molecular kinetic energy.',
          encouragement: 'Terrific answer! You nailed the core science concept accurately.',
          evaluatedAt: '2026-10-18T14:05:00.000Z'
        }
      },
      {
        id: 'q2',
        type: 'reasoning',
        question: 'Explain why water droplets form on the outer surface of a glass filled with ice water on a warm humid day.',
        modelAnswer: 'The icy water chills the exterior surface of the glass. When warm, humid surrounding air contacts this cold glass surface, thermal energy is transferred away from the air. As the surrounding air cools down to its dew point temperature, the invisible water vapor molecules lose speed and condense from gas into liquid droplets onto the glass.',
        keyWordsUsed: ['condensation', 'water vapor', 'dew point', 'cools', 'transferred heat'],
        marks: 3
      },
      {
        id: 'q3',
        type: 'definition',
        question: 'Define "transpiration" and describe how it differs from ordinary surface evaporation.',
        modelAnswer: 'Transpiration is the biological release of water vapor from plants into the atmosphere through microscopic leaf pores called stomata. It differs from ordinary evaporation because it occurs specifically through living plant tissues as part of photosynthesis and nutrient transport, whereas evaporation occurs from non-living surface bodies like oceans, puddles, and rivers.',
        keyWordsUsed: ['stomata', 'leaves', 'biological', 'living plant', 'evaporation'],
        marks: 2
      },
      {
        id: 'q4',
        type: 'diagram',
        question: 'Describe how cloud droplets grow inside a cloud until precipitation falls to the ground.',
        modelAnswer: 'Inside clouds, microscopic condensed droplets collide with one another through turbulent air currents in a process called coalescence. As they merge, their mass increases. Eventually, the droplets become too heavy for the rising upward air currents (updrafts) to support against gravity, causing them to fall to Earth as precipitation such as rain or snow.',
        keyWordsUsed: ['coalescence', 'collide', 'gravity', 'updrafts', 'precipitation'],
        marks: 3
      }
    ],
    quiz: [
      {
        id: 'qz1',
        type: 'mcq',
        question: 'Which process changes liquid water directly into invisible atmospheric water vapor?',
        options: ['Condensation', 'Evaporation', 'Precipitation', 'Infiltration'],
        correctIndex: 1,
        explanation: 'Evaporation is the phase transition where liquid water absorbs heat energy and turns into gaseous water vapor.'
      },
      {
        id: 'qz2',
        type: 'fill-blank',
        question: 'Microscopic pores underneath plant leaves that release water vapor into the air are called ______.',
        answer: 'stomata',
        explanation: 'Stomata (singular: stoma) are the tiny openings on leaf undersides that regulate gas exchange and transpiration.'
      },
      {
        id: 'qz3',
        type: 'match',
        question: 'Match each water cycle term with its correct real-world description:',
        pairs: [
          { left: 'Evaporation', right: 'Puddle drying under bright sunshine' },
          { left: 'Condensation', right: 'Dew drops forming on morning grass' },
          { left: 'Precipitation', right: 'Heavy monsoon raindrops falling' },
          { left: 'Infiltration', right: 'Rainwater soaking deep into garden soil' }
        ],
        explanation: 'Each term represents a distinct phase transition or mechanical movement of water across terrestrial and atmospheric spheres.'
      },
      {
        id: 'qz4',
        type: 'true-false',
        question: 'Clouds are made entirely of invisible gaseous water vapor, not liquid water.',
        answer: false,
        explanation: 'False! Gaseous water vapor is completely invisible. Clouds are made of billions of tiny visible liquid water droplets or suspended ice crystals.'
      },
      {
        id: 'qz5',
        type: 'mcq',
        question: 'What happens to water that infiltrates deep below soil and permeable rock layers?',
        options: [
          'It instantly evaporates back into clouds',
          'It collects in underground aquifers as groundwater',
          'It turns permanently into solid granite rock',
          'It gets absorbed only by tree bark'
        ],
        correctIndex: 1,
        explanation: 'Percolating water filters through porous rock and soil to replenish subterranean reservoirs called aquifers.'
      }
    ]
  },
  {
    id: 'ch_indus_valley',
    title: 'The Ancient Indus Valley Civilization',
    subject: 'Social Studies',
    grade: 6,
    examDate: '2026-11-20',
    dateAdded: '2026-10-16T11:00:00.000Z',
    lastStudied: '2026-10-17T16:00:00.000Z',
    text: `The Indus Valley Civilization (also known as the Harappan Civilization) flourished around 2500 BCE along the fertile banks of the Indus River basin across modern-day Pakistan and northwest India. It was one of the world's three earliest cradles of civilization alongside ancient Mesopotamia and Egypt. What set the Indus cities — notably Mohenjo-Daro and Harappa — apart was their astonishing urban town planning. Cities were engineered on a precise grid system with straight, wide avenues oriented north-to-south and east-to-west. Houses were built with standardized kiln-baked bricks and featured private bathrooms, indoor courtyards, and vertical waste pipes that connected directly to covered street drains lined with removable inspection covers for routine cleaning. Mohenjo-Daro featured the famous Great Bath, a watertight communal brick pool sealed with natural bitumen (pitch), likely utilized for ritualistic religious purification baths. The civilization maintained extensive maritime and overland trading networks with ancient Mesopotamia (who recorded them as 'Meluhha'), exporting precious lapis lazuli, carnelian beads, cotton textiles, and timber, verified by standardized stone cubical weights and steatite unicorn seals.`,
    sources: [
      { id: 'iv1', label: 'History of South Asia - Grade 6 Chapter 2', type: 'text' },
      { id: 'iv2', label: 'UNESCO World Heritage: Archaeological Ruins at Moenjodaro', type: 'link', url: 'https://whc.unesco.org' }
    ],
    masteryScore: 65,
    xpEarned: 180,
    quizScores: [65],
    reviews: [
      { date: '2026-10-17T16:00:00.000Z', score: 65, type: 'quiz' }
    ],
    reviewDates: [
      { day: 2, date: '2026-10-18T11:00:00.000Z', done: true },
      { day: 3, date: '2026-10-19T11:00:00.000Z', done: false },
      { day: 7, date: '2026-10-23T11:00:00.000Z', done: false },
      { day: 21, date: '2026-11-06T11:00:00.000Z', done: false }
    ],
    map: {
      chapterTitle: 'The Ancient Indus Valley Civilization',
      oneLineSummary: 'A 4,500-year-old bronze-age wonder renowned for planned grid cities, covered sewage, and peaceful trade.',
      bigIdea: '4,500 years ago, while most of the ancient world lived in scattered mud huts, the people of the Indus engineered clean multi-story brick homes, indoor toilets, and covered underground street drainage better than medieval Europe!',
      bigIdeaEmoji: '🏛️',
      bigIdeaAnalogy: 'Think of Mohenjo-Daro like a modern planned capital city like Islamabad: built with straight paved avenues, organized residential blocks, and strict public hygiene guidelines.',
      learningOutcomes: [
        'Identify key urban architectural features of Mohenjo-Daro and Harappa',
        'Analyze their advanced sanitation and covered drainage systems',
        'Understand trade connections with ancient Mesopotamia using seals and weights',
        'Explore theories explaining their mysterious decline around 1900 BCE'
      ],
      estimatedStudyMinutes: 20,
      branches: [
        {
          id: 'iv_b1',
          branchName: 'Grid City Planning & Baked Bricks',
          branchEmoji: '🧱',
          analogy: 'Like a chessboard where roads cross at crisp 90-degree right angles.',
          subPoints: [
            'Streets were designed in a strict cardinal grid aligned north-south and east-west.',
            'Buildings were constructed with standardized kiln-fired bricks with an exact 4:2:1 ratio.',
            'Cities were partitioned into a fortified Upper Citadel and a spacious Lower Residential Town.',
            'Residential homes had central open courtyards that stayed naturally cool in desert heat.'
          ],
          keyTakeaways: [
            'Precision grid system allowed organized residential planning.',
            'Standardized 4:2:1 ratio bricks proved centralized governance.',
            'Citadel housed public and administrative halls; Lower Town held homes.'
          ]
        },
        {
          id: 'iv_b2',
          branchName: 'The World\'s First Sanitation & Drainage',
          branchEmoji: '🚿',
          analogy: 'Like modern city underground plumbing where every private bathroom flushes safely out of sight.',
          subPoints: [
            'Nearly every home contained a private tiled bathing platform and latrine.',
            'Waste water flowed through terracotta pipes embedded in walls into covered street drains.',
            'Street drains featured removable stone inspection slabs for maintenance and clearing silt.',
            'Clean water was drawn from hundreds of brick-lined circular public and private wells.'
          ],
          keyTakeaways: [
            'World\'s most sophisticated municipal sanitation system of the Bronze Age.',
            'Covered street sewers prevented disease and odors.',
            'Standard of living prioritized hygiene and clean drinking wells.'
          ]
        },
        {
          id: 'iv_b3',
          branchName: 'The Great Bath of Mohenjo-Daro',
          branchEmoji: '🏊‍♂️',
          analogy: 'Like an ancient Olympic swimming pool waterproofed with natural tar for spiritual celebrations.',
          subPoints: [
            'Measures approximately 12 meters long, 7 meters wide, and 2.4 meters deep.',
            'Waterproofed with carefully fitted bricks set on edge and sealed with natural bitumen (asphalt pitch).',
            'Surrounded by private dressing rooms and wide colonnaded verandas.',
            'Historians believe it served ritual cleansing purposes prior to sacred festivals.'
          ],
          keyTakeaways: [
            'Masterpiece of ancient hydraulic civil engineering.',
            'Sealed with bitumen pitch to prevent groundwater seepage.',
            'Likely utilized for communal spiritual purification.'
          ]
        },
        {
          id: 'iv_b4',
          branchName: 'Trade, Seals & Mesopotamia',
          branchEmoji: '⚖️',
          analogy: 'Like international shipping containers stamped with custom trademarks and verified on official scales.',
          subPoints: [
            'Traded carnelian beads, copper, cotton cloth, and lapis lazuli as far as Mesopotamia.',
            'Used polished steatite stamp seals featuring carved animals (like the famous one-horned unicorn) and un-deciphered script.',
            'Employed binary and decimal weight systems carved from fine chert stone cubes.',
            'Lacked evidence of royal palaces, standing armies, or warfare glorification.'
          ],
          keyTakeaways: [
            'Standard stone weights ensured fair, honest mercantile commerce.',
            'Mesopotamian records referred to the Indus region as "Meluhha".',
            'Seals served as merchant labels on bundled trade goods.'
          ]
        }
      ]
    },
    keywords: [
      {
        id: 'iv_k1',
        word: 'Citadel',
        type: 'noun / place',
        childMeaning: 'A raised, fortified upper section of the city where important public buildings stood.',
        example: 'The Great Bath and assembly halls were built atop the Mohenjo-Daro Citadel.',
        memoryHook: 'CITY + CASTLE = Citadel on the hill!',
        spellingTip: 'CIT - A - DEL. Starts with C, not S.',
        mastered: true
      },
      {
        id: 'iv_k2',
        word: 'Steatite',
        type: 'noun',
        childMeaning: 'A soft, smooth soapstone used by Indus craftsmen to carve seals and beads.',
        example: 'The famous bearded Priest-King statue was sculpted from soft white steatite.',
        memoryHook: 'Steatite is smooth and easy to sculpt like soap!',
        spellingTip: 'S-T-E-A-T-I-T-E. Remember "tea" is in the middle.',
        mastered: false
      },
      {
        id: 'iv_k3',
        word: 'Bitumen',
        type: 'noun',
        childMeaning: 'A natural sticky black mineral pitch used as waterproof sealant in the Great Bath.',
        example: 'Bitumen acted like ancient tar to prevent the Great Bath from leaking water.',
        memoryHook: 'Bitumen = Binds It Tight, makes it watertight!',
        spellingTip: 'BI - TU - MEN. Sounds like "by-too-men".',
        mastered: false
      },
      {
        id: 'iv_k4',
        word: 'Granary',
        type: 'noun / place',
        childMeaning: 'A large, ventilated brick warehouse built to store surplus wheat and barley safely from pests.',
        example: 'The Great Granary at Harappa kept grains dry above ground level.',
        memoryHook: 'GRAIN is stored in the GRAN-ary!',
        spellingTip: 'G-R-A-N-A-R-Y. Ends with "ary", not "ery".',
        mastered: true
      }
    ],
    questions: [
      {
        id: 'iv_q1',
        type: 'short-answer',
        question: 'Name three unique architectural features of the houses discovered at Mohenjo-Daro.',
        modelAnswer: 'First, houses were constructed using standardized kiln-baked bricks in an exact 4:2:1 proportion. Second, homes featured central open-air courtyards surrounded by rooms to promote natural cooling. Third, they possessed private bathrooms with sloped brick floors and drainage pipes connecting to the covered street sewers.',
        keyWordsUsed: ['standardized baked bricks', 'courtyard', 'private bathrooms', 'covered drainage'],
        marks: 3
      },
      {
        id: 'iv_q2',
        type: 'reasoning',
        question: 'Why do historians conclude that the Indus Valley Civilization had an organized central authority or government?',
        modelAnswer: 'Historians conclude this because of the remarkable uniformity across distant cities: identical brick dimensions (4:2:1 ratio), standardized stone weight systems for commerce, identical city grid alignments, and coordinated municipal maintenance of public drains and wells across hundreds of kilometers.',
        keyWordsUsed: ['uniformity', 'standardized weights', 'brick ratio', 'grid alignments', 'sanitation'],
        marks: 3
      }
    ],
    quiz: [
      {
        id: 'iv_qz1',
        type: 'mcq',
        question: 'What substance was applied between brick layers to waterproof the Great Bath?',
        options: ['Cement plaster', 'Natural bitumen (pitch)', 'Animal fat', 'Tree sap'],
        correctIndex: 1,
        explanation: 'Natural bitumen (asphalt pitch) was coated between tight brick courses to create a completely leakproof water tank.'
      },
      {
        id: 'iv_qz2',
        type: 'true-false',
        question: 'Indus Valley street drains were left wide open to the sky like outdoor ditches.',
        answer: false,
        explanation: 'False! Street drains were carefully covered with terracotta tiles or limestone slabs to control odors and maintain hygiene.'
      },
      {
        id: 'iv_qz3',
        type: 'fill-blank',
        question: 'Ancient Mesopotamian clay tablets referred to the Indus Valley trading partner by the name ______.',
        answer: 'Meluhha',
        explanation: 'Sumerian and Akkadian cuneiform inscriptions record maritime trade with the prosperous land of "Meluhha".'
      }
    ]
  }
];
