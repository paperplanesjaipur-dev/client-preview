/* =====================================================
   SCRIPT.JS : Disha & Sambhav wedding invitation
   Website width = 720 px. The page scrolls up and down normally.
   ===================================================== */
/* =====================================================
   PART A : BASE (never change this part)
   ===================================================== */

const phone = document.getElementById('phone');
const pages = Array.from(document.querySelectorAll('.page'));

/* ---------- 1. FIT ONE FULL PAGE (720 x 1280) TO THE SCREEN ----------
   It only works again when the SCALE really changes. On a phone the address bar slides in and out
   while you scroll, which fires "resize" all the time. That used to make the page jump. */
const FILL_WIDTH_ALWAYS = false;   // ★ false = on a wide computer screen the site keeps its phone shape with coloured sides
                                   //   true  = the site always fills the full width (no side space anywhere, even on a computer)
let lastScale = 0;
let fitFrame = 0;
function fitToScreen() {
  const w = window.innerWidth, h = window.innerHeight;
  let s = (w < h || FILL_WIDTH_ALWAYS)
    ? w / 720                              /* ★ phone: fill the width */
    : Math.min(w / 720, h / 1280);         /* computer: fit the height */
  const dpr = window.devicePixelRatio || 1;
  s = Math.ceil(1280 * s * dpr) / (1280 * dpr);   // whole-pixel page height: no hairline between pages
  if (s === lastScale) return;              // nothing changed, do nothing
  lastScale = s;
  phone.style.setProperty('--s', s);
  document.body.style.height = (phone.offsetHeight * s) + 'px';   // makes the page scroll
}
function queueFit() {
  cancelAnimationFrame(fitFrame);
  fitFrame = requestAnimationFrame(fitToScreen);
}
fitToScreen();
window.addEventListener('resize', queueFit);
window.addEventListener('orientationchange', function () { setTimeout(queueFit, 250); });
window.addEventListener('load', function () { lastScale = 0; fitToScreen(); });

/* Let the phone decode pictures in the background, so scrolling does not freeze */
document.querySelectorAll('img').forEach(function (img) { img.decoding = 'async'; });

/* ---------- 2. START A PAGE'S ANIMATION WHEN IT SCROLLS INTO VIEW ---------- */
const watcher = new IntersectionObserver(function (entries) {
  entries.forEach(function (en) {
    const page = en.target;
    if (en.intersectionRatio >= 0.5 && !page.classList.contains('active')) {
      page.classList.add('active');
      page.dispatchEvent(new Event('enter'));
    } else if (en.intersectionRatio === 0 && page.classList.contains('active')) {
      page.classList.remove('active');
      page.dispatchEvent(new Event('leave'));
    }
  });
}, { threshold: [0, 0.5] });
pages.forEach(function (p) { watcher.observe(p); });

/* =====================================================
   PART B : PAGES (one block per page)
   ===================================================== */


/* ================= PAGE 1 START ================= */

const P1_FLIP_EVERY = 2500;   // ★ the card flips by itself every ... milliseconds (2000 = 2 s, 3000 = 3 s)
const P1_POPUP_TIME = 2600;   //   the slow pop-up at the start takes 2.6 s (same as in style.css), flipping starts after it

const p1Card = document.getElementById('p1Card');
let p1Angle   = 0;            // how far the card has turned so far
let p1Wait    = null;         // waits for the pop-up to finish
let p1Timer   = null;         // the repeating flip
let p1Visible = false;        // is page 1 on the screen?

/* Turn the card half a turn, always in the same direction */
function p1Turn() {
  p1Angle += 180;
  p1Card.style.setProperty('--rot', p1Angle + 'deg');
}
function p1Stop() {
  clearTimeout(p1Wait);
  clearInterval(p1Timer);
}
function p1Start(delay) {
  p1Stop();
  p1Wait = setTimeout(function () {
    p1Timer = setInterval(p1Turn, P1_FLIP_EVERY);
  }, delay);
}

/* 1) When page 1 comes into view: Ganesha slowly pops up, then the card starts flipping by itself */
pages[0].addEventListener('enter', function () {
  p1Visible = true;
  p1Card.classList.add('show');
  p1Start(P1_POPUP_TIME);
});

/* 2) When page 1 is fully scrolled away: stop and reset, so it pops up again when the user scrolls back */
pages[0].addEventListener('leave', function () {
  p1Visible = false;
  p1Stop();
  p1Card.classList.remove('show');
  p1Angle = 0;
  p1Card.style.setProperty('--rot', '0deg');
});

/* 3) Save battery: no flipping while the browser tab / app is in the background */
document.addEventListener('visibilitychange', function () {
  if (document.hidden) p1Stop();
  else if (p1Visible) p1Start(0);
});

/* ================= PAGE 1 END ================= */


/* ================= PAGE 2 START ================= */
/* Page 2 needs no JavaScript. Its text animates through CSS when the page scrolls into view. */
/* ================= PAGE 2 END ================= */


/* ================= PAGE 3 START ================= */

const P3_CHANGE_EVERY = 3000;     // ★ text 1 <-> text 2 swap time (milliseconds)
const P3_OPEN_PAUSE   = 700;      // ★ the slow push towards the doorway starts this long after the doors start opening (milliseconds)
const P3_SHOW_P4      = 1500;     // ★ when page 4 starts to fade in (milliseconds, counted from the tap)
const P3_P4_GROW      = 2400;     //   how long page 4 takes to settle (same as in style.css)

const page3     = document.getElementById('page3');
const p3Msgs    = page3.querySelectorAll('.p3-msg');
const p3Door    = document.getElementById('p3Door');
const p3DoorTag = document.getElementById('p3DoorTag');
const p3ZoomTag = document.getElementById('p3ZoomTag');
const p3Lunch   = document.getElementById('p3Lunch');
let p3Timer = null, p3Idx = 0, p3Busy = false;

/* Safety: page 4 must live INSIDE page 3. If it is somewhere else in the HTML, move it in. */
const page4   = document.getElementById('page4');
const p4Video = document.getElementById('p4Video');
if (!page3.contains(page4)) page3.appendChild(page4);

/* ---------- Page 4 video: it is only loaded while page 2 / page 3 are near, and unloaded afterwards ---------- */
const p4Src = p4Video.getAttribute('data-src') || p4Video.getAttribute('src');
p4Video.muted = true;
p4Video.disablePictureInPicture = true;
function p4Load() {
  if (!p4Video.getAttribute('poster') && p4Video.dataset.poster) p4Video.setAttribute('poster', p4Video.dataset.poster);
  if (p4Src && !p4Video.getAttribute('src')) {
    p4Video.preload = 'auto';
    p4Video.src = p4Src;
  }
}
function p4Unload() {
  p4Video.pause();
  if (p4Video.getAttribute('src')) {
    p4Video.removeAttribute('src');
    p4Video.load();                        // frees the memory, the poster picture stays
  }
}
p4Unload();                                // do not download it together with the whole website
/* (page 4's video is fetched only when page 3 is on the screen, see the page 3 'enter' below) */

/* ---------- Timers of the door sequence (so they can all be cancelled together) ---------- */
let p3Timeouts = [];
function p3After(fn, ms) { p3Timeouts.push(setTimeout(fn, ms)); }
function p3ClearTimeouts() { p3Timeouts.forEach(clearTimeout); p3Timeouts = []; }

/* ---------- Lock the scrolling while the door opens (no more "screen going down") ---------- */
const P3_SCROLL_KEYS = [' ', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
let p3Locked = false;
function p3StopScroll(e) { if (e.cancelable) e.preventDefault(); }
function p3StopScrollKeys(e) { if (P3_SCROLL_KEYS.indexOf(e.key) !== -1) e.preventDefault(); }
function p3Lock() {
  if (p3Locked) return;
  p3Locked = true;
  window.addEventListener('wheel', p3StopScroll, { passive: false });
  window.addEventListener('touchmove', p3StopScroll, { passive: false });
  window.addEventListener('keydown', p3StopScrollKeys);
}
function p3Unlock() {
  if (!p3Locked) return;
  p3Locked = false;
  window.removeEventListener('wheel', p3StopScroll);
  window.removeEventListener('touchmove', p3StopScroll);
  window.removeEventListener('keydown', p3StopScrollKeys);
}

/* Where to scroll so that page 3 (and page 4 growing out of it) sits nicely in the screen */
function p3AlignTarget() {
  const r  = page3.getBoundingClientRect();
  const top = window.scrollY + r.top;               // top of page 3 in the whole document
  const vh  = window.innerHeight;
  const y   = r.height < vh ? top - (vh - r.height) / 2 : top;   // shorter than the screen: centre it
  return Math.max(0, Math.round(y));
}

/* Show one of the two texts */
function p3Show(i) {
  p3Msgs.forEach(function (m, k) { m.classList.toggle('show', k === i); });
}
function p3StartText() {
  p3StopText();
  p3Idx = 0;
  p3Show(0);                                       // text 1 first
  p3Timer = setInterval(function () {              // then they keep swapping
    p3Idx = (p3Idx + 1) % p3Msgs.length;
    p3Show(p3Idx);
  }, P3_CHANGE_EVERY);
}
function p3StopText() {
  clearInterval(p3Timer);
  p3Msgs.forEach(function (m) { m.classList.remove('show'); });
}

/* Put the page back to its first look (door closed, page 4 hidden) */
function p3Reset() {
  p3ClearTimeouts();
  p3Unlock();
  page3.classList.remove('door-open', 'go-in', 'lunch-on', 'p4-in');
  p4Video.pause();
  p3Busy = false;
}

/* Zoom into the Welcome Lunch window, and back out */
p3ZoomTag.addEventListener('click', function () { if (!p3Busy) page3.classList.add('lunch-on'); });
p3Lunch.addEventListener('click', function () { page3.classList.remove('lunch-on'); });

/* Open the door, go inside, page 4 grows out of the doorway */
function p3EnterDoor() {
  if (p3Busy || page3.classList.contains('lunch-on')) return;
  p3Busy = true;
  p4Load();                                                       // make sure the video is on its way
  p3Lock();                                                       // the screen stays still from now on
  window.scrollTo({ top: p3AlignTarget(), behavior: 'smooth' });  // line up page 3 so page 4 fills the screen
  page3.classList.add('door-open');                               // 1) doors swing open

  p3After(function () {                                           // 2) while the doors are still opening, the slow push towards the doorway starts
    const t = p3AlignTarget();
    if (Math.abs(window.scrollY - t) > 40) window.scrollTo(0, t); //    (only if the screen is clearly NOT lined up, snap it)
    page3.classList.add('go-in');
    p4Warm();                                                     //    start the video quietly, so it does not stutter later
  }, P3_OPEN_PAUSE);

  p3After(function () {                                           // 3) page 4 fades in over the haveli (overlaps the push, so it is ONE movement)
    page3.classList.add('p4-in');
    p4Open();
  }, P3_SHOW_P4);

  p3After(p3Unlock, P3_SHOW_P4 + P3_P4_GROW);                     // 4) page 4 is open: the user can scroll again
}
p3DoorTag.addEventListener('click', p3EnterDoor);
p3Door.addEventListener('click', p3EnterDoor);

/* When page 3 scrolls into view: start the texts. When it is fully scrolled away: reset. */
page3.addEventListener('enter', function () { p4Load(); p3StartText(); });
page3.addEventListener('leave', function () {
  p3StopText(); p3Reset();
  setTimeout(function () { if (!page3.classList.contains('active')) p4Unload(); }, 800);   // not in the middle of the scroll
});

/* ================= PAGE 3 END ================= */


/* ================= PAGE 4 START ================= */

/* Starts the video a little before page 4 is visible (still hidden behind the glow) */
function p4Warm() {
  try { p4Video.currentTime = 0; } catch (e) {}
  const p = p4Video.play();
  if (p && p.catch) p.catch(function () {});
}

/* Called when page 4 starts growing out of the doorway.
   Page 4 is NOT locked: the user can scroll down from it to page 5. */
function p4Open() {
  if (p4Video.paused) {
    const p = p4Video.play();
    if (p && p.catch) p.catch(function () {});   // if the phone blocks autoplay, the poster picture stays
  }
}

/* ================= PAGE 4 END ================= */


/* ================= PAGES 5 - 10 START ================= */

/* Normal behaviour, light on the phone:
   - the video of the page on the screen plays at once
   - the NEXT video is downloaded in advance, so it starts without waiting
   - videos far away are unloaded (the still picture stays), so the phone's memory stays free */

const vItems = [];
document.querySelectorAll('.vpage').forEach(function (page) {
  const video = page.querySelector('.pv');
  if (!video) return;
  video.muted = true;
  video.setAttribute('playsinline', '');
  video.disablePictureInPicture = true;
  vItems.push({
    page: page, video: video, visible: false,
    src:    video.getAttribute('data-src') || video.getAttribute('src'),
    poster: video.getAttribute('data-poster') || ''
  });
});

let vFocus = -1;     // number of the video page that is on the screen now (-1 = none yet)

let vReady = false;   // becomes true after page 1 has loaded, so page 1 gets the full bandwidth first
function vPoster(it) {
  if (!vReady) return;
  if (it.poster && !it.video.getAttribute('poster')) it.video.setAttribute('poster', it.poster);
}
function vLoad(it, preload) {
  vPoster(it);
  if (!it.primed) {                         // first frame is shown as soon as the file is ready, the video waits there
    it.primed = true;
    it.video.addEventListener('loadedmetadata', function () {
      try { if (it.video.paused && it.video.currentTime < 0.05) it.video.currentTime = 0.05; } catch (e) {}
    });
  }
  it.video.preload = preload;
  if (it.src && !it.video.getAttribute('src')) it.video.src = it.src;
}
function vUnload(it) {
  it.video.pause();
  if (it.video.getAttribute('src')) {
    it.video.removeAttribute('src');
    it.video.load();                       // frees the memory, the still picture stays
  }
}
/* Slow network or Data Saver: download only the video that is on the screen, not the next one too */
function vSlowNet() {
  const c = navigator.connection;
  return !!(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
}
const V_KEEP_LOADED = true;   // ★ true  = poster + preload="metadata" on ALL videos, nothing is removed (smooth scrolling)
                              //   false = far videos are unloaded to save memory (can make scrolling jerky)
function vSync() {
  if (!vReady) return;
  const slow  = vSlowNet();
  const ahead = slow ? 1 : 2;               // ★ how many NEXT videos are downloaded in advance
  vItems.forEach(function (it, i) {
    const d = i - vFocus;
    vPoster(it);
    if (d === 0 || (d > 0 && d <= ahead)) vLoad(it, 'auto');   // this one + the next two: full download
    else if (d < 0) vLoad(it, 'metadata');                      // already passed: keep (scrolling back is smooth)
    else vUnload(it);                                           // far ahead: wait, so the next videos get the bandwidth
  });
}
function vPlay(it) {
  if (document.hidden || vScrolling) return;
  const p = it.video.play();
  if (p && p.catch) p.catch(function () {});
}

/* The still picture of every video page is also painted as the page's own background,
   so the page is never an empty colour, even if the video itself is not ready yet */
vItems.forEach(function (it) {
  if (it.poster) it.page.style.setProperty('--pimg', 'url("' + it.poster + '")');
});

/* All still pictures (thumbnails) are set at once, so every page already shows its picture before you reach it */
vItems.forEach(vPoster);
vSync();   // every video starts with poster + preload="metadata" (no full download)

/* Heavy work (loading / unloading / starting a video) waits until the finger STOPS scrolling.
   While you scroll, the phone only moves pictures, so scrolling stays smooth.
   A moment after you stop, the video of the page on the screen starts to play. */
const V_IDLE = 120;            // ★ ms of calm scrolling before the video starts (smaller = starts faster)
let vLastScroll = 0;
let vIdleTimer  = null;
const V_SETTLE = 180;      // ★ ms without scrolling before the video starts (smaller = starts faster)
let vScrolling = false, vStopTimer = null;
window.addEventListener('scroll', function () {
  vLastScroll = Date.now();
  if (!vScrolling) {                                   // scrolling started: every video holds still
    vScrolling = true;
    vItems.forEach(function (it) { it.video.pause(); });
  }
  clearTimeout(vStopTimer);
  vStopTimer = setTimeout(function () {                // scrolling stopped: the video of this page plays
    vScrolling = false;
    vSync();
    vItems.forEach(function (it) { if (it.visible) vPlay(it); });
  }, V_SETTLE);
}, { passive: true });

function vWhenIdle() {
  clearTimeout(vIdleTimer);
  vIdleTimer = setTimeout(function tick() {
    if (Date.now() - vLastScroll < V_IDLE) { vIdleTimer = setTimeout(tick, 60); return; }
    vSync();
    vItems.forEach(function (it) { if (it.visible) vPlay(it); });
  }, 60);
}

/* A video page counts as "on the screen" when a good part of it is visible */
const vWatcher = new IntersectionObserver(function (entries) {
  entries.forEach(function (en) {
    const i = vItems.findIndex(function (it) { return it.page === en.target; });
    if (i < 0) return;
    const it = vItems[i];
    if (en.intersectionRatio >= 0.3) {
      if (!it.visible) { it.visible = true; vFocus = i; vWhenIdle(); }
    } else if (it.visible) {
      it.visible = false;
      it.video.pause();                       // pausing is cheap, do it at once
    }
    if (en.intersectionRatio === 0) {         // fully off screen: back to the first frame, so it starts from the beginning next time
      try { if (it.video.getAttribute('src')) it.video.currentTime = 0.05; } catch (e) {}
    }
  });
}, { threshold: [0, 0.3] });
vItems.forEach(function (it) { vWatcher.observe(it.page); });

/* Pause everything when the browser tab / app goes to the background, continue when it comes back */
document.addEventListener('visibilitychange', function () {
  vItems.forEach(function (it) {
    if (document.hidden) it.video.pause();
    else if (it.visible) vPlay(it);
  });
});

/* Some phones (for example iPhone in Low Power Mode) block autoplay.
   The first touch on the website then starts the video that is on the screen. */
document.addEventListener('touchend', function () {
  vItems.forEach(function (it) { if (it.visible) vPlay(it); });
}, { once: true, passive: true });

/* ================= PAGES 5 - 10 END ================= */

/* ================= PHONES : SOFT FADE BETWEEN VIDEO PAGES ================= */
/* On a computer style.css fades the top of every video page into the page above it.
   On a phone that fade is only switched on (class "edge") while the top of the page is close to the screen,
   so the join looks exactly like on the computer, but the phone does not have to carry it all the time. */
if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
  const edgeWatcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { en.target.parentNode.classList.toggle('edge', en.isIntersecting); });
  }, { rootMargin: '140px 0px 140px 0px' });      // a little early, so the fade is ready before the join arrives
  document.querySelectorAll('.vpage').forEach(function (page) {
    const probe = document.createElement('div');
    probe.className = 'edge-probe';
    page.insertBefore(probe, page.firstChild);
    edgeWatcher.observe(probe);
  });
}

/* ================= LOADING COVER (shows while page 1 is getting ready) ================= */
/* No HTML or CSS needed. It disappears as soon as the pictures of page 1 are loaded,
   or after LOADER_MAX milliseconds at the latest, so nobody ever waits on a blank screen. */
const LOADER_BG   = '#fff8ec';   // ★ cover colour (change to match your website)
const LOADER_TEXT = '#7a1f2b';   // ★ text colour
const LOADER_MAX  = 3500;        // ★ the cover is removed after this long, whatever happens (milliseconds)

(function () {
  const cover = document.createElement('div');
  cover.style.cssText =
    'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
    'background:' + LOADER_BG + ';color:' + LOADER_TEXT + ';font:600 22px/1.4 Georgia,serif;' +
    'letter-spacing:.08em;text-align:center;transition:opacity .6s ease;touch-action:none;';
  cover.innerHTML = '<div>Disha &amp; Sambhav<br><small style="font-weight:400;font-size:14px;opacity:.7">loading…</small></div>';
  document.body.appendChild(cover);
  if (cover.animate) {
    cover.firstChild.animate([{ opacity: .45 }, { opacity: 1 }, { opacity: .45 }],
                             { duration: 1600, iterations: Infinity });
  }

  let done = false;
  function hide() {
    if (done) return;
    done = true;
    cover.style.opacity = '0';
    setTimeout(function () { cover.remove(); }, 650);
  }

  const imgs = Array.from(pages[0].querySelectorAll('img')).filter(function (i) { return !i.complete; });
  if (!imgs.length) { setTimeout(hide, 300); }
  else {
    let left = imgs.length;
    const one = function () { if (--left <= 0) setTimeout(hide, 200); };
    imgs.forEach(function (i) {
      i.addEventListener('load', one, { once: true });
      i.addEventListener('error', one, { once: true });
    });
  }
  setTimeout(hide, LOADER_MAX);   // safety: never stay longer than this
})();

/* ================= PRELOAD IN ORDER (fixes pages showing late while scrolling) ================= */
/* After page 1 is ready, all pictures and still images (posters) are downloaded one after another,
   top to bottom, 3 at a time. By the time the guest scrolls down they are already in the browser cache.
   Then the videos start loading (this one + the next two). */
(function () {
  const urls = [];
  document.querySelectorAll('img, video[data-poster]').forEach(function (el) {
    const u = el.tagName === 'VIDEO' ? el.getAttribute('data-poster') : el.getAttribute('src');
    if (u && urls.indexOf(u) === -1) urls.push(u);
  });
  const c = navigator.connection;
  const saver = !!(c && c.saveData);
  let next = 0, running = 0, finished = false;
  const MAX = 3;
  function finish() {
    if (finished) return;
    finished = true;
    vReady = true;
    vItems.forEach(vPoster);
    vSync();
    vItems.forEach(function (it) { if (it.visible) vPlay(it); });
  }
  function pump() {
    if (next >= urls.length && running === 0) { finish(); return; }
    while (running < MAX && next < urls.length) {
      const im = new Image();
      running++;
      const done = function () { running--; pump(); };
      im.onload = done; im.onerror = done;
      im.src = urls[next++];
    }
  }
  function begin() {
    vReady = true;                       // posters + first videos can start now
    vItems.forEach(vPoster);
    vSync();
    if (!saver) pump();
  }
  if (document.readyState === 'complete') begin(); else window.addEventListener('load', begin);
})(); 