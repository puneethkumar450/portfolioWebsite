const revealItems = document.querySelectorAll("[data-reveal]");
const botTrigger = document.getElementById("bot-trigger");
const bot = document.getElementById("android-bot");
const robotMessage = document.getElementById("robot-message");
const rope = document.querySelector(".scroll-rope");
const ropeDragger = document.getElementById("rope-dragger");

const botMessages = [
  "Built a Meeting SDK that supports 80+ participants per call.",
  "Scaled a live-streaming platform to 72,000 concurrent viewers.",
  "Cut Android release effort from 4 hours down to 2 with CI/CD.",
  "Shipped real apps on Google Play with strong ratings and downloads.",
  "Modernized products with Jetpack Compose, Hilt, and Kotlin-first architecture."
];

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

let botMessageIndex = 0;

if (botTrigger && robotMessage) {
  botTrigger.addEventListener("click", () => {
    botMessageIndex = (botMessageIndex + 1) % botMessages.length;
    robotMessage.textContent = botMessages[botMessageIndex];
    botTrigger.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.03)" },
        { transform: "scale(1)" }
      ],
      {
        duration: 280,
        easing: "ease-out"
      }
    );
  });

  botTrigger.addEventListener("pointermove", (event) => {
    const rect = botTrigger.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    const moveX = offsetX / 18;
    const moveY = offsetY / 22;
    const tilt = offsetX / 38;

    bot.style.setProperty("--bot-x", `${moveX}px`);
    bot.style.setProperty("--bot-y", `${moveY}px`);
    bot.style.setProperty("--bot-tilt", `${tilt}deg`);
  });

  botTrigger.addEventListener("pointerleave", () => {
    bot.style.setProperty("--bot-x", "0px");
    bot.style.setProperty("--bot-y", "0px");
    bot.style.setProperty("--bot-tilt", "0deg");
  });
}

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
