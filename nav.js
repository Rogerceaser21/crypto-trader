/* Site-wide navigation menu for the Annie static site.
   Self-contained vanilla JS. No external resources.
   Loaded via: <script defer id="site-nav" data-root="{prefix}" src="{prefix}nav.js"></script>
   where {prefix} is "" for root pages or "../" for pages one folder deep.
   It dynamically loads nav-data.js (window.__NAV_DATA) from the web root and
   renders a fixed hamburger button + slide-in left drawer.
   If nav-data.js fails to load, it logs to console and renders nothing else. */
(function () {
  "use strict";
  if (window.__cnNavInit) return;
  window.__cnNavInit = true;

  var scriptEl = document.getElementById("site-nav") || document.currentScript;
  var ROOT = (scriptEl && scriptEl.getAttribute("data-root")) || "";

  // --- dynamically load nav-data.js from the web root -----------------------
  var dataScript = document.createElement("script");
  dataScript.src = encodeURI(ROOT + "nav-data.js");
  dataScript.onload = function () {
    try {
      build();
    } catch (e) {
      console.error("[site-nav] failed to build navigation:", e);
    }
  };
  dataScript.onerror = function () {
    console.error("[site-nav] could not load nav-data.js from " + dataScript.src);
  };
  (document.head || document.documentElement).appendChild(dataScript);

  // --- theme detection ------------------------------------------------------
  function isDark() {
    var de = document.documentElement;
    var dt = de && de.getAttribute("data-theme");
    if (dt === "dark") return true;
    if (dt === "light") return false;
    if (document.body && document.body.classList && document.body.classList.contains("dark")) return true;
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  // --- CSS ------------------------------------------------------------------
  function injectCSS() {
    if (document.getElementById("cn-nav-style")) return;
    var css =
      ".cn-root{--cn-bg:#ffffff;--cn-fg:#1b1d22;--cn-muted:#6b7280;--cn-border:rgba(0,0,0,.12);" +
      "--cn-accent:#2563eb;--cn-hover:rgba(0,0,0,.055);--cn-btn-bg:rgba(255,255,255,.72);" +
      "--cn-btn-border:rgba(0,0,0,.14);--cn-overlay:rgba(0,0,0,.34);--cn-cur-bg:rgba(37,99,235,.14);" +
      "--cn-cur-fg:#1d4ed8;--cn-shadow:rgba(0,0,0,.24);" +
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}" +
      ".cn-root.cn-dark{--cn-bg:#1b1e25;--cn-fg:#e7e9ee;--cn-muted:#9aa1ac;--cn-border:rgba(255,255,255,.14);" +
      "--cn-accent:#7aa2ff;--cn-hover:rgba(255,255,255,.07);--cn-btn-bg:rgba(28,31,38,.62);" +
      "--cn-btn-border:rgba(255,255,255,.18);--cn-overlay:rgba(0,0,0,.55);--cn-cur-bg:rgba(122,162,255,.20);" +
      "--cn-cur-fg:#bcd0ff;--cn-shadow:rgba(0,0,0,.5);}" +

      ".cn-btn{position:fixed;top:10px;left:10px;width:40px;height:40px;z-index:2147483000;" +
      "display:flex;align-items:center;justify-content:center;padding:0;margin:0;cursor:pointer;" +
      "border-radius:10px;border:1px solid var(--cn-btn-border);background:var(--cn-btn-bg);" +
      "color:var(--cn-fg);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);" +
      "box-shadow:0 2px 8px var(--cn-shadow);line-height:1;transition:background .15s,box-shadow .15s;}" +
      ".cn-btn:hover{background:var(--cn-btn-bg);box-shadow:0 3px 12px var(--cn-shadow);}" +
      ".cn-btn:focus-visible{outline:2px solid var(--cn-accent);outline-offset:2px;}" +
      ".cn-btn svg{width:20px;height:20px;display:block;pointer-events:none;}" +

      ".cn-overlay{position:fixed;inset:0;z-index:2147482990;background:var(--cn-overlay);" +
      "opacity:0;visibility:hidden;transition:opacity .22s ease,visibility .22s ease;}" +
      ".cn-root.cn-open .cn-overlay{opacity:1;visibility:visible;}" +

      ".cn-drawer{position:fixed;top:0;left:0;height:100%;width:300px;max-width:86vw;z-index:2147482995;" +
      "background:var(--cn-bg);color:var(--cn-fg);border-right:1px solid var(--cn-border);" +
      "box-shadow:2px 0 18px var(--cn-shadow);display:flex;flex-direction:column;" +
      "transform:translateX(-100%);transition:transform .22s ease;" +
      "font-size:14px;-webkit-overflow-scrolling:touch;box-sizing:border-box;}" +
      ".cn-root.cn-open .cn-drawer{transform:translateX(0);}" +
      ".cn-drawer *{box-sizing:border-box;}" +

      ".cn-head{padding:14px 14px 12px 58px;border-bottom:1px solid var(--cn-border);flex:0 0 auto;}" +
      ".cn-head a{color:var(--cn-fg);text-decoration:none;font-weight:700;font-size:15px;display:inline-block;}" +
      ".cn-head a:hover{color:var(--cn-accent);}" +

      ".cn-filterwrap{padding:10px 12px;border-bottom:1px solid var(--cn-border);flex:0 0 auto;}" +
      ".cn-filter{width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--cn-border);" +
      "background:var(--cn-bg);color:var(--cn-fg);font-size:13px;outline:none;}" +
      ".cn-filter:focus{border-color:var(--cn-accent);}" +
      ".cn-filter::placeholder{color:var(--cn-muted);}" +

      ".cn-scroll{flex:1 1 auto;overflow-y:auto;padding:6px 0 24px;}" +
      ".cn-group{border-bottom:1px solid var(--cn-border);}" +
      ".cn-group-h{width:100%;display:flex;align-items:center;gap:8px;padding:10px 12px;margin:0;" +
      "background:transparent;border:0;cursor:pointer;color:var(--cn-muted);font:inherit;" +
      "font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;text-align:left;}" +
      ".cn-group-h:hover{color:var(--cn-fg);background:var(--cn-hover);}" +
      ".cn-group-h:focus-visible{outline:2px solid var(--cn-accent);outline-offset:-2px;}" +
      ".cn-chev{display:inline-block;width:9px;flex:0 0 auto;transition:transform .15s ease;color:var(--cn-muted);}" +
      ".cn-group[data-expanded='true'] .cn-chev{transform:rotate(90deg);}" +
      ".cn-gname{flex:1 1 auto;}" +
      ".cn-list{display:block;}" +
      ".cn-group[data-expanded='false'] .cn-list{display:none;}" +
      ".cn-item{display:block;padding:8px 14px 8px 29px;color:var(--cn-fg);text-decoration:none;" +
      "line-height:1.35;border-left:2px solid transparent;}" +
      ".cn-item:hover{background:var(--cn-hover);}" +
      ".cn-item:focus-visible{outline:2px solid var(--cn-accent);outline-offset:-2px;}" +
      ".cn-item.cn-current{background:var(--cn-cur-bg);color:var(--cn-cur-fg);font-weight:600;" +
      "border-left-color:var(--cn-accent);}" +
      ".cn-empty{padding:14px;color:var(--cn-muted);font-size:13px;display:none;}" +
      ".cn-empty.cn-show{display:block;}";
    var style = document.createElement("style");
    style.id = "cn-nav-style";
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // --- build ----------------------------------------------------------------
  function build() {
    var data = window.__NAV_DATA;
    if (!data || !data.groups || !data.groups.length) {
      console.error("[site-nav] nav-data.js loaded but window.__NAV_DATA is empty/invalid");
      return;
    }
    if (!document.body) {
      console.error("[site-nav] no document.body to attach to");
      return;
    }
    injectCSS();

    var rootEl = document.createElement("div");
    rootEl.className = "cn-root";

    // hamburger button
    var btn = document.createElement("button");
    btn.className = "cn-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Open navigation menu");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"></line>' +
      '<line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>';

    // overlay
    var overlay = document.createElement("div");
    overlay.className = "cn-overlay";

    // drawer
    var drawer = document.createElement("aside");
    drawer.className = "cn-drawer";
    drawer.setAttribute("aria-label", "Site navigation");

    var head = document.createElement("div");
    head.className = "cn-head";
    var homeLink = document.createElement("a");
    homeLink.href = encodeURI(ROOT + "index.html");
    homeLink.textContent = "☰ Claude Trading";
    head.appendChild(homeLink);

    var filterWrap = document.createElement("div");
    filterWrap.className = "cn-filterwrap";
    var filter = document.createElement("input");
    filter.className = "cn-filter";
    filter.type = "text";
    filter.setAttribute("placeholder", "Filter pages…");
    filter.setAttribute("aria-label", "Filter pages");
    filterWrap.appendChild(filter);

    var scroll = document.createElement("div");
    scroll.className = "cn-scroll";

    var emptyMsg = document.createElement("div");
    emptyMsg.className = "cn-empty";
    emptyMsg.textContent = "No matching pages.";
    scroll.appendChild(emptyMsg);

    // current-page detection: longest item path that the pathname ends with
    var here = "";
    try {
      here = decodeURIComponent(location.pathname);
    } catch (e) {
      here = location.pathname;
    }
    var bestLen = -1;
    var bestItem = null;
    var allItems = [];
    data.groups.forEach(function (g) {
      (g.items || []).forEach(function (it) {
        if (!it || !it.p) return;
        if (here === it.p || here.slice(-(it.p.length + 1)) === "/" + it.p) {
          if (it.p.length > bestLen) {
            bestLen = it.p.length;
            bestItem = it;
          }
        }
      });
    });

    var groups = [];
    data.groups.forEach(function (g) {
      if (!g || !g.items || !g.items.length) return;
      var groupEl = document.createElement("div");
      groupEl.className = "cn-group";

      var hbtn = document.createElement("button");
      hbtn.className = "cn-group-h";
      hbtn.type = "button";
      var chev = document.createElement("span");
      chev.className = "cn-chev";
      chev.textContent = "▸"; // ▸
      var gname = document.createElement("span");
      gname.className = "cn-gname";
      gname.textContent = g.g || "";
      hbtn.appendChild(chev);
      hbtn.appendChild(gname);

      var listEl = document.createElement("div");
      listEl.className = "cn-list";

      var items = [];
      var hasCurrent = false;
      g.items.forEach(function (it) {
        if (!it || !it.p) return;
        var a = document.createElement("a");
        a.className = "cn-item";
        a.href = encodeURI(ROOT + it.p);
        a.textContent = it.t || it.p;
        if (it === bestItem) {
          a.classList.add("cn-current");
          a.setAttribute("aria-current", "page");
          hasCurrent = true;
        }
        listEl.appendChild(a);
        items.push({ el: a, t: (it.t || it.p).toLowerCase(), p: it.p.toLowerCase() });
      });

      groupEl.appendChild(hbtn);
      groupEl.appendChild(listEl);
      scroll.appendChild(groupEl);

      var gobj = {
        el: groupEl,
        header: hbtn,
        expanded: hasCurrent, // default expanded only if it holds the current page
        items: items
      };
      applyExpanded(gobj);
      hbtn.addEventListener("click", function () {
        gobj.expanded = !gobj.expanded;
        if (!filter.value) applyExpanded(gobj);
        else applyFilter(); // keep filtered view consistent
      });
      groups.push(gobj);
    });

    function applyExpanded(gobj) {
      gobj.el.setAttribute("data-expanded", gobj.expanded ? "true" : "false");
      gobj.header.setAttribute("aria-expanded", gobj.expanded ? "true" : "false");
    }

    function applyFilter() {
      var q = filter.value.trim().toLowerCase();
      if (!q) {
        emptyMsg.classList.remove("cn-show");
        groups.forEach(function (gobj) {
          gobj.el.style.display = "";
          gobj.items.forEach(function (it) {
            it.el.style.display = "";
          });
          applyExpanded(gobj);
        });
        return;
      }
      var anyGroup = false;
      groups.forEach(function (gobj) {
        var anyMatch = false;
        gobj.items.forEach(function (it) {
          var m = it.t.indexOf(q) !== -1 || it.p.indexOf(q) !== -1;
          it.el.style.display = m ? "" : "none";
          if (m) anyMatch = true;
        });
        gobj.el.style.display = anyMatch ? "" : "none";
        if (anyMatch) {
          gobj.el.setAttribute("data-expanded", "true");
          gobj.header.setAttribute("aria-expanded", "true");
          anyGroup = true;
        }
      });
      emptyMsg.classList.toggle("cn-show", !anyGroup);
    }

    filter.addEventListener("input", applyFilter);

    drawer.appendChild(head);
    drawer.appendChild(filterWrap);
    drawer.appendChild(scroll);

    rootEl.appendChild(btn);
    rootEl.appendChild(overlay);
    rootEl.appendChild(drawer);
    document.body.appendChild(rootEl);

    // open / close
    function openNav() {
      rootEl.classList.toggle("cn-dark", isDark()); // re-check theme on open
      rootEl.classList.add("cn-open");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close navigation menu");
    }
    function closeNav() {
      rootEl.classList.remove("cn-open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open navigation menu");
    }
    function toggleNav() {
      if (rootEl.classList.contains("cn-open")) closeNav();
      else openNav();
    }

    btn.addEventListener("click", toggleNav);
    overlay.addEventListener("click", closeNav);
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.key === "Esc") && rootEl.classList.contains("cn-open")) {
        closeNav();
      }
    });

    rootEl.classList.toggle("cn-dark", isDark()); // initial theme
  }
})();
