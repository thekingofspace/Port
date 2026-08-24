(function () {
  const escapeHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  const RULES = {
    luau: /(--\[\[[\s\S]*?\]\]|--[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b(?:local|const|function|end|if|then|else|elseif|for|in|do|while|repeat|until|return|and|or|not|nil|true|false|export|type|self|break|continue|require)\b)|(\b[A-Z][A-Za-z0-9_]*\b)|(\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?\b)/g,
    rust: /(\/\/[^\n]*)|("(?:\\.|[^"\\\n])*")|(\b(?:fn|let|mut|struct|impl|pub|use|static|const|match|if|else|for|while|loop|return|self|crate|async|await|move|enum|type|where|dyn|ref|in|as|true|false|trait|mod)\b)|(\b[A-Z][A-Za-z0-9_]*\b)|(\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?\b)/g,
    ts: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b(?:class|extends|implements|interface|const|let|var|function|return|new|this|super|if|else|for|while|import|export|from|type|public|private|readonly|static|async|await|true|false|null|undefined)\b)|(\b[A-Z][A-Za-z0-9_]*\b)|(\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?\b)/g
  }

  const CLASSES = ["tk-c", "tk-s", "tk-k", "tk-t", "tk-n"]

  function paint(block) {
    const lang = block.getAttribute("data-lang") || "luau"
    const rule = RULES[lang]
    if (!rule) return
    const raw = block.textContent
    let out = ""
    let last = 0
    let m
    rule.lastIndex = 0
    while ((m = rule.exec(raw)) !== null) {
      out += escapeHtml(raw.slice(last, m.index))
      for (let i = 1; i <= 5; i++) {
        if (m[i] !== undefined) {
          out += '<span class="' + CLASSES[i - 1] + '">' + escapeHtml(m[i]) + "</span>"
          break
        }
      }
      last = m.index + m[0].length
    }
    out += escapeHtml(raw.slice(last))
    block.innerHTML = out
  }

  document.querySelectorAll("pre code[data-lang]").forEach(paint)

  const tabs = document.querySelectorAll(".tab")
  if (tabs.length) {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.getAttribute("data-panel")
        tabs.forEach((t) => {
          const on = t === tab
          t.classList.toggle("is-active", on)
          t.setAttribute("aria-selected", on ? "true" : "false")
        })
        document.querySelectorAll(".panel").forEach((p) => {
          p.classList.toggle("is-active", p.id === id)
        })
      })
    })
  }

  const lightbox = document.getElementById("lightbox")
  if (lightbox) {
    const lightboxImg = document.getElementById("lightboxImg")
    const close = () => {
      lightbox.hidden = true
      lightboxImg.src = ""
      document.body.style.overflow = ""
    }
    document.querySelectorAll(".shot").forEach((shot) => {
      shot.addEventListener("click", () => {
        const src = shot.getAttribute("data-full")
        const img = shot.querySelector("img")
        lightboxImg.src = src
        lightboxImg.alt = img ? img.alt : ""
        lightbox.hidden = false
        document.body.style.overflow = "hidden"
      })
    })
    lightbox.addEventListener("click", close)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !lightbox.hidden) close()
    })
  }

  const here = location.pathname.split("/").pop() || "index.html"
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const target = link.getAttribute("href")
    if (target === here) link.classList.add("is-current")
  })

  const revealables = document.querySelectorAll(".section, .ui-lead, .card, .shot, .next-card")
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in")
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.05 }
    )
    revealables.forEach((el) => {
      el.classList.add("reveal")
      io.observe(el)
    })
  }
})()
