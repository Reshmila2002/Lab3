"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  const themeToggle = document.querySelector(".theme-toggle");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const typingText = document.querySelector("#typing-text");
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");

  document.querySelector("#current-year").textContent = new Date().getFullYear();

  const setMenu = (isOpen) => {
    navigation.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.querySelector(".sr-only").textContent = isOpen ? "Close navigation menu" : "Open navigation menu";
  };

  menuToggle.addEventListener("click", () => setMenu(!navigation.classList.contains("open")));
  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  const savedTheme = localStorage.getItem("teamcode-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const setTheme = (dark) => {
    body.classList.toggle("dark-mode", dark);
    themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.querySelector(".theme-icon").textContent = dark ? "☀" : "☾";
  };
  setTheme(savedTheme ? savedTheme === "dark" : prefersDark);
  themeToggle.addEventListener("click", () => {
    const dark = !body.classList.contains("dark-mode");
    setTheme(dark);
    localStorage.setItem("teamcode-theme", dark ? "dark" : "light");
  });

  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 12);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const sections = document.querySelectorAll("main section[id]");
  const navObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    }),
    { rootMargin: "-32% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach((section) => navObserver.observe(section));

  const phrase = "together.";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotion) {
    typingText.textContent = "";
    let index = 0;
    const typeNextCharacter = () => {
      typingText.textContent += phrase[index];
      index += 1;
      if (index < phrase.length) window.setTimeout(typeNextCharacter, 105);
    };
    window.setTimeout(typeNextCharacter, 450);
  }

  const fields = {
    name: {
      input: document.querySelector("#name"),
      error: document.querySelector("#name-error"),
      validate(value) { return value.trim().length >= 2 ? "" : "Please enter at least two characters."; }
    },
    email: {
      input: document.querySelector("#email"),
      error: document.querySelector("#email-error"),
      validate(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Please enter a valid email address."; }
    },
    message: {
      input: document.querySelector("#message"),
      error: document.querySelector("#message-error"),
      validate(value) { return value.trim().length >= 10 ? "" : "Your message needs at least 10 characters."; }
    }
  };

  const validateField = (field) => {
    const message = field.validate(field.input.value);
    field.error.textContent = message;
    field.input.setAttribute("aria-invalid", String(Boolean(message)));
    field.input.setAttribute("aria-describedby", field.error.id);
    return !message;
  };

  Object.values(fields).forEach((field) => field.input.addEventListener("input", () => {
    if (field.input.getAttribute("aria-invalid") === "true") validateField(field);
    status.textContent = "";
  }));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = Object.values(fields).map(validateField).every(Boolean);
    if (!valid) {
      status.textContent = "Please correct the highlighted fields and try again.";
      const firstInvalid = Object.values(fields).find((field) => field.input.getAttribute("aria-invalid") === "true");
      firstInvalid.input.focus();
      return;
    }
    const name = fields.name.input.value.trim();
    status.textContent = `Thanks, ${name}! Your message was sent successfully.`;
    form.reset();
    Object.values(fields).forEach((field) => {
      field.error.textContent = "";
      field.input.removeAttribute("aria-invalid");
    });
  });
});
