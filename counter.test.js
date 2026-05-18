const fs = require("fs");
  const vm = require("vm");

  function readStudentJs() {
    const here = fs.readdirSync(".");
    if (here.includes("script.js")) return fs.readFileSync("script.js", "utf8");
    const js = here.find(
      (f) => f.endsWith(".js") && f !== "runner.js" && !f.endsWith(".test.js")
    );
    if (js) return fs.readFileSync(js, "utf8");
    const html = here.find((f) => f.endsWith(".html"));
    if (html) {
      const src = fs.readFileSync(html, "utf8");
      const blocks = [...src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
        .map((m) => m[1]).filter((s) => s.trim());
      if (blocks.length) return blocks.join("\n");
    }
    throw new Error("No JavaScript found. Files in sandbox: " + here.join(", "));
  }

  function loadCounter() {
    const code = readStudentJs();
    // Probe runs in the SAME top-level scope as `let count`, so it can read
    // the private variable without the student having written getCount().
    const probe = "\n;try{ this.__count = function(){ return count; }; }catch(e){}";
    const display = { textContent: "" };
    const noopEl = { addEventListener() {}, textContent: "" };
    const sandbox = {
      console,
      document: { getElementById: (id) => (id === "count" ? display : noopEl) },
    };
    vm.createContext(sandbox);
    vm.runInContext(code + probe, sandbox, { filename: "student.js" });
    if (typeof sandbox.__count !== "function") {
      throw new Error("Could not read `count`. Declare `let count = 0;` at the top of script.js.");
    }
    return { fn: sandbox, display };
  }

  test("counter_increment", () => {
    const { fn } = loadCounter();
    const before = fn.__count();
    fn.increment();
    if (fn.__count() !== before + 1)
      throw new Error(`increment() must raise count by 1 (count went ${before} → ${fn.__count()})`);
  });

  test("counter_decrement", () => {
    const { fn } = loadCounter();
    const before = fn.__count();
    fn.decrement();
    if (fn.__count() !== before - 1)
      throw new Error(`decrement() must lower count by 1 (count went ${before} → ${fn.__count()})`);
  });

  test("counter_get_count", () => {
    const { fn } = loadCounter();
    const got = fn.getCount();
    if (typeof got !== "number")
      throw new Error(`getCount() must return a number (returned ${typeof got})`);
    if (got !== fn.__count())
      throw new Error(`getCount() must return the current count (count=${fn.__count()}, returned ${got})`);
    fn.increment();
    if (fn.getCount() !== fn.__count())
      throw new Error(`getCount() must reflect updates (count=${fn.__count()}, returned ${fn.getCount()})`);
  });

  test("counter_display", () => {
    const { fn, display } = loadCounter();
    fn.increment();
    fn.increment();
    fn.displayCount();
    if (String(display.textContent) !== String(fn.__count()))
      throw new Error(
        `displayCount() must write the count into #count (count=${fn.__count()}, ` +
        `#count shows "${display.textContent}")`
      );
  });