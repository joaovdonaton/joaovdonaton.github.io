// ---------- page switching ----------

// Each navbar item id maps to a page id by swapping the suffix: "blog-item" -> "blog-page".
const navbarItems = document.getElementsByClassName("navbar-item");

function showPage(itemId, {updateHash = true} = {}){
    const pageId = itemId.replace("-item", "-page");

    const item = document.getElementById(itemId);
    const page = document.getElementById(pageId);
    if(!item || !page) return;

    const currentItem = document.getElementsByClassName("navbar-item-current")[0];
    if(currentItem) currentItem.classList.remove("navbar-item-current");
    item.classList.add("navbar-item-current");

    const currentPage = document.getElementsByClassName("page-container-current")[0];
    if(currentPage) currentPage.classList.remove("page-container-current");
    page.classList.add("page-container-current");

    if(updateHash){
        // keep the URL shareable without pushing a new history entry per click
        history.replaceState(null, "", "#" + itemId.replace("-item", ""));
        window.scrollTo({top: 0, behavior: "smooth"});
    }
}

for(const item of navbarItems){
    item.addEventListener("click", (e) => showPage(e.currentTarget.id));
}

// restore the page named in the URL hash on load (e.g. /#projects)
const initialPage = window.location.hash.replace("#", "");
if(initialPage){
    showPage(initialPage + "-item", {updateHash: false});
}

// ---------- project image carousels ----------

// Dots are generated from however many .carousel-slide images a project has,
// so adding an image to a project is just adding another <img> in the markup.
for(const carousel of document.querySelectorAll(".project-carousel")){
    const slides = carousel.querySelectorAll(".carousel-slide");

    // a single image needs no pagination
    if(slides.length < 2){
        slides[0]?.classList.add("is-active");
        continue;
    }

    const dots = document.createElement("div");
    dots.className = "carousel-dots";

    const show = (index) => {
        slides.forEach((slide, i) => {
            slide.classList.toggle("is-active", i === index);
            slide.setAttribute("aria-hidden", String(i !== index));
        });
        dots.childNodes.forEach((dot, i) => {
            dot.classList.toggle("is-active", i === index);
            dot.setAttribute("aria-current", String(i === index));
        });
    };

    slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Show image ${i + 1} of ${slides.length}`);
        dot.addEventListener("click", () => show(i));
        dot.addEventListener("keydown", (e) => {
            if(e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            const step = e.key === "ArrowRight" ? 1 : -1;
            const next = (i + step + slides.length) % slides.length;
            show(next);
            dots.childNodes[next].focus();
        });
        dots.appendChild(dot);
    });

    carousel.appendChild(dots);
    show(0);
}

// ---------- github contribution graph ----------

// GitHub's own contributions endpoint sends no CORS header, so the data comes
// from a public proxy. If it's unreachable the section just stays hidden
// rather than leaving an empty box on the page.
const GITHUB_USER = "joaovdonaton";

function renderContributions(data){
    const days = data?.contributions;
    if(!days || !days.length) return;

    const section = document.getElementById("contributions");
    const grid = document.getElementById("contrib-grid");
    const months = document.getElementById("contrib-months");

    const dateOf = (day) => new Date(day.date + "T00:00:00");

    // pad the first column so day one lands on its real weekday row
    const firstDayOfWeek = dateOf(days[0]).getDay();
    const weeks = Math.ceil((firstDayOfWeek + days.length) / 7);
    section.style.setProperty("--weeks", weeks);

    for(let i = 0; i < firstDayOfWeek; i++){
        const blank = document.createElement("i");
        blank.className = "contrib-cell is-blank";
        grid.appendChild(blank);
    }

    const fullDate = new Intl.DateTimeFormat("en", {month: "short", day: "numeric", year: "numeric"});

    for(const day of days){
        const cell = document.createElement("i");
        cell.className = "contrib-cell";
        cell.dataset.level = day.level;
        cell.title = `${day.count} contribution${day.count === 1 ? "" : "s"} on ${fullDate.format(dateOf(day))}`;
        grid.appendChild(cell);
    }

    // a month label sits above the column where that month first appears
    let lastMonth = -1;
    days.forEach((day, i) => {
        const date = dateOf(day);
        if(date.getMonth() === lastMonth) return;
        lastMonth = date.getMonth();

        const column = Math.floor((firstDayOfWeek + i) / 7) + 1;
        if(column > weeks - 1) return; // too close to the edge to read

        const label = document.createElement("span");
        label.textContent = date.toLocaleString("en", {month: "short"});
        label.style.gridColumn = column;
        months.appendChild(label);
    });

    document.getElementById("contrib-total").textContent =
        `${data.total.lastYear.toLocaleString()} contributions in the last year`;

    section.hidden = false;
}

function renderStars(repos){
    const stars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    const row = document.createElement("div");
    row.className = "gh-stat";
    row.innerHTML = `<dt>Stars earned</dt><dd>${stars.toLocaleString()}</dd>`;
    document.getElementById("gh-stat-list").appendChild(row);
}

// GitHub's own language colours, so the bar reads the way people expect
const LANG_COLORS = {
    "Java": "#b07219",
    "Python": "#3572A5",
    "Jupyter Notebook": "#DA5B0B",
    "JavaScript": "#f1e05a",
    "TypeScript": "#3178c6",
    "C++": "#f34b7d",
    "C": "#555555",
    "HTML": "#e34c26",
    "CSS": "#563d7c",
    "Shell": "#89e051",
};

// Counted by repository, not by bytes — a byte-accurate split would need one
// extra API request per repo.
function renderLanguages(repos){
    const counts = new Map();
    for(const repo of repos){
        if(!repo.language) continue;
        counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
    }
    if(!counts.size) return;

    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = ranked.slice(0, 5);

    const rest = ranked.slice(5).reduce((sum, [, n]) => sum + n, 0);
    if(rest) top.push(["Other", rest]);

    const bar = document.getElementById("lang-bar");
    const legend = document.getElementById("lang-legend");

    for(const [name, count] of top){
        const pct = (count / total) * 100;
        const color = LANG_COLORS[name] || "var(--line-strong)";

        const slice = document.createElement("i");
        slice.style.width = `${pct}%`;
        slice.style.setProperty("--lang", color);
        slice.title = `${name} — ${pct.toFixed(0)}%`;
        bar.appendChild(slice);

        const item = document.createElement("li");
        item.innerHTML = `<i class="lang-dot" style="--lang:${color}"></i>${name} ${pct.toFixed(0)}%`;
        legend.appendChild(item);
    }

    document.getElementById("gh-langs").hidden = false;
}

// Contribution data is required; the repo list is optional, so a failure there
// (or a hit on the 60/hour unauthenticated limit) costs the stars and language
// bar but still leaves the graph.
const asJson = (res) => (res.ok ? res.json() : Promise.reject(new Error(res.status)));

Promise.all([
    fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`).then(asJson),
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`).then(asJson).catch(() => null),
]).then(([contributions, repos]) => {
    renderContributions(contributions);

    const own = repos?.filter((repo) => !repo.fork);
    if(own?.length){
        renderStars(own);
        renderLanguages(own);
    }
}).catch(() => { /* no data, section stays hidden */ });

// ---------- name pronunciation ----------

const pronunciationAudio = new Audio("./assets/name.mp3");
document.getElementById("play-name").addEventListener("click", () => {
    pronunciationAudio.currentTime = 0;
    pronunciationAudio.play();
});
