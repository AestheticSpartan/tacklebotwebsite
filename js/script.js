document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    highlightActiveTab();
    initScrollNavbar();
    initFishTank();
    initGlitchEffects();
    initShop();
    initEasterEggs();
    window.addEventListener('pagehide', cleanupRuntime, { once: true });
});

const PAGE_THEME_MAP = {
    '': 'prime',
    'index.html': 'prime',
    'guide.html': 'archive',
    'shop.html': 'bazaar',
    'donate.html': 'cult',
    'privacy.html': 'surveillance',
    'tos.html': 'protocol'
};

const DEFAULT_THEME = 'prime';
const CURRENT_PAGE = getCurrentPage();
const NAV_BREAKPOINT = 820;
const REDUCED_MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');

const PAGE_RUNTIME_CONFIG = {
    'index.html': {
        glitch: { enabled: true, subliminalInterval: 9000, headingInterval: 6500, invertInterval: 15000 },
        fish: { initialCount: 5, desktopMax: 12, mobileMax: 6, bubbleInterval: 850, fishSpawnInterval: 3200, opacity: 0.72 },
        easterEggChanceMultiplier: 1
    },
    'guide.html': {
        glitch: { enabled: true, subliminalInterval: 12000, headingInterval: 9000, invertInterval: 20000 },
        fish: { initialCount: 3, desktopMax: 7, mobileMax: 4, bubbleInterval: 1200, fishSpawnInterval: 5000, opacity: 0.52 },
        easterEggChanceMultiplier: 0.8
    },
    'shop.html': {
        glitch: { enabled: true, subliminalInterval: 8500, headingInterval: 5500, invertInterval: 14000 },
        fish: { initialCount: 4, desktopMax: 10, mobileMax: 5, bubbleInterval: 900, fishSpawnInterval: 3600, opacity: 0.66 },
        easterEggChanceMultiplier: 1
    },
    'donate.html': {
        glitch: { enabled: true, subliminalInterval: 13000, headingInterval: 10000, invertInterval: 22000 },
        fish: { initialCount: 3, desktopMax: 6, mobileMax: 3, bubbleInterval: 1300, fishSpawnInterval: 5200, opacity: 0.45 },
        easterEggChanceMultiplier: 0.75
    },
    'privacy.html': {
        glitch: { enabled: false, subliminalInterval: 0, headingInterval: 0, invertInterval: 0 },
        fish: { initialCount: 1, desktopMax: 2, mobileMax: 1, bubbleInterval: 2000, fishSpawnInterval: 9000, opacity: 0.22 },
        easterEggChanceMultiplier: 0.35
    },
    'tos.html': {
        glitch: { enabled: false, subliminalInterval: 0, headingInterval: 0, invertInterval: 0 },
        fish: { initialCount: 1, desktopMax: 2, mobileMax: 1, bubbleInterval: 2000, fishSpawnInterval: 9000, opacity: 0.22 },
        easterEggChanceMultiplier: 0.35
    }
};

const EASTER_EGG_CONFIG = {
    chance: 0.18,
    promptText: 'click me',
    textSpawnInterval: 450,
    maxOverlayMessages: 45
};

const easterEggState = {
    overlay: null,
    textInterval: null
};

const runtimeState = {
    intervals: [],
    timeouts: [],
    menuOpen: false
};

const FISH_ART_LIBRARY = [
    'AceofClubsShark.png',
    'Aesthetic Spartan on a Fish.png',
    'Alluring Mermaid.png',
    'Anchovy.png',
    'Ancient Dragon Fish.png',
    'Ancient FlipFlop.png',
    'Anglerfish.png',
    'April Fool Flounder.png',
    'ArmoredWorm.png',
    'Autumn Koi.png',
    'Barracuda.png',
    'Bass.png',
    'Benihana HotFish.png',
    'Blobfish.png',
    'Bluegill.png',
    'BunyipFish.png',
    'Business Shark.png',
    'CanadianDolphin.png',
    'Carp.png',
    'Catfish.png',
    'Celestial Whale.png',
    'Cherry Salmon.png',
    'Cloud Mandrake.png',
    'Cosmic Angler.png',
    'Cosmic Crab.png',
    'CosmicOrcaWhale.png',
    'Crappie.png',
    'Crawfish.png',
    'Crystal Carp.png',
    'CthuluFish.png',
    'DallaBillFish.png',
    'Dark Carp.png',
    'Dark Cherry Bass.png',
    'Dark Minnow.png',
    'DevilBruiserFish.png',
    'Diamond Bass.png',
    'Dimensional Leviathan.png',
    'Disaster Clam.png',
    'Duke Worm-Wyrn.png',
    'Easter Bunny Fish.png',
    'Electric Ray.png',
    'EmberBass.png',
    'Ethereal Seahorse.png',
    'FallingShellfish.png',
    'Fish-O-Legend.png',
    'Frogo.png',
    'FrostBass.png',
    'FrozenMinnow.png',
    'Galactic Ray.png',
    'Gar.png',
    'GellyFish.png',
    'Ghostly Eel.png',
    'Giant Catfish.png',
    'Giant Sturgeon.png',
    'Gilded Coelacanth.png',
    'Goatfish.png',
    'Goblin Shark.png',
    'Golden Koi Fish.png',
    'GoldenMackeral.png',
    'Goldie X.png',
    'Goldie.png',
    'HeatEel.png',
    'hungry sardine.png',
    'IceMarlin.png',
    'Jack Fishington.png',
    'Jello Fish.png',
    'Kraken.png',
    'LightCherryBass.png',
    'Lord Spring Fish.png',
    'Lucky Whale Shark.png',
    'Luminous Eel.png',
    'Mackeral.png',
    'Magic Fish.png',
    'Mahi-Mahi.png',
    'Mal-Anchovy.png',
    'MapleSalmon.png',
    'MapleTrout.png',
    'Meh Plankton.png',
    'Micheal Mackeral.png',
    'Minnow.png',
    'Mr. Krabs.png',
    'Ninja Fish.png',
    'NO NAME.png',
    'Obsidian Marlin.png',
    'Old Boot.png',
    'Paradox Whale.png',
    'Perch.png',
    'Phoenix Fish.png',
    'Pike.png',
    'Piranha.png',
    'Plastic Bottle.png',
    'PoPRocketFish.png',
    'Prismatic Shark.png',
    'Pufferfish.png',
    'Quantum Kraken.png',
    'Rainbow Bloom.png',
    'Rainbow Shark.png',
    'Rainbow Trout.png',
    'Reality Ripper.png',
    'Ribbity.png',
    'RichKraken.png',
    'RonaldRizz.png',
    'Rusted Fishing Hook.png',
    'Rusty Can.png',
    'Salmon.png',
    'Sardine.png',
    'Seaweed Clump.png',
    'SlotWhale.png',
    'Snail.png',
    'Snapper.png',
    'Snowflake Pufferfish.png',
    'SnowFlounder.png',
    'Spring Carp.png',
    'Stained Glass Fish.png',
    'Star Devourer.png',
    'Starlight Jellyfish.png',
    'SummerClam.png',
    'SummerSquid.png',
    'Sunfish.png',
    'SunfishPrime.png',
    'SupaSeahorse.png',
    'Swordfish.png',
    'Tangled Fishing Line.png',
    'ThunderbirdFish.png',
    'Time Serpent.png',
    'Toxic Sludge Fish.png',
    'Transparent Shark.png',
    'TrippinFish.png',
    'TrueAngelFish.png',
    'Tuna.png',
    'VenomFish.png',
    'Void Leviathan.png',
    'Void Maw.png',
    'waterloggedphone.png',
    'WendigoFish.png',
    'WhimsyFish.png',
    'WhiskeyRiverFish.png'
];

const THEME_CONFIGS = {
    prime: {
        subliminalPhrases: [
            'THE CURRENT KNOWS YOUR USERNAME',
            'SYNC YOUR REELS WITH THE GRID',
            'ALL SIGNALS FEED THE TIDE',
            'CASTING IS JUST TRANSMISSION',
            'PLEASE REMAIN HYDRATED',
            'THE WATER WANTS YOUR INPUT',
            'WE TRADE IN DREAMS OF KRILL',
            'HOOK THE LOOP. LOOP THE HOOK.',
            'RESET THE OCEAN CACHE DAILY',
            'THE TIDELINE IS SPEAKING',
            'SOME FISH ARE SIMULATED',
            'PRIME CURRENT LISTENING',
            'SCAN FOR RARE BAIT NOW',
            'THE SEA ACCEPTS YOUR TERMS',
            'PRESS CAST TO BELIEVE',
            'GLASS IS JUST SLOW WATER',
            'EVERY NET IS A MEMORY',
            'SONAR HEARS YOUR SECRET'
        ],
        glitchOverlays: [
            'PRIME CURRENT {text}',
            '>>> SIGNAL LOCKED <<<',
            'CALIBRATING LURE CORE',
            'CURRENT.LOG > {text}',
            'HYDROPHONE GLEAMS AT YOU',
            'FATHOM HASH VERIFIED'
        ],
        shop: {
            title: 'The Fish Market',
            tagline: 'Currency accepted: Coins, Dabloons, and LP (Liquid Pizza?)',
            currencies: ['Coins', 'Dabloons', 'LP'],
            itemPrefixes: ['Cursed', 'Golden', 'Glitchy', 'Wet', 'Radioactive', 'Invisible', 'Spicy', 'Quantum', 'Void', 'Digital', 'Mirror-Forged', 'Hypercard', 'Biolum', 'Encrypted'],
            itemCores: ['Fish Food', 'Hook', 'Bait', 'Net', 'Boat', 'Hat', 'Bucket', 'Worm', 'Pixel', 'Memory', 'Harpoon', 'Charm', 'Reel', 'Modulator'],
            itemSuffixes: ['of Undertows', 'MK II', '++', 'from Beyond', 'Protocol', 'vNext', 'Edition 7', 'for Friend Fish'],
            sigils: ['Seal of Current', 'Hydro Certified', 'Approved by Tide'],
            fishImages: FISH_ART_LIBRARY,
            weirdChance: 0.1,
            weirdMessages: [
                'THERE IS NO SHOP',
                'THE FISH ARE SLEEPING',
                'OUT OF STOCK FOREVER',
                'YOU CANNOT BUY HAPPINESS',
                'CURRENCY IS A SOCIAL CONSTRUCT',
                'RETURN TO THE OCEAN',
                '404: COMMERCE NOT FOUND'
            ],
            weirdDescriptions: [
                'Please come back when the tide is right.',
                'Merchants currently moulting. Try later.',
                'Inventory dissolved into brine.',
                'Payment rails clogged with kelp.'
            ],
            weirdGlyphs: ['[ TIDE PAUSED ]', '<00>', '{VOID}'],
            extraNotes: [
                'Warranty void once submerged.',
                'Warning: may attract ghost fish.',
                'Certified for brine-safe handling.',
                'Side effects include mild bioluminescence.'
            ],
            priceRange: [25, 1200],
            itemCountRange: [6, 12],
            glitchChance: 0.05,
            rarities: [
                { label: 'Everyday Stock', multiplier: 1 },
                { label: 'Glitched Lot', multiplier: 1.25 },
                { label: 'Mythic Drop', multiplier: 1.75 }
            ]
        }
    },
    archive: {
        subliminalPhrases: [
            'SCROLLS OF CORAL ARE OPEN',
            'REFER TO APPENDIX ATLANTIS',
            'KNOWLEDGE SCHOOLS HERE',
            'FOOTNOTE: BAIT, SEE ALSO TIME',
            'THE INDEX REMEMBERS',
            'YOUR QUESTIONS FEED THE REEF',
            'TURN PAGE BEFORE IT DRIFTS',
            'GUIDES ARE WRITTEN IN SAND',
            'LEGENDS HID INSIDE TIDE TABLES',
            'ARCHIVAL WATER IS STILL WET',
            'WELCOME BACK, CURIOUS ANGLER',
            'ANNOTATE YOUR CASTS',
            'MARGINS GLOW WHEN YOU LEARN',
            'THE CHAPTER ENDS IN BUBBLES'
        ],
        glitchOverlays: [
            'CITATION {text}',
            '>> PAGE 404 RECOVERED <<',
            'FOOTNOTE 7: KEEP FISHING',
            'INDEXING YOUR QUESTIONS',
            'SCRIPTORIUM CURRENT ACTIVE'
        ]
    },
    bazaar: {
        subliminalPhrases: [
            'BARGAIN WITH THE BARNACLES',
            'HAGGLE IN WHALESONG',
            'THE STALLS NEVER CLOSE',
            'ALL SALES ARE CIRCULAR',
            'THE MERCHANT OWNS SIX MOONS',
            'PAY IN PEARLS OR STORIES',
            'CHECK THE GILLS FOR AUTHENTICITY',
            'FLASH SALE UNDER THE KELP',
            'LIMITED RUN OF QUANTUM WORMS',
            'NO RECEIPTS. ONLY RIPPLES.',
            "DON'T LICK THE DEMO FISH",
            'EVERYTHING SMELLS LIKE PROFIT',
            'THE AUCTIONEER SPEAKS IN BUBBLES',
            'MERCHANTS TRACK YOUR SCENT'
        ],
        glitchOverlays: [
            'BID HIGHER: {text}',
            'APPRAISAL: 7 TIDES',
            'COUNTEROFFER AUTHORIZED',
            'SEAL OF THE BAZAAR',
            'BRIBE ACCEPTED'
        ],
        shop: {
            title: 'Midnight Tackle Bazaar',
            tagline: 'Tender accepted: Pearl IOUs, Echo Credits, Dabloons, LP, and verified tall tales.',
            currencies: ['Pearl IOUs', 'Echo Credits', 'Dabloons', 'LP', 'Tide Bonds'],
            itemPrefixes: ['Contraband', 'Fractal', 'Salt-Cured', 'Bioluminescent', 'Entropy-Seared', 'Polychrome', 'Singing', 'Forgotten', 'Temporal', 'Borrowed', 'Gilded', 'Feral'],
            itemCores: ['Hook', 'Bait', 'Net', 'Trident', 'Charm', 'Decoy', 'Sextant', 'Rod', 'Patch Kit', 'Signal Flare', 'Ledger', 'Souvenir Barnacle'],
            itemSuffixes: ['from Spiral Reef', 'mk.[inf]', 'Edition Omega', 'with Backup Kraken', 'signed by the Tidecaller', 'of Portable Storms', 'calibrated nightly'],
            itemEpithets: ['Night Market Lot', 'Smuggled Stock', 'Legal Enough', 'Traveler Series', 'Heirloom Tide'],
            sigils: ['Tide Embassy Stamp', 'Traveling Merchant Seal', 'Verified Catch & Release'],
            fishImages: [
                'Golden Koi Fish.png',
                'RichKraken.png',
                'Cosmic Crab.png',
                'Business Shark.png',
                'Celestial Whale.png',
                'Rainbow Bloom.png',
                'Gilded Coelacanth.png',
                'Star Devourer.png',
                'Quantum Kraken.png',
                'Paradox Whale.png'
            ],
            weirdChance: 0.15,
            weirdMessages: [
                'THE MARKET IS CLOSED TO LAND DWELLERS',
                'STALLS DISSOLVED INTO MIST',
                'PRICE DISCOVERY FAILED',
                'LICENSE REVOKED BY THE TIDE',
                'INVENTORY IS IN A DIFFERENT TIMELINE'
            ],
            weirdDescriptions: [
                'Return with a story worth trading.',
                'Only verified krill magnates may enter.',
                'Merchants currently bartering with ghosts.',
                'Bazaar relocated three fathoms left.'
            ],
            weirdGlyphs: ['[MARKET OFFLINE]', '~~~', '<<VOID BID>>'],
            extraNotes: [
                'Proof of catch required upon pickup.',
                'Smells like guaranteed profit.',
                'Handle with non-euclidean gloves.',
                'Keep away from shallow investors.'
            ],
            priceRange: [75, 3200],
            itemCountRange: [7, 14],
            glitchChance: 0.08,
            rarities: [
                { label: 'Street Stock', multiplier: 1 },
                { label: 'Smuggled Tier', multiplier: 1.4 },
                { label: 'Myth-Grade', multiplier: 2.1 }
            ]
        }
    },
    cult: {
        subliminalPhrases: [
            'TITHE YOUR SHINIEST LURES',
            'THE ALTAR ACCEPTS KO-FI',
            'CHANT THE DONOR IDS',
            'SUPPORTERS GLOW IN THE DARK',
            'FISH LISTEN TO PATRONS FIRST',
            'BLESSINGS COME WITH RECEIPTS',
            'SIGN YOUR NAME IN BUBBLES',
            'THE HIGHEST TIER GETS GILLS',
            'SHARE YOUR TREASURE WITH THE TIDE',
            'EXCLUSIVE FISH ARE SUMMONED',
            'YOUR GENEROSITY FEEDS THE KRAKEN'
        ],
        glitchOverlays: [
            'PLEDGE REGISTERED',
            'DONOR SIGNAL DETECTED',
            'OFFERING ACCEPTED',
            'BLESS THE STREAM',
            'KO-FI RECEIPT {text}'
        ]
    },
    surveillance: {
        subliminalPhrases: [
            'PRIVACY POLICY WATCHES BACK',
            'ALL WAVES ARE LOGGED',
            'YOUR SHADOW FILE IS FLOATING',
            'THE CAMERA LOVES THE SEA',
            'CONSENT TO BE OBSERVED',
            'NETS DOUBLE AS ANTENNAS',
            'ANONYMITY WEARS A SNORKEL',
            'WE ONLY RECORD THE GOOD PARTS',
            'WHO IS WATCHING THE WHALES?',
            'THE COOKIES ARE MADE OF PLANKTON',
            'TRACKING PIXELS SWIM IN SCHOOLS'
        ],
        glitchOverlays: [
            'LOG ENTRY CREATED',
            'DATA TIDE ENGAGED',
            'MASK YOUR BUBBLES',
            'SURVEILLANCE SUBROUTINE',
            'AUDIT OF {text}'
        ]
    },
    protocol: {
        subliminalPhrases: [
            'TERMS PRINTED ON DRIFTWOOD',
            'SIGN WITH A SCALE',
            'CLAUSE 7 DIVES DEEPER',
            'YOU ALREADY AGREED',
            'ALL CONTRACTS ARE LIQUID',
            'BY CASTING YOU CONSENT',
            'PLEASE INITIAL EACH RIPPLE',
            'THE FINE PRINT IS HATCHLING SMALL',
            'COMPLIANCE IS A LIFE VEST',
            'OUR LAWYERS ARE OCTOPI',
            'VIOLATORS WILL BE SPRAYED'
        ],
        glitchOverlays: [
            'SECTION {text}',
            'APPROVED BY THE DEPTHS',
            'LEGAL CURRENT ONLINE',
            'SIGNATURE VERIFIED',
            'MANDATORY FUN APPLIES'
        ]
    }
};

function initGlitchEffects() {
    const subliminalLayer = document.getElementById('subliminal-layer');
    const subliminalText = document.getElementById('subliminal-text');
    const body = document.body;
    const runtimeConfig = getPageRuntimeConfig();
    
    // Safety check: if elements don't exist, don't run the effects
    if (!subliminalLayer || !subliminalText) return;
    
    const theme = getCurrentPageTheme();
    const themeConfig = getThemeConfig(theme);
    const phrases = themeConfig.subliminalPhrases && themeConfig.subliminalPhrases.length
        ? themeConfig.subliminalPhrases
        : getThemeConfig(DEFAULT_THEME).subliminalPhrases;
    const overlays = themeConfig.glitchOverlays || [];

    body.setAttribute('data-theme', theme);
    body.dataset.activeTheme = theme;

    if (REDUCED_MOTION_QUERY.matches || !runtimeConfig.glitch.enabled) return;

    const headings = document.querySelectorAll('h1, h2, h3, .btn');
    headings.forEach(heading => {
        if (!heading.hasAttribute('data-base-text')) {
            heading.setAttribute('data-base-text', heading.innerText);
            heading.setAttribute('data-text', heading.innerText);
        }
    });

    registerInterval(() => {
        if (Math.random() > 0.7) { // 30% chance every check
            const phrase = phrases[Math.floor(Math.random() * phrases.length)];
            subliminalText.innerText = phrase;
            subliminalLayer.style.opacity = '1';
            
            // Random duration: sometimes short flash, sometimes readable
            let duration;
            if (Math.random() > 0.7) {
                // 30% chance to stay for 2-3 seconds
                duration = Math.random() * 1000 + 2000;
            } else {
                // 70% chance of quick flash (50-200ms)
                duration = Math.random() * 150 + 50;
            }
            
            registerTimeout(() => {
                subliminalLayer.style.opacity = '0';
            }, duration);
        }
    }, runtimeConfig.glitch.subliminalInterval);

    registerInterval(() => {
        if (headings.length && Math.random() > 0.7) {
            const target = headings[Math.floor(Math.random() * headings.length)];
            const originalText = target.innerText;
            const glitchClass = `glitch-theme-${theme}`;
            const overlayText = overlays.length ? formatOverlayText(getRandom(overlays), originalText) : target.getAttribute('data-base-text') || originalText;
            
            target.setAttribute('data-text', overlayText);
            target.dataset.glitchTheme = theme;
            target.classList.add('glitch-active', glitchClass);
            
            registerTimeout(() => {
                target.classList.remove('glitch-active', glitchClass);
                const baseText = target.getAttribute('data-base-text') || originalText;
                target.setAttribute('data-text', baseText);
                target.removeAttribute('data-glitch-theme');
            }, Math.random() * 500 + 200);
        }
    }, runtimeConfig.glitch.headingInterval);

    registerInterval(() => {
        if (Math.random() > 0.95) { // Rare event
            body.classList.add('color-invert');
            registerTimeout(() => {
                body.classList.remove('color-invert');
            }, 100); // Very quick flash
        }
    }, runtimeConfig.glitch.invertInterval);
}

function highlightActiveTab() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === CURRENT_PAGE || (CURRENT_PAGE === '' && linkPath === 'index.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

function initScrollNavbar() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScrollTop = window.scrollY || 0;
    let isTicking = false;

    const updateHeader = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const isDesktop = window.innerWidth > NAV_BREAKPOINT;
        const scrollingDown = scrollTop > lastScrollTop + 6;
        const pastThreshold = scrollTop > 160;

        if (isDesktop && pastThreshold && scrollingDown && !runtimeState.menuOpen) {
            header.classList.add('nav-hidden');
        } else {
            header.classList.remove('nav-hidden');
        }

        lastScrollTop = Math.max(scrollTop, 0);
        isTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(updateHeader);
            isTicking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        header.classList.remove('nav-hidden');
    });
}

function initFishTank() {
    const tank = document.getElementById('fish-tank');
    const runtimeConfig = getPageRuntimeConfig();
    if (!tank || REDUCED_MOTION_QUERY.matches) return;

    const fishImages = FISH_ART_LIBRARY;
    const fishConfig = runtimeConfig.fish;

    registerInterval(() => {
        createBubble(tank);
    }, fishConfig.bubbleInterval);

    for (let i = 0; i < fishConfig.initialCount; i++) {
        createFish(tank, fishImages, true, fishConfig);
    }

    registerInterval(() => {
        const isMobile = window.innerWidth < 768;
        const maxFish = isMobile ? fishConfig.mobileMax : fishConfig.desktopMax;
        if (document.querySelectorAll('.fish').length < maxFish) {
            createFish(tank, fishImages, false, fishConfig);
        }
    }, fishConfig.fishSpawnInterval);
}

function createBubble(container) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    const size = Math.random() * 10 + 5; // 5px to 15px
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.animationDuration = `${Math.random() * 5 + 5}s`; // 5s to 10s
    
    container.appendChild(bubble);

    registerTimeout(() => {
        bubble.remove();
    }, 10000);
}

function createFish(container, images, randomX, fishConfig) {
    const fish = document.createElement('img');
    const randomImage = images[Math.floor(Math.random() * images.length)];
    fish.src = `fishImages/${randomImage}`;
    fish.classList.add('fish');
    fish.loading = 'lazy';
    fish.decoding = 'async';
    fish.style.opacity = fishConfig.opacity;
    fish.addEventListener('error', () => {
        fish.remove();
    }, { once: true });

    // Random properties
    const direction = Math.random() > 0.5 ? 'right' : 'left';
    const topPos = Math.random() * 90; // 0 to 90vh
    const duration = Math.random() * 10 + 10; // 10s to 20s
    
    const isMobile = window.innerWidth < 768;
    const size = isMobile 
        ? Math.random() * 30 + 30  // 30px to 60px for mobile
        : Math.random() * 60 + 40; // 40px to 100px for desktop

    fish.style.top = `${topPos}vh`;
    fish.style.width = `${size}px`;
    
    if (direction === 'right') {
        fish.style.animation = `swimRight ${duration}s linear forwards`;
        fish.style.transform = 'scaleX(-1)'; 
    } else {
        fish.style.animation = `swimLeft ${duration}s linear forwards`;
        fish.style.transform = 'scaleX(1)';
    }

    if (randomX) {
        const startX = Math.random() * 100;
        fish.style.left = `${startX}vw`;
        fish.style.left = direction === 'right' ? '-150px' : '100vw';
    }

    container.appendChild(fish);

    registerTimeout(() => {
        fish.remove();
    }, duration * 1000);
}

function initShop() {
    const shopContainer = document.getElementById('shop-container') || document.querySelector('.shop-container') || document.getElementById('main-content');
    const shopItemsContainer = document.getElementById('shop-items');
    const shopTitle = document.getElementById('shop-title');
    const shopTagline = document.getElementById('shop-tagline');
    
    if (!shopContainer || !shopItemsContainer) return;

    const theme = getCurrentPageTheme();
    const themeConfig = getThemeConfig(theme);
    const fallbackShop = getThemeConfig(DEFAULT_THEME).shop;
    const shopConfig = (themeConfig && themeConfig.shop) ? themeConfig.shop : fallbackShop;

    if (!shopConfig) return;

    if (shopItemsContainer.dataset.shopBound !== 'true') {
        shopItemsContainer.addEventListener('click', event => {
            const button = event.target.closest('.buy-btn');
            if (!button) return;
            const currency = button.dataset.currency || 'coins';
            window.alert(`ERROR: INSUFFICIENT ${currency.toUpperCase()}`);
        });
        shopItemsContainer.dataset.shopBound = 'true';
    }

    if (shopTitle && shopConfig.title) {
        shopTitle.innerText = shopConfig.title;
    }

    if (shopTagline && shopConfig.tagline) {
        shopTagline.innerText = shopConfig.tagline;
    }

    const weirdChance = typeof shopConfig.weirdChance === 'number' ? shopConfig.weirdChance : 0.1;
    if (Math.random() < weirdChance) {
        renderWeirdLandingPage(shopContainer, shopConfig);
        return;
    }

    const countRange = shopConfig.itemCountRange || [6, 12];
    const itemCount = randomBetween(countRange[0], countRange[1]);
    const glitchChance = typeof shopConfig.glitchChance === 'number' ? shopConfig.glitchChance : 0.05;
    const priceRange = shopConfig.priceRange || [25, 1000];
    const fragment = document.createDocumentFragment();

    shopItemsContainer.innerHTML = '';

    for (let i = 0; i < itemCount; i++) {
        const item = document.createElement('div');
        item.classList.add('shop-item');

        if (Math.random() < glitchChance) {
            item.classList.add('glitchy');
        }

        const rarity = shopConfig.rarities && shopConfig.rarities.length
            ? getRandom(shopConfig.rarities)
            : { label: 'Standard Issue', multiplier: 1 };
        const prefix = pickFromPool(shopConfig.itemPrefixes);
        const core = pickFromPool(shopConfig.itemCores, 'Artifact');
        const suffix = Math.random() > 0.5 ? pickFromPool(shopConfig.itemSuffixes) : null;
        const epithet = shopConfig.itemEpithets && Math.random() > 0.6 ? pickFromPool(shopConfig.itemEpithets) : null;
        const sigil = shopConfig.sigils && Math.random() > 0.5 ? pickFromPool(shopConfig.sigils) : null;
        const note = shopConfig.extraNotes && Math.random() > 0.65 ? pickFromPool(shopConfig.extraNotes) : null;

        const name = [prefix, core, suffix].filter(Boolean).join(' ') || core;
        const basePrice = randomBetween(priceRange[0], priceRange[1]);
        const price = Math.max(1, Math.floor(basePrice * (rarity.multiplier || 1)));
        const currency = pickFromPool(shopConfig.currencies, 'Coins');

        const imagePool = shopConfig.fishImages && shopConfig.fishImages.length ? shopConfig.fishImages : FISH_ART_LIBRARY;
        const image = pickFromPool(imagePool, 'Bass.png');

        item.innerHTML = `
            <img src="fishImages/${image}" alt="${name}">
            <div class="item-header">
                <h3>${name}</h3>
                <span class="rarity-badge">${rarity.label}</span>
            </div>
            ${epithet ? `<p class="epithet">${epithet}</p>` : ''}
            <div class="price">${price} <span class="currency">${currency}</span></div>
            ${sigil ? `<div class="sigil">${sigil}</div>` : ''}
            ${note ? `<p class="note">${note}</p>` : ''}
            <button class="buy-btn" type="button" data-currency="${currency}">Buy Now</button>
        `;

        const itemImage = item.querySelector('img');
        if (itemImage) {
            itemImage.loading = 'lazy';
            itemImage.decoding = 'async';
            itemImage.addEventListener('error', () => {
                itemImage.remove();
            }, { once: true });
        }

        fragment.appendChild(item);
    }

    shopItemsContainer.appendChild(fragment);
}

function getCurrentPageTheme() {
    return PAGE_THEME_MAP[CURRENT_PAGE] || PAGE_THEME_MAP[''] || DEFAULT_THEME;
}

function getThemeConfig(themeName) {
    return THEME_CONFIGS[themeName] || THEME_CONFIGS[DEFAULT_THEME];
}

function formatOverlayText(template, fallback) {
    if (!template) return fallback;
    return template.includes('{text}') ? template.replace(/\{text\}/g, fallback) : template;
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickFromPool(pool, fallback = null) {
    return pool && pool.length ? getRandom(pool) : fallback;
}

function renderWeirdLandingPage(container, shopConfig = {}) {
    container.innerHTML = '';
    container.classList.add('weird-landing');

    const messages = shopConfig.weirdMessages && shopConfig.weirdMessages.length
        ? shopConfig.weirdMessages
        : [
            'THERE IS NO SHOP',
            'THE FISH ARE SLEEPING',
            'OUT OF STOCK FOREVER',
            'YOU CANNOT BUY HAPPINESS',
            'CURRENCY IS A SOCIAL CONSTRUCT',
            'RETURN TO THE OCEAN',
            '404: COMMERCE NOT FOUND'
        ];

    const descriptions = shopConfig.weirdDescriptions && shopConfig.weirdDescriptions.length
        ? shopConfig.weirdDescriptions
        : ['Please come back when the tide is right.'];

    const glyphs = shopConfig.weirdGlyphs && shopConfig.weirdGlyphs.length ? shopConfig.weirdGlyphs : null;

    const h1 = document.createElement('h1');
    h1.innerText = pickFromPool(messages, 'THE SHOP IS ELSEWHERE');
    container.appendChild(h1);

    if (glyphs) {
        const glyph = document.createElement('div');
        glyph.classList.add('weird-glyph');
        glyph.innerText = pickFromPool(glyphs, '[]');
        container.appendChild(glyph);
    }

    const p = document.createElement('p');
    p.innerText = pickFromPool(descriptions, 'Please come back when the tide is right.');
    container.appendChild(p);
}

function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function initEasterEggs() {
    const runtimeConfig = getPageRuntimeConfig();
    const chance = EASTER_EGG_CONFIG.chance * (runtimeConfig.easterEggChanceMultiplier || 1);
    if (REDUCED_MOTION_QUERY.matches || Math.random() > chance) return;
    const target = getEasterEggTarget();
    if (!target || target.querySelector('.easter-egg-prompt')) return;
    target.classList.add('easter-egg-zone');
    createEasterEggPrompt(target);
}

function getEasterEggTarget() {
    const selectorsByPage = {
        'index.html': ['.hero', '.features'],
        'guide.html': ['.guide-card', '.guide-toc'],
        'shop.html': ['#shop-container', '#main-content'],
        'donate.html': ['.donation-grid', '.btn-group'],
        'privacy.html': ['.text-content'],
        'tos.html': ['.text-content']
    };
    const selectors = selectorsByPage[CURRENT_PAGE] || [];
    selectors.push('.content-wrapper', '.container');
    for (const selector of selectors) {
        const candidate = document.querySelector(selector);
        if (candidate) {
            return candidate;
        }
    }
    return null;
}

function createEasterEggPrompt(target) {
    const fishImage = pickFromPool(FISH_ART_LIBRARY, 'Minnow.png');
    const prompt = document.createElement('button');
    prompt.type = 'button';
    prompt.className = 'easter-egg-prompt';
    prompt.setAttribute('aria-label', 'Open secret portal');
    prompt.style.setProperty('--prompt-top', `${Math.random() * 60 + 10}%`);
    prompt.style.setProperty('--prompt-left', `${Math.random() * 60 + 10}%`);
    prompt.innerHTML = `
        <div class="easter-egg-chat">${EASTER_EGG_CONFIG.promptText}</div>
        <img src="fishImages/${fishImage}" alt="Secret fish">
    `;
    prompt.addEventListener('click', () => startEasterEggSequence(prompt));
    target.appendChild(prompt);
}

function startEasterEggSequence(prompt) {
    if (prompt) {
        prompt.remove();
    }
    stopEasterEggSequence();
    const body = document.body;
    const overlay = document.createElement('div');
    const hue = Math.floor(Math.random() * 360);
    const themeConfig = getThemeConfig(getCurrentPageTheme());
    const phrases = themeConfig.subliminalPhrases || getThemeConfig(DEFAULT_THEME).subliminalPhrases;
    overlay.className = 'easter-egg-overlay';
    overlay.style.setProperty('--overlay-hue', hue);
    overlay.innerHTML = `
        <div class="overlay-gradient"></div>
        <div class="overlay-noise"></div>
        <div class="overlay-text-stream" aria-live="polite"></div>
        <button type="button" class="overlay-close">Close Portal</button>
    `;
    const closeBtn = overlay.querySelector('.overlay-close');
    const textStream = overlay.querySelector('.overlay-text-stream');
    body.appendChild(overlay);
    body.classList.add('easter-egg-active');
    easterEggState.overlay = overlay;
    easterEggState.textInterval = startOverlayTextStream(textStream, phrases);
    closeBtn.addEventListener('click', () => stopEasterEggSequence());
}

function startOverlayTextStream(container, phrases) {
    const spawnFragment = () => {
        const fragment = document.createElement('span');
        fragment.className = 'overlay-text-fragment';
        fragment.innerText = getRandom(phrases);
        fragment.style.setProperty('--fragment-hue', Math.floor(Math.random() * 360));
        fragment.style.animationDuration = `${3 + Math.random() * 5}s`;
        fragment.style.fontSize = `${0.8 + Math.random() * 1.2}rem`;
        container.appendChild(fragment);
        if (container.children.length > EASTER_EGG_CONFIG.maxOverlayMessages) {
            container.removeChild(container.firstChild);
        }
    };
    spawnFragment();
    return setInterval(spawnFragment, EASTER_EGG_CONFIG.textSpawnInterval);
}

function stopEasterEggSequence() {
    if (easterEggState.textInterval) {
        clearInterval(easterEggState.textInterval);
        easterEggState.textInterval = null;
    }
    if (easterEggState.overlay) {
        easterEggState.overlay.remove();
        easterEggState.overlay = null;
    }
    document.body.classList.remove('easter-egg-active');
}

function initNavigation() {
    const body = document.body;
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (!toggle || !navLinks) return;

    const setMenuState = shouldOpen => {
        runtimeState.menuOpen = shouldOpen;
        body.classList.toggle('nav-open', shouldOpen);
        toggle.setAttribute('aria-expanded', String(shouldOpen));
    };

    toggle.addEventListener('click', () => {
        setMenuState(!body.classList.contains('nav-open'));
    });

    navLinks.addEventListener('click', event => {
        if (event.target.closest('a')) {
            setMenuState(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > NAV_BREAKPOINT) {
            setMenuState(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        setMenuState(false);
        stopEasterEggSequence();
    });
}

function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

function getPageRuntimeConfig() {
    return PAGE_RUNTIME_CONFIG[CURRENT_PAGE] || PAGE_RUNTIME_CONFIG['index.html'];
}

function registerInterval(callback, delay) {
    const intervalId = window.setInterval(callback, delay);
    runtimeState.intervals.push(intervalId);
    return intervalId;
}

function registerTimeout(callback, delay) {
    const timeoutId = window.setTimeout(() => {
        runtimeState.timeouts = runtimeState.timeouts.filter(id => id !== timeoutId);
        callback();
    }, delay);
    runtimeState.timeouts.push(timeoutId);
    return timeoutId;
}

function cleanupRuntime() {
    runtimeState.intervals.forEach(intervalId => clearInterval(intervalId));
    runtimeState.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    runtimeState.intervals = [];
    runtimeState.timeouts = [];
    stopEasterEggSequence();
}
