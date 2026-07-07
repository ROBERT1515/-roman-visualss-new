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

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
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
  message: (value) => (value.trim().length >= 12 ? "" : "Share a few more details."),
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

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const status = form.querySelector(".form-status");
    if (!validateForm()) return;

    status.textContent = "Request received. This is a simulated submission for now.";
    form.reset();
    form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
  });
}
