import { HTMLTable } from "./HTMLTable.js";

const filterButton = document.querySelector(".filter-button");
if(filterButton) {
    console.log(document.querySelector("table"))
    const table = new HTMLTable(document.querySelector("table"), {
        doubleUniqueValues: {5: ["done", "to do"]}
    });
    
    filterButton.addEventListener("click", ()=>table.initFilter());
}