"use strict";
const $ = (s) => document.querySelector(s);
const colores = ["#e0704a", "#5aa67f", "#f0bb52", "#ee9a97", "#5aa3ba"];
const obras = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  tipo: i < 10 ? "museo" : "debate",
  titulo:
    i < 10
      ? `Obra del museo · ${String(i + 1).padStart(2, "0")}`
      : `Obra externa · ${String(i - 9).padStart(2, "0")}`,
}));
let filtro = "todos",
  lista = [],
  cur = 0,
  arrastre = false;
function pinta(o) {
  return `<div class="miniatura" style="--c:${colores[(o.id - 1) % 5]};--f:${colores[(o.id + 1) % 5]};--rot:${o.id % 2 ? "-20deg" : "20deg"}"><span class="num">${String(o.id).padStart(2, "0")} / 15</span><i class="fruta"></i><span class="placeholder">ILUSTRACIÓN · NO ES UNA OBRA</span></div>`;
}
function render() {
  const termino = $("#busqueda").value.trim().toLowerCase();
  lista = obras.filter(
    (o) =>
      (filtro === "todos" || o.tipo === filtro) &&
      o.titulo.toLowerCase().includes(termino),
  );
  cur = Math.min(cur, Math.max(lista.length - 1, 0));
  $("#obras").innerHTML = lista
    .map(
      (o) =>
        `<button class="obra" data-obra="${o.id}" aria-label="Abrir ficha: ${o.titulo}">${pinta(o)}<h3>${o.titulo} ↗</h3><p>Por seleccionar · ${o.tipo === "museo" ? "Museo Botero" : "Obra externa o caso de debate"}</p></button>`,
    )
    .join("");
  $("#scrub").max = Math.max(lista.length - 1, 0);
  $("#resultados").textContent =
    `${lista.length} fichas visibles · Títulos y datos pendientes de investigación`;
  coloca();
}
function coloca() {
  [...$("#obras").children].forEach((c, i) => {
    const o = i - cur,
      a = Math.abs(o);
    c.style.setProperty("--o", o);
    c.style.setProperty("--a", a);
    c.style.zIndex = 20 - a;
    c.classList.toggle("lejos", a > 2);
    c.classList.toggle("centro", a === 0);
    c.tabIndex = a === 0 ? 0 : -1;
  });
  $("#scrub").value = cur;
  $("#contador").textContent = lista.length
    ? `${String(cur + 1).padStart(2, "0")} / ${String(lista.length).padStart(2, "0")}`
    : "0 / 0";
}
function mover(d) {
  if (!lista.length) return;
  cur = Math.max(0, Math.min(lista.length - 1, cur + d));
  coloca();
}
render();
document.querySelectorAll("[data-filter]").forEach((b) =>
  b.addEventListener("click", () => {
    filtro = b.dataset.filter;
    cur = 0;
    document.querySelectorAll("[data-filter]").forEach((x) => {
      x.classList.toggle("activo", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    });
    render();
  }),
);
$("#busqueda").addEventListener("input", () => {
  cur = 0;
  render();
});
function abrirFicha(o) {
  $("#fichaContenido").innerHTML =
    `<div class="ficha-cuadro">${pinta(o)}</div><p class="eyebrow">FICHA DE INVESTIGACIÓN / ${String(o.id).padStart(2, "0")}</p><h2>${o.titulo}</h2><p class="aviso">Este espacio no representa una obra identificada. Reemplazarlo tras verificar la selección.</p><h3>Información por reunir</h3><ul>${(o.tipo === "museo" ? ["Título, año y técnica.", "Confirmar su pertenencia al recorrido del Museo Botero.", "Contexto histórico y significado, con fuentes.", "Relación con la evolución del estilo.", "Imagen, procedencia y permiso de uso.", "Propuesta musical y justificación."] : ["Título, año, técnica y ubicación.", "Fuentes sobre su contexto y recepción.", "Distinguir controversia documentada de censura.", "Reacciones identificadas: quién, cuándo y dónde.", "Pregunta de reflexión, imagen y permisos.", "Propuesta musical y justificación."]).map((x) => `<li>${x}</li>`).join("")}</ul><div class="ficha-nav"><button class="btn secundario" data-ir="-1">← Anterior</button><button class="btn secundario" data-ir="1">Siguiente →</button></div>`;
  if (!$("#ficha").open) $("#ficha").showModal();
}
$("#obras").addEventListener("click", (e) => {
  if (arrastre) return;
  const b = e.target.closest("[data-obra]");
  if (!b) return;
  const i = [...$("#obras").children].indexOf(b);
  if (i !== cur) {
    cur = i;
    coloca();
    return;
  }
  abrirFicha(lista[cur]);
});
$("#fichaContenido").addEventListener("click", (e) => {
  const b = e.target.closest("[data-ir]");
  if (!b) return;
  mover(Number(b.dataset.ir));
  abrirFicha(lista[cur]);
});
$("#prev").addEventListener("click", () => mover(-1));
$("#next").addEventListener("click", () => mover(1));
$("#scrub").addEventListener("input", (e) => {
  cur = Number(e.target.value);
  coloca();
});
let x0 = null;
$("#sala").addEventListener("pointerdown", (e) => {
  x0 = e.clientX;
});
$("#sala").addEventListener("pointercancel", () => {
  x0 = null;
});
$("#sala").addEventListener("pointerup", (e) => {
  if (x0 === null) return;
  const dx = e.clientX - x0;
  x0 = null;
  if (Math.abs(dx) > 50) {
    arrastre = true;
    mover(dx < 0 ? 1 : -1);
    setTimeout(() => (arrastre = false), 60);
  }
});
$("#cerrar").addEventListener("click", () => $("#ficha").close());
$("#ficha").addEventListener("click", (e) => {
  if (e.target === $("#ficha")) {
    const r = $("#ficha").getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      $("#ficha").close();
  }
});
const etapas = [
  [
    "Influencias y formación",
    "¿Qué referentes y experiencias ayudan a comprender sus primeras búsquedas? Reunir biografía, fechas verificadas y obras concretas.",
  ],
  [
    "Un lenguaje visual propio",
    "¿Cómo se relacionan volumen, proporción, composición y color? Comparar obras verificadas sin reducir el análisis a una sola característica.",
  ],
  [
    "El museo y la donación",
    "¿Cómo se originó el Museo Botero? Investigar la donación, la colección y la propuesta del recorrido mediante fuentes institucionales.",
  ],
  [
    "Arte, memoria y recepción",
    "¿Cómo se representan experiencias de violencia y cómo reaccionaron los públicos? Distinguir hechos comprobados, interpretación y opinión.",
  ],
];
function etapa(i) {
  $("#etapaTexto").innerHTML = `<h3>${etapas[i][0]}</h3><p>${etapas[i][1]}</p>`;
}
etapa(0);
document.querySelectorAll("[data-etapa]").forEach((b) =>
  b.addEventListener("click", () => {
    etapa(Number(b.dataset.etapa));
    document.querySelectorAll("[data-etapa]").forEach((x) => {
      x.classList.toggle("activo", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    });
  }),
);
$("#menu").addEventListener("click", () => {
  const open = $("#nav").classList.toggle("abierto");
  $("#menu").setAttribute("aria-expanded", String(open));
});
document.querySelectorAll("#nav a").forEach((a) =>
  a.addEventListener("click", () => {
    $("#nav").classList.remove("abierto");
    $("#menu").setAttribute("aria-expanded", "false");
  }),
);
if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("js");
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.remove("pendiente");
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((e) => {
    e.classList.add("pendiente");
    observer.observe(e);
  });
}
function scrollProgress() {}
addEventListener("scroll", scrollProgress, { passive: true });
addEventListener("resize", scrollProgress);
scrollProgress();
let ctx,
  master,
  timer,
  step = 0,
  nextTime = 0,
  playing = false,
  source = "synth",
  url = null,
  busy = false;
const audio = $("#audio");
audio.volume = 0.35;
function initAudio() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) throw new Error("Web Audio no disponible");
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = Number($("#volumen").value) * 0.65;
  master.connect(ctx.destination);
}
function nota(freq, time, duration, level) {
  const osc = ctx.createOscillator(),
    gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(level, time + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(time);
  osc.stop(time + duration + 0.05);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}
const chords = [
  [130.81, 164.81, 196],
  [110, 130.81, 164.81],
  [87.31, 130.81, 174.61],
  [98, 146.83, 196],
];
function schedule() {
  while (nextTime < ctx.currentTime + 0.25) {
    const c = chords[Math.floor(step / 8) % 4];
    nota(c[step % 3] * 2, nextTime, 1.6, 0.15);
    if (step % 4 === 0) c.forEach((f) => nota(f, nextTime, 2.6, 0.06));
    step++;
    nextTime += 0.44;
  }
}
function ui() {
  document.body.classList.toggle("sonando", playing);
  $("#play").textContent = playing ? "Ⅱ" : "▶";
  $("#play").setAttribute(
    "aria-label",
    playing ? "Pausar música" : "Reproducir música",
  );
  $("#estadoAudio").textContent = playing
    ? "Música en reproducción"
    : "Sonido pausado";
  $("#tipoAudio").textContent =
    source === "synth"
      ? "Ambiente instrumental generado"
      : "Archivo local seleccionado";
  $("#soundMain").textContent = playing
    ? "Ⅱ Pausar música"
    : "▶ Escuchar música";
  $("#heroAudio").textContent = playing
    ? "Ⅱ Pausar sonido"
    : "♫ Entrar con sonido";
}
async function toggle() {
  if (busy) return;
  busy = true;
  try {
    if (playing) {
      if (source === "file") audio.pause();
      else {
        clearInterval(timer);
        timer = null;
        await ctx.suspend();
      }
      playing = false;
    } else {
      if (source === "file") {
        await audio.play();
      } else {
        initAudio();
        await ctx.resume();
        nextTime = ctx.currentTime + 0.06;
        schedule();
        timer = setInterval(schedule, 100);
      }
      playing = true;
    }
    ui();
  } catch (e) {
    playing = false;
    clearInterval(timer);
    ui();
    $("#estadoAudio").textContent = "No se pudo iniciar el audio";
    $("#archivoNombre").textContent =
      "Revisa el volumen o prueba otro archivo de audio compatible.";
  } finally {
    busy = false;
  }
}
["#play", "#heroAudio", "#soundMain"].forEach((s) =>
  $(s).addEventListener("click", toggle),
);
$("#volumen").addEventListener("input", (e) => {
  const v = Number(e.target.value);
  audio.volume = v;
  if (master) master.gain.setTargetAtTime(v * 0.65, ctx.currentTime, 0.05);
});
async function stop() {
  audio.pause();
  clearInterval(timer);
  timer = null;
  if (ctx && ctx.state === "running") await ctx.suspend();
  playing = false;
  ui();
}
$("#archivoAudio").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await stop();
  if (url) URL.revokeObjectURL(url);
  url = URL.createObjectURL(file);
  audio.src = url;
  source = "file";
  $("#archivoNombre").textContent =
    `Seleccionado: ${file.name}. Pulsa reproducir para escucharlo.`;
  $("#volverAmbiente").hidden = false;
  ui();
});
$("#volverAmbiente").addEventListener("click", async () => {
  await stop();
  source = "synth";
  audio.removeAttribute("src");
  audio.load();
  if (url) {
    URL.revokeObjectURL(url);
    url = null;
  }
  $("#archivoAudio").value = "";
  $("#archivoNombre").textContent =
    "Ambiente instrumental generado listo. Pulsa reproducir.";
  $("#volverAmbiente").hidden = true;
  ui();
});
audio.addEventListener("error", () => {
  if (source === "file") {
    playing = false;
    ui();
    $("#estadoAudio").textContent = "Archivo no compatible";
  }
});
audio.addEventListener("pause", () => {
  if (source === "file" && playing) {
    playing = false;
    ui();
  }
});

const guiaMsgs = {
  inicio: "¡Bienvenido al museo! Soy Chela, tu guía. Entremos.",
  proyecto: "La idea es simple: mirar, comprender y cuestionar.",
  galeria: "Esta es la sala principal. Recorre los cuadros.",
  mirar: "Toca una tarjeta y te doy una pregunta para mirar mejor.",
  trayectoria: "Elige un eje para ver sus preguntas de investigación.",
  laboratorio: "Infla la figura y mira qué detalles se quedan pequeños.",
  debate: "Abre cada caso. Aquí investigamos antes de opinar.",
  sonido: "Dale play al ambiente o carga tu propia música.",
  libreta: "Anota lo que notaste. Se queda en tu navegador.",
  equipo: "Ellos son las cuatro personas detrás del proyecto.",
  fuentes: "Citar bien también es parte del trabajo.",
};
const ids = [...document.querySelectorAll("main > section[id]")].map(
  (s) => s.id,
);
const nombres = {
  inicio: "Inicio",
  proyecto: "Proyecto",
  galeria: "Galería",
  mirar: "Mirar",
  trayectoria: "Trayectoria",
  laboratorio: "Laboratorio",
  debate: "Debate",
  sonido: "Sonido",
  libreta: "Libreta",
  equipo: "Equipo",
  fuentes: "Fuentes",
};
const rail = document.createElement("nav");
rail.className = "rail";
rail.setAttribute("aria-label", "Secciones");
rail.innerHTML = ids
  .map(
    (id) =>
      `<a href="#${id}" aria-label="${nombres[id] || id}"><span>${nombres[id] || id}</span></a>`,
  )
  .join("");
document.body.appendChild(rail);
let actual = "inicio";
function marca(id) {
  actual = id;
  $("#aqui").textContent = nombres[id] || id;
  document.querySelectorAll("#nav a,.rail a,.cuarto").forEach((a) => {
    const on = a.getAttribute("href") === "#" + id;
    a.classList.toggle("actual", on);
    on
      ? a.setAttribute("aria-current", "true")
      : a.removeAttribute("aria-current");
  });
}
let ult = 0;
addEventListener(
  "scroll",
  () => {
    const y = scrollY;
    $("header").classList.toggle(
      "oculto",
      y > ult && y > 400 && !$("#nav").classList.contains("abierto"),
    );
    ult = y;
  },
  { passive: true },
);
const guia = $(".guia");
function guiaDice(t) {
  $("#guiaMsg").textContent = t;
  guia.classList.remove("habla");
  void guia.offsetWidth;
  guia.classList.add("habla");
}
function guiaDi(id) {
  if (guiaMsgs[id]) guiaDice(guiaMsgs[id]);
}
guiaDi("inicio");
$("#guiaBtn").addEventListener("click", () => {
  const callada = guia.classList.toggle("callada");
  $("#guiaBtn").setAttribute("aria-expanded", String(!callada));
});
document
  .querySelectorAll(".mirar")
  .forEach((b) =>
    b.addEventListener("click", () =>
      b.setAttribute(
        "aria-pressed",
        String(b.getAttribute("aria-pressed") !== "true"),
      ),
    ),
  );
const infla = $("#infla"),
  stage = $("#labStage");
infla.addEventListener("input", () => {
  const v = Number(infla.value);
  stage.style.setProperty("--inf", v);
  $("#inflaVal").textContent = `${Math.round(v * 100)} %`;
});
infla.addEventListener("change", () => {
  const v = Number(infla.value);
  if (v >= 1.5)
    guiaDice("¡Eso sí es volumen! Mira lo pequeñas que quedaron las manos.");
  else if (v <= 0.7) guiaDice("Muy delgada. ¡Vuelve a inflarla!");
});
document.querySelectorAll("[data-vestido]").forEach((b) =>
  b.addEventListener("click", () => {
    stage.style.setProperty("--vestido", b.dataset.vestido);
    document
      .querySelectorAll("[data-vestido]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    guiaDice(`${b.getAttribute("aria-label")}: buena elección.`);
  }),
);
const libreta = $("#nota");
try {
  libreta.value = localStorage.getItem("botero-libreta") || "";
} catch {}
function contar() {
  $("#notaCuenta").textContent = `${libreta.value.length} caracteres`;
  try {
    localStorage.setItem("botero-libreta", libreta.value);
  } catch {}
}
contar();
libreta.addEventListener("input", contar);
document.querySelectorAll("[data-pregunta]").forEach((b) =>
  b.addEventListener("click", () => {
    libreta.value +=
      (libreta.value && !libreta.value.endsWith("\n") ? "\n" : "") +
      b.dataset.pregunta +
      "\n";
    libreta.focus();
    contar();
  }),
);
$("#notaBorrar").addEventListener("click", () => {
  libreta.value = "";
  contar();
});
if (
  matchMedia("(hover:hover) and (prefers-reduced-motion:no-preference)").matches
) {
  document.querySelectorAll(".pilares article,.equipo article").forEach((c) => {
    c.classList.add("tilt");
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty(
        "--ry",
        ((e.clientX - r.left) / r.width - 0.5) * 14 + "deg",
      );
      c.style.setProperty(
        "--rx",
        (0.5 - (e.clientY - r.top) / r.height) * 14 + "deg",
      );
    });
    c.addEventListener("pointerleave", () => {
      c.style.setProperty("--rx", "0deg");
      c.style.setProperty("--ry", "0deg");
    });
  });
  const p = $(".poster");
  p.addEventListener("pointermove", (e) => {
    const r = p.getBoundingClientRect();
    p.style.setProperty("--px", (e.clientX - r.left) / r.width - 0.5);
    p.style.setProperty("--py", (e.clientY - r.top) / r.height - 0.5);
  });
}
$("#planoGrid").innerHTML = ids
  .map(
    (id, i) =>
      `<a class="cuarto c${i}" href="#${id}"><small>${i ? "Sala " + String(i).padStart(2, "0") : "Entrada"}</small>${nombres[id] || id}</a>`,
  )
  .join("");
marca(actual);
$("#plano").addEventListener("click", () => $("#mapa").showModal());
$("#cerrarMapa").addEventListener("click", () => $("#mapa").close());
$("#planoGrid").addEventListener("click", (e) => {
  if (e.target.closest("a")) $("#mapa").close();
});

/* ---- Recorrido por salas ---- */
let cuarto = 0;
const museo = document.querySelector("main");
museo.addEventListener("scroll", () => {
  museo.scrollTop = 0;
  museo.scrollLeft = 0;
});
const puertas = ["ant", "sig"].map((k) => {
  const b = document.createElement("button");
  b.className = "puerta " + k;
  b.type = "button";
  b.innerHTML = "<i></i><small></small>";
  b.addEventListener("click", () => ir(ids[cuarto + (k === "sig" ? 1 : -1)]));
  document.body.appendChild(b);
  return b;
});
function ir(id, push = true) {
  const i = ids.indexOf(id);
  if (i < 0) return;
  cuarto = i;
  ids.forEach((s, k) => {
    const el = document.getElementById(s),
      d = k - i;
    el.style.setProperty("--d", d);
    el.style.setProperty("--ad", Math.min(Math.abs(d), 2));
    el.inert = d !== 0;
  });
  document.getElementById(id).scrollTop = 0;
  marca(id);
  guiaDi(id);
  $("#progreso").style.width = `${(i / (ids.length - 1)) * 100}%`;
  [-1, 1].forEach((s, n) => {
    const t = ids[i + s],
      b = puertas[n];
    b.hidden = !t;
    if (t) {
      b.querySelector("small").textContent = nombres[t];
      b.setAttribute("aria-label", "Ir a la sala: " + nombres[t]);
    }
  });
  if (push && location.hash !== "#" + id) history.pushState(null, "", "#" + id);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href").slice(1);
  if (ids.includes(id)) {
    e.preventDefault();
    ir(id);
  }
});
addEventListener("popstate", () =>
  ir(location.hash.slice(1) || "inicio", false),
);
$("#guiaSig").addEventListener("click", () =>
  ir(ids[Math.min(cuarto + 1, ids.length - 1)]),
);
document.addEventListener("keydown", (e) => {
  if (
    /INPUT|TEXTAREA/.test(e.target.tagName) ||
    document.querySelector("dialog[open]")
  )
    return;
  const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
  if (!d) return;
  if (ids[cuarto] === "galeria" && !e.shiftKey) mover(d);
  else ir(ids[cuarto + d]);
});
ir(
  ids.includes(location.hash.slice(1)) ? location.hash.slice(1) : "inicio",
  false,
);
