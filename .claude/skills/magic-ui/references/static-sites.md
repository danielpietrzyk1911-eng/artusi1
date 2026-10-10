# Magic UI effects on static HTML/CSS/JS sites

Ports of the most useful Magic UI effects, without React or Tailwind. Put CSS in the
site's stylesheet and JS in its existing script file. Replace the `--accent`, `--bg`,
`--text` variables with the site's own variables.

## blur-fade (entrance on scroll)
```html
<h2 class="mu-blur-fade">Notre cuisine</h2>
```
```css
.mu-blur-fade{opacity:0;filter:blur(8px);transform:translateY(12px);transition:opacity .6s ease,filter .6s ease,transform .6s ease}
.mu-blur-fade.is-in{opacity:1;filter:none;transform:none}
@media (prefers-reduced-motion:reduce){.mu-blur-fade{opacity:1;filter:none;transform:none;transition:none}}
```
```js
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{threshold:.2});
document.querySelectorAll('.mu-blur-fade').forEach((el,i)=>{el.style.transitionDelay=`${(i%4)*80}ms`;io.observe(el)});
```

## marquee (reviews, partner or press logos)
```html
<div class="mu-marquee" aria-label="Avis clients">
  <div class="mu-marquee__track">
    <span>« Les meilleures pâtes du quartier »</span><span>« Accueil adorable »</span>
  </div>
</div>
```
```css
.mu-marquee{overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)}
.mu-marquee__track{display:flex;gap:3rem;width:max-content;animation:mu-marquee 30s linear infinite}
.mu-marquee:hover .mu-marquee__track,.mu-marquee:focus-within .mu-marquee__track{animation-play-state:paused}
@keyframes mu-marquee{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.mu-marquee__track{animation:none;flex-wrap:wrap;width:auto}}
```
```js
// Duplicate the content once so the loop is seamless (aria-hidden on the copy)
document.querySelectorAll('.mu-marquee__track').forEach(t=>{[...t.children].forEach(c=>{const d=c.cloneNode(true);d.setAttribute('aria-hidden','true');t.appendChild(d)})});
```

## shimmer / shiny button (main CTA, e.g. "Réserver")
```html
<a class="mu-shimmer" href="#reserver">Réserver une table</a>
```
```css
.mu-shimmer{position:relative;overflow:hidden;display:inline-block;padding:.9em 1.6em;border-radius:999px;background:var(--accent);color:var(--bg);text-decoration:none}
.mu-shimmer::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.45) 50%,transparent 65%);transform:translateX(-100%);animation:mu-shimmer 3s ease-in-out infinite}
@keyframes mu-shimmer{60%,100%{transform:translateX(100%)}}
@media (prefers-reduced-motion:reduce){.mu-shimmer::after{display:none}}
```

## dot-pattern / grid-pattern (subtle background)
```css
.mu-dots{background-image:radial-gradient(color-mix(in srgb,var(--text) 18%,transparent) 1px,transparent 1px);background-size:22px 22px;mask-image:radial-gradient(ellipse at center,#000 40%,transparent 75%)}
.mu-grid{background-image:linear-gradient(color-mix(in srgb,var(--text) 10%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--text) 10%,transparent) 1px,transparent 1px);background-size:40px 40px}
```

## border-beam (highlight card: menu of the day, special offer)
```css
.mu-beam{position:relative;border-radius:16px;isolation:isolate}
.mu-beam::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:conic-gradient(from var(--a,0deg),transparent 80%,var(--accent));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:mu-beam 4s linear infinite;z-index:-1}
@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes mu-beam{to{--a:360deg}}
@media (prefers-reduced-motion:reduce){.mu-beam::before{animation:none}}
```

## number-ticker (e.g. "Depuis 1998", "12 000 pizzas par an")
```html
<span class="mu-ticker" data-to="1998">1998</span>
```
```js
const tio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;tio.unobserve(e.target);const el=e.target,to=+el.dataset.to,t0=performance.now(),d=1200;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
(function f(t){const p=Math.min(1,(t-t0)/d),v=Math.round(to*(1-Math.pow(1-p,3)));el.textContent=v.toLocaleString('fr-FR');if(p<1)requestAnimationFrame(f)})(t0)}),{threshold:.5});
document.querySelectorAll('.mu-ticker').forEach(el=>tio.observe(el));
```
The final number is already in the HTML, so it stays correct without JS and for search engines.

## Before adding an effect
- Does it serve the content (social proof, CTA, hierarchy)? If not, skip it.
- Is there already a moving element in this viewport (hero video, marquee)? If so, skip it.
- Check mobile: no horizontal overflow, readable text.
