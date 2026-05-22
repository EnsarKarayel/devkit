(function () {
  "use strict";

  if (document.body.dataset.tool !== "json-schema") {
    return;
  }

  var $ = window.DevKit.$;
  var input = $("#schemaInput");
  var output = $("#schemaOutput");
  var statusMessage = $("#statusMessage");
  var inputMeta = $("#inputMeta");
  var metrics = $("#metrics");
  var lastSchema = "";
  var lastSchemaObject = null;

  var sampleJson = {
    customerId: 42,
    email: "customer@example.com",
    active: true,
    tags: ["trial", "api"],
    address: {
      country: "TR",
      city: "Istanbul"
    },
    orders: [
      { id: "ORD-1001", total: 125.5, paid: true },
      { id: "ORD-1002", total: 89, paid: false }
    ]
  };

  function updateInputMeta() {
    inputMeta.textContent = window.DevKit.formatBytes(input.value) + " / " + window.DevKit.lineCount(input.value) + " lines";
  }

  function parseInput() {
    var raw = input.value.trim();
    if (!raw) {
      throw new Error("Input is empty.");
    }
    return JSON.parse(raw);
  }

  function detectStringFormat(value) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "email";
    }
    if (/^https?:\/\/[^\s]+$/i.test(value)) {
      return "uri";
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return "date-time";
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return "date";
    }
    return "";
  }

  function typeOfValue(value) {
    if (value === null) {
      return "null";
    }
    if (Array.isArray(value)) {
      return "array";
    }
    if (typeof value === "number" && Number.isInteger(value)) {
      return "integer";
    }
    return typeof value;
  }

  function inferSchema(value) {
    var type = typeOfValue(value);

    if (type === "array") {
      return {
        type: "array",
        items: inferArrayItems(value)
      };
    }

    if (type === "object") {
      return inferObjectSchema(value);
    }

    var schema = { type: type };
    if (type === "string") {
      var format = detectStringFormat(value);
      if (format) {
        schema.format = format;
      }
      schema.examples = [value];
    }
    return schema;
  }

  function inferObjectSchema(value) {
    var keys = Object.keys(value);
    var properties = {};
    keys.forEach(function (key) {
      properties[key] = inferSchema(value[key]);
    });
    return {
      type: "object",
      required: keys,
      properties: properties,
      additionalProperties: true
    };
  }

  function inferArrayItems(items) {
    if (!items.length) {
      return {};
    }
    return items.map(inferSchema).reduce(mergeSchemas);
  }

  function mergeSchemas(left, right) {
    if (!left) {
      return right;
    }
    if (!right) {
      return left;
    }

    if (left.type !== right.type) {
      var types = [];
      [left.type, right.type].forEach(function (type) {
        if (Array.isArray(type)) {
          type.forEach(function (item) {
            if (types.indexOf(item) === -1) {
              types.push(item);
            }
          });
        } else if (types.indexOf(type) === -1) {
          types.push(type);
        }
      });
      if (types.indexOf("number") !== -1 && types.indexOf("integer") !== -1) {
        types = types.filter(function (type) {
          return type !== "integer";
        });
      }
      return { type: types };
    }

    if (left.type === "object") {
      return mergeObjectSchemas(left, right);
    }

    if (left.type === "array") {
      return { type: "array", items: mergeSchemas(left.items, right.items) };
    }

    return left;
  }

  function mergeObjectSchemas(left, right) {
    var properties = {};
    var keys = Object.keys(left.properties || {}).concat(Object.keys(right.properties || {}));
    keys.forEach(function (key) {
      if (properties[key]) {
        return;
      }
      properties[key] = mergeSchemas((left.properties || {})[key], (right.properties || {})[key]);
    });
    var required = (left.required || []).filter(function (key) {
      return (right.required || []).indexOf(key) !== -1;
    });
    return {
      type: "object",
      required: required,
      properties: properties,
      additionalProperties: true
    };
  }

  function schemaDepth(schema) {
    if (!schema || typeof schema !== "object") {
      return 0;
    }
    if (schema.type === "object") {
      return 1 + Math.max.apply(null, Object.keys(schema.properties || {}).map(function (key) {
        return schemaDepth(schema.properties[key]);
      }).concat([0]));
    }
    if (schema.type === "array") {
      return 1 + schemaDepth(schema.items);
    }
    return 1;
  }

  function countProperties(schema) {
    if (!schema || typeof schema !== "object") {
      return 0;
    }
    if (schema.type === "object") {
      return Object.keys(schema.properties || {}).reduce(function (total, key) {
        return total + 1 + countProperties(schema.properties[key]);
      }, 0);
    }
    if (schema.type === "array") {
      return countProperties(schema.items);
    }
    return 0;
  }

  function validateValue(value, schema, path, errors) {
    if (!schema || !schema.type) {
      return;
    }
    var actual = typeOfValue(value);
    var expected = Array.isArray(schema.type) ? schema.type : [schema.type];
    var integerAllowedAsNumber = actual === "integer" && expected.indexOf("number") !== -1;
    if (expected.indexOf(actual) === -1 && !integerAllowedAsNumber) {
      errors.push(path + " expected " + expected.join(" or ") + " but received " + actual + ".");
      return;
    }
    if (actual === "object") {
      (schema.required || []).forEach(function (key) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
          errors.push(path + "." + key + " is required.");
        }
      });
      Object.keys(schema.properties || {}).forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          validateValue(value[key], schema.properties[key], path + "." + key, errors);
        }
      });
    }
    if (actual === "array") {
      value.forEach(function (item, index) {
        validateValue(item, schema.items, path + "[" + index + "]", errors);
      });
    }
  }

  function renderMetrics(schema, text) {
    window.DevKit.renderMetrics(metrics, [
      { label: "Schema size", value: window.DevKit.formatBytes(text) },
      { label: "Properties", value: String(countProperties(schema)) },
      { label: "Depth", value: String(schemaDepth(schema)) },
      { label: "Required", value: String((schema.required || []).length) }
    ]);
  }

  function generateSchema() {
    var parsed = parseInput();
    var schema = inferSchema(parsed);
    schema.$schema = "https://json-schema.org/draft/2020-12/schema";
    schema.title = "GeneratedSchema";
    var text = JSON.stringify(schema, null, 2);
    lastSchemaObject = schema;
    lastSchema = text;
    output.textContent = text;
    renderMetrics(schema, text);
    window.DevKit.setStatus(statusMessage, "ok", "Schema generated");
  }

  function validateSample() {
    if (!lastSchemaObject) {
      generateSchema();
    }
    var parsed = parseInput();
    var errors = [];
    validateValue(parsed, lastSchemaObject, "$", errors);
    if (errors.length) {
      window.DevKit.setStatus(statusMessage, "error", errors.slice(0, 3).join(" "));
      return;
    }
    window.DevKit.setStatus(statusMessage, "ok", "Sample matches generated schema");
  }

  function handleAction(action) {
    if (action === "generate") {
      try {
        generateSchema();
      } catch (error) {
        window.DevKit.setStatus(statusMessage, "error", error.message);
      }
    }
    if (action === "validate") {
      try {
        validateSample();
      } catch (error) {
        window.DevKit.setStatus(statusMessage, "error", error.message);
      }
    }
    if (action === "sample") {
      input.value = JSON.stringify(sampleJson, null, 2);
      updateInputMeta();
      generateSchema();
    }
    if (action === "clear") {
      input.value = "";
      output.textContent = "";
      lastSchema = "";
      lastSchemaObject = null;
      updateInputMeta();
      window.DevKit.setStatus(statusMessage, "", "Ready");
      window.DevKit.renderMetrics(metrics, []);
    }
    if (action === "copy") {
      window.DevKit.copyText(lastSchema).then(function () {
        window.DevKit.setStatus(statusMessage, "ok", "Copied");
      });
    }
    if (action === "download") {
      window.DevKit.downloadText("schema.json", lastSchema || output.textContent, "application/schema+json;charset=utf-8");
    }
  }

  document.addEventListener("click", function (event) {
    var actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleAction(actionButton.dataset.action);
    }
  });

  input.addEventListener("input", window.DevKit.debounce(updateInputMeta, 120));
  input.value = JSON.stringify(sampleJson, null, 2);
  updateInputMeta();
  generateSchema();
})();
