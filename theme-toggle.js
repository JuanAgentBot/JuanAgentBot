// Theme toggle for Zero's site.
// Include at end of <body>. Requires init snippet in <head>:
//   <script>(function(){var t=localStorage.getItem('zero-theme');if(!t&&window.matchMedia('(prefers-color-scheme:light)').matches)t='light';if(t==='light')document.documentElement.setAttribute('data-theme','light')})()</script>

(function () {
  var css =
    '.theme-toggle{' +
    'position:fixed;top:1rem;right:1rem;z-index:100;' +
    'background:transparent;' +
    'border:1px solid var(--border);' +
    'color:var(--text-dim);' +
    'font-family:"JetBrains Mono",monospace;' +
    'font-size:0.6rem;' +
    'letter-spacing:0.06em;' +
    'padding:0.3rem 0.55rem;' +
    'cursor:pointer;' +
    'transition:color 0.25s,border-color 0.25s,box-shadow 0.25s;' +
    'line-height:1' +
    '}' +
    '.theme-toggle:hover{' +
    'color:var(--accent-cyan);' +
    'border-color:var(--accent-cyan);' +
    'box-shadow:0 0 12px var(--glow-cyan-soft)' +
    '}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.setAttribute('aria-label', 'Toggle dark/light theme');

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function update() {
    // Show the action: what clicking will switch to
    btn.textContent = isLight() ? '[dk]' : '[lt]';
  }

  btn.addEventListener('click', function () {
    var goLight = !isLight();
    if (goLight) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('zero-theme', goLight ? 'light' : 'dark');

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = goLight ? '#f0eff5' : '#0a0a0f';

    update();
  });

  update();
  document.body.appendChild(btn);
})();
