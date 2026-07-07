const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

const menuButton = document.querySelector(".mobile-menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mobileNav?.classList.toggle("is-open", !isOpen);
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    mobileNav?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
});

document.querySelectorAll(".project-media video").forEach((video) => {
  video.addEventListener("mouseenter", () => {
    if (!prefersReducedMotion) video.play().catch(() => {});
  });

  video.addEventListener("mouseleave", () => {
    if (!video.controls) video.pause();
  });
});

const heroProjects = [
  {
    id: "hyper",
    title: "Hyper",
    category: "AI Product Motion",
    description: "A punchy motion piece turning the idea of an AI super memory into a premium product story.",
    video: "assets/videos/hyper.mp4",
    poster: "assets/posters/hyper-poster.jpg",
  },
  {
    id: "shuttle",
    title: "Shuttle",
    category: "Product Explainer",
    description: "A clean product video designed to explain the platform with clarity, rhythm and premium execution.",
    video: "assets/videos/shuttle.mp4",
    poster: "assets/posters/shuttle-poster.jpg",
  },
  {
    id: "hevn",
    title: "HEVN",
    category: "Fintech Launch Video",
    description: "A cinematic UI animation for global payments, built to make complex financial infrastructure feel instant.",
    video: "assets/videos/hevn.mp4",
    poster: "assets/posters/hevn-poster.jpg",
  },
];

const heroVideo = document.querySelector("#hero-reel-video");
const heroTitle = document.querySelector("#hero-reel-title");
const heroCategory = document.querySelector("#hero-reel-category");
const heroDescription = document.querySelector("#hero-reel-description");
const heroDots = document.querySelectorAll("[data-hero-index]");
const heroPlayButton = document.querySelector(".hero-play-button");
let currentHeroIndex = 0;

function playHeroVideo() {
  if (!heroVideo || prefersReducedMotion) return;
  heroVideo.play().catch(() => {});
}

function setHeroProject(index) {
  if (!heroVideo) return;

  currentHeroIndex = (index + heroProjects.length) % heroProjects.length;
  const project = heroProjects[currentHeroIndex];

  heroVideo.src = project.video;
  heroVideo.poster = project.poster;
  heroVideo.setAttribute("aria-label", `${project.title} portfolio video`);
  heroVideo.load();

  if (heroTitle) heroTitle.textContent = project.title;
  if (heroCategory) heroCategory.textContent = project.category;
  if (heroDescription) heroDescription.textContent = project.description;

  heroDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === currentHeroIndex;
    dot.classList.toggle("is-active", isActive);
    if (isActive) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });

  playHeroVideo();
}

heroDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    setHeroProject(Number(dot.dataset.heroIndex));
  });
});

heroVideo?.addEventListener("ended", () => {
  if (!prefersReducedMotion) setHeroProject(currentHeroIndex + 1);
});

heroPlayButton?.addEventListener("click", () => {
  if (!heroVideo) return;

  if (heroVideo.paused) {
    heroVideo.play().catch(() => {});
    heroPlayButton.setAttribute("aria-label", "Pause hero reel");
  } else {
    heroVideo.pause();
    heroPlayButton.setAttribute("aria-label", "Play hero reel");
  }
});

if (prefersReducedMotion) {
  heroVideo?.pause();
} else {
  playHeroVideo();
}

const caseCarousel = document.querySelector(".case-carousel");
const caseViewport = document.querySelector(".case-carousel-viewport");
const caseTrack = document.querySelector(".case-carousel-track");
const caseCards = document.querySelectorAll(".case-carousel .case-card");
const caseDots = document.querySelectorAll("[data-case-index]");
const casePrevButton = document.querySelector("[data-case-prev]");
const caseNextButton = document.querySelector("[data-case-next]");
let currentCaseIndex = 0;
let caseTimer = null;

function setCaseIndex(index, shouldScroll = false) {
  if (!caseTrack || !caseCards.length) return;

  currentCaseIndex = (index + caseCards.length) % caseCards.length;
  caseTrack.style.transform = `translateX(-${currentCaseIndex * 100}%)`;

  caseCards.forEach((card, cardIndex) => {
    card.toggleAttribute("aria-current", cardIndex === currentCaseIndex);
  });

  caseDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === currentCaseIndex;
    dot.classList.toggle("is-active", isActive);
    if (isActive) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });

  if (shouldScroll && window.matchMedia("(max-width: 980px)").matches && caseViewport) {
    caseCards[currentCaseIndex].scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "start",
    });
  }
}

function startCaseTimer() {
  if (prefersReducedMotion || !caseCards.length) return;
  stopCaseTimer();
  caseTimer = window.setInterval(() => setCaseIndex(currentCaseIndex + 1), 7000);
}

function stopCaseTimer() {
  if (caseTimer) window.clearInterval(caseTimer);
  caseTimer = null;
}

casePrevButton?.addEventListener("click", () => {
  setCaseIndex(currentCaseIndex - 1, true);
  startCaseTimer();
});

caseNextButton?.addEventListener("click", () => {
  setCaseIndex(currentCaseIndex + 1, true);
  startCaseTimer();
});

caseDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    setCaseIndex(Number(dot.dataset.caseIndex), true);
    startCaseTimer();
  });
});

caseCarousel?.addEventListener("mouseenter", stopCaseTimer);
caseCarousel?.addEventListener("mouseleave", startCaseTimer);

document.querySelectorAll("[data-case-target]").forEach((link) => {
  link.addEventListener("click", () => {
    setCaseIndex(Number(link.dataset.caseTarget));
  });
});

document.querySelectorAll("[data-hero-project]").forEach((link) => {
  link.addEventListener("click", () => {
    const projectIndex = heroProjects.findIndex((project) => project.id === link.dataset.heroProject);
    if (projectIndex >= 0) setHeroProject(projectIndex);
  });
});

setCaseIndex(0);
startCaseTimer();

const form = document.querySelector(".contact-form");
const FORM_ENDPOINT = "https://formspree.io/f/xlgzlppp";

const validators = {
  name: (value) => (value.trim().length >= 2 ? "" : "Enter your name."),
  company: (value) => (value.trim().length >= 2 ? "" : "Enter your company name."),
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Enter a valid email.",
  website: (value) => {
    if (!value.trim()) return "";
    try {
      const url = new URL(value.trim());
      return url.protocol === "http:" || url.protocol === "https:" ? "" : "Use http or https.";
    } catch {
      return "Enter a valid URL.";
    }
  },
  project: (value) => (value.trim().length >= 3 ? "" : "Tell me the project type."),
  budget: (value) => (value.trim().length >= 2 ? "" : "Add a budget range."),
  timeline: (value) => (value.trim().length >= 2 ? "" : "Add a timeline."),
  message: (value) => (value.trim().length >= 30 ? "" : "Share at least 30 characters."),
};

function setFieldError(field, message) {
  const wrapper = field.closest(".field");
  const error = wrapper?.querySelector(".error-message");

  if (!wrapper || !error) return;

  wrapper.classList.toggle("invalid", Boolean(message));
  error.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateForm() {
  let isValid = true;

  Object.entries(validators).forEach(([name, validate]) => {
    const field = form.elements[name];
    const message = validate(field.value);
    setFieldError(field, message);
    if (message) isValid = false;
  });

  const privacy = form.elements.privacy;
  const status = form.querySelector(".form-status");
  if (!privacy.checked) {
    status.textContent = "Please agree to the Privacy Policy before submitting.";
    isValid = false;
  } else if (!isValid) {
    status.textContent = "Please fix the highlighted fields.";
  } else {
    status.textContent = "";
  }

  return isValid;
}

if (form) {
  Object.keys(validators).forEach((name) => {
    const field = form.elements[name];
    field.addEventListener("blur", () => setFieldError(field, validators[name](field.value)));
    field.addEventListener("input", () => {
      if (field.closest(".field")?.classList.contains("invalid")) {
        setFieldError(field, validators[name](field.value));
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = form.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');
    const submitButtonText = submitButton?.textContent;
    if (!validateForm()) return;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }
    status.textContent = "Sending your request...";

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form),
      });

      if (response.ok) {
        status.textContent = "Thank you. Your request has been sent successfully.";
        form.reset();
        form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
      } else {
        status.textContent = "There was a problem sending your request. Please try again.";
      }
    } catch {
      status.textContent = "Connection error. Please try again.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitButtonText;
      }
    }
  });
}
