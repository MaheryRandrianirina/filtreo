import { SortIcon } from "./components/icons/sort.js";
import { createElement, isDate, isLetter, isHour, is_null } from "./utils/func.js";
import { FilterAndSort } from "./Filter.js";

export class HTMLTable {

    constructor(table, options = null, firstOptionValue = "aucun")
    {
        this.table = table;
        console.log("table", this.table)
        this.firstOptionValue = firstOptionValue;
        this.options = options;
        this.alphabets = {
            0: "a",
            1: "b",
            2: "c",
            3: "d",
            4: "e",
            5: "f",
            6: "g",
            7: "h",
            8: "i",
            9: "j",
            10: "k",
            11: "l",
            12: "m",
            13: "n",
            14: "o",
            15: "p",
            16: "q",
            17: "r",
            18: "s",
            19: "t",
            20: "u",
            21: "v",
            22: "w",
            23: "x",
            24: "y",
            25: "z"
        }

        this.rowsStackArray = [];
        // For column of cells with letter values
        this.sortedNumericValuesOfFirstLetterOfCellsValues;
        // For column of cells with date values
        this.sortedDates;
        // Two properties below are for column of cells with hour values
        this.sortedNewDates
        this.unsortedNewDates;

        this.sortedRows = [];
        this.unsortedRows = [];

        this.tbody;
        this.rows;
    }

    /**
     * Event handler
     * You use this after a click on a button or anything else to enable the filter
     */
    initFilter()
    {
        this.tbody = this.table.querySelector("tbody");
        this.rows = Array.from(this.table.querySelectorAll("tbody tr"));
        
        new FilterAndSort(this, this.options);
    }

    getTableHTML()
    {
        return this.table;
    }    

    /**
     * 
     * @param {HTMLTableElement} th : th element
     */
    addSelectIntoTHElement(th)
    {
        const select = createElement("select");
        this.innerSelectOptions(select, th);

        const sortIcon = th.querySelector("svg");
        if(sortIcon){
            sortIcon.before(select);
        }else {
            th.innerHTML = "";
            th.appendChild(select)
        }
        
    }

    innerSelectOptions(select, th)
    {
        const index = th.getAttribute("f-idx");
        const cells = this.table.querySelectorAll(`td[f-column-idx='${index}']`);
        
        // insert option with value "aucun" as the first item allowing to unselect item
        this.insertOptionIntoSelectWithValue(select, this.firstOptionValue);

        if(this.options 
            && "doubleUniqueValues" in this.options
            && index in this.options.doubleUniqueValues
        ){
            this.options.doubleUniqueValues[index].forEach(value => {
                this.insertOptionIntoSelectWithValue(select, value);
            });

            return;
        }

        let columnUniqueValues = [];
        cells.forEach(cell => {
            const cellValue = cell.innerText
            if(!columnUniqueValues.includes(cellValue)){
                columnUniqueValues.push(cellValue);

                this.insertOptionIntoSelectWithValue(select, cellValue);
            }
        });
    }

    insertOptionIntoSelectWithValue(select, value)
    {
        const option = createElement("option");
        option.value = value;
        option.innerText = value[0].toUpperCase() + value.slice(1);

        select.appendChild(option);
    }

    addIconIntoTHElement(th, sortableOnly=false)
    {
        if(this.addedSelect){
            throw new Error("Select elements have already been inserted. Make sure calling 'addIconIntoTHElement' method before 'addSelectIntoTHElement' method")
        }
        
        // Don't add sorting feature to THElement having "not-sortable" attribute
        if(th.hasAttribute("not-sortable")){
            return;
        }

        if(!sortableOnly){
            th.innerHTML = SortIcon({"sorted" : false});
        }else {
            th.innerHTML = th.innerText + SortIcon({"sorted" : false});
            
        }
        
    }

    addOptions(options)
    {
        this.options = options;
    }

    filter(selects)
    {
        /*
         * this object will contain indexes of rows in this.rows property with number of cells with matching values
         * example : {0: 2, 3: 1, 4: 1} as indexes 0, 3, 4 are rows indexes in the this.rows property and values 2, 1, 1 are number of cells with matching values of each row
        */
        let rowsIndexWithNumberOfCellsMatchingSelectsValues = {};
        // If and only if row contains cells with matching value as many as this variable value, the row is considered as showable
        let numberOfCellsOfARowWithMatchingValueToBeConsideredAsValid = selects.length;
        
        selects.forEach(select => {
            const selectedIndex = select.selectedIndex;
            const selectedOption = select.options.item(selectedIndex);
            const selectedOptionValue = selectedOption.value;

            const thIndex = select.parentElement.getAttribute('f-idx');
            if(is_null(thIndex)){
                throw new Error("You surely forgot to define 'f-idx' attribute in one of <th> element parent of select element");
            }

            // If value match nothing value, reduce by 1 the number of selects with value of validation then return
            if(selectedOptionValue.toLowerCase() === this.firstOptionValue){
                numberOfCellsOfARowWithMatchingValueToBeConsideredAsValid--;

                return;
            }

            this.rows.forEach(row => {
                const cell = row.cells.item(thIndex-1);
                const svgInsideCell = cell.querySelector("svg");
                if((cell.innerText.toLowerCase() === selectedOptionValue.toLowerCase()
                    || (svgInsideCell && svgInsideCell.getAttribute("value-like") === selectedOptionValue.toLowerCase()))
                    && selectedOptionValue.toLowerCase() !== this.firstOptionValue
                ){
                    const rowIndex = this.rows.indexOf(row);
                    
                    if(rowIndex in rowsIndexWithNumberOfCellsMatchingSelectsValues === false){
                        rowsIndexWithNumberOfCellsMatchingSelectsValues[rowIndex] = 1;
                    }else {
                        rowsIndexWithNumberOfCellsMatchingSelectsValues[rowIndex]++;
                    }
                }
            });
        });

        if(numberOfCellsOfARowWithMatchingValueToBeConsideredAsValid === 0){
            this.rows.forEach(row => {
                this.showHiddenRow(row);
            })

            return;
        }

        this.rows.forEach(row => {
            const rowIndex = this.rows.indexOf(row);
            /* 1. Hide all rows not matching the filter : they without enough and they without any cells with matching values
               2. Show all rows with enough cells having matching values
            */
            const notEnoughCellsWithMatchingvalues = rowIndex in rowsIndexWithNumberOfCellsMatchingSelectsValues 
                && rowsIndexWithNumberOfCellsMatchingSelectsValues[rowIndex] !== numberOfCellsOfARowWithMatchingValueToBeConsideredAsValid;
            const noCellsWithMatchingValues = rowIndex in rowsIndexWithNumberOfCellsMatchingSelectsValues === false;
            if((notEnoughCellsWithMatchingvalues
                || noCellsWithMatchingValues)
                && !row.hasAttribute("hidden")
            ){
                row.hidden = true;
            }else if(rowsIndexWithNumberOfCellsMatchingSelectsValues[rowIndex] === numberOfCellsOfARowWithMatchingValueToBeConsideredAsValid
                && row.hasAttribute("hidden")
            ){
                row.removeAttribute("hidden");
            }
        })
    }

    /**
     * 
     * @param {HTMLTableRowElement} row 
     */
    showHiddenRow(row)
    {
        if(row.hasAttribute("hidden")){
            row.removeAttribute("hidden");
        }
    }

    sort(e)
    {
        const {currentColumnCells, firstColumnCell, cells} = this.filterCells(e);
        
        if(this.columnContainsLetter(firstColumnCell, currentColumnCells)){
            if(this.sortedNumericValuesOfFirstLetterOfCellsValues){
                this.sortedNumericValuesOfFirstLetterOfCellsValues = this.sortedNumericValuesOfFirstLetterOfCellsValues.reverse();
            }else {
                this.sortedNumericValuesOfFirstLetterOfCellsValues = currentColumnCells
                    .map(cell => cell.innerHTML[0])
                    .map(firstLetter => {
                        let numeric;
                        for(let idx in this.alphabets){
                            if(this.alphabets[idx] === firstLetter.toLowerCase()){
                                numeric = parseInt(idx);
                            }
                        }
        
                        return numeric;
                    }).sort();
            }

            this.sortLettersColumn(currentColumnCells);
            
        }else if(isDate(firstColumnCell.innerText)){
            let cellIndexWithValue = {};
            if(this.sortedDates){
                currentColumnCells.forEach(cell => {
                    cellIndexWithValue[currentColumnCells.indexOf(cell)] = cell.innerText;
                });
            }else {
                this.sortedDates = currentColumnCells.map(cell => {
                    cellIndexWithValue[currentColumnCells.indexOf(cell)] = cell.innerText;
        
                    return cell.innerText;
                }).sort();
            }
            
            this.sortDateColumn(cellIndexWithValue);
        }else if(isHour(firstColumnCell.innerText) || 
            currentColumnCells.filter(cell => isHour(cell.innerText)).length > 0
        ){
            // combine date and hour values to form new Date then compare each other
            const dateColumnCells = cells.filter(cell => isDate(cell.innerText));
                            
            const newDates = currentColumnCells.map((cell, idx) => {
                // if hour is not mentioned, we consider it to be the lowest time "00:01:00"
                const hour = isHour(cell.innerText) ? `${cell.innerText}:00` : "00:01:00";
                return `${dateColumnCells[idx].innerText} ${hour}`; 
            });

            if(!this.sortedNewDates){
                const newDatesCopy = [...newDates];
                this.sortedNewDates = newDatesCopy.sort();
            }
            
            this.sorteHourColumn(newDates);
        }
        
        this.table.querySelector("tbody").innerHTML = "";
        this.sortedRows.forEach(row => this.table.querySelector("tbody").appendChild(row));

    }

    filterCells(e, forReverseSorting=false)
    {
        const currentClickedButton = e.currentTarget;
        const currentColumnHead = currentClickedButton.parentElement;
        forReverseSorting ? currentColumnHead.removeAttribute("sorted") : currentColumnHead.setAttribute("sorted", "true");

        const currentColumnIdx = currentColumnHead.getAttribute("f-idx");
        const cells = Array.from(this.table.querySelectorAll("td"));
        const currentColumnCells = cells.filter(td => td.hasAttribute("f-column-idx") && td.getAttribute('f-column-idx') === currentColumnIdx);
            
        const firstColumnCell = currentColumnCells[0];

        return {firstColumnCell, currentColumnCells, cells};
    }

    unsort(e)
    {
        const {firstColumnCell, currentColumnCells, cells} = this.filterCells(e, true);

        if(this.columnContainsLetter(firstColumnCell, currentColumnCells)){
            this.sortedNumericValuesOfFirstLetterOfCellsValues = this.sortedNumericValuesOfFirstLetterOfCellsValues.reverse();
            
            this.sortLettersColumn(currentColumnCells, true);
        }else if(isDate(firstColumnCell.innerText)){            
            const cellIndexWithValue = {};
            this.sortedDates = currentColumnCells.map(cell => {
                cellIndexWithValue[currentColumnCells.indexOf(cell)] = cell.innerText;
    
                return cell.innerText;
            }).sort();

            const sortedDatesCopy = [...this.sortedDates];
            this.unsortedDates = sortedDatesCopy.reverse();
        }else if(isHour(firstColumnCell.innerText) || 
            currentColumnCells.filter(cell => isHour(cell.innerText)).length > 0
        ){
            const dateColumnCells = cells.filter(cell => isDate(cell.innerText));
                            
            const newDates = currentColumnCells.map((cell, idx) => {
                // if hour is not mentioned, we consider it to be the lowest time "00:01:00"
                const hour = isHour(cell.innerText) ? `${cell.innerText}:00` : "00:01:00";
                return `${dateColumnCells[idx].innerText} ${hour}`; 
            });
            
            if(!this.unsortedNewDates){
                const sortedDates = [...newDates];
                this.unsortedNewDates = sortedDates.reverse();
            }
            
            this.sorteHourColumn(newDates, true)
        }
        
        this.table.querySelector("tbody").innerHTML = "";
        this.unsortedRows.forEach(row => this.table.querySelector("tbody").appendChild(row));
    }

    columnContainsLetter(firstColumnCell, currentColumnCells)
    {
        return isLetter(firstColumnCell.innerText) && currentColumnCells.filter(cell => isHour(cell.innerText)).length === 0;
    }

    /**
     * 
     * @param {HTMLTableCellElement[]} currentColumnCells cells of the current column to sort
     */
    sortLettersColumn(currentColumnCells, isReverse=false)
    {
        this.sortedNumericValuesOfFirstLetterOfCellsValues.forEach(numeric => {
            const firstLetter = this.alphabets[numeric];
            currentColumnCells.forEach(cell => {
                if(!isReverse && cell.innerHTML[0]===firstLetter && !this.sortedRows.includes(cell.parentElement)){
                    this.sortedRows.push(cell.parentElement);
                }else if(isReverse && cell.innerHTML[0]===firstLetter && !this.unsortedRows.includes(cell.parentElement)){
                    this.unsortedRows.push(cell.parentElement);
                }
            })
        })
    }

    sortDateColumn(cellIndexWithValue, isReverse=false)
    {
        const toLoopDates = isReverse ? this.unsortedDates : this.sortedDates;

        toLoopDates.forEach(date => {
            for(const i in cellIndexWithValue){
                if(cellIndexWithValue[i]=== date){
                    isReverse ? this.unsortedRows.push(this.table.querySelectorAll('tbody tr')[i]) 
                        : this.sortedRows.push(this.table.querySelectorAll('tbody tr')[i]);
                }
            }
        });
    }

    sorteHourColumn(newDates, isReverse=false)
    {
        const newDatesToLoop = isReverse ? this.unsortedNewDates : this.sortedNewDates
        newDatesToLoop.forEach(date => {
            for(const i in newDates){
                if(date === newDates[i]){
                    isReverse ? this.unsortedRows.push(this.table.querySelectorAll('tbody tr')[i]) : this.sortedRows.push(this.table.querySelectorAll('tbody tr')[i]);
                }
            }
        })
    }
}