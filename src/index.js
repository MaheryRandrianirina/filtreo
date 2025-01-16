import { HTMLTable } from "./HTMLTable.js";

const filterButton = document.querySelector(".filter-button");
if(filterButton) {
    const table = new HTMLTable(document.querySelector("table"), {
        doubleUniqueValues: {5: ["done", "to do"]}
    });
    
    filterButton.addEventListener("click", ()=>table.initFilter());
}