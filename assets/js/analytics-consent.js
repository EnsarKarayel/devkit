(function () {
  "use strict";

  var MEASUREMENT_ID = "G-SGR2EZG0BM";
  var STORAGE_KEY = "formalint_consent_v1";
  var storedPreference = null;

  try {
    storedPreference = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    storedPreference = null;
  }

  function getConsentState(preference) {
    var granted = preference === "accepted";
    return {
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied"
    };
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };

  window.gtag(
    "consent",
    "default",
    Object.assign(getConsentState(storedPreference), { wait_for_update: 500 })
  );
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_flags: "SameSite=None;Secure"
  });

  function savePreference(preference) {
    try {
      window.localStorage.setItem(STORAGE_KEY, preference);
    } catch (error) {
      // Consent still applies for the current page even if storage is unavailable.
    }

    window.gtag("consent", "update", getConsentState(preference));

    if (preference === "accepted") {
      window.gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }

  function removeBanner(banner) {
    banner.classList.add("is-closing");
    window.setTimeout(function () {
      banner.remove();
    }, 180);
  }

  function renderBanner(force) {
    var existing = document.querySelector(".consent-banner");
    if (existing) {
      existing.remove();
    }

    if (!force && (storedPreference === "accepted" || storedPreference === "declined")) {
      return;
    }

    var banner = document.createElement("aside");
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Privacy preferences");
    banner.innerHTML =
      '<div class="consent-copy">' +
      "<strong>Privacy preferences</strong>" +
      "<p>Formalint uses Google Analytics and advertising signals only with your consent. Tool input stays in your browser.</p>" +
      '<a href="privacy.html">Privacy policy</a>' +
      "</div>" +
      '<div class="consent-actions">' +
      '<button type="button" class="secondary" data-consent-choice="declined">Necessary only</button>' +
      '<button type="button" data-consent-choice="accepted">Accept</button>' +
      "</div>";

    banner.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-consent-choice]") : null;
      if (!button) {
        return;
      }
      var preference = button.getAttribute("data-consent-choice");
      storedPreference = preference;
      savePreference(preference);
      removeBanner(banner);
    });

    document.body.appendChild(banner);
  }

  window.FormalintConsent = {
    status: function () {
      return storedPreference || "unset";
    },
    setPreference: function (preference) {
      if (preference !== "accepted" && preference !== "declined") {
        return;
      }
      storedPreference = preference;
      savePreference(preference);
    }
  };

  document.addEventListener("click", function (event) {
    var target = event.target;
    var button = target && target.closest ? target.closest("[data-consent-open]") : null;
    if (button) {
      renderBanner(true);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      renderBanner(false);
    });
  } else {
    renderBanner(false);
  }
})();
