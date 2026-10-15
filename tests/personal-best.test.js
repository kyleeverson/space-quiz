const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class Element {
  constructor() {
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.classNames = new Set();
    this.classList = {
      add: name => this.classNames.add(name),
      remove: name => this.classNames.delete(name)
    };
    this.style = {};
  }

  get firstElementChild() {
    return this.children[0];
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  append(...elements) {
    this.children.push(...elements);
  }

  replaceChildren(...elements) {
    this.children = elements;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  focus() {}

  click() {
    this.listeners.click?.();
  }

  after() {}

  querySelector(selector) {
    return this.queries?.[selector];
  }

  querySelectorAll(selector) {
    return this.queryLists?.[selector] ?? [];
  }
}

const source = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1];

function startQuiz(storage) {
  const selectors = [
    "#question-count", "#current-question", "#score", "#personal-best",
    ".progress-track", "#progress-fill", "#category", "#question", "#answers",
    "#feedback", "#next-button", "#next-label", "#quiz-view", "#results-view"
  ];
  const elements = Object.fromEntries(selectors.map(selector => [selector, new Element()]));
  const replayButtons = [new Element(), new Element()];
  elements["#results-view"].queries = {
    ".score-result": new Element(),
  };
  elements["#results-view"].queryLists = {
    ".restart-button": replayButtons
  };
  const document = {
    querySelector: selector => elements[selector],
    createElement: () => new Element()
  };
  const context = {
    document,
    window: { localStorage: storage },
    console,
  };
  vm.runInNewContext(script, context);
  return elements;
}

function completeRun(elements, correctCount) {
  const correctAnswers = [1, 2, 0, 1, 1, 2, 2, 1, 3, 0];
  correctAnswers.forEach((answer, index) => {
    const selected = index < correctCount ? answer : (answer + 1) % 4;
    elements["#answers"].children[selected].click();
    elements["#next-button"].click();
  });
}

test("personal best persists, only increases, and quiz runs without storage", () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };

  let elements = startQuiz(storage);
  assert.equal(elements["#personal-best"].textContent, "0");
  completeRun(elements, 3);
  assert.equal(values.get("spaceQuizPersonalBest"), "3");
  assert.match(elements["#results-view"].innerHTML, /Your score/);
  assert.match(elements["#results-view"].innerHTML, /Personal best/);
  assert.match(elements["#results-view"].innerHTML, /<strong>3<\/strong>/);

  elements = startQuiz(storage);
  assert.equal(elements["#personal-best"].textContent, "3");
  completeRun(elements, 1);
  assert.equal(values.get("spaceQuizPersonalBest"), "3");
  assert.match(elements["#results-view"].innerHTML, /Your score/);
  assert.match(elements["#results-view"].innerHTML, /Personal best/);
  assert.match(elements["#results-view"].innerHTML, /<strong>1<\/strong>/);
  assert.match(elements["#results-view"].innerHTML, /<strong>3<\/strong>/);

  const unavailableStorage = {
    getItem() { throw new Error("storage unavailable"); },
    setItem() { throw new Error("storage unavailable"); }
  };
  elements = startQuiz(unavailableStorage);
  completeRun(elements, 2);
  assert.equal(elements["#personal-best"].textContent, "2");
  assert.match(elements["#results-view"].innerHTML, /<strong>2<\/strong>/);
});
