const revealItems = document.querySelectorAll("[data-reveal]");
const rope = document.querySelector(".scroll-rope");
const ropeDragger = document.getElementById("rope-dragger");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

if (rope && ropeDragger) {
  let activePointerId = null;
  let startPointerY = 0;
  let startScrollY = 0;
  let currentPull = 0;
  let maxPull = 0;

  const getMaxScroll = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const getMaxPull = () =>
    Math.max(96, window.innerHeight - 176);

  const setRopePull = (value) => {
    currentPull = Math.max(0, Math.min(maxPull, value));
    rope.style.setProperty("--rope-pull", `${currentPull}px`);
  };

  const syncRopeToScroll = () => {
    maxPull = getMaxPull();
    const maxScroll = getMaxScroll();
    const progress = maxScroll === 0 ? 0 : window.scrollY / maxScroll;
    setRopePull(progress * maxPull);
  };

  const stopRopeDragging = () => {
    const releasedPointerId = activePointerId;
    rope.classList.remove("is-dragging");
    if (releasedPointerId !== null) {
      ropeDragger.releasePointerCapture?.(releasedPointerId);
    }
    activePointerId = null;
    syncRopeToScroll();
  };

  ropeDragger.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    activePointerId = event.pointerId;
    startPointerY = event.clientY;
    startScrollY = window.scrollY;
    maxPull = getMaxPull();
    rope.classList.add("is-dragging");
    ropeDragger.setPointerCapture(event.pointerId);
  });

  ropeDragger.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointerId) {
      return;
    }

    event.preventDefault();
    const dragDistance = Math.max(0, event.clientY - startPointerY);
    setRopePull(dragDistance);

    const maxScroll = getMaxScroll();
    const remainingScroll = Math.max(0, maxScroll - startScrollY);
    const progress = currentPull / maxPull;
    const targetScroll = startScrollY + remainingScroll * progress;

    window.scrollTo({
      top: targetScroll,
      behavior: "auto"
    });
  });

  ropeDragger.addEventListener("pointerup", (event) => {
    if (event.pointerId !== activePointerId) {
      return;
    }
    stopRopeDragging();
  });

  ropeDragger.addEventListener("pointercancel", stopRopeDragging);
  ropeDragger.addEventListener("lostpointercapture", stopRopeDragging);

  window.addEventListener("scroll", () => {
    if (activePointerId === null) {
      syncRopeToScroll();
    }
  }, { passive: true });

  window.addEventListener("resize", syncRopeToScroll);
  syncRopeToScroll();
}

const LANG_STORAGE_KEY = "portfolio-lang";
const zhDictionary = (window.TRANSLATIONS && window.TRANSLATIONS.zh) || {};
const i18nTextElements = document.querySelectorAll("[data-i18n]");
const i18nAriaElements = document.querySelectorAll("[data-i18n-aria]");
const langButtons = document.querySelectorAll("[data-lang-option]");
const englishTextByElement = new Map();
const englishAriaByElement = new Map();
const englishTitle = document.title;

i18nTextElements.forEach((element) => {
  englishTextByElement.set(element, element.textContent.trim());
});

i18nAriaElements.forEach((element) => {
  englishAriaByElement.set(element, element.getAttribute("aria-label") || "");
});

const applyLanguage = (lang) => {
  const isChinese = lang === "zh";

  document.documentElement.lang = isChinese ? "zh-CN" : "en";
  document.title = isChinese
    ? zhDictionary["meta.title"] || englishTitle
    : englishTitle;

  i18nTextElements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const english = englishTextByElement.get(element);
    element.textContent = isChinese ? zhDictionary[key] || english : english;
  });

  i18nAriaElements.forEach((element) => {
    const key = element.getAttribute("data-i18n-aria");
    const english = englishAriaByElement.get(element);
    element.setAttribute("aria-label", isChinese ? zhDictionary[key] || english : english);
  });

  langButtons.forEach((button) => {
    const isActive = button.getAttribute("data-lang-option") === lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (error) {
    // localStorage can be unavailable (private mode); the language still applies for this visit.
  }
};

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.getAttribute("data-lang-option"));
  });
});

let initialLang = "en";
try {
  initialLang = localStorage.getItem(LANG_STORAGE_KEY) === "zh" ? "zh" : "en";
} catch (error) {
  initialLang = "en";
}
applyLanguage(initialLang);
