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

// ---------- name pronunciation ----------

const pronunciationAudio = new Audio("./assets/name.mp3");
document.getElementById("play-name").addEventListener("click", () => {
    pronunciationAudio.currentTime = 0;
    pronunciationAudio.play();
});
