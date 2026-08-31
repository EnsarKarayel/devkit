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
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-tools-section]"));
  var activeTopic = "all";

  var topicMatchers = {
    formatter: ["formatter", "format", "lint", "linter", "indent", "cleanup", "schema", "csv", "json", "xml", "yaml", "sql", "python"],
    regex: ["regex", "regular expression", "lookahead", "lookbehind", "email", "uuid", "url", "date", "log parser", "javascript regex"],
    api: ["api", "http", "jwt", "oauth", "cors", "webhook", "graphql", "cookie", "samesite", "rate limit", "cache-control", "status", "headers"],
    ops: ["dba", "database", "postgresql", "mysql", "redis", "docker", "kubernetes", "nginx", "linux", "windows", "powershell", "git", "dns", "tls", "cockpit"],
    runtime: ["runtime", "node", "node.js", "npm", "php", "composer", "java", "jdk", "python", "fastapi", "django", "flask"],
    security: ["security", "jwt", "oauth", "cookie", "samesite", "tls", "https", "headers", "csp", "hsts", "safe", "privacy", "secret"]
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

  function update() {
    var query = normalize(input && input.value).trim();
    var visibleCount = 0;

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
          visibleCount += 1;
        }
      });

      section.hidden = sectionVisible === 0;
    });

    if (count) {
      count.textContent = visibleCount
        ? "Showing " + visibleCount + " resource" + (visibleCount === 1 ? "" : "s")
        : "No matching resources";
    }

    controls.classList.toggle("has-filter", Boolean(query) || activeTopic !== "all");
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

  update();
})();
