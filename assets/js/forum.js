(function () {
  "use strict";

  var root = document.querySelector("[data-forum-board]");
  if (!root) {
    return;
  }

  var postsKey = "formalintForumPosts";
  var handleKey = "formalintForumHandle";
  var handleNode = root.querySelector("[data-forum-handle]");
  var regenerate = root.querySelector("[data-regenerate-handle]");
  var form = root.querySelector("[data-forum-form]");
  var list = root.querySelector("[data-forum-list]");
  var empty = root.querySelector("[data-forum-empty]");
  var clear = root.querySelector("[data-clear-forum-posts]");
  var copyDraft = root.querySelector("[data-copy-forum-draft]");
  var status = root.querySelector("[data-forum-status]");
  var titleInput = root.querySelector("#forumTitle");
  var bodyInput = root.querySelector("#forumBody");
  var topicInput = root.querySelector("#forumTopic");
  var emojiButtons = Array.prototype.slice.call(root.querySelectorAll("[data-forum-emoji]"));

  var seedPosts = [
    {
      handle: "Softest-1042",
      topic: "Regex",
      title: "Email regex matched too much text",
      body: "I fixed the pattern by adding anchors, then tested empty strings, plus-addresses and a long invalid sample before using it in validation.",
      date: "2026-09-08T08:30:00.000Z",
      seed: true
    },
    {
      handle: "Softest-2718",
      topic: "API",
      title: "401 or 403 first?",
      body: "I now capture status code, WWW-Authenticate header and token scope separately. It keeps authentication and authorization mistakes from mixing together.",
      date: "2026-09-08T09:10:00.000Z",
      seed: true
    },
    {
      handle: "Softest-3141",
      topic: "DBA",
      title: "Slow endpoint was actually a connection pool issue",
      body: "The useful note was active sessions, pool size, timeout and the exact endpoint timestamp. After that the SQL formatter was only the readability step.",
      date: "2026-09-08T10:05:00.000Z",
      seed: true
    }
  ];

  function setStatus(message) {
    if (!status) {
      return;
    }
    status.textContent = message;
    window.setTimeout(function () {
      if (status.textContent === message) {
        status.textContent = "";
      }
    }, 3200);
  }

  function readJson(key, fallback) {
    try {
      var value = window.localStorage ? window.localStorage.getItem(key) : null;
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      setStatus("Local storage is not available in this browser session.");
    }
  }

  function randomHandle() {
    var number = String(Math.floor(1000 + Math.random() * 9000));
    return "Softest-" + number;
  }

  function getHandle() {
    var handle = "";
    try {
      handle = window.localStorage ? window.localStorage.getItem(handleKey) : "";
    } catch (error) {
      handle = "";
    }
    if (!handle) {
      handle = randomHandle();
      try {
        if (window.localStorage) {
          window.localStorage.setItem(handleKey, handle);
        }
      } catch (error) {
        // The generated handle can still be shown even when storage is blocked.
      }
    }
    return handle;
  }

  function updateHandle() {
    if (handleNode) {
      handleNode.textContent = getHandle();
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function readPosts() {
    return readJson(postsKey, []);
  }

  function writePosts(posts) {
    writeJson(postsKey, posts.slice(0, 30));
  }

  function postTemplate(post) {
    var date = new Date(post.date);
    var time = Number.isNaN(date.getTime()) ? "just now" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    return (
      '<article class="forum-post' + (post.seed ? " seed" : "") + '">' +
      '<div class="forum-post-meta"><span>' + escapeHtml(post.topic) + '</span><span>' + escapeHtml(post.handle) + '</span><time>' + escapeHtml(time) + "</time></div>" +
      "<h3>" + escapeHtml(post.title) + "</h3>" +
      "<p>" + escapeHtml(post.body) + "</p>" +
      '<button type="button" class="copy-code-button" data-copy-forum-post="' + escapeHtml(post.title) + '">Copy note</button>' +
      "</article>"
    );
  }

  function render() {
    var localPosts = readPosts();
    var posts = localPosts.concat(seedPosts);
    if (list) {
      list.innerHTML = posts.map(postTemplate).join("");
    }
    if (empty) {
      empty.hidden = posts.length > 0;
    }
  }

  function draftText() {
    return [
      "Formalint Forum Draft",
      "Handle: " + getHandle(),
      "Topic: " + (topicInput && topicInput.value ? topicInput.value : "General"),
      "Title: " + (titleInput && titleInput.value ? titleInput.value.trim() : ""),
      "",
      bodyInput && bodyInput.value ? bodyInput.value.trim() : ""
    ].join("\n");
  }

  function copyText(text) {
    if (!text.trim()) {
      setStatus("Nothing to copy yet.");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setStatus("Copied.");
      }).catch(function () {
        setStatus("Clipboard permission was blocked.");
      });
    } else {
      setStatus("Clipboard API is not available.");
    }
  }

  function insertAtCursor(input, value) {
    if (!input || !value) {
      return;
    }
    var start = typeof input.selectionStart === "number" ? input.selectionStart : input.value.length;
    var end = typeof input.selectionEnd === "number" ? input.selectionEnd : input.value.length;
    var prefix = input.value.slice(0, start);
    var suffix = input.value.slice(end);
    var next = prefix + value + suffix;
    input.value = next.slice(0, Number(input.getAttribute("maxlength")) || next.length);
    var cursor = Math.min(prefix.length + value.length, input.value.length);
    input.focus();
    if (input.setSelectionRange) {
      input.setSelectionRange(cursor, cursor);
    }
  }

  updateHandle();
  render();

  if (regenerate) {
    regenerate.addEventListener("click", function () {
      var next = randomHandle();
      try {
        if (window.localStorage) {
          window.localStorage.setItem(handleKey, next);
        }
      } catch (error) {
        // Ignore storage failure; the visible handle still updates.
      }
      updateHandle();
      setStatus("New local handle ready.");
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var title = titleInput ? titleInput.value.trim() : "";
      var body = bodyInput ? bodyInput.value.trim() : "";
      var topic = topicInput ? topicInput.value : "General";
      if (title.length < 8 || body.length < 24) {
        setStatus("Add a clearer title and a little more detail first.");
        return;
      }
      var posts = readPosts();
      posts.unshift({
        handle: getHandle(),
        topic: topic,
        title: title.slice(0, 120),
        body: body.slice(0, 1200),
        date: new Date().toISOString(),
        seed: false
      });
      writePosts(posts);
      form.reset();
      render();
      setStatus("Saved in this browser. Public posting needs the future backend.");
    });
  }

  if (copyDraft) {
    copyDraft.addEventListener("click", function () {
      copyText(draftText());
    });
  }

  emojiButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      insertAtCursor(bodyInput, button.getAttribute("data-forum-emoji") || "");
      setStatus("Emoji added to your note.");
    });
  });

  if (clear) {
    clear.addEventListener("click", function () {
      writePosts([]);
      render();
      setStatus("Local forum notes cleared.");
    });
  }

  if (list) {
    list.addEventListener("click", function (event) {
      var button = event.target.closest("[data-copy-forum-post]");
      if (!button) {
        return;
      }
      var post = button.closest(".forum-post");
      copyText(post ? post.innerText : button.getAttribute("data-copy-forum-post"));
    });
  }
})();
