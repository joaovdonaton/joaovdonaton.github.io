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

// ---------- name pronunciation ----------

const pronunciationAudio = new Audio("./assets/name.mp3");
document.getElementById("play-name").addEventListener("click", () => {
    pronunciationAudio.currentTime = 0;
    pronunciationAudio.play();
});
