const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const countTargets = document.querySelectorAll("[data-count]");

function animateCount(node) {
  const target = Number(node.dataset.count || 0);
  const duration = 1100;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = Math.round(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  countTargets.forEach((node) => {
    node.textContent = Number(node.dataset.count || 0).toLocaleString();
  });
} else {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.7 }
  );

  countTargets.forEach((node) => countObserver.observe(node));
}

const compare = document.querySelector("[data-compare]");

if (compare) {
  const range = compare.querySelector("[data-compare-range]");
  const before = compare.querySelector("[data-before]");
  const handle = compare.querySelector("[data-handle]");

  const setCompare = (value) => {
    const clamped = Math.max(0, Math.min(100, Number(value)));
    before.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    handle.style.left = `${clamped}%`;
  };

  range.addEventListener("input", (event) => setCompare(event.target.value));
  setCompare(range.value);
}

const carousel = document.querySelector("[data-review-carousel]");
const prevReview = document.querySelector("[data-review-prev]");
const nextReview = document.querySelector("[data-review-next]");

if (carousel) {
  const cards = Array.from(carousel.querySelectorAll(".review-card"));
  let active = cards.findIndex((card) => card.classList.contains("is-active"));
  active = active >= 0 ? active : 0;

  function showReview(nextIndex) {
    cards[active].classList.remove("is-active");
    active = (nextIndex + cards.length) % cards.length;
    cards[active].classList.add("is-active");
  }

  prevReview?.addEventListener("click", () => showReview(active - 1));
  nextReview?.addEventListener("click", () => showReview(active + 1));

  if (!prefersReducedMotion) {
    let timer = window.setInterval(() => showReview(active + 1), 7000);
    carousel.addEventListener("pointerenter", () => window.clearInterval(timer));
    carousel.addEventListener("pointerleave", () => {
      timer = window.setInterval(() => showReview(active + 1), 7000);
    });
  }
}

const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));

if ("IntersectionObserver" in window && navLinks.length) {
  const linkById = new Map(navLinks.map((link) => [link.hash.slice(1), link]));
  const sections = Array.from(document.querySelectorAll("main section[id]")).filter((section) =>
    linkById.has(section.id)
  );

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove("is-active"));
          linkById.get(entry.target.id)?.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-35% 0px -58% 0px" }
  );

  sections.forEach((section) => spy.observe(section));
}

if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

document.querySelectorAll("details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    const parent = details.parentElement;
    if (!parent?.classList.contains("faq-list")) return;

    parent.querySelectorAll("details[open]").forEach((other) => {
      if (other !== details) other.open = false;
    });
  });
});

const form = document.querySelector("[data-form]");

if (form) {
  const status = form.querySelector("[data-form-status]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    form.querySelectorAll(".field.is-invalid").forEach((field) => field.classList.remove("is-invalid"));
    status.classList.remove("is-error");
    status.textContent = "";

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    if (!name || !phone) {
      if (!name) form.querySelector("#name")?.closest(".field")?.classList.add("is-invalid");
      if (!phone) form.querySelector("#phone")?.closest(".field")?.classList.add("is-invalid");
      status.classList.add("is-error");
      status.textContent = "Please add your name and phone number so we can reach you.";
      return;
    }

    const service = String(data.get("service") || "Garage door repair").trim();
    const details = String(data.get("details") || "").trim();
    const body = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Service: ${service}`,
      "",
      "Details:",
      details || "(none provided)"
    ].join("\n");

    status.textContent = "Opening your email app. You can also call us directly if it does not open.";
    window.location.href = `mailto:hello@ironwolfgaragedoor.com?subject=${encodeURIComponent(
      `Quote request from ${name}`
    )}&body=${encodeURIComponent(body)}`;
  });
}
