import { NotADateError } from "./class.js"
/**
 * 
 * @param {any} element 
 * @returns boolean
 */
function isUndefined(element)
{
    return element === undefined
}

function is_null(element){
    return element === null;
}

/**
 * 
 * @param {string} type 
 * @param {string} className 
 * @returns HTMLElement
 */
function createElement(type, className = null) {
    let element = document.createElement(type)
    if(className !== null) {
        element.className = className
    }

    return element
}

const isLetter = (value)=>{
    return !is_null(value.match(/[A-Za-z]/));
}

const isDate = (value)=>{
    try {
        const dateParts = value.split("-");
        if(dateParts.length < 3 
            || dateParts.filter(part => typeof parseInt(part) === "number").length < 3
        ){
            throw new NotADateError("Cette valeur ne représente pas une date");
        }

        return true;
    }catch(e){
        return e instanceof NotADateError ? false : true;
    }
}

const isHour = (value)=>{
    const hourArray = value.split(":");
    return hourArray.length >= 2 && hourArray[0].length === 2 && hourArray[1].length === 2
        && typeof parseInt(hourArray[0]) === "number" && typeof parseInt(hourArray[1]) === "number";
}

export {
    isLetter,
    isDate,
    isHour,
    createElement,
    is_null,
    isUndefined
}