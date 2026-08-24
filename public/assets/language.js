(function () {
  "use strict";

  var storageKey = "jtj-language";
  var supportedLanguages = ["en", "pt"];

  function isSupported(language) {
    return supportedLanguages.indexOf(language) !== -1;
  }

  function savePreference(language) {
    if (!isSupported(language)) return;

    try {
      window.localStorage.setItem(storageKey, language);
    } catch (_) {
      // Language selection still works when local storage is unavailable.
    }
  }

  function storedPreference() {
    try {
      var language = window.localStorage.getItem(storageKey);
      return isSupported(language) ? language : null;
    } catch (_) {
      return null;
    }
  }

  function devicePreference() {
    var languages = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en"];

    for (var index = 0; index < languages.length; index += 1) {
      var language = String(languages[index]).toLowerCase();
      if (language === "pt" || language.indexOf("pt-") === 0) return "pt";
      if (language === "en" || language.indexOf("en-") === 0) return "en";
    }

    return "en";
  }

  function rememberLanguageLinks() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest("[data-language]");
      if (!link) return;
      savePreference(link.getAttribute("data-language"));
    });
  }

  rememberLanguageLinks();

  if (!document.documentElement.hasAttribute("data-language-gateway")) return;

  var query = new URLSearchParams(window.location.search);
  if (query.get("choose") === "1") return;

  var requestedLanguage = query.get("lang");
  var language = isSupported(requestedLanguage)
    ? requestedLanguage
    : storedPreference() || devicePreference();

  savePreference(language);
  window.location.replace(new URL("./" + language + "/", window.location.href));
})();
