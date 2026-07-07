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

const form = document.querySelector(".contact-form");

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
    if (!validateForm()) return;

    // To connect Formspree later:
    // 1. Replace FORM_ENDPOINT with your Formspree endpoint.
    // 2. Uncomment the fetch block below.
    const FORM_ENDPOINT = "";

    if (!FORM_ENDPOINT) {
      status.textContent = "Request received. This is a simulated submission for now.";
      form.reset();
      form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
      return;
    }

    /*
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: new FormData(form),
    });

    if (response.ok) {
      status.textContent = "Request received. I will get back to you within 48 hours.";
      form.reset();
    } else {
      status.textContent = "There was a problem sending your request. Please try again.";
    }
    */
  });
}
