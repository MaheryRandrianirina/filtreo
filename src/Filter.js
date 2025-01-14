import { HTMLTable } from "./HTMLTable.js";

/**
 * Replace titles by select inputs
 * Add sort icons
 * Add values inside cells of the column corresponding to the select inside this last (must be unique)
 * Cliqck on a select option filters the table
 * Click on the sort icon sorts the table
 * NB: 
 *  - La structure du tableau html doit suivre obligatoirement des règles spécifiques : voir partials/calendar.php
 *  - th elements must have "f-label" class to be fitlerable. Elements containing values to insert inside select must have "f-value" class
 */
export class FilterAndSort {

    /**
     * 
     * @param {HTMLTable} table 
     * @param {{[option: "doubleUniqueValues"|string]: {[f_idx:number]: string[]}}} options
     */
    constructor(table, options)
    {
        this.table = table;
        this.table.addOptions(options);

        const labels = table.getTableHTML().querySelectorAll("thead .f-label");
        labels.forEach(label => {
            this.currentLabelOnIteration = label;

            this.add();
        });

        // Add sorting feature to sortable only columns
        this.table.getTableHTML().querySelectorAll("thead th[sortable]").forEach(sortable => this.table.addIconIntoTHElement(sortable, true));
        
        // If there is no more than 1 row inside the table body, proceeding to filter is not necessary
        if(this.table.rows.length <= 1){
            return;
        }
        
        this.checkForFilterChange();
        this.checkForSorting();
    }

    /**
     * add change event listener on all selects then filter table following new value
     */
    checkForFilterChange()
    {
        const selects = this.table.getTableHTML().querySelectorAll(".f-label select");
        selects.forEach(select => {
            select.addEventListener("change", this.table.filter.bind(this.table, selects));
        })
    }
    
    add()
    {
        console.log("add")
        if(!this.currentLabelOnIteration)
        {
            throw new Error("Property 'currentLabelOnIteration' is not defined");
        }

        this.table.addIconIntoTHElement(this.currentLabelOnIteration);
        this.table.addSelectIntoTHElement(this.currentLabelOnIteration);
    }

    checkForSorting()
    {
        const sortButtons = this.table.getTableHTML().querySelectorAll(".sort-icon");
        sortButtons.forEach(sortButton => {
            sortButton.addEventListener("click", e => {
                !sortButton.parentElement.hasAttribute("sorted") ? this.table.sort(e) : this.table.unsort(e);
            });
        })
    }
}