/* L'Artusi — intro: WebGL green plasma shader (1.2x slower) + rotating words.
   Faithful vanilla port of the provided GLSL shader — no three.js / React. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Rotating words ---------------- */
  var words = Array.prototype.slice.call(document.querySelectorAll(".rot-word"));
  if (words.length > 1 && !reduce) {
    var idx = 0;
    setInterval(function () {
      var prev = idx;
      idx = (idx + 1) % words.length;
      words[prev].classList.remove("is-active");
      words[prev].classList.add("is-exit");
      words[idx].classList.remove("is-exit");
      words[idx].classList.add("is-active");
      setTimeout(function () { words[prev].classList.remove("is-exit"); }, 700);
    }, 2200);
  }

  /* ---------------- WebGL plasma shader ---------------- */
  var canvas = document.getElementById("intro-shader");
  if (!canvas) return;

  function useFallback() { document.documentElement.classList.add("no-webgl"); }

  if (reduce) { useFallback(); return; }

  var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) { useFallback(); return; }

  var vsrc = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  var fsrc = [
    "precision highp float;",
    "uniform float time;",
    "uniform float intensity;",
    "uniform vec3 c1;",
    "uniform vec3 c2;",
    "uniform vec3 hi;",
    "uniform vec2 res;",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / res;",
    "  float n = sin(uv.x * 20.0 + time) * cos(uv.y * 15.0 + time * 0.8);",
    "  n += sin(uv.x * 35.0 - time * 2.0) * cos(uv.y * 25.0 + time * 1.2) * 0.5;",
    "  vec3 color = mix(c1, c2, n * 0.5 + 0.5);",
    "  color = mix(color, hi, pow(abs(n), 2.0) * intensity);",
    "  float glow = 1.0 - length(uv - 0.5) * 1.3;",
    "  glow = clamp(pow(glow, 2.0), 0.0, 1.0);",
    "  gl_FragColor = vec4(color * (0.40 + 0.60 * glow), 1.0);",
    "}"
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("shader compile error:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, vsrc);
  var fs = compile(gl.FRAGMENT_SHADER, fsrc);
  if (!vs || !fs) { useFallback(); return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { useFallback(); return; }
  gl.useProgram(prog);

  // Full-screen quad
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var pLoc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(pLoc);
  gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(prog, "time");
  var uIntensity = gl.getUniformLocation(prog, "intensity");
  var uRes = gl.getUniformLocation(prog, "res");
  // L'Artusi greens + gold highlight (keeps the site palette)
  gl.uniform3f(gl.getUniformLocation(prog, "c1"), 0.122, 0.239, 0.169); // #1f3d2b
  gl.uniform3f(gl.getUniformLocation(prog, "c2"), 0.290, 0.439, 0.345); // #4a7058
  gl.uniform3f(gl.getUniformLocation(prog, "hi"), 0.757, 0.604, 0.306); // #c19a4e

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    var h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // Only animate while the intro is on screen (saves the GPU once scrolled past)
  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }, { threshold: 0.01 }).observe(canvas);
  }

  var SPEED = 1 / 1.2; // 1.2x slower than the shader's native speed
  var start0 = null, raf = null;
  function frame(now) {
    if (start0 === null) start0 = now;
    var t = ((now - start0) / 1000) * SPEED;
    gl.uniform1f(uTime, t);
    gl.uniform1f(uIntensity, 0.45 + Math.sin(t * 2.0) * 0.12);
    resize();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (visible) { raf = requestAnimationFrame(frame); } else { raf = null; }
  }
  function start() { if (raf === null) raf = requestAnimationFrame(frame); }
  start();
})();
