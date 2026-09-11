(function () {
  "use strict";

  var storageKey = "jtj-theme";
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var root = document.documentElement;

  function readPreference() {
    try {
      var saved = window.localStorage.getItem(storageKey);
      return saved === "light" || saved === "dark" ? saved : "auto";
    } catch (_error) {
      return "auto";
    }
  }

  function resolvedTheme(preference) {
    return preference === "auto" ? (media.matches ? "dark" : "light") : preference;
  }

  function updateControls(theme) {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      var nextTheme = theme === "dark" ? "light" : "dark";
      var label = nextTheme === "dark" ? button.dataset.labelDark : button.dataset.labelLight;

      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    });
  }

  function applyPreference(preference, persist) {
    var theme = resolvedTheme(preference);

    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme;

    // Hidden variants stay lazy; fetch the visible logo immediately on a theme change.
    var visibleLogoClass = theme === "dark" ? "panel-logo-light" : "panel-logo-dark";
    document.querySelectorAll(".panel-logo").forEach(function (logo) {
      logo.loading = logo.classList.contains(visibleLogoClass) ? "eager" : "lazy";
    });

    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", theme === "dark" ? "#111417" : "#f2efe8");
    }

    if (persist) {
      try {
        if (preference === "auto") {
          window.localStorage.removeItem(storageKey);
        } else {
          window.localStorage.setItem(storageKey, preference);
        }
      } catch (_error) {
        // The visual preference still applies when storage is unavailable.
      }
    }

    updateControls(theme);
  }

  root.classList.remove("no-js");
  root.classList.add("js");
  applyPreference(readPreference(), false);

  document.addEventListener("DOMContentLoaded", function () {
    updateControls(root.dataset.theme || resolvedTheme(root.dataset.themePreference || "auto"));

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        applyPreference(root.dataset.theme === "dark" ? "light" : "dark", true);
      });
    });

    var mobileMenus = document.querySelectorAll(".mobile-nav");

    mobileMenus.forEach(function (menu) {
      menu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          menu.removeAttribute("open");
        });
      });
    });

    document.addEventListener("click", function (event) {
      mobileMenus.forEach(function (menu) {
        if (menu.hasAttribute("open") && !menu.contains(event.target)) {
          menu.removeAttribute("open");
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;

      mobileMenus.forEach(function (menu) {
        if (menu.hasAttribute("open")) {
          menu.removeAttribute("open");
          menu.querySelector("summary").focus();
        }
      });
    });

    var backToTopLinks = document.querySelectorAll("[data-back-to-top]");

    if (backToTopLinks.length) {
      var updateBackToTop = function () {
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        var revealAt = Math.min(640, Math.max(320, viewportHeight * 0.75));
        var isVisible = window.scrollY > revealAt;

        backToTopLinks.forEach(function (link) {
          var footer = link.closest(".site-footer");
          var restingOffset = window.innerWidth <= 760 ? 16 : 32;
          var footerClearance = window.innerWidth <= 760 ? 16 : 24;
          var footerTop = footer ? footer.getBoundingClientRect().top : viewportHeight;
          var collisionOffset = footerTop < viewportHeight
            ? viewportHeight - footerTop + footerClearance
            : restingOffset;

          link.style.setProperty(
            "--back-to-top-offset",
            Math.max(restingOffset, collisionOffset) + "px"
          );
          link.classList.toggle("is-visible", isVisible);
        });
      };

      backToTopLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
          var heading = document.querySelector("h1");
          var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

          event.preventDefault();
          window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });

          window.setTimeout(function () {
            if (heading) {
              try {
                heading.focus({ preventScroll: true });
              } catch (_error) {
                heading.focus();
              }
            }
          }, reduceMotion ? 0 : 420);
        });
      });

      updateBackToTop();
      window.addEventListener("scroll", updateBackToTop, { passive: true });
      window.addEventListener("resize", updateBackToTop);
    }
  });

  function handleSystemThemeChange() {
    if ((root.dataset.themePreference || "auto") === "auto") {
      applyPreference("auto", false);
    }
  }

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handleSystemThemeChange);
  } else if (typeof media.addListener === "function") {
    media.addListener(handleSystemThemeChange);
  }

  window.addEventListener("storage", function (event) {
    if (event.key === storageKey) {
      applyPreference(readPreference(), false);
    }
  });
})();
