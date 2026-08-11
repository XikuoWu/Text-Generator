(function () {
  'use strict';

  // Build a map for the contiguous "Mathematical Alphanumeric Symbols" blocks,
  // and for other blocks that are laid out the same way (26 letters + optional
  // digits in a row). A few styles have historical gaps — already-encoded
  // letters reused from the Letterlike Symbols block — pass those as
  // `exceptions`. Passing the same value for upperStart/lowerStart reuses one
  // glyph set for both cases (used by styles that only define uppercase, like
  // Squared and Circled Filled).
  function buildMap(upperStart, lowerStart, digitStart, exceptions) {
    exceptions = exceptions || {};
    var map = {};
    for (var i = 0; i < 26; i++) {
      var upper = String.fromCharCode(65 + i);
      var lower = String.fromCharCode(97 + i);
      map[upper] = exceptions[upper] || (upperStart !== null ? String.fromCodePoint(upperStart + i) : upper);
      map[lower] = exceptions[lower] || (lowerStart !== null ? String.fromCodePoint(lowerStart + i) : lower);
    }
    for (var d = 0; d <= 9; d++) {
      var ds = String(d);
      if (exceptions[ds]) {
        map[ds] = exceptions[ds];
      } else if (digitStart !== null) {
        map[ds] = String.fromCodePoint(digitStart + d);
      }
    }
    return map;
  }

  function applyMap(str, map) {
    return Array.from(str).map(function (ch) {
      return map[ch] !== undefined ? map[ch] : ch;
    }).join('');
  }

  function applyCaseInsensitiveMap(str, map) {
    return Array.from(str).map(function (ch) {
      var lower = ch.toLowerCase();
      return map[lower] !== undefined ? map[lower] : ch;
    }).join('');
  }

  // ---- Mathematical Alphanumeric Symbols maps (U+1D400 block) ----
  var boldMap = buildMap(0x1D400, 0x1D41A, 0x1D7CE);
  var italicMap = buildMap(0x1D434, 0x1D44E, null, { h: '\u210E' });
  var boldItalicMap = buildMap(0x1D468, 0x1D482, null);
  var scriptMap = buildMap(0x1D49C, 0x1D4B6, null, {
    B: '\u212C', E: '\u2130', F: '\u2131', H: '\u210B', I: '\u2110',
    L: '\u2112', M: '\u2133', R: '\u211B',
    e: '\u212F', g: '\u210A', o: '\u2134'
  });
  var boldScriptMap = buildMap(0x1D4D0, 0x1D4EA, null);
  // "Cursive" is the same script alphabet as Handwriting, but for the
  // handful of lowercase/uppercase letters Unicode never assigned a script
  // glyph to, it falls back to the mathematical italic form instead of the
  // Letterlike Symbols block. That's the substitution most fancy-text sites
  // use, since the italic fallback blends with the surrounding slant.
  var cursiveMap = buildMap(0x1D49C, 0x1D4B6, null, {
    B: String.fromCodePoint(0x1D435), E: String.fromCodePoint(0x1D438), F: String.fromCodePoint(0x1D439),
    H: String.fromCodePoint(0x1D43B), I: String.fromCodePoint(0x1D43C), L: String.fromCodePoint(0x1D43F),
    M: String.fromCodePoint(0x1D440), R: String.fromCodePoint(0x1D445),
    e: String.fromCodePoint(0x1D452), g: String.fromCodePoint(0x1D454), o: String.fromCodePoint(0x1D45C)
  });
  var frakturMap = buildMap(0x1D504, 0x1D51E, null, {
    C: '\u212D', H: '\u210C', I: '\u2111', R: '\u211C', Z: '\u2128'
  });
  var boldFrakturMap = buildMap(0x1D56C, 0x1D586, null);
  var doubleStruckMap = buildMap(0x1D538, 0x1D552, 0x1D7D8, {
    C: '\u2102', H: '\u210D', N: '\u2115', P: '\u2119',
    Q: '\u211A', R: '\u211D', Z: '\u2124'
  });
  var sansMap = buildMap(0x1D5A0, 0x1D5BA, 0x1D7E2);
  var sansBoldMap = buildMap(0x1D5D4, 0x1D5EE, 0x1D7EC);
  var sansItalicMap = buildMap(0x1D608, 0x1D622, null);
  var sansBoldItalicMap = buildMap(0x1D63C, 0x1D656, null);
  var monospaceMap = buildMap(0x1D670, 0x1D68A, 0x1D7F6);
  var fullwidthMap = buildMap(0xFF21, 0xFF41, 0xFF10);

  // Regional Indicator Symbols only exist for A-Z (both cases share one
  // glyph, same trick as the filled-circled/squared maps below). Digits and
  // punctuation have no equivalent, so they pass through unchanged.
  var flagMap = buildMap(0x1F1E6, 0x1F1E6, null);

  // ---- Enclosed Alphanumerics (circled / squared / parenthesized) ----
  var circledMap = buildMap(0x24B6, 0x24D0, null, {
    '0': '\u24EA', '1': '\u2460', '2': '\u2461', '3': '\u2462', '4': '\u2463',
    '5': '\u2464', '6': '\u2465', '7': '\u2466', '8': '\u2467', '9': '\u2468'
  });
  // Filled circled / squared letters only exist for uppercase — reuse the
  // same glyph for lowercase input by giving lowerStart the same value.
  var circledFilledMap = buildMap(0x1F150, 0x1F150, null, {
    '1': '\u2776', '2': '\u2777', '3': '\u2778', '4': '\u2779', '5': '\u277A',
    '6': '\u277B', '7': '\u277C', '8': '\u277D', '9': '\u277E'
  });
  var squaredMap = buildMap(0x1F130, 0x1F130, null);
  var squaredFilledMap = buildMap(0x1F170, 0x1F170, null);
  // Parenthesized letters only exist for lowercase — same trick in reverse.
  var parenthesizedMap = buildMap(0x249C, 0x249C, null, {
    '1': '\u2474', '2': '\u2475', '3': '\u2476', '4': '\u2477', '5': '\u2478',
    '6': '\u2479', '7': '\u247A', '8': '\u247B', '9': '\u247C'
  });

  // ---- Non-contiguous / custom maps ----
  var smallCapsSource = {
    a: '\u1D00', b: '\u0299', c: '\u1D04', d: '\u1D05', e: '\u1D07', f: 'ꜰ',
    g: '\u0262', h: '\u029C', i: '\u026A', j: '\u1D0A', k: '\u1D0B', l: '\u029F',
    m: '\u1D0D', n: '\u0274', o: '\u1D0F', p: '\u1D18', q: 'q', r: '\u0280',
    s: 's', t: '\u1D1B', u: '\u1D1C', v: '\u1D20', w: '\u1D21', x: 'x',
    y: '\u028F', z: '\u1D22'
  };

  var upsideDownSource = {
    a: '\u0250', b: 'q', c: '\u0254', d: 'p', e: '\u01DD', f: '\u025F',
    g: '\u0183', h: '\u0265', i: '\u0131', j: '\u027E', k: '\u029E', l: 'l',
    m: '\u026F', n: 'u', o: 'o', p: 'd', q: 'b', r: '\u0279', s: 's',
    t: '\u0287', u: 'n', v: '\u028C', w: '\u028D', x: 'x', y: '\u028E', z: 'z',
    '0': '0', '1': '\u0197', '2': '\u1041', '3': '\u01DD', '4': '\u3123',
    '5': '\u03DB', '6': '9', '7': '\u3125', '8': '8', '9': '6',
    '.': '\u02D9', ',': "'", "'": ',', '"': ',,', '?': '\u00BF', '!': '\u00A1',
    '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
    '<': '>', '>': '<', '&': '\u214B', '_': '\u203E'
  };

  var superscriptMap = {
    a: '\u1D43', b: '\u1D47', c: '\u1D9C', d: '\u1D48', e: '\u1D49', f: '\u1DA0',
    g: '\u1D4D', h: '\u02B0', i: '\u2071', j: '\u02B2', k: '\u1D4F', l: '\u02E1',
    m: '\u1D50', n: '\u207F', o: '\u1D52', p: '\u1D56', r: '\u02B3', s: '\u02E2',
    t: '\u1D57', u: '\u1D58', v: '\u1D5B', w: '\u02B7', x: '\u02E3', y: '\u02B8', z: '\u1DBB',
    A: '\u1D2C', B: '\u1D2E', D: '\u1D30', E: '\u1D31', G: '\u1D33', H: '\u1D34',
    I: '\u1D35', J: '\u1D36', K: '\u1D37', L: '\u1D38', M: '\u1D39', N: '\u1D3A',
    O: '\u1D3C', P: '\u1D3E', R: '\u1D3F', T: '\u1D40', U: '\u1D41', V: '\u2C7D', W: '\u1D42',
    '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3', '4': '\u2074',
    '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079',
    '+': '\u207A', '-': '\u207B', '=': '\u207C', '(': '\u207D', ')': '\u207E'
  };

  var subscriptMap = {
    a: '\u2090', e: '\u2091', h: '\u2095', i: '\u1D62', j: '\u2C7C', k: '\u2096',
    l: '\u2097', m: '\u2098', n: '\u2099', o: '\u2092', p: '\u209A', r: '\u1D63',
    s: '\u209B', t: '\u209C', u: '\u1D64', v: '\u1D65', x: '\u2093',
    '0': '\u2080', '1': '\u2081', '2': '\u2082', '3': '\u2083', '4': '\u2084',
    '5': '\u2085', '6': '\u2086', '7': '\u2087', '8': '\u2088', '9': '\u2089',
    '+': '\u208A', '-': '\u208B', '=': '\u208C', '(': '\u208D', ')': '\u208E'
  };

  // "Currency" is a novelty cipher, not a real Unicode alphabet block — each
  // letter is swapped for a currency sign or letter-with-stroke that looks
  // roughly similar. One glyph covers both cases, same as Small caps.
  // Digits have no currency equivalent, so they pass through unchanged.
  var currencySource = {
    a: '\u20B3', b: '\u0243', c: '\u20B5', d: '\u0110', e: '\u0246', f: '\u20A3',
    g: '\u20B2', h: '\u0126', i: '\u0197', j: '\u0248', k: '\u20AD', l: '\u20A4',
    m: '\u20A5', n: '\u20A6', o: '\u00D8', p: '\u20B1', q: '\u024A', r: '\u211E',
    s: '\u0024', t: '\u20AE', u: '\u0244', v: '\u2205', w: '\u20A9', x: '\u2717',
    y: '\u00A5', z: '\u01B5'
  };

  // Braille Patterns block (U+2800), standard English Grade-1 letter cells.
  // A real, complete Unicode alphabet — not a lookalike cipher.
  var brailleSource = {
    a: '\u2801', b: '\u2803', c: '\u2809', d: '\u2819', e: '\u2811', f: '\u280B',
    g: '\u281B', h: '\u2813', i: '\u280A', j: '\u281A', k: '\u2805', l: '\u2807',
    m: '\u280D', n: '\u281D', o: '\u2815', p: '\u280F', q: '\u281F', r: '\u2817',
    s: '\u280E', t: '\u281E', u: '\u2825', v: '\u2827', w: '\u283A', x: '\u282D',
    y: '\u283D', z: '\u2835'
  };

  // International Morse code. Letters/digits become dot-dash groups
  // separated by spaces; a space in the input becomes a "/" word break.
  var morseSource = {
    a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....',
    i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.',
    q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-',
    y: '-.--', z: '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
  };

  // Combining marks used for "cursed" (zalgo) text — a mix of above, below,
  // and mid-strike combining diacritics stacked in random combinations.
  var zalgoUp = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a', '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350', '\u0300', '\u0301', '\u030b', '\u030f', '\u0312'];
  var zalgoDown = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0324', '\u0325', '\u0326', '\u0329', '\u032a', '\u032b', '\u032c', '\u032d', '\u032e', '\u032f', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0323'];

  function toStrikethrough(str) {
    return Array.from(str).map(function (ch) { return ch + '\u0336'; }).join('');
  }

  function toUnderline(str) {
    return Array.from(str).map(function (ch) { return ch + '\u0332'; }).join('');
  }

  function toUpsideDown(str) {
    var chars = Array.from(str).map(function (ch) {
      var lower = ch.toLowerCase();
      return upsideDownSource[lower] !== undefined ? upsideDownSource[lower] : ch;
    });
    return chars.reverse().join('');
  }

  function toReversed(str) {
    return Array.from(str).reverse().join('');
  }

  function toWideSpaced(str) {
    return Array.from(str).join(' ');
  }

  // These two don't substitute individual letters — they wrap the whole
  // string, so (unlike every other style here) they work on any script,
  // not just Latin letters and digits.
  function toBracketed(str) {
    return '\u300E' + str + '\u300F';
  }

  function toSparkle(str) {
    return '\u2726 ' + str + ' \u2726';
  }

  function toHearts(str) {
    return '\u2665 ' + str + ' \u2665';
  }

  function toMusic(str) {
    return '\u266A ' + str + ' \u266A';
  }

  function toMorse(str) {
    return Array.from(str).map(function (ch) {
      if (ch === ' ') return '/';
      var lower = ch.toLowerCase();
      return morseSource[lower] !== undefined ? morseSource[lower] : ch;
    }).join(' ');
  }

  // Two Regional Indicator Symbols placed next to each other render as a
  // country flag (e.g. "U" + "S" -> 🇺🇸), which would scramble any word
  // longer than one letter. A zero-width space between each character keeps
  // every letter showing as its own boxed letter instead.
  function toFlags(str) {
    return Array.from(str).map(function (ch) {
      var lower = ch.toLowerCase();
      return flagMap[lower] !== undefined ? flagMap[lower] : ch;
    }).join('\u200B');
  }

  function toZalgo(str) {
    return Array.from(str).map(function (ch) {
      if (ch === ' ') return ch;
      var out = ch;
      var upCount = 1 + Math.floor(Math.random() * 3);
      var downCount = 1 + Math.floor(Math.random() * 3);
      for (var i = 0; i < upCount; i++) out += zalgoUp[Math.floor(Math.random() * zalgoUp.length)];
      for (var i = 0; i < downCount; i++) out += zalgoDown[Math.floor(Math.random() * zalgoDown.length)];
      return out;
    }).join('');
  }

  var STYLES = [
    { name: 'Bold', convert: function (s) { return applyMap(s, boldMap); } },
    { name: 'Italic', convert: function (s) { return applyMap(s, italicMap); } },
    { name: 'Bold italic', convert: function (s) { return applyMap(s, boldItalicMap); } },
    { name: 'Handwriting', convert: function (s) { return applyMap(s, scriptMap); } },
    { name: 'Bold handwriting', convert: function (s) { return applyMap(s, boldScriptMap); } },
    { name: 'Cursive', convert: function (s) { return applyMap(s, cursiveMap); } },
    { name: 'Fraktur', convert: function (s) { return applyMap(s, frakturMap); } },
    { name: 'Bold fraktur', convert: function (s) { return applyMap(s, boldFrakturMap); } },
    { name: 'Double-struck', convert: function (s) { return applyMap(s, doubleStruckMap); } },
    { name: 'Sans-serif', convert: function (s) { return applyMap(s, sansMap); } },
    { name: 'Sans bold', convert: function (s) { return applyMap(s, sansBoldMap); } },
    { name: 'Sans italic', convert: function (s) { return applyMap(s, sansItalicMap); } },
    { name: 'Sans bold italic', convert: function (s) { return applyMap(s, sansBoldItalicMap); } },
    { name: 'Monospace', convert: function (s) { return applyMap(s, monospaceMap); } },
    { name: 'Fullwidth', convert: function (s) { return applyMap(s, fullwidthMap); } },
    { name: 'Circled', convert: function (s) { return applyMap(s, circledMap); } },
    { name: 'Circled filled', convert: function (s) { return applyMap(s, circledFilledMap); } },
    { name: 'Squared', convert: function (s) { return applyMap(s, squaredMap); } },
    { name: 'Squared filled', convert: function (s) { return applyMap(s, squaredFilledMap); } },
    { name: 'Parenthesized', convert: function (s) { return applyMap(s, parenthesizedMap); } },
    { name: 'Flag letters', convert: toFlags },
    { name: 'Currency', convert: function (s) { return applyCaseInsensitiveMap(s, currencySource); } },
    { name: 'Braille', convert: function (s) { return applyCaseInsensitiveMap(s, brailleSource); } },
    { name: 'Morse code', convert: toMorse },
    { name: 'Small caps', convert: function (s) { return applyCaseInsensitiveMap(s, smallCapsSource); } },
    { name: 'Superscript', convert: function (s) { return applyMap(s, superscriptMap); } },
    { name: 'Subscript', convert: function (s) { return applyMap(s, subscriptMap); } },
    { name: 'Strikethrough', convert: toStrikethrough },
    { name: 'Underline', convert: toUnderline },
    { name: 'Upside down', convert: toUpsideDown },
    { name: 'Reversed', convert: toReversed },
    { name: 'Wide spaced', convert: toWideSpaced },
    { name: 'Bracketed', convert: toBracketed },
    { name: 'Sparkle', convert: toSparkle },
    { name: 'Hearts', convert: toHearts },
    { name: 'Music', convert: toMusic },
    { name: 'Cursed (zalgo)', convert: toZalgo }
  ];

  var inputEl = document.getElementById('inputText');
  var listEl = document.getElementById('specimenList');
  var charCountEl = document.getElementById('charCount');

  function render() {
    var text = inputEl.value || '';
    charCountEl.textContent = text.length + (text.length === 1 ? ' character' : ' characters');
    listEl.innerHTML = '';

    STYLES.forEach(function (style, idx) {
      var output = text.length ? style.convert(text) : '';

      var row = document.createElement('div');
      row.className = 'specimen';

      var index = document.createElement('div');
      index.className = 'specimen-index';
      index.textContent = String(idx + 1).padStart(2, '0');

      var body = document.createElement('div');
      body.className = 'specimen-body';

      var label = document.createElement('p');
      label.className = 'specimen-label';
      label.textContent = style.name;

      var out = document.createElement('p');
      out.className = 'specimen-output';
      out.textContent = output || '\u2014';

      body.appendChild(label);
      body.appendChild(out);

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.disabled = !output;
      btn.addEventListener('click', function () {
        copyText(output, btn);
      });

      row.appendChild(index);
      row.appendChild(body);
      row.appendChild(btn);
      listEl.appendChild(row);
    });
  }

  function copyText(text, btn) {
    if (!text) return;

    var onSuccess = function () {
      var original = btn.textContent;
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1200);
    };

    var fallback = function () {
      var temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.focus();
      temp.select();
      try {
        document.execCommand('copy');
        onSuccess();
      } catch (err) {
        btn.textContent = 'Copy failed';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1200);
      }
      document.body.removeChild(temp);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(fallback);
    } else {
      fallback();
    }
  }

  // No length cap now, so a large paste shouldn't trigger a full re-render
  // (many styles' worth of conversion) on every keystroke while still typing.
  var renderTimer = null;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  }

  inputEl.addEventListener('input', scheduleRender);
  render();
})();
