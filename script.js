
/* Extracted script 1 */
;
(() => {
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll(".theme-toggle");
  try { const savedTheme = localStorage.getItem("mukul-portfolio-theme"); if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme; } catch (_) {}
  function updateThemeButton() {
    themeButtons.forEach(btn => {
      const light = root.dataset.theme === "light";
      btn.querySelector(".theme-label").textContent = light ? "Dark mode" : "Light mode";
      btn.querySelector(".theme-icon").textContent = light ? "☾" : "☼";
      btn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    });
  }
  updateThemeButton();
  themeButtons.forEach(btn => btn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    try { localStorage.setItem("mukul-portfolio-theme", root.dataset.theme); } catch (_) {}
    updateThemeButton();
  }));
  document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

  const pages = [...document.querySelectorAll(".app-page")];
  const navLinks = [...document.querySelectorAll("[data-route]")];
  function routeFromHash() {
    const hash = location.hash.replace(/^#\/?/, "").split("/")[0].split("?")[0];
    const map = {home:"index", index:"index", about:"about", skills:"skills", projects:"projects", contact:"contact"};
    return map[hash] || "index";
  }
  // Reveal a linked section even when its card is hidden by the project carousel or skill-tree view.
  function revealPageTarget(targetId) {
    const target = document.getElementById(targetId);
    if (!target) {
      const feedback = document.getElementById("action-feedback");
      const message = document.getElementById("action-feedback-message");
      if (feedback && message) {
        message.textContent = "This section is not available on this page yet.";
        feedback.hidden = false;
      }
      return;
    }

    const projectCard = target.matches(".project-card") ? target : target.closest(".project-card");
    if (projectCard && projectCard.closest("#projects-grid.project-carousel")) {
      const search = document.getElementById("project-search");
      if (search && search.value) { search.value = ""; search.dispatchEvent(new Event("input", {bubbles:true})); }
      document.querySelector('#project-filters [data-filter="all"]')?.click();
      const cards = [...document.querySelectorAll("#projects-grid .project-card")];
      const index = cards.indexOf(projectCard);
      document.querySelectorAll("#project-carousel-dots .project-carousel-dot")[index]?.click();
      window.setTimeout(() => target.scrollIntoView({behavior:"smooth", block:"start"}), 80);
      return;
    }

    const skillCard = target.matches(".skill-card") ? target : target.closest(".skill-card");
    if (skillCard && skillCard.closest("#skill-grid")) {
      document.getElementById("skills-grid-view")?.click();
      const search = document.getElementById("skill-search");
      if (search && search.value) { search.value = ""; search.dispatchEvent(new Event("input", {bubbles:true})); }
      document.querySelector('#skill-filters [data-filter="all"]')?.click();
      window.setTimeout(() => target.scrollIntoView({behavior:"smooth", block:"start"}), 80);
      return;
    }

    target.scrollIntoView({behavior:"smooth", block:"start"});
  }

  function showPage(name, updateHash=true) {
    pages.forEach(page => {
      const active = page.dataset.page === name;
      page.classList.toggle("is-active", active);
      page.setAttribute("aria-hidden", String(!active));
    });
    document.querySelectorAll(".nav-links [data-route]").forEach(a => a.classList.toggle("active", a.dataset.route === name));
    const nav = document.querySelector(".nav-links"), menu = document.querySelector(".menu-toggle");
    nav?.classList.remove("nav-open"); menu?.classList.remove("is-open"); menu?.setAttribute("aria-expanded", "false");
    if (updateHash) {
      const hash = name === "index" ? "#home" : "#" + name;
      if (location.hash !== hash) history.pushState(null, "", hash);
    }
    window.scrollTo({top:0, behavior:"smooth"});
    initReveals(document.querySelector("#page-" + name));
  }
  // Shared route entry point for CTA/footer links handled outside this closure.
  window.showPortfolioPage = showPage;
  navLinks.forEach(link => link.addEventListener("click", event => {
    const route = link.dataset.route;
    if (route) { event.preventDefault(); showPage(route); }
  }));

  // Fix .html links for single-file portfolio: never navigate to missing local HTML files.
  document.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;
    const href = (link.getAttribute("href") || "").trim();
    const match = href.match(/^(?:\.\/)?(index|about|skills|projects|contact)\.html(?:#([^?]+))?(?:\?.*)?$/i);
    if (!match) return;
    event.preventDefault();
    const routeName = match[1].toLowerCase();
    const route = routeName === "index" ? "index" : routeName;
    const targetId = match[2] ? decodeURIComponent(match[2]) : "";
    showPage(route);
    if (targetId) setTimeout(() => revealPageTarget(targetId), 100);
  }, true);

  window.addEventListener("hashchange", () => showPage(routeFromHash(), false));
  window.addEventListener("popstate", () => showPage(routeFromHash(), false));
  const initialRoute = routeFromHash();
  showPage(initialRoute, false);

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (menuToggle && nav) menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.classList.toggle("is-open", open);
  });

  // Accessibility: close the mobile navigation on outside click or Escape.
  if (menuToggle && nav) {
    document.addEventListener("click", event => {
      if (nav.classList.contains("nav-open") &&
          !nav.contains(event.target) && !menuToggle.contains(event.target)) {
        nav.classList.remove("nav-open");
        menuToggle.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("nav-open")) {
        nav.classList.remove("nav-open");
        menuToggle.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.focus({preventScroll:true});
      }
    });
  }

  function initReveals(scope=document) {
    const items = scope.querySelectorAll(".reveal:not(.is-visible)");
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
    }, {threshold:.08}) : null;
    items.forEach(el => observer ? observer.observe(el) : el.classList.add("is-visible"));
  }
  initReveals();

  function setupFilter({searchId, filtersId, cardsSelector, emptyId, treeSelector}) {
    const search = document.getElementById(searchId), filters = document.getElementById(filtersId);
    const cards = [...document.querySelectorAll(cardsSelector)], empty = document.getElementById(emptyId);
    const treeBranches = treeSelector ? [...document.querySelectorAll(treeSelector)] : [];
    if (!search || !filters || !cards.length) return;
    let category = "all";
    function apply() {
      const query = search.value.trim().toLowerCase(); let count = 0;
      cards.forEach(card => {
        const matchesCategory = category === "all" || card.dataset.category === category;
        const matchesQuery = !query || ((card.dataset.search || "") + " " + card.innerText).toLowerCase().includes(query);
        card.hidden = !(matchesCategory && matchesQuery); if (!card.hidden) count++;
      });
      treeBranches.forEach(branch => {
        const linkedCard = cards.find(card => card.dataset.category === branch.dataset.category);
        branch.hidden = !linkedCard || linkedCard.hidden;
        if (branch.hidden) {
          const children = branch.querySelector(".skill-tree-children");
          const toggle = branch.querySelector(".skill-tree-branch-toggle");
          if (children) children.hidden = true;
          if (toggle) toggle.setAttribute("aria-expanded", "false");
          const mark = toggle && toggle.querySelector(".skill-tree-chevron");
          if (mark) mark.textContent = "＋";
        }
      });
      if (empty) empty.hidden = count > 0;
    }
    search.addEventListener("input", apply);
    filters.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
      category = btn.dataset.filter;
      filters.querySelectorAll("[data-filter]").forEach(other => {
        other.classList.toggle("active", other === btn);
        other.setAttribute("aria-pressed", String(other === btn));
      });
      apply();
    }));
    apply();
  }
  setupFilter({searchId:"skill-search",filtersId:"skill-filters",cardsSelector:"#skill-grid .skill-card",emptyId:"skills-empty",treeSelector:"#skill-tree-branches .skill-tree-branch"});
  setupFilter({searchId:"project-search",filtersId:"project-filters",cardsSelector:"#projects-grid .project-card",emptyId:"projects-empty"});
  // Premium project carousel: one featured card at a time, with arrows, dots, and swipe support.
  (()=>{
    const track=document.getElementById("projects-grid"), controls=document.getElementById("project-carousel-controls");
    const prev=document.getElementById("project-prev"), next=document.getElementById("project-next"), dots=document.getElementById("project-carousel-dots"), count=document.getElementById("project-carousel-count");
    if(!track||!controls||!prev||!next||!dots||!count)return;
    track.classList.add("project-carousel");
    const cards=Array.from(track.querySelectorAll(".project-card")); let current=0, touchStartX=0, touchStartY=0;
    cards.forEach((card,i)=>{const dot=document.createElement("button");dot.type="button";dot.className="project-carousel-dot";dot.setAttribute("aria-label","Show project "+(i+1)+": "+(card.querySelector("h2")?.textContent.trim()||"Project"));dot.addEventListener("click",()=>{current=i;render();});dots.appendChild(dot);});
    const dotButtons=Array.from(dots.querySelectorAll("button"));
    function visibleIndexes(){return cards.map((card,i)=>!card.hidden?i:-1).filter(i=>i>=0);}
    function render(direction=1){
      const visible=visibleIndexes();
      if(!visible.length){cards.forEach(c=>c.classList.remove("is-current"));controls.hidden=true;return;}
      controls.hidden=false;
      if(!visible.includes(current))current=visible[0];
      cards.forEach((card,i)=>{card.classList.toggle("is-current",i===current);card.classList.remove("is-previous","is-next");if(!card.hidden&&visible.length>1){const at=visible.indexOf(current);if(i===visible[(at-1+visible.length)%visible.length])card.classList.add("is-previous");if(i===visible[(at+1)%visible.length])card.classList.add("is-next");}card.setAttribute("aria-roledescription","slide");card.setAttribute("aria-label",(i+1)+" of "+cards.length);});
      dotButtons.forEach((dot,i)=>{dot.hidden=cards[i].hidden;dot.setAttribute("aria-current",String(i===current));});
      count.textContent=String(visible.indexOf(current)+1).padStart(2,"0")+" / "+String(visible.length).padStart(2,"0");
      prev.disabled=visible.length<2;next.disabled=visible.length<2;
      track.querySelectorAll(".project-card").forEach(c=>c.style.animationDirection=direction<0?"reverse":"normal");
    }
    function move(step){const visible=visibleIndexes();if(!visible.length)return;let at=visible.indexOf(current);at=(at+step+visible.length)%visible.length;current=visible[at];render(step);}
    prev.addEventListener("click",()=>move(-1));next.addEventListener("click",()=>move(1));
    track.addEventListener("touchstart",e=>{if(!e.touches.length)return;touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;},{passive:true});
    track.addEventListener("touchend",e=>{if(!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touchStartX,dy=e.changedTouches[0].clientY-touchStartY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)move(dx<0?1:-1);},{passive:true});
    track.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){e.preventDefault();move(-1)}else if(e.key==="ArrowRight"){e.preventDefault();move(1)}});
    const observer=new MutationObserver(()=>{const visible=visibleIndexes();if(visible.length&&!visible.includes(current))current=visible[0];render();});
    cards.forEach(card=>observer.observe(card,{attributes:true,attributeFilter:["hidden"]}));
    render();
  })();
  document.querySelectorAll(".details-toggle").forEach(btn => btn.addEventListener("click", () => {
    const details = btn.nextElementSibling, open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open)); details.hidden = !open; btn.querySelector("span").textContent = open ? "−" : "＋";
  }));
  const form = document.getElementById("contact-form");
  if (form) {
    const fields=["name","email","topic","message"], status=document.getElementById("form-status"), key="mukul-portfolio-contact-draft";
    function readFields(){return Object.fromEntries(fields.map(k=>[k,form.elements[k].value]));}
    function fillFields(data){fields.forEach(k=>{if(data[k]!==undefined)form.elements[k].value=data[k];});}
    try{const draft=localStorage.getItem(key);if(draft)fillFields(JSON.parse(draft));}catch(_){}
    form.addEventListener("submit",event=>{event.preventDefault();if(!form.reportValidity())return;try{localStorage.setItem(key,JSON.stringify(readFields()));status.textContent="Your message draft has been saved in this browser. It has not been sent.";status.classList.add("success");}catch(_){status.textContent="Could not save locally. Check your browser storage settings.";}});
    form.addEventListener("input",()=>{status.textContent="";status.classList.remove("success");});
    document.getElementById("clear-draft")?.addEventListener("click",()=>{form.reset();status.textContent="Form cleared.";try{localStorage.removeItem(key);}catch(_){}});
  }

  // Reading progress and accessible back-to-top control.
  const progressBar = document.getElementById("reading-progress");
  const backTop = document.getElementById("back-to-top");
  function updateScrollUI() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progressBar) progressBar.style.width = (window.scrollY / maxScroll * 100) + "%";
    if (backTop) backTop.classList.toggle("visible", window.scrollY > 420);
  }
  window.addEventListener("scroll", updateScrollUI, {passive:true});
  window.addEventListener("resize", updateScrollUI);
  backTop?.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
  updateScrollUI();

  // Search overlay: pages, skills, and project cards; Ctrl/Cmd + K opens it.
  const searchOverlay = document.getElementById("quick-search-overlay");
  const quickInput = document.getElementById("quick-search-input");
  const quickResults = document.getElementById("quick-search-results");
  const searchOpen = document.getElementById("quick-search-button");
  const searchClose = document.getElementById("quick-search-close");
  const quickItems = [
    {title:"Home", detail:"Introduction and overview", icon:"⌂", route:"index", keywords:"welcome intro profile"},
    {title:"About & experience", detail:"Background and work history", icon:"◎", route:"about", keywords:"career experience system engineer developer"},
    {title:"Skills", detail:"Search technical and professional skills", icon:"✳", route:"skills", keywords:"angular javascript typescript aws linux reporting excel"},
    {title:"Projects", detail:"Browse featured projects", icon:"▧", route:"projects", keywords:"job-check aws architecture connect my doc"},
    {title:"Contact", detail:"Open the contact form", icon:"✉", route:"contact", keywords:"message connect opportunity"}
  ];
  document.querySelectorAll("#projects-grid .project-card").forEach(card => {
    quickItems.push({
      title: card.querySelector("h2")?.textContent.trim() || "Project",
      detail: card.querySelector(".project-card-body > p")?.textContent.trim() || "Featured project",
      icon:"↗", route:"projects", target:card.id || "",
      keywords:(card.dataset.search || "") + " " + card.innerText
    });
  });
  document.querySelectorAll("#skill-grid .skill-card").forEach(card => {
    quickItems.push({
      title: card.querySelector("h3")?.textContent.trim() || "Skill",
      detail: card.querySelector(".skill-category")?.textContent.trim() || "Skill category",
      icon:"✳", route:"skills", target:"",
      keywords:card.innerText
    });
  });
  function closeQuickSearch() {
    searchOverlay?.classList.remove("open");
    document.body.style.overflow = "";
    searchOpen?.focus({preventScroll:true});
  }
  function openQuickSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    if (quickInput) { quickInput.value = ""; renderQuickResults(""); setTimeout(() => quickInput.focus(), 20); }
  }
  function renderQuickResults(query) {
    if (!quickResults) return;
    const q = query.trim().toLowerCase();
    const matches = quickItems.filter(item => (item.title + " " + item.detail + " " + (item.keywords || "")).toLowerCase().includes(q)).slice(0, 10);
    quickResults.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement("div"); empty.className = "quick-empty"; empty.textContent = "No matches found. Try a different keyword."; quickResults.append(empty); return;
    }
    matches.forEach(item => {
      const button = document.createElement("button"); button.type = "button"; button.className = "quick-result";
      const icon = document.createElement("span"); icon.className = "quick-result-icon"; icon.textContent = item.icon;
      const copy = document.createElement("span"); const title = document.createElement("strong"); title.textContent = item.title;
      const detail = document.createElement("small"); detail.textContent = item.detail;
      copy.append(title, detail); button.append(icon, copy);
      button.addEventListener("click", () => {
        closeQuickSearch(); showPage(item.route);
        if (item.target) setTimeout(() => revealPageTarget(item.target), 180);
      });
      quickResults.append(button);
    });
  }
  searchOpen?.addEventListener("click", openQuickSearch);
  searchClose?.addEventListener("click", closeQuickSearch);
  quickInput?.addEventListener("input", () => renderQuickResults(quickInput.value));
  searchOverlay?.addEventListener("click", event => { if (event.target === searchOverlay) closeQuickSearch(); });
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openQuickSearch(); }
    if (event.key === "Escape" && searchOverlay?.classList.contains("open")) closeQuickSearch();
  });
  renderQuickResults("");

})();

  // Prevent accidental horizontal overflow from dynamically rendered content.
  function clampWideContent() {
    document.querySelectorAll("main, section, .page, .page-section, .container, .section-container, .content-wrap").forEach(el => {
      el.style.maxWidth = "100%";
      el.style.minWidth = "0";
    });
  }
  window.addEventListener("load", clampWideContent, {once:true});
  window.addEventListener("resize", clampWideContent, {passive:true});


  // Local-file friendly click handling: explain broken destinations instead of opening ERR_FILE_NOT_FOUND.
  (function(){
    const toast = document.getElementById("action-feedback");
    const message = document.getElementById("action-feedback-message");
    if (!toast || !message) return;
    let toastTimer;
    function notify(text, html){
      message.textContent = text;
      if (html) message.appendChild(html);
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(()=>{toast.hidden=true;}, 6500);
    }
    const close = toast.querySelector("button");
    if(close) close.addEventListener("click",()=>toast.hidden=true);

    // Ensure page navigation links work within the single HTML file.
    document.addEventListener("click", function(event){
      const link = event.target.closest("a");
      if (!link) return;
      const href = (link.getAttribute("href") || "").trim();
      if (!href || href === "#") {
        event.preventDefault();
        notify("This link does not have a destination configured yet.");
        return;
      }
      if (/^(mailto:|tel:|https?:|sms:|whatsapp:)/i.test(href)) return;
      if (href.startsWith("#")) {
        const rawHash = decodeURIComponent(href.slice(1));
        const routeKey = rawHash.split(/[/?]/)[0].toLowerCase();
        const routeMap = {home:"index",index:"index",about:"about",skills:"skills",projects:"projects",contact:"contact"};
        if (routeMap[routeKey]) {
          event.preventDefault();
          // Header/footer links have their own handler; allow it to keep aria/current state in sync.
          if (link.hasAttribute("data-route")) return;
          window.showPortfolioPage?.(routeMap[routeKey]);
          return;
        }
        const target = document.getElementById(rawHash);
        if (target) return;
        event.preventDefault();
        notify("This section link is not connected to a section in this HTML file.");
        return;
      }
      if (/^(?:\.\/)?(index|about|skills|projects|contact)\.html(?:#.*)?$/i.test(href)) {
        // The main route handler already dealt with these single-document routes.
        event.preventDefault();
        return;
      }
      if (/^(javascript:|data:|file:|content:)/i.test(href)) {
        event.preventDefault();
        notify("This destination is unavailable from this local portfolio file.");
      }
    }, true);

  })();
;


/* Extracted script 2 */
;
(function(){const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));$('#download-resume')?.addEventListener('click',()=>{const t=`MUKUL SINGANJUNDE\nSystem Engineer | IT Operations | Cloud & Front-end Development\n\nSUMMARY\nTechnology and operations professional with around 2 years of experience, combining front-end development, process operations, reporting, and practical problem-solving.\n\nEXPERIENCE\nSystem Engineer — Cross Country Infotech Pvt. Ltd.\nIT operations, technical support, asset management, and process-focused problem solving.\n\nSKILLS\nHTML, CSS, JavaScript, TypeScript, Angular, AWS fundamentals, Linux, Nginx, Tomcat, Git, GitLab, VS Code\n\nPROJECTS\nIT Service Desk website; AWS 3-tier architecture learning project; Job-Check; Connect My Doc.\n`;const u=URL.createObjectURL(new Blob([t],{type:'text/plain'})),a=document.createElement('a');a.href=u;a.download='Mukul_Singanjunde_Resume.txt';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(u)});const f=$('#preview-frame'),lab=$('#device-size-label');if(f&&lab){$$('.device-choice').forEach(b=>b.addEventListener('click',()=>{$$('.device-choice').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});f.classList.remove('desktop','tablet','mobile');f.classList.add(b.dataset.device);lab.textContent='Preview · '+b.dataset.device}));}if(!$('#sudoku-board')||!$('#memory-board')||!$('#typing-prompt')||!$('#quiz-options'))return;const puz=[1,0,3,0,1,0,2,0,1],sol=[1,2,3,3,1,2,2,3,1],board=$('#sudoku-board');function sudoku(){board.replaceChildren();puz.forEach((v,i)=>{const e=document.createElement(v?'div':'input');e.className='sudoku-cell'+(v?' given':'');if(v)e.textContent=v;else{e.type='number';e.min=1;e.max=3;e.dataset.i=i;e.setAttribute('aria-label','Sudoku cell '+(i+1))}board.append(e)})}sudoku();$('#check-sudoku')?.addEventListener('click',()=>{const a=puz.map((v,i)=>v||Number($('[data-i="'+i+'"]',board)?.value||0));$('#sudoku-feedback').textContent=a.every((v,i)=>v===sol[i])?'Correct! Puzzle solved.':'Not quite. Check each row and column using 1–3.'});$('#reset-sudoku')?.addEventListener('click',sudoku);const icons=['⌘','☁','🐧','⚙','⌘','☁','🐧','⚙'];let first=null,lock=false,moves=0,found=0;function mix(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}function memory(){const root=$('#memory-board');root.replaceChildren();first=null;lock=false;moves=found=0;$('#memory-moves').textContent=0;$('#memory-feedback').textContent='Find all 4 pairs.';mix([...icons]).forEach((v,i)=>{const b=document.createElement('button');b.className='memory-card';b.type='button';b.textContent='?';b.dataset.v=v;b.setAttribute('aria-label','Memory card '+(i+1));b.onclick=()=>{if(lock||b.classList.contains('matched')||b===first)return;b.textContent=v;b.classList.add('flipped');if(!first){first=b;return}moves++;$('#memory-moves').textContent=moves;if(first.dataset.v===v){first.classList.add('matched');b.classList.add('matched');found+=2;first=null;if(found===8)$('#memory-feedback').textContent='All pairs matched in '+moves+' moves!'}else{lock=true;const old=first;first=null;setTimeout(()=>{old.textContent=b.textContent='?';old.classList.remove('flipped');b.classList.remove('flipped');lock=false},650)}};root.append(b)})}memory();$('#reset-memory')?.addEventListener('click',memory);const prompt=$('#typing-prompt').textContent;$('#check-typing')?.addEventListener('click',()=>{const v=$('#typing-input').value;let n=0;for(let i=0;i<Math.min(v.length,prompt.length);i++)if(v[i]===prompt[i])n++;const pct=v.length?Math.round(n/Math.max(v.length,prompt.length)*100):0;$('#typing-feedback').textContent=v===prompt?'Perfect match! Accuracy 100%.':'Accuracy: '+pct+'%. Keep going until the sentence matches exactly.'});$('#reset-typing')?.addEventListener('click',()=>{$('#typing-input').value='';$('#typing-feedback').textContent='Challenge restarted.'});const qs=[['Which command lists hidden files?',['ls -a','pwd','mkdir'],0,'ls -a includes hidden entries.'],['Which command shows the current directory?',['cd','pwd','touch'],1,'pwd prints the working directory.'],['Which command lists running processes?',['ps','cp','grep'],0,'ps reports process information.'],['Which command changes file permissions?',['chmod','chown','cat'],0,'chmod modifies permissions.'],['Which command checks mounted filesystem space?',['free -m','df -h','du -x'],1,'df -h shows filesystem space.']];let qi=0,score=0,answered=false;function quiz(){const q=qs[qi],root=$('#quiz-options');$('#quiz-question').textContent=q[0];root.replaceChildren();answered=false;q[1].forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.className='quiz-option';b.textContent=v;b.onclick=()=>{if(answered)return;answered=true;if(i===q[2]){score++;$('#quiz-score').textContent=score;$('#quiz-feedback').textContent='Correct. '+q[3]}else $('#quiz-feedback').textContent='Not quite. '+q[3];$$('button',root).forEach(x=>x.disabled=true)};root.append(b)})}quiz();$('#next-quiz')?.addEventListener('click',()=>{qi=(qi+1)%qs.length;if(qi===0)score=0;$('#quiz-score').textContent=score;quiz()})
 // Reference-inspired Star Catcher game
 const starGrid=$('star-grid');let starActive=-1,starScore=0,starTime=15,starTimer=null,starRunning=false;
 function renderStars(){if(!starGrid)return;starGrid.innerHTML='';for(let i=0;i<9;i++){const b=document.createElement('button');b.type='button';b.className='star-target'+(starRunning&&i===starActive?' active':'');b.textContent=starRunning&&i===starActive?'⭐':'·';b.disabled=!starRunning;b.setAttribute('aria-label','Star target '+(i+1));b.onclick=()=>{if(!starRunning)return;if(i===starActive){starScore++;$('star-score').textContent=starScore;$('star-feedback').textContent='Nice catch! Keep going.';score(2);if(starScore>=5)unlock('stars');let next=Math.floor(Math.random()*9);if(next===starActive)next=(next+1)%9;starActive=next;beep(620)}else beep(210);renderStars()};starGrid.append(b)}}
 function startStars(){clearInterval(starTimer);starScore=0;starTime=15;starRunning=true;starActive=Math.floor(Math.random()*9);$('star-score').textContent='0';$('star-time').textContent='15';$('star-status').textContent='Go! Tap the glowing star!';$('star-start').textContent='Restart 15s round';$('star-feedback').textContent='Catch as many as you can.';renderStars();starTimer=setInterval(()=>{starTime--;$('star-time').textContent=starTime;if(starTime<=0){clearInterval(starTimer);starTimer=null;starRunning=false;starActive=-1;$('star-status').textContent=`Time is up — you caught ${starScore} star${starScore===1?'':'s'}!`;$('star-start').textContent='Play another round';$('star-feedback').textContent=starScore>=5?'Great reflexes! Achievement unlocked.':'Try again and beat your score.';renderStars();if(starScore>0)unlock('stars')}},1000)}
 $('star-start')?.addEventListener('click',startStars);renderStars();
 // Rock-Paper-Scissors game
 let rpsUser=0,rpsCpu=0,rpsTies=0;const rpsIcons={rock:'🪨',paper:'📄',scissors:'✂️'};
 function playRps(user){const options=['rock','paper','scissors'],cpu=options[Math.floor(Math.random()*3)];$('rps-user-pick').textContent=rpsIcons[user];$('rps-cpu-pick').textContent=rpsIcons[cpu];if(user===cpu){rpsTies++;$('rps-feedback').textContent='It is a tie! Both picked '+user+'.'}else if((user==='rock'&&cpu==='scissors')||(user==='paper'&&cpu==='rock')||(user==='scissors'&&cpu==='paper')){rpsUser++;$('rps-feedback').textContent='You win! '+user+' beats '+cpu+'.';score(5);unlock('rps');beep(700)}else{rpsCpu++;$('rps-feedback').textContent='CPU wins! '+cpu+' beats '+user+'.';beep(250)}$('rps-user-score').textContent=rpsUser;$('rps-cpu-score').textContent=rpsCpu;$('rps-tie-score').textContent=rpsTies;$('rps-feedback').className='game-feedback '+(user===cpu?'':'good')}
 $$('[data-rps-choice]').forEach(b=>b.addEventListener('click',()=>playRps(b.dataset.rpsChoice)));$('rps-reset')?.addEventListener('click',()=>{rpsUser=rpsCpu=rpsTies=0;$('rps-user-score').textContent='0';$('rps-cpu-score').textContent='0';$('rps-tie-score').textContent='0';$('rps-user-pick').textContent='❔';$('rps-cpu-pick').textContent='🤖';$('rps-feedback').textContent='Pick your move to start.';$('rps-feedback').className='game-feedback';});
 })();
;


/* Extracted script 3 */
;
(()=>{
 const $=id=>document.getElementById(id), $$=(sel,root=document)=>[...root.querySelectorAll(sel)];
 // The Play/Arcade page was removed; do not let its old handlers abort later site features.
 if(!$('arcade-score')||!$('arcade-theme')||!$('sudoku-board'))return;
 let total=0,unlocked=new Set(),soundOn=false,audioCtx=null;
 try{total=Number(localStorage.getItem('mukulArcadeTotal')||0)}catch(e){};
 $('arcade-score').textContent=total;
 const achievements=[['first','🎮 First Game','Finish a game or answer a quiz question.'],['logic','🧩 Logic Star','Solve Sudoku.'],['memory','🧠 Memory Master','Match all pairs.'],['speed','⌨️ Speed Demon','Complete a typing sprint.'],['linux','🐧 Terminal Ready','Answer a Linux question correctly.'],['snake','🐍 Snake Charmer','Score 5 in Snake.'],['2048','🔷 Tile Tactician','Create a 128 tile in 2048.'],['tic','⭕ Perfect Match','Win Tic-Tac-Toe.'],['reflex','⚡ Quick Reflex','React in under 300 ms.'],['stars','⭐ Star Catcher','Catch stars in a timed round.'],['rps','✊ Arcade Showdown','Play Rock-Paper-Scissors.']];
 function beep(freq=540,dur=.08){if(!soundOn)return;try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;o.connect(g);g.connect(audioCtx.destination);g.gain.value=.035;o.start();o.stop(audioCtx.currentTime+dur)}catch(e){}}
 function score(n){total=Math.max(0,total+n);$('arcade-score').textContent=total;try{localStorage.setItem('mukulArcadeTotal',String(total))}catch(e){};unlock('first')}
 const levelRank={easy:0,medium:1,hard:2,impossible:3};const levelName={easy:'Easy',medium:'Medium',hard:'Hard',impossible:'Impossible'};function gameLevel(game){return $('difficulty-'+game)?.value||'medium'}function levelFactor(game){return [0.75,1,1.35,1.8][levelRank[gameLevel(game)]||1]}
 function unlock(id){if(unlocked.has(id))return;unlocked.add(id);$('achievement-count').textContent=`${unlocked.size} / ${achievements.length}`;$('achievement-strip').innerHTML=achievements.filter(a=>unlocked.has(a[0])).map(a=>`<span class="achievement-chip" title="${a[2]}">${a[1]}</span>`).join('')||'<span class="achievement-chip">🏁 Start playing to unlock achievements</span>';beep(760,.12)}
 $$('[data-game-target]').forEach(b=>b.addEventListener('click',()=>{ $$('.arcade-tab').forEach(x=>x.classList.toggle('active',x===b));$$('.arcade-game').forEach(x=>x.classList.toggle('active',x.dataset.game===b.dataset.gameTarget));}));
 $('arcade-theme').addEventListener('click',()=>{const r=document.documentElement;r.dataset.theme=r.dataset.theme==='light'?'dark':'light';beep(430)});
 $('arcade-reset-score')?.addEventListener('click',()=>{if(confirm('Reset your total arcade score on this device?')){total=0;$('arcade-score').textContent='0';try{localStorage.removeItem('mukulArcadeTotal')}catch(e){}}});
 $('arcade-sound').addEventListener('click',()=>{soundOn=!soundOn;$('arcade-sound').textContent=soundOn?'🔊 Sound: On':'🔇 Sound: Off';$('arcade-sound').setAttribute('aria-pressed',String(soundOn));beep(600)});
 // 3x3 mini sudoku
 const basePuzzle=[1,0,3,0,3,0,0,0,2],solution=[1,2,3,2,3,1,3,1,2];let puzzle=basePuzzle.slice();
 let sudokuRewarded=false;function drawSudoku(){const clues={easy:6,medium:4,hard:3,impossible:2}[gameLevel('sudoku')];const indices=[0,1,2,3,4,5,6,7,8].sort(()=>Math.random()-.5);puzzle=Array(9).fill(0);indices.slice(0,clues).forEach(i=>puzzle[i]=solution[i]);const board=$('sudoku-board');board.innerHTML='';puzzle.forEach((v,i)=>{const inp=document.createElement('input');inp.className='sudoku-cell';inp.inputMode='numeric';inp.maxLength=1;inp.setAttribute('aria-label',`Sudoku row ${Math.floor(i/3)+1}, column ${i%3+1}`);inp.value=v||'';inp.disabled=!!v;inp.dataset.index=i;inp.addEventListener('input',()=>{const v=inp.value.replace(/[^1-3]/g,'').slice(-1);inp.value=v});board.append(inp)})}
 $('check-sudoku').onclick=()=>{const cells=$$('.sudoku-cell',$('sudoku-board'));const vals=cells.map(x=>Number(x.value));if(vals.some(v=>!Number.isInteger(v)||v<1||v>3)){$('sudoku-feedback').textContent='Fill every cell with a number from 1 to 3.';$('sudoku-feedback').className='game-feedback bad';beep(220);return}const rows=[0,1,2].every(r=>new Set(vals.slice(r*3,r*3+3)).size===3);const cols=[0,1,2].every(c=>new Set([vals[c],vals[c+3],vals[c+6]]).size===3);const givensMatch=vals.every((v,i)=>!puzzle[i]||v===puzzle[i]);const ok=rows&&cols&&givensMatch;$('sudoku-feedback').textContent=ok?'Solved! Every row and column is valid. +100 points':!givensMatch?'Keep the starting numbers unchanged.':'Not quite — each row and column must contain 1, 2, and 3 exactly once.';$('sudoku-feedback').className='game-feedback '+(ok?'good':'bad');if(ok){if(!sudokuRewarded){score(100);unlock('logic');sudokuRewarded=true}else $('sudoku-feedback').textContent='Puzzle solved! Points for this puzzle were already awarded.'}beep(ok?800:220)};
 $('reset-sudoku').onclick=()=>{sudokuRewarded=false;drawSudoku();$('sudoku-feedback').textContent='New '+levelName[gameLevel('sudoku')]+' puzzle ready.'};$('difficulty-sudoku').addEventListener('change',()=>{$('reset-sudoku').click()});drawSudoku();
 // memory
 const emojis=['🎧','🌙','⚡','🎮','🚀','🧩','⭐','🎲','💎','🪐'];function memoryPairCount(){return {easy:3,medium:6,hard:8,impossible:10}[gameLevel('memory')]}let memDeck=[],memOpen=[],memMatched=new Set(),memMoves=0,memLock=false;
 function resetMemory(){const chosen=emojis.slice(0,memoryPairCount());memDeck=[...chosen,...chosen].sort(()=>Math.random()-.5);memOpen=[];memMatched=new Set();memMoves=0;memLock=false;$('memory-moves').textContent='0';$('memory-pairs').textContent='0';$('memory-feedback').textContent=`Find all ${memoryPairCount()} pairs (${levelName[gameLevel('memory')]}).`;$('memory-board').innerHTML='';memDeck.forEach((em,i)=>{const b=document.createElement('button');b.className='memory-card';b.textContent='?';b.setAttribute('aria-label','Hidden memory card');b.onclick=()=>flipMemory(i,b);$('memory-board').append(b)})}
 function flipMemory(i,b){if(memLock||memMatched.has(i)||memOpen.some(x=>x.i===i))return;b.textContent=memDeck[i];memOpen.push({i,b});beep(350);if(memOpen.length===2){memMoves++;$('memory-moves').textContent=memMoves;if(memDeck[memOpen[0].i]===memDeck[memOpen[1].i]){memOpen.forEach(x=>{memMatched.add(x.i);x.b.classList.add('matched');x.b.disabled=true;x.b.setAttribute('aria-label','Matched '+memDeck[x.i])});memOpen=[];$('memory-pairs').textContent=memMatched.size/2;score(Math.round(10*levelFactor('memory')));if(memMatched.size===memoryPairCount()*2){$('memory-feedback').textContent=`All pairs matched in ${memMoves} moves! +80 bonus`;$('memory-feedback').className='game-feedback good';score(80);unlock('memory')}}else{memLock=true;setTimeout(()=>{memOpen.forEach(x=>x.b.textContent='?');memOpen=[];memLock=false},650)}}}
 $('reset-memory').onclick=resetMemory;$('difficulty-memory').addEventListener('change',resetMemory);resetMemory();
 // typing
 const phrases=['Reliable systems begin with clear thinking.','Small improvements create excellent experiences.','Linux makes automation powerful and repeatable.','Practice every day to build speed and accuracy.'];let phrase=phrases[0],typingStart=0;
 function resetTyping(){const hardPhrases=['Reliable infrastructure depends on monitoring, redundancy, and thoughtful incident response.','Automate repetitive administrative tasks while protecting credentials and least-privilege access.','Troubleshoot network connectivity by validating routes, DNS resolution, firewall rules, and service health.'];const impossiblePhrases=['Diagnose intermittent packet loss by correlating interface counters, routing convergence, DNS latency, and application telemetry.','Design resilient cloud workloads with least-privilege IAM, multi-zone failover, observable deployments, and tested recovery procedures.'];const pool=gameLevel('typing')==='easy'?phrases.slice(0,2):gameLevel('typing')==='medium'?phrases:gameLevel('typing')==='hard'?hardPhrases:impossiblePhrases;phrase=pool[Math.floor(Math.random()*pool.length)];$('typing-prompt').textContent=phrase;$('typing-input').value='';$('typing-feedback').textContent='Start typing the sentence, then check your result.';typingStart=0}
 $('typing-input').addEventListener('input',()=>{if(!typingStart&&$('typing-input').value)typingStart=Date.now()});$('check-typing').onclick=()=>{const val=$('typing-input').value.trim();if(!val){$('typing-feedback').textContent='Type the sentence first.';return}let correct=0;for(let i=0;i<Math.min(val.length,phrase.length);i++)if(val[i]===phrase[i])correct++;const accuracy=Math.round(correct/Math.max(val.length,phrase.length)*100),mins=Math.max((Date.now()-(typingStart||Date.now()))/60000,.01),wpm=Math.round(val.split(/\s+/).filter(Boolean).length/mins);$('typing-feedback').textContent=`${accuracy}% accuracy · ${wpm} WPM · ${val===phrase?'Perfect match!':'Keep practising for a perfect match.'}`;if(val===phrase){score(60);unlock('speed');$('typing-feedback').className='game-feedback good'}else score(Math.round(accuracy/10));beep(accuracy>80?700:280)};$('reset-typing').onclick=resetTyping;$('difficulty-typing').addEventListener('change',resetTyping);
 // quiz data
 const quizData={linux:[['Which command lists files including hidden entries?',['ls -a','pwd -a','show -all','list -h'],0],['Which command displays the current directory?',['cd','pwd','whoami','where'],1],['Which command changes file permissions?',['chmod','chownall','perm','usermod'],0],['Which command searches text patterns in files?',['grep','touch','mkdir','mv'],0],['Which command shows running processes?',['ps','df','du','cat'],0],['Which command checks disk space by filesystem?',['free -m','df -h','lsblk -f only','uptime'],1]],aws:[['Which AWS service provides virtual servers?',['Amazon S3','Amazon EC2','Amazon Route 53','AWS IAM'],1],['Which service is object storage?',['Amazon EBS','Amazon RDS','Amazon S3','Amazon VPC'],2],['What does IAM primarily manage?',['Identity and access','Image backups','Network latency','Billing invoices only'],0],['Which service is a managed relational database?',['Amazon RDS','Amazon CloudFront','AWS Lambda','Amazon SQS'],0],['What connects a VPC to the public internet for IPv4?',['NAT instance only','Internet Gateway','Security group','Route 53 hosted zone'],1],['Which service runs code in response to events without managing servers?',['AWS Lambda','Amazon EFS','AWS Direct Connect','Amazon Inspector'],0]]};
 const quizState={};function drawQuiz(kind){const data=quizData[kind],st=quizState[kind]||{i:0,answered:false};quizState[kind]=st;const item=data[st.i%data.length];$(kind+'-progress').textContent=`Question ${(st.i%data.length)+1} of ${data.length}`;$(kind+'-question').textContent=item[0];$(kind+'-feedback').textContent='';$(kind+'-options').innerHTML='';item[1].forEach((op,j)=>{const b=document.createElement('button');b.className='quiz-option';b.textContent=String.fromCharCode(65+j)+'. '+op;b.onclick=()=>{if(st.answered)return;st.answered=true;$$('.quiz-option',$(kind+'-options')).forEach(x=>x.disabled=true);const ok=j===item[2];b.classList.add('theme-flash');$(kind+'-feedback').textContent=ok?'Correct! +20 points.':'Not quite. Correct answer: '+item[1][item[2]];$(kind+'-feedback').className='game-feedback '+(ok?'good':'bad');if(ok){score(Math.round(20*levelFactor(kind)));unlock(kind)}beep(ok?780:220)};$(kind+'-options').append(b)});st.answered=false}
 ['linux','aws'].forEach(k=>{drawQuiz(k);$(k+'-next').onclick=()=>{quizState[k].i++;drawQuiz(k)};$(k+'-reset').onclick=()=>{quizState[k].i=0;drawQuiz(k)};$('difficulty-'+k).addEventListener('change',()=>{quizState[k].i=0;drawQuiz(k);$(k+'-feedback').textContent=levelName[gameLevel(k)]+' mode selected. Correct answers award more points on harder levels.'})});
 // Snake
 const cv=$('snake-canvas'),ctx=cv.getContext('2d');let snake,food,dir,nextDir,snakeScore,snakeTimer=null,snakeLive=false;
 function initSnake(){clearInterval(snakeTimer);snake=[{x:5,y:5},{x:4,y:5},{x:3,y:5}];dir={x:1,y:0};nextDir=dir;snakeScore=0;snakeLive=true;food={x:Math.floor(Math.random()*15),y:Math.floor(Math.random()*15)};$('snake-score').textContent='0';$('snake-feedback').textContent='Go! Use arrows or touch controls.';drawSnake();snakeTimer=setInterval(stepSnake,{easy:190,medium:135,hard:95,impossible:60}[gameLevel('snake')])}
 function drawSnake(){ctx.clearRect(0,0,360,360);ctx.fillStyle='#0a111a';ctx.fillRect(0,0,360,360);ctx.strokeStyle='#1e293b';for(let n=0;n<=360;n+=24){ctx.beginPath();ctx.moveTo(n,0);ctx.lineTo(n,360);ctx.stroke();ctx.beginPath();ctx.moveTo(0,n);ctx.lineTo(360,n);ctx.stroke()}ctx.fillStyle='#fb7185';ctx.fillRect(food.x*24+4,food.y*24+4,16,16);snake.forEach((p,i)=>{ctx.fillStyle=i?'#67d7f5':'#a78bfa';ctx.fillRect(p.x*24+2,p.y*24+2,20,20)})}
 function stepSnake(){if(!snakeLive)return;dir=nextDir;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.y<0||h.x>=15||h.y>=15||snake.some(p=>p.x===h.x&&p.y===h.y)){snakeLive=false;clearInterval(snakeTimer);$('snake-feedback').textContent=`Game over — score ${snakeScore}. Tap restart to play again.`;return}snake.unshift(h);if(h.x===food.x&&h.y===food.y){snakeScore++;score(5);$('snake-score').textContent=snakeScore;beep(640);do{food={x:Math.floor(Math.random()*15),y:Math.floor(Math.random()*15)}}while(snake.some(p=>p.x===food.x&&p.y===food.y));if(snakeScore>=5)unlock('snake')}else snake.pop();drawSnake()}
 function setSnakeDir(d){const m={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}[d];if(m&&!(m.x===-dir.x&&m.y===-dir.y))nextDir=m}
 $('snake-start').onclick=initSnake;$('difficulty-snake').addEventListener('change',()=>{if(snakeLive)initSnake();else $('snake-feedback').textContent=levelName[gameLevel('snake')]+' speed selected. Start a new run.'});$$('[data-dir]').forEach(b=>b.onclick=()=>setSnakeDir(b.dataset.dir));
 // 2048
 let grid2048,score2048=0;function addTile(){const e=[];grid2048.forEach((row,r)=>row.forEach((v,c)=>{if(!v)e.push([r,c])}));if(e.length){const [r,c]=e[Math.floor(Math.random()*e.length)];grid2048[r][c]=Math.random()<.9?2:4}}
 function reset2048(){grid2048=Array.from({length:4},()=>[0,0,0,0]);score2048=0;const starts={easy:4,medium:3,hard:2,impossible:1}[gameLevel('2048')];for(let i=0;i<starts;i++)addTile();render2048();$('2048-feedback').textContent='Slide tiles to combine matching numbers.'}
 function render2048(){ $('2048-score').textContent=score2048;const b=$('2048-board');b.innerHTML='';grid2048.flat().forEach(v=>{const d=document.createElement('div');d.className='tile-2048';d.dataset.v=String(v);d.textContent=v||'';b.append(d)}) }
 function move2048(direction){if(!canMove2048())return;const before=JSON.stringify(grid2048);let gained=0;for(let i=0;i<4;i++){let line=direction==='left'||direction==='right'?grid2048[i].slice():grid2048.map(r=>r[i]);if(direction==='right'||direction==='down')line.reverse();line=line.filter(Boolean);const out=[];for(let j=0;j<line.length;j++){if(line[j]===line[j+1]){out.push(line[j]*2);gained+=line[j]*2;j++}else out.push(line[j])}while(out.length<4)out.push(0);if(direction==='right'||direction==='down')out.reverse();if(direction==='left'||direction==='right')grid2048[i]=out;else out.forEach((v,r)=>grid2048[r][i]=v)}if(JSON.stringify(grid2048)!==before){score2048+=gained;if(gained)score(Math.max(1,Math.round(gained/2)));addTile();render2048();if(grid2048.flat().some(v=>v>=128))unlock('2048');if(grid2048.flat().includes(2048))$('2048-feedback').textContent='2048! You did it!';else if(!canMove2048())$('2048-feedback').textContent='No more moves. Tap New Game to restart.';beep(440)}}
 function canMove2048(){for(let r=0;r<4;r++)for(let c=0;c<4;c++){if(!grid2048[r][c])return true;if(c<3&&grid2048[r][c]===grid2048[r][c+1])return true;if(r<3&&grid2048[r][c]===grid2048[r+1][c])return true}return false}
 $('2048-reset').onclick=reset2048;$('difficulty-2048').addEventListener('change',reset2048);$$('[data-2048]').forEach(b=>b.onclick=()=>move2048(b.dataset['2048']));reset2048();
 // Tic tac toe
 let ttt=[],turn='X',tttOver=false;function drawTTT(){const b=$('ttt-board');b.innerHTML='';ttt.forEach((v,i)=>{const x=document.createElement('button');x.className='ttt-cell';x.textContent=v;x.setAttribute('aria-label',`Cell ${i+1} ${v||'empty'}`);x.onclick=()=>playTTT(i);b.append(x)});$('ttt-status').textContent=tttOver?'Round over — start a new round.':turn+' goes next.'}
 function playTTT(i){if(ttt[i]||tttOver)return;ttt[i]=turn;const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];const won=wins.some(w=>w.every(k=>ttt[k]===turn));if(won){tttOver=true;$('ttt-status').textContent=turn+' wins! +50 points';score(Math.round(50*levelFactor('ttt')));unlock('tic');beep(800)}else if(ttt.every(Boolean)){tttOver=true;$('ttt-status').textContent='Draw! Try again.'}else turn=turn==='X'?'O':'X';drawTTT()}
 $('ttt-reset').onclick=()=>{ttt=Array(9).fill('');turn='X';tttOver=false;drawTTT()};$('difficulty-ttt').addEventListener('change',()=>{$('ttt-status').textContent=levelName[gameLevel('ttt')]+' mode selected. Harder levels award more points to the winner.';});ttt=Array(9).fill('');drawTTT();
 // reaction time
 let reactionState='idle',reactionTimer=null,reactionStart=0,best=null;function reactionReset(){clearTimeout(reactionTimer);reactionState='idle';$('reaction-zone').className='reaction-zone';$('reaction-zone').textContent='Tap to begin';$('reaction-feedback').textContent='Tap to start a round.'}
 $('reaction-zone').onclick=()=>{const z=$('reaction-zone');if(reactionState==='idle'||reactionState==='done'){reactionState='waiting';z.className='reaction-zone waiting';z.textContent='Wait for green…';$('reaction-feedback').textContent='Wait for the color to change.';const ranges={easy:[600,1400],medium:[900,2400],hard:[1400,3000],impossible:[2000,4000]};const range=ranges[gameLevel('reaction')];reactionTimer=setTimeout(()=>{reactionState='go';reactionStart=performance.now();z.className='reaction-zone go';z.textContent='TAP NOW!'},range[0]+Math.random()*range[1])}else if(reactionState==='waiting'){clearTimeout(reactionTimer);reactionState='done';z.className='reaction-zone';z.textContent='Too soon!';$('reaction-feedback').textContent='False start — try again.';beep(180)}else if(reactionState==='go'){const ms=Math.round(performance.now()-reactionStart);reactionState='done';z.className='reaction-zone';z.textContent=ms+' ms';$('reaction-feedback').textContent=ms<300?'Lightning fast! +60 points':`Reaction time: ${ms} ms`;score(Math.round(Math.min(100,Math.max(5,Math.round(6000/ms)))*levelFactor('reaction')));if(ms<300)unlock('reflex');if(best===null||ms<best){best=ms;$('reaction-best').textContent=ms+' ms'}beep(ms<300?900:500)}};$('reaction-reset').onclick=reactionReset;$('difficulty-reaction').addEventListener('change',reactionReset);reactionReset();
 document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;const active=$('.arcade-game.active');if(!active)return;const tag=document.activeElement?.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||tag==='BUTTON')return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright'].includes(k)){if(active.dataset.game==='snake'){e.preventDefault();setSnakeDir(k.slice(5))}if(active.dataset.game==='2048'){e.preventDefault();move2048(k.slice(5))}}});
})();
;


/* Extracted script 4 */
;
(()=>{
 const focusItems=['Cloud & Linux fundamentals','Responsive web experiences','Infrastructure architecture concepts','Reliable operations & reporting'];
 const focusText=document.getElementById('hero-focus-text'),focusCount=document.getElementById('hero-focus-count');
 if(focusText&&focusCount&&!matchMedia('(prefers-reduced-motion: reduce)').matches){let i=0;setInterval(()=>{i=(i+1)%focusItems.length;focusText.classList.add('focus-changing');focusText.textContent=focusItems[i];focusCount.textContent=String(i+1).padStart(2,'0')+' / '+String(focusItems.length).padStart(2,'0');setTimeout(()=>focusText.classList.remove('focus-changing'),220)},3600)}
 const labData={
 architecture:{overline:'THREE-TIER CONCEPT',title:'Separate responsibilities. Connect securely.',description:'A common web architecture separates incoming traffic, application processing, and persistent data so each tier can be managed with clear boundaries.',points:['Web tier: Nginx receives and routes requests.','Application tier: Tomcat runs the application layer.','Data tier: a relational database stores application data.'],nodes:[['01','Users','HTTPS requests'],['02','Nginx','Web / reverse proxy'],['03','Tomcat','Application layer'],['04','Relational DB','Persistent data']]},
 linux:{overline:'SERVICE OPERATIONS',title:'Know the service. Check the evidence.',description:'A repeatable Linux troubleshooting flow starts with service status and logs, then checks listening ports, configuration, permissions, and dependencies.',points:['Inspect: systemctl status and journalctl.','Verify: process, port, configuration, and file permissions.','Change carefully: test the fix and re-check service health.'],nodes:[['01','systemctl','Service state'],['02','journalctl','Logs & errors'],['03','ss -tulpn','Listening ports'],['04','Validate','Re-test service']]},
 network:{overline:'CONNECTIVITY CHECKLIST',title:'Trace the path from source to service.',description:'When a connection fails, isolate the layer instead of changing several settings at once. Validate addressing, routing, DNS, firewall rules, and the destination service.',points:['Confirm IP address, subnet, and default route.','Check DNS resolution and reachability to the destination.','Review security groups, firewalls, ports, and service listeners.'],nodes:[['01','Client','IP & subnet'],['02','DNS / Route','Name & path'],['03','Firewall','Rules & ports'],['04','Service','Listener health']]},
 monitoring:{overline:'OBSERVABILITY BASICS',title:'Use signals to spot and explain issues.',description:'Monitoring is most useful when metrics, logs, and alarms help connect a symptom to a likely cause and support a clear follow-up action.',points:['Metrics: CPU, memory, disk, and service availability.','Logs: timestamps, errors, and repeated failure patterns.','Alerts: thresholds, context, and a documented response.'],nodes:[['01','Metrics','Resource signals'],['02','Logs','Event context'],['03','Alarm','Threshold breach'],['04','Response','Investigate & record']]}
 };
 const tabs=[...document.querySelectorAll('.lab-tab')],panel=document.getElementById('lab-panel');
 function showLab(key){const d=labData[key];if(!d||!panel)return;document.getElementById('lab-overline').textContent=d.overline;document.getElementById('lab-title').textContent=d.title;document.getElementById('lab-description').textContent=d.description;const ul=document.getElementById('lab-points');ul.replaceChildren(...d.points.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));const diagram=document.getElementById('lab-diagram');diagram.replaceChildren();d.nodes.forEach((n,i)=>{const node=document.createElement('div');node.className='lab-node'+(i===1?' accent-node':'')+(i===2?' accent-node blue-node':'');const num=document.createElement('span');num.textContent=n[0];const strong=document.createElement('strong');strong.textContent=n[1];const small=document.createElement('small');small.textContent=n[2];node.append(num,strong,small);diagram.append(node);if(i<d.nodes.length-1){const arrow=document.createElement('div');arrow.className='lab-connector';arrow.textContent='↓';diagram.append(arrow)}});tabs.forEach(t=>{const active=t.dataset.lab===key;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active))})}
 tabs.forEach(t=>t.addEventListener('click',()=>showLab(t.dataset.lab)));showLab('architecture');
 const heroRole=document.querySelector('.hero-focus');if(heroRole){const style=document.createElement('style');style.textContent='.focus-changing{animation:focusChange .22s ease}@keyframes focusChange{from{opacity:.35;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}';document.head.append(style)}
})();
;


/* Extracted script 5 */
;
(() => {
 const root=document.documentElement,panel=document.getElementById('personalize-panel'),backdrop=document.getElementById('personalize-backdrop');if(!panel||!backdrop)return;
 const $=id=>document.getElementById(id),key='mukul-portfolio-personalization';
 const defaults={accent:'violet',font:100,contrast:false,motion:false,compact:false,readable:false,corners:'rounded',background:'grid',focus:'system',motionLevel:'subtle',pageBg:'',cardBg:'',borderColor:'',glow:25,fontFamily:'default',lineHeight:17,letterSpace:0,contentWidth:'89%',shadow:25,ambient:true,hover:true,animatedBorder:false,viewport:'100%'};
 const palettes={violet:{dark:['#a78bfa','#67d7f5'],light:['#7552dc','#138cb4']},ocean:{dark:['#38bdf8','#818cf8'],light:['#0369a1','#4f46e5']},mint:{dark:['#34d399','#5eead4'],light:['#047857','#0f766e']},sunset:{dark:['#fb923c','#fb7185'],light:['#c2410c','#be123c']}};
 let prefs={...defaults},history=[];try{prefs={...prefs,...JSON.parse(localStorage.getItem(key)||'{}')}}catch(_){}
 // Restore the original focused width once, while preserving other preferences and future width choices.
 try{const widthResetKey='mukul-portfolio-content-width-reset-v2';if(!localStorage.getItem(widthResetKey)){prefs.contentWidth='89%';localStorage.setItem(key,JSON.stringify(prefs));localStorage.setItem(widthResetKey,'done')}}catch(_){prefs.contentWidth='89%'}

 const base={bg:'#0b0d13',surface:'#121621',line:'rgba(174,190,220,.14)'};
 function status(msg){const el=$('pref-status');if(el)el.textContent=msg}
 function snapshot(){history.push(JSON.stringify(prefs));if(history.length>25)history.shift()}
 function apply(save=true){const mode=root.dataset.theme==='light'?'light':'dark',colors=(palettes[prefs.accent]||palettes.violet)[mode];root.style.setProperty('--accent',colors[0]);root.style.setProperty('--accent2',colors[1]);root.style.fontSize=prefs.font+'%';root.style.setProperty('--bg',prefs.pageBg||(mode==='dark'?base.bg:'#f6f7fb'));root.style.setProperty('--surface',prefs.cardBg||(mode==='dark'?base.surface:'#fff'));root.style.setProperty('--line',prefs.borderColor?prefs.borderColor+'55':(mode==='dark'?base.line:'rgba(45,58,88,.14)'));root.style.setProperty('--shadow',`0 24px 70px rgba(0,0,0,${Number(prefs.shadow||25)/100})`);root.style.setProperty('--personal-glow',Number(prefs.glow||0)/100);root.style.setProperty('--personal-content-width',prefs.contentWidth||'89%');root.style.setProperty('--personal-line-height',Number(prefs.lineHeight||17)/10);root.style.setProperty('--personal-letter-space',(Number(prefs.letterSpace)||0)+'px');root.dataset.contrast=prefs.contrast?'high':'normal';root.dataset.motion=(prefs.motion||prefs.motionLevel==='off')?'reduced':'normal';root.dataset.compact=String(!!prefs.compact);root.dataset.readable=String(!!prefs.readable);root.dataset.corners=prefs.corners||'rounded';root.dataset.background=prefs.background||'grid';root.dataset.focus=prefs.focus||'system';root.dataset.fontFamily=prefs.fontFamily||'default';root.dataset.effects=!prefs.ambient?'off':(!prefs.hover?'nohover':(prefs.animatedBorder?'animated':'on'));root.dataset.animatedBorder=String(!!prefs.animatedBorder);root.dataset.viewport=prefs.viewport==='390px'?'mobile':prefs.viewport==='768px'?'tablet':'desktop';document.body.style.lineHeight=String(Number(prefs.lineHeight||17)/10);document.body.style.letterSpacing=(Number(prefs.letterSpace)||0)+'px';document.querySelectorAll('.section-wrap').forEach(el=>{el.style.width='';});document.querySelectorAll('.section-wrap').forEach(el=>{if(el.closest('.personalize-panel'))return;el.style.maxWidth=prefs.contentWidth==='98%'?'1400px':prefs.contentWidth==='94%'?'1240px':'';el.style.width=prefs.contentWidth||'89%'});
  const ids={'pref-font-size':prefs.font,'pref-contrast':!!prefs.contrast,'pref-motion':!!prefs.motion,'pref-compact':!!prefs.compact,'pref-readable':!!prefs.readable,'pref-corners':prefs.corners,'pref-background':prefs.background,'pref-focus':prefs.focus,'pref-motion-level':prefs.motionLevel,'pref-page-bg':prefs.pageBg|| (mode==='dark'?base.bg:'#f6f7fb'),'pref-card-bg':prefs.cardBg||(mode==='dark'?base.surface:'#fff'),'pref-border-color':prefs.borderColor||'#343b4d','pref-glow':prefs.glow,'pref-font-family':prefs.fontFamily,'pref-line-height':prefs.lineHeight,'pref-letter-space':prefs.letterSpace,'pref-content-width':prefs.contentWidth,'pref-shadow':prefs.shadow,'pref-ambient':!!prefs.ambient,'pref-hover':!!prefs.hover,'pref-animated-border':!!prefs.animatedBorder,'pref-viewport':prefs.viewport};Object.entries(ids).forEach(([id,v])=>{const el=$(id);if(el)el.type==='checkbox'?el.checked=v:el.value=v});
  [['pref-font-output',prefs.font+'%'],['pref-glow-output',prefs.glow+'%'],['pref-line-output',(Number(prefs.lineHeight)/10).toFixed(1)],['pref-letter-output',prefs.letterSpace+'px'],['pref-shadow-output',prefs.shadow+'%']].forEach(([id,v])=>{if($(id))$(id).textContent=v});document.querySelectorAll('.accent-swatch').forEach(b=>{const active=b.dataset.accent===prefs.accent;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});$('pref-theme').textContent=mode==='light'?'Use dark mode':'Use light mode';if(save){try{localStorage.setItem(key,JSON.stringify(prefs))}catch(_){}} }
 function syncThemeButtons(){document.querySelectorAll('.theme-toggle').forEach(btn=>{const light=root.dataset.theme==='light',label=btn.querySelector('.theme-label'),icon=btn.querySelector('.theme-icon');if(label)label.textContent=light?'Dark mode':'Light mode';if(icon)icon.textContent=light?'☾':'☼';btn.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode')})}
 function open(){panel.hidden=false;backdrop.hidden=false;document.body.style.overflow='hidden';$('personalize-close').focus()}function close(){panel.hidden=true;backdrop.hidden=true;document.body.style.overflow='';$('personalize-open').focus()}
 function change(k,v){snapshot();prefs[k]=v;apply();status('Changes applied and saved in this browser.')}
 $('personalize-open').addEventListener('click',open);$('personalize-close').addEventListener('click',close);backdrop.addEventListener('click',close);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close()});
 $('pref-theme').addEventListener('click',()=>{snapshot();root.dataset.theme=root.dataset.theme==='light'?'dark':'light';try{localStorage.setItem('mukul-portfolio-theme',root.dataset.theme)}catch(_){}syncThemeButtons();apply()});
 document.querySelectorAll('.accent-swatch').forEach(b=>b.addEventListener('click',()=>change('accent',b.dataset.accent)));
 const binds={'pref-font-size':['font',Number],'pref-contrast':['contrast',Boolean],'pref-motion':['motion',Boolean],'pref-compact':['compact',Boolean],'pref-readable':['readable',Boolean],'pref-corners':['corners',String],'pref-background':['background',String],'pref-focus':['focus',String],'pref-motion-level':['motionLevel',String],'pref-page-bg':['pageBg',String],'pref-card-bg':['cardBg',String],'pref-border-color':['borderColor',String],'pref-glow':['glow',Number],'pref-font-family':['fontFamily',String],'pref-line-height':['lineHeight',Number],'pref-letter-space':['letterSpace',Number],'pref-content-width':['contentWidth',String],'pref-shadow':['shadow',Number],'pref-ambient':['ambient',Boolean],'pref-hover':['hover',Boolean],'pref-animated-border':['animatedBorder',Boolean],'pref-viewport':['viewport',String]};Object.entries(binds).forEach(([id,[k,cast]])=>$(id).addEventListener(['pref-font-size','pref-glow','pref-line-height','pref-letter-space','pref-shadow'].includes(id)?'input':'change',e=>change(k,cast(e.target.type==='checkbox'?e.target.checked:e.target.value))));
 const presetDefs={professional:{accent:'ocean',pageBg:'#0d1422',cardBg:'#141f30',borderColor:'#3c5878',glow:15,fontFamily:'default',background:'clean',shadow:20},cyber:{accent:'ocean',pageBg:'#07131b',cardBg:'#0c1d29',borderColor:'#20566b',glow:55,fontFamily:'mono',background:'terminal',shadow:35},purple:{accent:'violet',pageBg:'#100b1c',cardBg:'#1b132b',borderColor:'#57416e',glow:50,background:'grid',shadow:35},emerald:{accent:'mint',pageBg:'#08140f',cardBg:'#102219',borderColor:'#285a3e',glow:35,fontFamily:'mono',background:'terminal',shadow:25},minimal:{accent:'ocean',pageBg:'#f6f7fb',cardBg:'#ffffff',borderColor:'#cbd3e1',glow:0,fontFamily:'system',background:'clean',shadow:10}};
 $('pref-preset').addEventListener('change',e=>{const def=presetDefs[e.target.value];if(!def)return;snapshot();prefs={...prefs,...def};if(e.target.value==='minimal')root.dataset.theme='light';else root.dataset.theme='dark';syncThemeButtons();apply();status('Preset applied: '+e.target.options[e.target.selectedIndex].text)});
 $('pref-undo').addEventListener('click',()=>{if(!history.length){status('Nothing to undo yet.');return}try{prefs=JSON.parse(history.pop());apply();status('Last change undone.')}catch(_){status('Could not restore the previous settings.')}});
 $('pref-reset').addEventListener('click',()=>{snapshot();prefs={...defaults};root.dataset.theme='dark';try{localStorage.removeItem('mukul-portfolio-theme')}catch(_){}syncThemeButtons();apply();status('All personalization settings reset.')});$('pref-reset-category').addEventListener('click',()=>{snapshot();['accent','pageBg','cardBg','borderColor','glow','background','corners','shadow','ambient','hover','animatedBorder','fontFamily','lineHeight','letterSpace','contentWidth','font'].forEach(k=>prefs[k]=defaults[k]);apply();status('Appearance and typography settings reset.')});
 $('pref-save-preset').addEventListener('click',()=>{try{localStorage.setItem('mukul-portfolio-custom-preset',JSON.stringify(prefs));status('Your custom preset has been saved in this browser.')}catch(_){status('Browser storage is unavailable.')}});
 $('pref-load-preset').addEventListener('click',()=>{try{const saved=localStorage.getItem('mukul-portfolio-custom-preset');if(!saved){status('No saved custom preset was found on this browser.');return}const incoming=JSON.parse(saved);snapshot();prefs={...defaults,...incoming};apply();status('Your saved custom preset has been loaded.')}catch(_){status('Could not load the saved preset.')}});
 $('pref-export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(prefs,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mukul-portfolio-settings.json';a.click();URL.revokeObjectURL(url);status('Settings exported as JSON.')});$('pref-import').addEventListener('click',()=>$('pref-import-file').click());$('pref-import-file').addEventListener('change',async e=>{const file=e.target.files&&e.target.files[0];if(!file)return;try{const incoming=JSON.parse(await file.text());if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))throw new Error('Invalid settings');snapshot();prefs={...defaults};Object.keys(defaults).forEach(k=>{if(Object.prototype.hasOwnProperty.call(incoming,k)&&typeof incoming[k]===typeof defaults[k])prefs[k]=incoming[k]});prefs.font=Math.min(115,Math.max(90,Number(prefs.font)||100));prefs.glow=Math.min(70,Math.max(0,Number(prefs.glow)||0));prefs.shadow=Math.min(60,Math.max(0,Number(prefs.shadow)||0));prefs.lineHeight=Math.min(22,Math.max(14,Number(prefs.lineHeight)||17));apply();status('Settings imported successfully.')}catch(_){status('Invalid settings file. Please choose a valid exported JSON file.')}e.target.value=''});
 document.querySelectorAll('.theme-toggle').forEach(btn=>btn.addEventListener('click',()=>setTimeout(()=>{syncThemeButtons();apply()},0)));syncThemeButtons();apply();
})();
;


/* Extracted script 6 */
;
(()=>{
 const reduceQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.documentElement;
 const motionToggle=document.getElementById('globe-motion-toggle');
 const globe=document.getElementById('network-globe-canvas');
 const bg=document.getElementById('ambient-network-canvas');
 const glow=document.getElementById('cursor-glow');
 let globePaused=reduceQuery.matches, raf=0, bgRaf=0, pointer={x:-1000,y:-1000}, lastPointerMove=0;
 const setMotion=()=>{root.dataset.reduceMotion=String(reduceQuery.matches || document.getElementById('pref-motion')?.checked===true);if(motionToggle){motionToggle.textContent=globePaused?'Resume globe':'Pause globe';motionToggle.setAttribute('aria-pressed',String(globePaused));}};
 motionToggle?.addEventListener('click',()=>{globePaused=!globePaused;setMotion();document.dispatchEvent(new CustomEvent('portfolio-globe-motion'));});
 document.getElementById('pref-motion')?.addEventListener('change',setMotion);
 document.getElementById('pref-motion-level')?.addEventListener('change',e=>{root.dataset.motionLevel=e.target.value;});
 reduceQuery.addEventListener?.('change',()=>{globePaused=reduceQuery.matches;setMotion();});
 window.addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;lastPointerMove=performance.now();if(glow){glow.style.left=pointer.x+'px';glow.style.top=pointer.y+'px';glow.style.opacity=matchMedia('(pointer:fine)').matches && !reduceQuery.matches?'1':'0';}},{passive:true});
 window.addEventListener('pointerleave',()=>{if(glow)glow.style.opacity='0';});
 function sizeCanvas(canvas,ctx){const dpr=Math.min(window.devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);return {w:r.width,h:r.height};}
 if(globe){const ctx=globe.getContext('2d');let w=0,h=0,angle=0,nodes=[];const kinds=['cloud','server','network','network','server','cloud'];
 function globeResize(){const d=sizeCanvas(globe,ctx);w=d.w;h=d.h;nodes=[];const count=48;for(let i=0;i<count;i++){const y=1-(i/(count-1))*2;const radius=Math.sqrt(1-y*y);const theta=i*Math.PI*(3-Math.sqrt(5));nodes.push({x:Math.cos(theta)*radius,y,z:Math.sin(theta)*radius,type:kinds[i%kinds.length],phase:i*.7});}}
 function drawGlobe(){ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,R=Math.min(w*.34,h*.39,170);if(!globePaused&&!reduceQuery.matches&&document.visibilityState==='visible')angle+=.003;const projected=nodes.map(n=>{const x=n.x*Math.cos(angle)-n.z*Math.sin(angle),z=n.x*Math.sin(angle)+n.z*Math.cos(angle);return {...n,px:cx+x*R,py:cy+n.y*R,z};});
 const grad=ctx.createRadialGradient(cx-R*.25,cy-R*.3,4,cx,cy,R*1.2);grad.addColorStop(0,'rgba(80,165,255,.13)');grad.addColorStop(1,'rgba(90,105,220,.015)');ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fillStyle=grad;ctx.fill();ctx.strokeStyle='rgba(113,171,255,.28)';ctx.lineWidth=1;ctx.stroke();
 // latitude and longitude arcs
 ctx.save();ctx.beginPath();ctx.arc(cx,cy,R*.68,0,Math.PI*2);ctx.strokeStyle='rgba(115,170,255,.13)';ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,R,R*.38,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,R*.48,R,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 const maxDist=Math.min(w,h)*.2;projected.forEach((a,i)=>{for(let j=i+1;j<projected.length;j++){const b=projected[j],dx=a.px-b.px,dy=a.py-b.py;if(dx*dx+dy*dy<maxDist*maxDist && a.z>-.2 && b.z>-.2){ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);ctx.strokeStyle=`rgba(108,176,255,${.05+Math.max(0,(a.z+b.z)/2)*.15})`;ctx.lineWidth=.7;ctx.stroke();}}});
 const colors={cloud:'#75d8ff',server:'#a99aff',network:'#75e5b6'};projected.forEach(n=>{if(n.z<-.42)return;const rr=(n.type==='cloud'?2.6:2)+(n.z+1)*.8;ctx.beginPath();ctx.arc(n.px,n.py,rr,0,Math.PI*2);ctx.fillStyle=colors[n.type];ctx.globalAlpha=.38+Math.max(0,n.z)*.62;ctx.fill();if(n.z>.35){ctx.beginPath();ctx.arc(n.px,n.py,rr+3,0,Math.PI*2);ctx.strokeStyle=colors[n.type];ctx.globalAlpha=.22;ctx.stroke();}ctx.globalAlpha=1;});
 if(!globePaused&&!reduceQuery.matches)raf=requestAnimationFrame(drawGlobe);}
 globeResize();drawGlobe();document.addEventListener('portfolio-globe-motion',()=>{cancelAnimationFrame(raf);drawGlobe()});window.addEventListener('resize',()=>{cancelAnimationFrame(raf);globeResize();drawGlobe();},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){cancelAnimationFrame(raf);drawGlobe()}else cancelAnimationFrame(raf)});
 }
 if(bg){const ctx=bg.getContext('2d');let w=0,h=0,particles=[];function bgResize(){const d=sizeCanvas(bg,ctx);w=d.w;h=d.h;const count=Math.min(65,Math.max(22,Math.floor(w*h/22000)));particles=Array.from({length:count},(_,i)=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:Math.random()*1.6+.5}));}
 function drawBg(){ctx.clearRect(0,0,w,h);const off=reduceQuery.matches||document.getElementById('pref-motion')?.checked||document.getElementById('pref-motion-level')?.value==='off';const drawParticles=()=>{for(let i=0;i<particles.length;i++){const a=particles[i];if(!off){a.x+=a.vx;a.y+=a.vy;if(a.x<0||a.x>w)a.vx*=-1;if(a.y<0||a.y>h)a.vy*=-1;}ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fillStyle='rgba(111,177,255,.42)';ctx.fill();for(let j=i+1;j<particles.length;j++){const b=particles[j],dx=a.x-b.x,dy=a.y-b.y,dist=Math.hypot(dx,dy);if(dist<115){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(111,177,255,${(1-dist/115)*.13})`;ctx.lineWidth=.7;ctx.stroke();}}}};if(root.dataset.motionLevel!=='off')drawParticles();if(!reduceQuery.matches&&!document.getElementById('pref-motion')?.checked&&document.visibilityState==='visible')bgRaf=requestAnimationFrame(drawBg);}
 bgResize();drawBg();window.addEventListener('resize',()=>{cancelAnimationFrame(bgRaf);bgResize();drawBg()},{passive:true});document.getElementById('pref-motion')?.addEventListener('change',()=>{cancelAnimationFrame(bgRaf);drawBg()});document.getElementById('pref-motion-level')?.addEventListener('change',()=>{cancelAnimationFrame(bgRaf);drawBg()});document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(bgRaf);if(document.visibilityState==='visible')drawBg()});}
 setMotion();
})();
;


/* Extracted script 7 */
;
/* Accessible reveal-on-scroll enhancement; content remains visible if observers are unavailable. */
(function () {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var targets = document.querySelectorAll('main section, section, .project-card, .skill-card, .experience-card, .timeline-item');
    if (!targets.length || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('fx-reveal-ready');
    targets.forEach(function (el, i) {
      if (el.classList.contains('fx-reveal')) return;
      el.classList.add('fx-reveal');
      el.style.transitionDelay = (i % 4) * 55 + 'ms';
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fx-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
    targets.forEach(function (el) { observer.observe(el); });
  } catch (e) { /* Progressive enhancement: preserve normal page behavior. */ }
})();
;


/* Extracted script 8 */
;
/* Reliable mobile menu and personalization close behavior */
(() => {
  const nav = document.querySelector('.site-header .nav-links');
  const toggle = document.querySelector('.site-header .menu-toggle');
  const panel = document.getElementById('personalize-panel');
  const backdrop = document.getElementById('personalize-backdrop');
  const openButton = document.getElementById('personalize-open');
  const closeButton = document.getElementById('personalize-close');
  function closeMenu() {
    nav?.classList.remove('nav-open'); toggle?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded','false');
  }
  function closePanel() {
    if (!panel || !backdrop) return;
    panel.hidden = true; backdrop.hidden = true; document.body.style.overflow = '';
    openButton?.setAttribute('aria-expanded','false');
  }
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  openButton?.addEventListener('click', closeMenu);
  closeButton?.addEventListener('click', closePanel, true);
  backdrop?.addEventListener('click', closePanel, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (panel && !panel.hidden) closePanel(); closeMenu(); } });
  if (window.matchMedia('(max-width: 780px)').matches) closeMenu();
})();
;


/* Extracted script 9 */
;
/* Safe, simulated portfolio terminal: no shell, network, or system commands. */
(() => {
 const form=document.getElementById('terminal-form'), input=document.getElementById('terminal-input'), output=document.getElementById('terminal-output');
 if(!form||!input||!output||form.dataset.ready) return; form.dataset.ready='true';
 const history=[]; let historyIndex=0;
 const categories={
  Profile:{about:'Your introduction and professional summary',profile:'Short profile summary',whoami:'Show the simulated visitor identity',hostname:'Show the portfolio host label',neofetch:'Portfolio system profile',fastfetch:'Compact portfolio system summary'},
  Skills:{skills:'Show technical skill areas',stack:'Languages, frameworks and tools',focus:'Current learning focus',reporting:'Reporting and analytics skills'},
  AWS:{aws:'AWS architecture project overview','aws architecture':'Explain the 3-tier architecture','aws services':'List core AWS services in this portfolio','aws projects':'Show AWS-related projects'},
  Linux:{linux:'Linux and operations overview',pwd:'Show the simulated working directory',ls:'List simulated portfolio directories',tree:'Show the portfolio directory tree',grep:'Search simulated portfolio text files',uptime:'Show fictional demo uptime',network:'Networking concepts and troubleshooting'},
  Projects:{projects:'Featured portfolio projects','projects --details':'Show project summaries'},
  Career:{experience:'Career background',education:'Education information',certifications:'Verified certifications only',resume:'Resume download information',contact:'Contact options'},
  Utilities:{help:'Show command help','help --all':'Show every command by category','help aws':'Show AWS command help',date:'Show the current local date',theme:'Change terminal accent theme',matrix:'Show a short Matrix-style animation',fortune:'Display a random developer quote',cowsay:'Print a message in ASCII cow art',cat:'Read a simulated portfolio text file',complete:'Show keyboard completion tips',clear:'Clear terminal output',home:'Return to the top of the page'}
 };
 const commands={
  help:(args)=>({lines:args.includes('--all')?categoryHelp():args[0]?categorySpecific(args[0]):['Quick help: type a command or start typing to see suggestions.','Use help --all for every command, or help aws for AWS commands.','Keyboard: Tab completes; ↑ / ↓ browse history; Esc closes suggestions.']}),
  about:()=>({lines:['Mukul Singanjude','Front-end Developer & System Engineer','I build user-focused web experiences and work across cloud fundamentals and reliable operations.']}),
  skills:()=>({lines:['Frontend: Angular, TypeScript, JavaScript, HTML, CSS','Cloud & infrastructure: AWS fundamentals, EC2, S3, IAM, VPC','Systems: Linux administration, networking, troubleshooting','Reporting: Excel, SQL and Power BI fundamentals']}),
  stack:()=>({lines:['Languages & frontend: HTML, CSS, JavaScript, TypeScript, Angular','Cloud: AWS service and architecture fundamentals','Systems: Linux, web servers, permissions, services and logs','Tools & reporting: Git, VS Code, Excel, SQL, Power BI']}),
  profile:()=>({lines:['Mukul Singanjude','Front-end Developer & System Engineer','Interested in practical web experiences, cloud fundamentals, Linux administration and reliable operations.']}),
  whoami:()=>({lines:['mukul — simulated portfolio profile','Access level: simulated guest','No account, server, or system access is available from this terminal.']}),
  hostname:()=>({lines:['mukul-portfolio.local (fictional demo hostname)','This label is for the portfolio simulation only; it is not a real network host.']}),
  pwd:()=>({lines:['/home/mukul/portfolio (simulated directory)']}),
  ls:()=>({lines:['about/   skills/   projects/   experience/   contact/','aws-3-tier/   job-check/   connect-my-doc/','These are portfolio sections, not files on a real filesystem.']}),
  uptime:()=>({lines:['Demo uptime: 12 days, 04 hours (fictional sample value)','This is a decorative example, not measured server uptime.']}),
  date:()=>({lines:[new Date().toLocaleString(undefined,{dateStyle:'full',timeStyle:'short'})]}),
  neofetch:()=>({lines:['        .--.       mukul@portfolio','       |o_o |      ----------------','       |:_/ |      Role: System Engineer','      //   \\     Focus: Web · Cloud · Operations','     (|     | )    Mode: Safe simulation','      /_____|\\    Host: mukul-portfolio.local (demo)']}),
  fastfetch:()=>({lines:['mukul@portfolio','----------------','OS: MukulOS Portfolio Simulation','Role: System Engineer','Focus: Frontend · AWS · Linux · Reporting','Projects: Job-Check · AWS 3-Tier · Connect My Doc','Shell: portfolio-sim (not a real shell)']}),
  network:()=>({lines:['Networking topics: DNS, routing, VPN, VPC, security groups and connectivity troubleshooting.','Learning overview only; this command does not inspect your network.']}),
  reporting:()=>({lines:['Reporting & analytics: Excel, SQL, Power BI, report preparation and distribution.','Use these skills to turn complex information into clear, practical reporting.']}),
  focus:()=>({lines:['Current focus: Cloud & Linux fundamentals','Also exploring responsive web experiences, infrastructure architecture concepts, and reliable operations & reporting.']}),
  projects:(args)=>({lines:args.includes('--details')?['Job-Check — responsive job-related web project','AWS 3-Tier Architecture — cloud architecture learning project','Connect My Doc — telehealth interface and service-design work']:['Featured projects in this portfolio:','Job-Check — job-related web project','AWS 3-Tier Architecture — cloud architecture project','Connect My Doc — web project'],links:[['Open projects page','projects.html']]}),
  experience:()=>({lines:['Current: System Engineer at Cross Country Infotech.','Previous: Front-end development experience at Pratian Technology.'],links:[['Read about me','about.html']]}),
  aws:(args)=>({lines:args[0]==='architecture'?['AWS 3-tier flow: users → load balancer/web entry → application tier → database tier.','Network controls and monitoring support the layers. Select components in the interactive architecture below.']:args[0]==='services'?['EC2 — compute','S3 — object storage','IAM — identity and access management','VPC — network isolation and routing','RDS — managed relational database','CloudWatch — monitoring and logs']:args[0]==='projects'?['AWS 3-Tier Architecture — illustrative cloud architecture project','This is a project summary, not a live AWS connection.']:['AWS 3-Tier Architecture','A portfolio project illustrating a layered cloud architecture.','This is a project summary, not a connection to a live AWS account.'],links:[['View projects','projects.html#aws-architecture']]}),
  linux:()=>({lines:['Linux and operations focus','Package management, permissions, services, logs, storage and networking fundamentals.','This simulator does not execute Linux commands on a real machine.']}),
  contact:()=>({lines:['Want to connect or discuss a project?','Open the Contact section for the available contact options.'],links:[['Go to contact page','contact.html']]}),
  certifications:()=>({lines:['No verified certification details are configured in this portfolio yet.','Add only certifications you have earned, with issuer and date.']}),
  resume:()=>({lines:['Use the Download Resume button in the hero/contact area to download the configured resume file.','Check that the linked resume file is present before publishing.']}),
  education:()=>({lines:['Education details have not been configured in this terminal yet.','Add your real qualification, institution, and graduation year to display them here.']}),
  theme:(args)=>{const terminal=document.getElementById('portfolio-terminal');const themes=['ocean','purple','mint','sunset'];if(!args.length)return {lines:['Usage: theme ocean | purple | mint | sunset','Accent themes affect terminal highlights only; the green prompt stays green.']};const chosen=args[0];if(!themes.includes(chosen))return {lines:['Unknown accent theme: '+chosen,'Choose ocean, purple, mint, or sunset.']};terminal.classList.remove(...themes.map(t=>'theme-'+t));terminal.classList.add('theme-'+chosen);return {lines:['Terminal accent changed to '+chosen+'.','The green prompt and website dark/light mode are unchanged.'],tone:'success'};},
  cat:(args)=>{const file=(args[0]||'').split('/').pop();const files={'about.txt':['Mukul Singanjunde','System Engineer | Frontend · Cloud · Operations','Interested in building useful web experiences and learning practical infrastructure skills.'],'skills.txt':['Frontend: Angular, TypeScript, JavaScript, HTML, CSS','AWS & Cloud: EC2, S3, IAM, VPC fundamentals','Linux & Networking: administration, DNS concepts, troubleshooting','Reporting & Analytics: Excel, SQL and Power BI fundamentals'],'projects.txt':['Job-Check — job-related web project','AWS 3-Tier Architecture — cloud architecture learning project','Connect My Doc — web project']};return files[file]?{lines:files[file]}:{lines:['cat: simulated file not found: '+(args[0]||'(missing filename)'),'Available files: about.txt, skills.txt, projects.txt.']};},
  tree:()=>({lines:['portfolio/','├── about.txt','├── skills.txt','├── projects.txt','├── experience/','├── aws-3-tier/','├── job-check/','└── connect-my-doc/','Simulated directory tree; no real files were read.']}),
  grep:(args)=>{const term=args[0]||'';const file=(args[1]||'skills.txt').split('/').pop();const files={'about.txt':['Mukul Singanjunde','System Engineer | Frontend · Cloud · Operations','Interested in building useful web experiences and learning practical infrastructure skills.'],'skills.txt':['Frontend: Angular, TypeScript, JavaScript, HTML, CSS','AWS & Cloud: EC2, S3, IAM, VPC fundamentals','Linux & Networking: administration, DNS concepts, troubleshooting','Reporting & Analytics: Excel, SQL and Power BI fundamentals'],'projects.txt':['Job-Check — job-related web project','AWS 3-Tier Architecture — cloud architecture learning project','Connect My Doc — web project']};if(!term)return {lines:['Usage: grep <word> <about.txt|skills.txt|projects.txt>']};const matches=(files[file]||[]).filter(line=>line.toLowerCase().includes(term.toLowerCase()));return {lines:files[file]?(matches.length?matches.map(line=>file+': '+line):['No matches for +term+ in '+file+'.']):['grep: simulated file not found: '+file,'Available files: about.txt, skills.txt, projects.txt.']};},
  matrix:()=>({lines:['Wake up, Mukul...','░▒▓ M U K U L   O S ▓▒░','01001000 01000101 01001100 01001100 01001111','Matrix effect simulated — no background process is running.']}),
  fortune:()=>({lines:[['“First, solve the problem. Then, write the code.” — John Johnson','“Simplicity is the soul of efficiency.” — Austin Freeman','“It works on my machine” is not a monitoring strategy.'][Math.floor(Math.random()*3)]]}),
  cowsay:(args)=>{const msg=args.join(' ')||'Hello from Mukul’s portfolio!';const safe=msg.slice(0,64);const bar='-' .repeat(Math.max(4,safe.length+2));return {lines:[' '+bar,'< '+safe+' >',' '+bar,'        ^__^','        (oo)_______','        (__)       )','            ||----w |','            ||     ||']};},
  complete:()=>({lines:['Type part of a command to see suggestions and descriptions.','Press Tab to complete a unique match; use ↑ / ↓ for command history.','For multiword commands, type the full phrase such as aws architecture.']}),
  home:()=>({lines:['Returning to the top of the homepage.'],action:()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}),
  clear:()=>({clear:true})
 };
 function categoryHelp(){const lines=['COMMAND DIRECTORY — grouped by category'];Object.entries(categories).forEach(([group,items])=>{lines.push('');lines.push('['+group+']');Object.entries(items).forEach(([cmd,desc])=>lines.push('  '+cmd.padEnd(23,' ')+desc));});lines.push('','All commands are simulated; no real shell or system commands run.');return lines;}
 function categorySpecific(group){const key=group.toLowerCase();const entry=Object.entries(categories).find(([name])=>name.toLowerCase()===key);if(!entry)return ['Unknown help category: '+group,'Available categories: Profile, Skills, AWS, Linux, Projects, Career, Utilities.','Try help --all for the full directory.'];return ['['+entry[0]+']',...Object.entries(entry[1]).map(([cmd,desc])=>'  '+cmd+' — '+desc)];}
 function addLine(text,cls=''){const p=document.createElement('p');p.className='terminal-line'+(cls?' '+cls:'');p.textContent=text;output.appendChild(p);return p;}
 function addCommandLine(command){const p=document.createElement('p');p.className='terminal-line command';const prompt=document.createElement('span');prompt.className='terminal-command-prompt';prompt.textContent='mukul@portfolio:~$ ';const cmd=document.createElement('span');cmd.textContent=command;p.append(prompt,cmd);output.appendChild(p);return p;}
 function run(raw){const entered=raw.trim();if(!entered)return;const normalized=entered.toLowerCase();addCommandLine(entered);if(normalized==='clear'){output.replaceChildren();return;}
  let key=normalized,args=[];
  if(normalized.startsWith('help ')){key='help';args=normalized.slice(5).trim().split(/\s+/).filter(Boolean);}
  else if(normalized.startsWith('aws ')){key='aws';args=normalized.slice(4).trim().split(/\s+/).filter(Boolean);}
  else if(normalized.startsWith('projects ')){key='projects';args=normalized.slice(9).trim().split(/\s+/).filter(Boolean);}
  else {const parts=normalized.split(/\s+/);key=parts.shift();args=parts;}
  if(!commands[key]){const candidates=Object.keys(categories).flatMap(k=>Object.keys(categories[k])).filter(n=>n.startsWith(key)).slice(0,5);addLine('Command not found: '+key+'. No command was executed.','error');addLine(candidates.length?'Did you mean: '+candidates.join(', ')+'?':'Tip: type help --all or start typing for suggestions.','tone-amber');return;}
  const result=commands[key](args);if(result.clear){output.replaceChildren();return;}
  (result.lines||[]).forEach((line,i)=>{const isDirectoryEntry=key==='help'&&line.startsWith('  ');if(isDirectoryEntry){const p=document.createElement('p');p.className='terminal-line terminal-directory-entry';const raw=line.trimStart();const splitAt=raw.indexOf('  ');const commandName=splitAt>=0?raw.slice(0,splitAt).trim():raw;const description=splitAt>=0?raw.slice(splitAt).trim():'';const cmdSpan=document.createElement('span');cmdSpan.className='terminal-directory-command';cmdSpan.textContent=commandName;const descSpan=document.createElement('span');descSpan.className='terminal-directory-description';descSpan.textContent=description?'  '+description:'';p.append(cmdSpan,descSpan);output.appendChild(p);return;}const isCommandDirectory=key==='help'&&line.startsWith('Commands:');const semantic=(key==='matrix'?'tone-cyan':(key==='fortune'?'':(i===0&&['about','projects','skills','experience','aws','linux','contact','neofetch','fastfetch'].includes(key))?'success':(isCommandDirectory?'tone-cyan':(line.startsWith('[')?'terminal-category':''))));addLine(line,semantic||'');});
  (result.links||[]).forEach(([label,href])=>{const p=document.createElement('p');p.className='terminal-line tone-blue';const a=document.createElement('a');a.href=href;a.textContent='↗ '+label;p.appendChild(a);output.appendChild(p);});if(result.action)result.action();output.scrollTop=output.scrollHeight;
 }
 const suggestions=document.createElement('div');suggestions.className='terminal-suggestions';suggestions.id='terminal-suggestions';suggestions.setAttribute('role','group');suggestions.setAttribute('aria-label','Command suggestions');form.insertAdjacentElement('beforebegin',suggestions);
 const allEntries=Object.entries(categories).flatMap(([category,items])=>Object.entries(items).map(([name,description])=>({name,description,category})));let activeSuggestion=-1;
 function refreshSuggestions(){const q=input.value.trim().toLowerCase();suggestions.replaceChildren();activeSuggestion=-1;if(!q)return;const matches=allEntries.filter(x=>x.name.startsWith(q)||(x.name.includes(' ')&&x.name.startsWith(q))).slice(0,6);matches.forEach(item=>{const b=document.createElement('button');b.type='button';b.className='terminal-suggestion';const strong=document.createElement('strong');strong.textContent=item.name;const small=document.createElement('small');small.textContent=item.category+' · '+item.description;b.append(strong,small);b.addEventListener('click',()=>{input.value=item.name;input.focus();suggestions.replaceChildren();});suggestions.append(b);});}
 input.addEventListener('input',refreshSuggestions);
 input.addEventListener('keydown',e=>{if(e.key==='Escape'){suggestions.replaceChildren();return;}if(e.key==='Tab'){const q=input.value.trim().toLowerCase();if(!q)return;const matches=allEntries.map(x=>x.name).filter((n,i,a)=>n.startsWith(q)&&a.indexOf(n)===i);if(matches.length===1){e.preventDefault();input.value=matches[0];refreshSuggestions();}else if(matches.length>1){e.preventDefault();addLine('Matches: '+matches.join('  '),'tone-purple');}}});
 form.addEventListener('submit',e=>{e.preventDefault();const value=input.value.trim();if(!value)return;history.push(value);historyIndex=history.length;run(value);input.value='';suggestions.replaceChildren();});
 input.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();if(historyIndex>0){historyIndex--;input.value=history[historyIndex]||'';refreshSuggestions();}}else if(e.key==='ArrowDown'){e.preventDefault();if(historyIndex<history.length-1){historyIndex++;input.value=history[historyIndex]||'';}else{historyIndex=history.length;input.value='';}refreshSuggestions();}});

 const awsContent={loadbalancer:['COMPONENT 01','Load balancer','Receives incoming web traffic and distributes requests across healthy application targets. In a typical design, HTTPS listeners and health checks help route requests safely.','Design note: expose only the required entry point; keep application and database services private where practical.'],application:['COMPONENT 02','Application tier','Runs application logic on compute such as EC2 instances or containers in private subnets. It handles requests from the web tier and retrieves data through controlled database access.','Design note: use least-privilege security-group rules and avoid direct public access to application instances.'],database:['COMPONENT 03','Database tier','Stores application data in a relational database such as Amazon RDS. The database should accept connections only from approved application resources.','Design note: backups, encryption, access control, and recovery testing are important; this diagram does not represent a deployed environment.'],network:['NETWORK & SECURITY','Network & security','A VPC, subnets, route tables, security groups, and network ACLs define how traffic moves and which connections are allowed.','Design note: separate public entry points from private workloads and allow only required ports and sources.'],monitoring:['OPERATIONS','Monitoring','Metrics, logs, alarms, and health checks help operators spot issues and understand service behavior. CloudWatch is a common AWS monitoring option.','Design note: alert on actionable symptoms and document the response path; this is a conceptual overview.']};
 document.querySelectorAll('[data-aws]').forEach(b=>b.addEventListener('click',()=>{const d=awsContent[b.dataset.aws];if(!d)return;document.querySelectorAll('[data-aws]').forEach(x=>{x.setAttribute('aria-pressed',String(x===b));});['aws-detail-kicker','aws-detail-title','aws-detail-copy','aws-detail-note'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=d[i]})}));
 const skillContent={frontend:{k:'FRONTEND',title:'Angular & responsive UI',copy:'Build responsive page layouts with reusable interface elements, clear navigation, and mobile-first behavior.',tags:['Angular','TypeScript','JavaScript','HTML/CSS'],example:'Job-Check and this personal portfolio.',href:'projects.html'},cloud:{k:'AWS & CLOUD',title:'AWS architecture fundamentals',copy:'Understand how compute, storage, identity, networking, and database services fit into a layered application design.',tags:['EC2','S3','IAM','VPC','3-tier design'],example:'AWS 3-Tier Architecture learning project.',href:'projects.html#aws-architecture'},linux:{k:'LINUX & NETWORKING',title:'Linux operations & connectivity',copy:'Practice service and package management, permissions, logs, DNS concepts, routing, VPNs, and troubleshooting workflows.',tags:['Linux','Nginx','Tomcat','DNS','VPN'],example:'System administration topics and the AWS architecture project.',href:'projects.html#aws-architecture'},reporting:{k:'REPORTING & ANALYTICS',title:'Turning information into reports',copy:'Use spreadsheets and reporting fundamentals to organize information, prepare reports, and communicate useful findings.',tags:['Excel','SQL fundamentals','Power BI fundamentals','Report distribution'],example:'Reporting and report-distribution responsibilities; no unverified dashboard metrics are claimed.',href:'contact.html'}};
 const skillDetails={
  'Angular':{category:'frontend',title:'Angular',copy:'Build component-based interfaces and organize a frontend into reusable, maintainable views.',tags:['Components','Templates','Responsive UI'],example:'Job-Check and the interactive sections of this personal portfolio.',href:'projects.html#job-check'},
  'TypeScript':{category:'frontend',title:'TypeScript',copy:'Use typed variables, interfaces, and clearer contracts to make larger JavaScript applications easier to maintain.',tags:['Types','Interfaces','Maintainability'],example:'Frontend development practice across Angular-oriented work.',href:'projects.html#job-check'},
  'JavaScript':{category:'frontend',title:'JavaScript',copy:'Add client-side interactions, input handling, and dynamic content to web interfaces.',tags:['DOM interactions','Events','Dynamic UI'],example:'Interactive portfolio terminal, navigation, and project interactions.',href:'projects.html'},
  'HTML/CSS':{category:'frontend',title:'HTML & CSS',copy:'Create semantic page structure, responsive layouts, and consistent visual styling across screen sizes.',tags:['Semantic HTML','Flexbox/Grid','Responsive design'],example:'Responsive layouts in Job-Check and this portfolio.',href:'projects.html#job-check'},
  'EC2':{category:'cloud',title:'Amazon EC2',copy:'Understand virtual compute instances, their network placement, and the basics of managing server workloads.',tags:['Compute','Instances','Security groups'],example:'AWS 3-Tier Architecture learning project.',href:'projects.html#aws-architecture'},
  'S3':{category:'cloud',title:'Amazon S3',copy:'Explore object storage for files, static assets, backups, and lifecycle-based storage patterns.',tags:['Object storage','Buckets','Lifecycle concepts'],example:'AWS cloud-services learning and architecture planning.',href:'projects.html#aws-architecture'},
  'IAM':{category:'cloud',title:'AWS IAM',copy:'Apply identity and access-management concepts such as roles, policies, and least-privilege permissions.',tags:['Roles','Policies','Least privilege'],example:'Security considerations in the AWS 3-Tier Architecture learning project.',href:'projects.html#aws-architecture'},
  'VPC':{category:'cloud',title:'Amazon VPC',copy:'Plan isolated cloud networks using subnets, route tables, gateways, and security boundaries.',tags:['Subnets','Routes','Network boundaries'],example:'Network layout and private-tier concepts in the AWS architecture project.',href:'projects.html#aws-architecture'},
  'Linux':{category:'linux',title:'Linux administration',copy:'Practice package-management concepts, file permissions, services, logs, and basic system troubleshooting.',tags:['Permissions','Packages','Services'],example:'System administration learning notes and the simulated portfolio terminal.',href:'projects.html#aws-architecture'},
  'Nginx':{category:'linux',title:'Nginx',copy:'Understand web-server and reverse-proxy responsibilities, request routing, and the public web tier.',tags:['Web server','Reverse proxy','Request routing'],example:'Nginx web tier in the AWS 3-Tier Architecture learning project.',href:'projects.html#aws-architecture'},
  'DNS':{category:'linux',title:'DNS & networking',copy:'Follow how names resolve to addresses and how connectivity can be checked layer by layer.',tags:['Name resolution','Connectivity','Troubleshooting'],example:'Networking concepts connected to the AWS architecture and terminal demos.',href:'projects.html#aws-architecture'},
  'VPN':{category:'linux',title:'VPN fundamentals',copy:'Learn how VPN tunnels can connect networks or remote users while protecting traffic in transit.',tags:['Tunnels','Private connectivity','Routing'],example:'Networking learning notes and infrastructure design concepts.',href:'projects.html#aws-architecture'},
  'Excel':{category:'reporting',title:'Excel',copy:'Organize data, use formulas, and structure information so recurring reporting tasks are easier to review.',tags:['Formulas','Data organization','Reporting'],example:'Reporting and report-preparation responsibilities.',href:'contact.html'},
  'SQL':{category:'reporting',title:'SQL fundamentals',copy:'Use queries to retrieve, filter, sort, and combine structured data for analysis.',tags:['SELECT','Filtering','JOIN concepts'],example:'Database and reporting fundamentals; examples are educational, not production claims.',href:'contact.html'},
  'Power BI':{category:'reporting',title:'Power BI fundamentals',copy:'Understand how data sources, transformations, and visuals combine into reports and dashboards.',tags:['Data model','Visuals','Reports'],example:'Reporting and analytics learning path; no unverified dashboard metrics are claimed.',href:'contact.html'},
  'Report distribution':{category:'reporting',title:'Report distribution',copy:'Prepare and distribute reports with attention to accuracy, audience, and repeatable process steps.',tags:['Accuracy','Communication','Repeatable workflow'],example:'Report-making and report-distribution responsibilities.',href:'contact.html'}
};
const groupSkills={frontend:['Angular','TypeScript','JavaScript','HTML/CSS'],cloud:['EC2','S3','IAM','VPC'],linux:['Linux','Nginx','DNS','VPN'],reporting:['Excel','SQL','Power BI','Report distribution']};
function renderSkillPick(skill){const d=skillDetails[skill];if(!d)return;document.querySelectorAll('.skill-pick').forEach(b=>{const active=b.dataset.skill===skill;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};set('skill-map-kicker',d.category==='cloud'?'AWS & CLOUD':d.category==='linux'?'LINUX & NETWORKING':d.category==='reporting'?'REPORTING & ANALYTICS':'FRONTEND');set('skill-map-detail-title',d.title);set('skill-map-detail-copy',d.copy);set('skill-map-example',d.example);const tags=document.getElementById('skill-map-tags');if(tags){tags.replaceChildren();d.tags.forEach(t=>{const e=document.createElement('span');e.textContent=t;tags.append(e)})}const link=document.getElementById('skill-map-project-link');if(link){link.href=d.href;link.textContent=d.category==='reporting'?'Explore related work ↗':'Explore related project ↗'}}
function renderSkillGroup(group){const picks=document.getElementById('skill-map-picks');if(!picks)return;picks.replaceChildren();(groupSkills[group]||[]).forEach((skill,i)=>{const b=document.createElement('button');b.type='button';b.className='skill-pick'+(i===0?' active':'');b.dataset.skill=skill;b.setAttribute('aria-pressed',String(i===0));b.textContent=skill;b.addEventListener('click',()=>renderSkillPick(skill));picks.append(b)});renderSkillPick((groupSkills[group]||[])[0])}
document.querySelectorAll('[data-skill-group]').forEach(b=>b.addEventListener('click',()=>{const group=b.dataset.skillGroup;document.querySelectorAll('[data-skill-group]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});renderSkillGroup(group)}));renderSkillGroup('frontend');
 // Lightweight startup animation adds a greeting without delaying the rest of the page.
 const welcome=document.getElementById('terminal-welcome');
 if(welcome){welcome.style.opacity='0';welcome.style.transform='translateY(5px)';requestAnimationFrame(()=>{welcome.style.transition='opacity .45s ease,transform .45s ease';welcome.style.opacity='1';welcome.style.transform='translateY(0)';});}
})();

// Interactive simulated AWS architecture explorer
(function(){
 const data={
  lb:{n:'Load Balancer',k:'COMPONENT 01',t:'Distributes incoming HTTPS requests across healthy application targets. In a real AWS design, an Application Load Balancer can perform health checks and route traffic to registered targets.',tags:['ALB','Health checks','HTTPS']},
  app:{n:'Application layer',k:'COMPONENT 02',t:'Runs the web application and server-side logic. This example represents compute instances running a web server or application runtime, placed across subnets for resilience.',tags:['EC2','Nginx / app','Auto Scaling']},
  db:{n:'Database layer',k:'COMPONENT 03',t:'Stores persistent application data separately from the presentation and application layers. A managed database such as Amazon RDS can provide backups and maintenance features.',tags:['RDS','Private access','Backups']},
  net:{n:'VPC & subnets',k:'NETWORK COMPONENT',t:'Defines the isolated virtual network and subnet boundaries. Route tables and security groups help control where traffic can travel and which resources can communicate.',tags:['VPC','Subnets','Security groups']}
 };
 const buttons=[...document.querySelectorAll('[data-aws-node]')];let current='lb';
 function choose(key){const d=data[key];if(!d)return;current=key;buttons.forEach(b=>{b.classList.toggle('active',b.dataset.awsNode===key);b.setAttribute('aria-pressed',String(b.dataset.awsNode===key))});const panel=document.querySelector('.aws-detail-panel'),k=panel?.querySelector('#aws3d-detail-kicker'),n=panel?.querySelector('#aws3d-detail-title'),t=panel?.querySelector('#aws3d-detail-text'),tags=panel?.querySelector('#aws3d-detail-tags');if(k)k.textContent=d.k;if(n)n.textContent=d.n;if(t)t.textContent=d.t;if(tags){tags.replaceChildren();d.tags.forEach(x=>{const span=document.createElement('span');span.textContent=x;tags.append(span)})}}
 buttons.forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.awsNode==='lb'));b.addEventListener('click',()=>choose(b.dataset.awsNode))});
 const next=document.getElementById('aws-next');if(next)next.addEventListener('click',()=>{const keys=['lb','app','db','net'];choose(keys[(keys.indexOf(current)+1)%keys.length])});
 // Subtle cursor tilt is desktop-only and never required for interaction.
 const hero=document.querySelector('.hero-visual');if(hero&&window.matchMedia('(hover:hover) and (pointer:fine)').matches&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){hero.addEventListener('mousemove',e=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;const card=hero.querySelector('.profile-card');if(card)card.style.transform=`rotateY(${-7+x*5}deg) rotateX(${3-y*4}deg)`});hero.addEventListener('mouseleave',()=>{const card=hero.querySelector('.profile-card');if(card)card.style.transform=''})}
})();
;


/* Extracted script 10 */
;
(()=>{
 const consolePanel=document.getElementById('interactive-console-panel');
 const playground=document.getElementById('webdev-lab');
 const consoleButton=document.getElementById('open-console');
 const playgroundButton=document.getElementById('open-playground');
 if(!consolePanel||!playground||!consoleButton||!playgroundButton)return;
 function openPanel(which){
  const showConsole=which==='console';
  // Keep both launcher buttons together; reveal the chosen tool in its own page position.
  consolePanel.hidden=!showConsole;
  playground.hidden=showConsole;
  consoleButton.setAttribute('aria-expanded',String(showConsole));
  playgroundButton.setAttribute('aria-expanded',String(!showConsole));
  const target=showConsole?consolePanel:playground;
  // Wait until the hidden section has been laid out before scrolling to it.
  target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  window.setTimeout(()=>{
   target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
   const heading=target.querySelector('h2');
   if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
  },80);
 }
 consoleButton.addEventListener('click',()=>openPanel('console'));
 playgroundButton.addEventListener('click',()=>openPanel('playground'));
})();
;


/* Extracted script 11 */
;
(()=>{
 const ids=['html','css','js']; const editors=Object.fromEntries(ids.map(k=>[k,document.getElementById('wdl-'+k)]));
 const tabs=[...document.querySelectorAll('.wdl-tab')], current=document.getElementById('wdl-current-file'), lines=document.getElementById('wdl-lines'), count=document.getElementById('wdl-char-count'), frame=document.getElementById('wdl-preview'), status=document.getElementById('wdl-preview-status'), message=document.getElementById('wdl-message');
 if(!frame||!editors.html||!editors.css||!editors.js||!current||!lines||!count||!status||!message||!document.getElementById('wdl-run')||!document.getElementById('wdl-refresh')||!document.getElementById('wdl-reset')||!document.getElementById('wdl-copy'))return;
 const starter={html:editors.html.value,css:editors.css.value,js:editors.js.value}; let active='html';
 const names={html:'index.html',css:'styles.css',js:'script.js'};
 function announce(t){message.textContent=t}
 function updateMeta(){const ed=editors[active];const n=Math.max(1,ed.value.split('\n').length);lines.textContent=Array.from({length:n},(_,i)=>i+1).join('\n');count.textContent=active.toUpperCase()+' · '+ed.value.length+' chars';current.textContent=names[active];}
 function switchFile(key){if(!editors[key])return;active=key;tabs.forEach(t=>{const on=t.dataset.file===key;t.classList.toggle('is-active',on);t.setAttribute('aria-selected',String(on));t.setAttribute('tabindex',on?'0':'-1');});ids.forEach(k=>{editors[k].hidden=k!==key;editors[k].classList.toggle('is-visible',k===key)});updateMeta();editors[key].focus();}
 function run(){
  const html=editors.html.value, css=editors.css.value, js=editors.js.value;
  const safeCss=css.replace(/<\/style/gi,'<\\/style');
  const safeJs=js.replace(/<\/script/gi,'<\\/script');
  const doc='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+safeCss+'</style></head><body>'+html+'<scr'+'ipt>window.onerror=function(m){parent.postMessage({type:"wdl-error",message:String(m)},"*")};try{'+safeJs+'}catch(e){parent.postMessage({type:"wdl-error",message:e.message},"*")}<\/scr'+'ipt></body></html>';
  frame.srcdoc=doc; status.textContent='Preview updated'; announce('Run complete. Your code is running inside the isolated preview.');
 }

 tabs.forEach(t=>t.addEventListener('click',()=>switchFile(t.dataset.file)));
 ids.forEach(k=>{editors[k].addEventListener('input',()=>{if(k===active)updateMeta();status.textContent='Unsaved edits';});editors[k].addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const el=e.currentTarget,start=el.selectionStart,end=el.selectionEnd;el.setRangeText('  ',start,end,'end');el.dispatchEvent(new Event('input',{bubbles:true}));}});});
 document.getElementById('wdl-run').addEventListener('click',run);document.getElementById('wdl-refresh').addEventListener('click',run);
 document.getElementById('wdl-reset').addEventListener('click',()=>{ids.forEach(k=>editors[k].value=starter[k]);switchFile('html');run();announce('Starter code restored.');});
 document.getElementById('wdl-copy').addEventListener('click',async()=>{const value=editors[active].value;try{await navigator.clipboard.writeText(value);announce('Copied '+names[active]+' to clipboard.');}catch(e){editors[active].focus();editors[active].select();try{document.execCommand('copy');announce('Copied '+names[active]+' to clipboard.');}catch(_){announce('Select the code and copy it manually.');}}});
 window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||!e.data||e.data.type!=='wdl-error')return;status.textContent='Preview error';announce('Preview error: '+e.data.message);});
 updateMeta();run();
})();
;


/* Extracted script 12: skills-tab-content-dedup-fix */
;
(function(){
 const root=document.getElementById('interactive-skills');
 if(!root || root.dataset.dedupFix==='1') return;
 root.dataset.dedupFix='1';
 const details={
  frontend:{label:'FRONTEND',title:'Build responsive interfaces',copy:'Explore how frontend tools support reusable components, browser interactions, semantic structure, and responsive layouts.',skills:[['Angular','Component-based views and reusable UI.'],['TypeScript','Typed code and clearer application contracts.'],['JavaScript','Interactive behavior and dynamic content.'],['HTML/CSS','Semantic structure, layout, and visual styling.']]},
  cloud:{label:'AWS & CLOUD',title:'Understand cloud infrastructure',copy:'Explore core AWS services and how compute, storage, identity, and networking fit into a cloud design.',skills:[['EC2','Virtual compute instances and server workloads.'],['S3','Object storage for files, assets, and backups.'],['IAM','Roles, policies, and least-privilege access.'],['VPC','Subnets, routes, and network boundaries.']]},
  linux:{label:'LINUX & NETWORKING',title:'Explore systems and connectivity',copy:'Review the building blocks used to administer servers, serve web traffic, resolve names, and connect networks.',skills:[['Linux','Permissions, packages, services, and troubleshooting.'],['Nginx','Web serving, reverse proxying, and request routing.'],['DNS','Name resolution and connectivity checks.'],['VPN','Private connectivity and tunnel fundamentals.']]},
  reporting:{label:'REPORTING & ANALYTICS',title:'Turn information into useful reports',copy:'Explore tools and repeatable practices for preparing, querying, visualizing, and distributing accurate information.',skills:[['Excel','Formulas, data organization, and reporting.'],['SQL','Querying, filtering, sorting, and joining data.'],['Power BI','Data models, visuals, and dashboard fundamentals.'],['Report distribution','Accurate, audience-aware report delivery.']]}
 };
 const title=root.querySelector('#skill-map-detail-title'),copy=root.querySelector('#skill-map-detail-copy'),kicker=root.querySelector('#skill-map-kicker'),picks=root.querySelector('#skill-map-picks'),tags=root.querySelector('#skill-map-tags'),example=root.querySelector('#skill-map-example');
 if(!title||!copy||!kicker||!picks) return;
 function render(group,skill){const d=details[group];if(!d)return;const item=d.skills.find(x=>x[0]===skill)||d.skills[0];kicker.textContent=d.label;title.textContent=item[0];copy.textContent=item[1];if(tags){tags.replaceChildren();[d.label,item[0],d.title].forEach(t=>{const el=document.createElement('span');el.textContent=t;tags.append(el)})}if(example)example.textContent=d.title+'. '+item[1];picks.replaceChildren();d.skills.forEach(([name,desc])=>{const b=document.createElement('button');b.type='button';b.className='skill-pick'+(name===item[0]?' active':'');b.dataset.skill=name;b.setAttribute('aria-pressed',String(name===item[0]));b.textContent=name;b.addEventListener('click',()=>render(group,name));picks.append(b)});}
 root.querySelectorAll('[data-skill-group]').forEach(b=>{b.addEventListener('click',()=>{root.querySelectorAll('[data-skill-group]').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});render(b.dataset.skillGroup);});});
 // Keep the existing skill-card search and filters, but ensure category filtering is distinct and scoped to this page.
 const grid=document.getElementById('skill-grid');
 const search=document.getElementById('skill-search');
 const filterRoot=document.getElementById('skill-filters');
 let category='all';
 function applyFilters(){if(!grid)return;const q=(search?.value||'').trim().toLowerCase();let shown=0;grid.querySelectorAll('.skill-card').forEach(card=>{const cat=(card.dataset.category||'').toLowerCase();const text=((card.dataset.search||'')+' '+card.textContent).toLowerCase();const ok=(category==='all'||cat===category)&&(!q||text.includes(q));card.hidden=!ok;if(ok)shown++});const empty=document.getElementById('skills-empty');if(empty)empty.hidden=shown>0;}
 if(search)search.addEventListener('input',applyFilters);
 if(filterRoot)filterRoot.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const label=(b.dataset.filter||b.dataset.category||b.textContent||'all').trim().toLowerCase();category=label.includes('front')?'frontend':label.includes('cloud')?'cloud':label.includes('tool')?'tools':label.includes('operation')?'operations':'all';filterRoot.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));applyFilters()}));
 render('frontend');
})();
;


/* Extracted script 13: skills-grid-list-controller */
;
(function(){
 const grid=document.getElementById("skill-grid");
 const tree=document.getElementById("skill-tree-panel");
 const buttons={grid:document.getElementById("skills-grid-view"),list:document.getElementById("skills-list-view"),tree:document.getElementById("skills-tree-view")};
 if(!grid||!tree||!buttons.grid||!buttons.list||!buttons.tree)return;
 const storageKey="mukul-portfolio-skills-view";
 function setView(view,save){
  const mode=["grid","list","tree"].includes(view)?view:"grid";
  const isTree=mode==="tree",isList=mode==="list";
  grid.hidden=isTree;
  tree.hidden=!isTree;
  grid.classList.toggle("is-list-view",isList);
  grid.dataset.view=mode;
  Object.entries(buttons).forEach(([key,button])=>{
   const active=key===mode;
   button.classList.toggle("active",active);
   button.setAttribute("aria-pressed",String(active));
  });
  if(save){try{localStorage.setItem(storageKey,mode)}catch(_){/* Storage may be unavailable; the view still works. */}}
 }
 let initial="grid";
 try{const saved=localStorage.getItem(storageKey);if(["grid","list","tree"].includes(saved))initial=saved;}catch(_){}
 setView(initial,false);
 buttons.grid.addEventListener("click",()=>setView("grid",true));
 buttons.list.addEventListener("click",()=>setView("list",true));
 buttons.tree.addEventListener("click",()=>setView("tree",true));
})();
;


/* Extracted script 14: skills-tree-interactions */
;
(function(){
 const tree=document.getElementById("skill-tree-panel"),grid=document.getElementById("skill-grid");
 const detail=document.getElementById("skill-tree-detail"),detailCategory=document.getElementById("skill-tree-detail-category");
 const detailTitle=document.getElementById("skill-tree-detail-title"),detailCopy=document.getElementById("skill-tree-detail-copy");
 const openCard=document.getElementById("skill-tree-open-card"),search=document.getElementById("skill-search");
 const filters=document.getElementById("skill-filters"),gridButton=document.getElementById("skills-grid-view");
 if(!tree||!grid||!detail||!detailCategory||!detailTitle||!detailCopy||!openCard||!filters||!gridButton)return;
 let selected={category:"",skill:"",summary:""};
 tree.querySelectorAll(".skill-tree-branch-toggle").forEach(button=>button.addEventListener("click",()=>{
  const branch=button.closest(".skill-tree-branch"),children=branch&&branch.querySelector(".skill-tree-children");
  if(!children)return;const open=children.hidden;children.hidden=!open;button.setAttribute("aria-expanded",String(open));
  const mark=button.querySelector(".skill-tree-chevron");if(mark)mark.textContent=open?"−":"＋";
 }));
 tree.querySelectorAll(".skill-tree-leaf").forEach(button=>button.addEventListener("click",()=>{
  selected={category:button.dataset.treeCategory||"",skill:button.dataset.treeSkill||"",summary:button.dataset.treeSummary||""};
  tree.querySelectorAll(".skill-tree-leaf").forEach(leaf=>{const active=leaf===button;leaf.classList.toggle("active",active);leaf.setAttribute("aria-pressed",String(active));});
  detailCategory.textContent=selected.category.toUpperCase()+" · SKILL";detailTitle.textContent=selected.skill;detailCopy.textContent=selected.summary;detail.hidden=false;
  openCard.textContent="Open "+(grid.querySelector('.skill-card[data-category="'+selected.category+'"] h3')?.textContent.trim()||"skill")+" card ↗";
 }));
 openCard.addEventListener("click",()=>{
  if(!selected.category)return;gridButton.click();
  if(search&&search.value){search.value="";search.dispatchEvent(new Event("input",{bubbles:true}));}
  const filter=filters.querySelector('[data-filter="'+selected.category+'"]');if(filter)filter.click();
  const card=grid.querySelector('.skill-card[data-category="'+selected.category+'"]');if(!card)return;
  const expand=card.querySelector(".skill-detail-toggle"),panel=expand&&expand.nextElementSibling;
  if(expand&&panel&&panel.hidden){expand.setAttribute("aria-expanded","true");panel.hidden=false;const symbol=expand.querySelector("span");if(symbol)symbol.textContent="−";}
  card.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
 });
})();
;


/* Extracted script 15: case-study-preview-interactions */
;
(function(){
  const dialog=document.getElementById("case-preview-dialog");
  const scene=document.getElementById("case-preview-dialog-scene");
  const title=document.getElementById("case-preview-dialog-title");
  const close=document.getElementById("case-preview-dialog-close");
  if(!dialog||!scene||!title||!close)return;
  let lastTrigger=null;
  function closePreview(){
    if(typeof dialog.close==="function"&&dialog.open)dialog.close();
    else {dialog.removeAttribute("open");scene.replaceChildren();if(lastTrigger)lastTrigger.focus({preventScroll:true});}
  }
  document.querySelectorAll("#page-projects .case-preview-open").forEach(button=>{
    button.addEventListener("click",()=>{
      const artwork=button.closest(".project-card-art");
      if(!artwork)return;
      lastTrigger=button;
      const enlarged=artwork.cloneNode(true);
      enlarged.querySelector(".case-preview-open")?.remove();
      scene.replaceChildren(enlarged);
      title.textContent=button.dataset.previewTitle||"Project preview";
      if(typeof dialog.showModal==="function")dialog.showModal();
      else dialog.setAttribute("open","");
      close.focus({preventScroll:true});
    });
  });
  close.addEventListener("click",closePreview);
  dialog.addEventListener("click",event=>{if(event.target===dialog)closePreview();});
  dialog.addEventListener("close",()=>{
    scene.replaceChildren();
    if(lastTrigger&&document.contains(lastTrigger))lastTrigger.focus({preventScroll:true});
  });
})();
;


/* Extracted script 16: apply-portrait-to-small-identities */
;
(function(){
  // Reuse the same professional portrait already embedded in the About section.
  // This keeps the main profile.ts illustration and About image unchanged.
  const reference=document.querySelector("#page-about .about-feature-photo");
  if(!reference)return;
  const portrait=reference.getAttribute("src")||reference.currentSrc||reference.src;
  if(!portrait)return;
  [".brand-photo",".mini-avatar-photo"].forEach(selector=>{
    document.querySelectorAll(selector).forEach(img=>{
      if(img.getAttribute("src")!==portrait)img.setAttribute("src",portrait);
    });
  });
})();
;


/* Extracted script 17: portrait-favicon-init */
;
(function(){
  const photo=document.querySelector("#page-about .about-feature-photo");
  if(!photo)return;
  const source=photo.getAttribute("src")||photo.currentSrc||photo.src;
  if(!source)return;
  // Load a separate eager image so a hidden lazy-loaded About section doesn't block favicon creation.
  const image=new Image();
  image.onload=function(){
    try{
      if(!image.naturalWidth||!image.naturalHeight)return;
      const size=64,canvas=document.createElement("canvas");
      canvas.width=size;canvas.height=size;
      const context=canvas.getContext("2d");
      if(!context)return;
      context.clearRect(0,0,size,size);
      context.beginPath();
      if(typeof context.roundRect==="function")context.roundRect(0,0,size,size,13);
      else{
        const radius=13;
        context.moveTo(radius,0);context.lineTo(size-radius,0);context.quadraticCurveTo(size,0,size,radius);
        context.lineTo(size,size-radius);context.quadraticCurveTo(size,size,size-radius,size);
        context.lineTo(radius,size);context.quadraticCurveTo(0,size,0,size-radius);
        context.lineTo(0,radius);context.quadraticCurveTo(0,0,radius,0);
      }
      context.closePath();context.clip();
      const scale=Math.max(size/image.naturalWidth,size/image.naturalHeight);
      const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
      context.drawImage(image,(size-width)/2,(size-height)*0.22,width,height);
      let link=document.getElementById("portfolio-favicon");
      if(!link){link=document.createElement("link");link.id="portfolio-favicon";link.rel="icon";document.head.appendChild(link);}
      link.type="image/png";
      link.sizes="64x64";
      link.href=canvas.toDataURL("image/png");
    }catch(_){
      // Keep the branded SVG favicon fallback if canvas generation is unavailable.
    }
  };
  image.onerror=function(){/* Preserve the valid SVG fallback. */};
  image.src=source;
})();

;
(function(){
  const photo=document.querySelector("#page-about .about-feature-photo");
  if(!photo)return;
  async function applyPhotoFavicon(){
    try{
      if(typeof photo.decode==="function")await photo.decode();
      else if(!photo.complete)await new Promise((resolve,reject)=>{
        photo.addEventListener("load",resolve,{once:true});
        photo.addEventListener("error",reject,{once:true});
      });
      if(!photo.naturalWidth||!photo.naturalHeight)return;
      const size=64,canvas=document.createElement("canvas");
      canvas.width=size;canvas.height=size;
      const context=canvas.getContext("2d");
      if(!context)return;
      context.clearRect(0,0,size,size);
      context.beginPath();
      if(typeof context.roundRect==="function")context.roundRect(0,0,size,size,13);
      else{
        const radius=13;
        context.moveTo(radius,0);context.lineTo(size-radius,0);context.quadraticCurveTo(size,0,size,radius);
        context.lineTo(size,size-radius);context.quadraticCurveTo(size,size,size-radius,size);
        context.lineTo(radius,size);context.quadraticCurveTo(0,size,0,size-radius);
        context.lineTo(0,radius);context.quadraticCurveTo(0,0,radius,0);
      }
      context.closePath();context.clip();
      const scale=Math.max(size/photo.naturalWidth,size/photo.naturalHeight);
      const width=photo.naturalWidth*scale,height=photo.naturalHeight*scale;
      context.drawImage(photo,(size-width)/2,(size-height)*0.22,width,height);
      let link=document.getElementById("portfolio-favicon");
      if(!link){link=document.createElement("link");link.id="portfolio-favicon";link.rel="icon";document.head.appendChild(link);}
      link.type="image/png";
      link.sizes="64x64";
      link.href=canvas.toDataURL("image/png");
    }catch(_){
      // Keep the branded SVG fallback if the browser cannot generate the photo icon.
    }
  }
  applyPhotoFavicon();
})();
;
