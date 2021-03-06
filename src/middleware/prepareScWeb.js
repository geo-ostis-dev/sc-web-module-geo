function prepareScWeb() {
    window.parent.$("#window-header-tools").css("visibility", "hidden");
    window.parent.$("#history-item-langs").css("visibility", "visible");
    window.parent.$("#history-item-langs").css("left", "96px");
    window.parent.$("#history-item-langs").css("top", "34px");

    window.parent.$("#history-item-langs a").on("click", (event) => {
        let innerText = event.target.innerHTML;

        if (innerText === "Map interface" || innerText === "Картографический интерфейс") {
            window.parent.$("#window-header-tools").css("visibility", "hidden");
            window.parent.$("#history-item-langs").css("visibility", "visible");
            window.parent.$("#history-item-langs").css("left", "96px");
            window.parent.$("#history-item-langs").css("top", "34px");
        } else {
            window.parent.$("#window-header-tools").css("visibility", "");
            window.parent.$("#history-item-langs").css("visibility", "");
            window.parent.$("#history-item-langs").css("left", "");
            window.parent.$("#history-item-langs").css("top", "");
        }
    });

    $(".menu").on("click", () => {
        window.parent.$(".histoy-item-btn").click();
    });

    $(".hide-history").on("click", () => {
        window.parent.$("#windows-list").click();
    });
}

export default prepareScWeb;
