document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    highlightActiveTab();
    initScrollNavbar();
    initFishTank();
    window.addEventListener('pagehide', cleanupRuntime, { once: true });
});

const CURRENT_PAGE = getCurrentPage();
const NAV_BREAKPOINT = 820;
const REDUCED_MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');

const PAGE_RUNTIME_CONFIG = {
    'index.html':   { fish: { initialCount: 5, desktopMax: 12, mobileMax: 6, bubbleInterval: 850,  fishSpawnInterval: 3200, opacity: 0.72 } },
    'guide.html':   { fish: { initialCount: 3, desktopMax: 7,  mobileMax: 4, bubbleInterval: 1200, fishSpawnInterval: 5000, opacity: 0.52 } },
    'shop.html':    { fish: { initialCount: 4, desktopMax: 9,  mobileMax: 5, bubbleInterval: 1000, fishSpawnInterval: 4000, opacity: 0.6  } },
    'donate.html':  { fish: { initialCount: 3, desktopMax: 6,  mobileMax: 3, bubbleInterval: 1300, fishSpawnInterval: 5200, opacity: 0.45 } },
    'privacy.html': { fish: { initialCount: 1, desktopMax: 2,  mobileMax: 1, bubbleInterval: 2000, fishSpawnInterval: 9000, opacity: 0.22 } },
    'tos.html':     { fish: { initialCount: 1, desktopMax: 2,  mobileMax: 1, bubbleInterval: 2000, fishSpawnInterval: 9000, opacity: 0.22 } }
};

const runtimeState = { intervals: [], timeouts: [], menuOpen: false };

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
    'NO NAME.png',
    'Ninja Fish.png',
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
    'SnowFlounder.png',
    'Snowflake Pufferfish.png',
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
    'WendigoFish.png',
    'WhimsyFish.png',
    'WhiskeyRiverFish.png',
    'hungry sardine.png',
    'waterloggedphone.png'
];

function highlightActiveTab() {
    document.querySelectorAll('.nav-links a').forEach(link => {
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
        if (!isTicking) { window.requestAnimationFrame(updateHeader); isTicking = true; }
    }, { passive: true });
    window.addEventListener('resize', () => header.classList.remove('nav-hidden'));
}

function initFishTank() {
    const tank = document.getElementById('fish-tank');
    const runtimeConfig = getPageRuntimeConfig();
    if (!tank || REDUCED_MOTION_QUERY.matches) return;
    const fishConfig = runtimeConfig.fish;
    registerInterval(() => createBubble(tank), fishConfig.bubbleInterval);
    for (let i = 0; i < fishConfig.initialCount; i++) createFish(tank, FISH_ART_LIBRARY, true, fishConfig);
    registerInterval(() => {
        const isMobile = window.innerWidth < 768;
        const maxFish = isMobile ? fishConfig.mobileMax : fishConfig.desktopMax;
        if (document.querySelectorAll('.fish').length < maxFish) createFish(tank, FISH_ART_LIBRARY, false, fishConfig);
    }, fishConfig.fishSpawnInterval);
}

function createBubble(container) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    const size = Math.random() * 10 + 5;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.animationDuration = `${Math.random() * 5 + 5}s`;
    container.appendChild(bubble);
    registerTimeout(() => bubble.remove(), 10000);
}

function createFish(container, images, randomX, fishConfig) {
    const fish = document.createElement('img');
    const randomImage = images[Math.floor(Math.random() * images.length)];
    fish.src = `fishImages/${randomImage}`;
    fish.classList.add('fish');
    fish.loading = 'lazy';
    fish.decoding = 'async';
    fish.alt = '';
    fish.style.opacity = fishConfig.opacity;
    fish.addEventListener('error', () => fish.remove(), { once: true });
    const direction = Math.random() > 0.5 ? 'right' : 'left';
    const topPos = Math.random() * 90;
    const duration = Math.random() * 10 + 10;
    const isMobile = window.innerWidth < 768;
    const size = isMobile ? Math.random() * 30 + 30 : Math.random() * 60 + 40;
    fish.style.top = `${topPos}vh`;
    fish.style.width = `${size}px`;
    if (direction === 'right') {
        fish.style.animation = `swimRight ${duration}s linear forwards`;
        fish.style.transform = 'scaleX(-1)';
    } else {
        fish.style.animation = `swimLeft ${duration}s linear forwards`;
        fish.style.transform = 'scaleX(1)';
    }
    if (randomX) fish.style.left = direction === 'right' ? '-150px' : '100vw';
    container.appendChild(fish);
    registerTimeout(() => fish.remove(), duration * 1000);
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
    toggle.addEventListener('click', () => setMenuState(!body.classList.contains('nav-open')));
    navLinks.addEventListener('click', event => { if (event.target.closest('a')) setMenuState(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > NAV_BREAKPOINT) setMenuState(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenuState(false); });
}

function getCurrentPage() { return window.location.pathname.split('/').pop() || 'index.html'; }
function getPageRuntimeConfig() { return PAGE_RUNTIME_CONFIG[CURRENT_PAGE] || PAGE_RUNTIME_CONFIG['index.html']; }
function registerInterval(cb, delay) { const id = window.setInterval(cb, delay); runtimeState.intervals.push(id); return id; }
function registerTimeout(cb, delay) {
    const id = window.setTimeout(() => { runtimeState.timeouts = runtimeState.timeouts.filter(t => t !== id); cb(); }, delay);
    runtimeState.timeouts.push(id); return id;
}
function cleanupRuntime() {
    runtimeState.intervals.forEach(clearInterval);
    runtimeState.timeouts.forEach(clearTimeout);
    runtimeState.intervals = [];
    runtimeState.timeouts = [];
}
