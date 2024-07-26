// add listeners to clickable navbar items
let navbarItems = document.getElementsByClassName("navbar-item");
for(let item of navbarItems){
    item.addEventListener("click", (e) => {
        // change navbar highlight
        let currentPageNav = document.getElementsByClassName("navbar-item-current")[0];
        currentPageNav.classList.remove("navbar-item-current");

        e.currentTarget.classList.add("navbar-item-current");

        // change visible page
        let currentPageContainer = document.getElementsByClassName("page-container-current")[0];
        currentPageContainer.classList.remove("page-container-current");

        let pageId = e.currentTarget.id;
        pageId = pageId.replace("-item", "-page");

        document.getElementById(pageId).classList.add("page-container-current");
    })
}


// add listener to name pronounciation text
let clickHere = document.getElementById("play-name")
let pronunciationAudio = new Audio("./assets/name.mp3")
clickHere.addEventListener("click", (e) => {
    pronunciationAudio.play()
})