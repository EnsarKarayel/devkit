(function () {
  "use strict";

  var controls = document.querySelector("[data-directory-controls]");
  if (!controls) {
    return;
  }

  var input = document.getElementById("toolsDirectorySearch");
  var count = document.getElementById("toolsDirectoryCount");
  var clear = controls.querySelector("[data-clear-tools]");
  var buttons = Array.prototype.slice.call(controls.querySelectorAll("[data-tools-topic]"));
  var quickQueries = Array.prototype.slice.call(controls.querySelectorAll("[data-tools-query]"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-tools-section]"));
  var activeTopic = "all";

  var topicMatchers = {
    formatter: ["formatter", "format", "lint", "linter", "indent", "cleanup", "schema", "csv", "json", "xml", "yaml", "sql", "python"],
    regex: ["regex", "regular expression", "lookahead", "lookbehind", "email", "phone", "password", "ip address", "slug", "hex", "uuid", "url", "date", "log parser", "javascript regex"],
    api: ["api", "http", "jwt", "expiration", "401", "403", "timeout", "oauth", "cors", "webhook", "graphql", "cookie", "samesite", "rate limit", "cache-control", "status", "headers"],
    ops: ["dba", "database", "postgresql", "mysql", "redis", "docker", "kubernetes", "nginx", "linux", "journalctl", "windows", "powershell", "git", "dns", "tls", "cockpit"],
    runtime: ["runtime", "node", "node.js", "npm", "environment", "php", "composer", "fpm", "java", "jdk", "thread dump", "python", "virtualenv", "fastapi", "django", "flask"],
    security: ["security", "injection", "jwt", "oauth", "password", "cookie", "samesite", "tls", "https", "headers", "csp", "hsts", "safe", "privacy", "secret"]
  };

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function cardMatchesTopic(card, topic) {
    if (topic === "all") {
      return true;
    }
    var haystack = normalize(card.textContent + " " + card.getAttribute("href"));
    return (topicMatchers[topic] || []).some(function (term) {
      return haystack.indexOf(term) !== -1;
    });
  }

  function setActiveButton(topic) {
    buttons.forEach(function (button) {
      var active = button.getAttribute("data-tools-topic") === topic;
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function readStateFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var topic = params.get("topic");
    var query = params.get("q");

    if (topic && topicMatchers[topic]) {
      activeTopic = topic;
    }

    if (query && input) {
      input.value = query.slice(0, 80);
    }

    setActiveButton(activeTopic);
  }

  function writeStateToUrl() {
    if (!window.history || !window.history.replaceState) {
      return;
    }

    var query = normalize(input && input.value).trim();
    var params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    if (activeTopic !== "all") {
      params.set("topic", activeTopic);
    }

    var next = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    window.history.replaceState(null, "", next);
  }

  function update() {
    var query = normalize(input && input.value).trim();
    var visibleCount = 0;
    var uniqueVisible = {};

    sections.forEach(function (section) {
      var sectionVisible = 0;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".tool-card"));

      cards.forEach(function (card) {
        var haystack = normalize(card.textContent + " " + card.getAttribute("href"));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesTopic = cardMatchesTopic(card, activeTopic);
        var visible = matchesQuery && matchesTopic;

        card.hidden = !visible;
        if (visible) {
          sectionVisible += 1;
          uniqueVisible[card.getAttribute("href")] = true;
        }
      });

      section.hidden = sectionVisible === 0;
    });

    if (count) {
      visibleCount = Object.keys(uniqueVisible).length;
      count.textContent = visibleCount
        ? "Showing " + visibleCount + " resource" + (visibleCount === 1 ? "" : "s")
        : "No matching resources";
    }

    controls.classList.toggle("has-filter", Boolean(query) || activeTopic !== "all");
    writeStateToUrl();
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeTopic = button.getAttribute("data-tools-topic") || "all";
      setActiveButton(activeTopic);
      update();
    });
  });

  if (input) {
    input.addEventListener("input", update);
  }

  if (clear) {
    clear.addEventListener("click", function () {
      if (input) {
        input.value = "";
        input.focus();
      }
      activeTopic = "all";
      setActiveButton(activeTopic);
      update();
    });
  }

  quickQueries.forEach(function (button) {
    button.addEventListener("click", function () {
      if (input) {
        input.value = button.getAttribute("data-tools-query") || "";
      }
      activeTopic = button.getAttribute("data-tools-topic-jump") || "all";
      setActiveButton(activeTopic);
      update();
    });
  });

  readStateFromUrl();
  update();
})();
