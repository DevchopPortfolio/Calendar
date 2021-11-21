
//  variable that links to the currently active day cell
let activecell;

// create links to elements in html
const celllink = document.querySelector('#celltemplate');      /*cell template */
const monthlink = document.querySelector('#monthtemplate');    /*month template */
const formlink = document.querySelector('#form');              /*form template */
const inputlink = document.querySelector('#textinput');        /*text input template */
const infobarDaylink = document.querySelector('#infobar #weekday');      /*infobar weekday*/
const infobarDatelink = document.querySelector('#infobar #date');        /*infobar date*/
const infobarMonthlink = document.querySelector('#infobar #month');      /*infobar month*/
const infobarCodelink = document.querySelector('#infobar #code');        /*infobar code*/
const infobarWeeklink = document.querySelector('#infobar #week');        /*infobar code*/

// users fav day - get values from session storage
const favmonth = Number(sessionStorage.getItem('favmonth'));
const favday = Number(sessionStorage.getItem('favday'));

// anatomy of a year
const firstofjan = sessionStorage.getItem('starton') || 0;
const daysinfeb = sessionStorage.getItem('leapyear') || 28;      //short-circuit operators ensure blank values from user input don't return null
const dpm = [firstofjan, 31, daysinfeb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31];    //dpm = days per month
const monthname = ['Dec.', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan.'];
const weekdayname = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// get style values from CSS custom properties in stylesheet
const rawcellheight = getComputedStyle(document.documentElement).getPropertyValue('--cellheight');
const cellheight = Number(rawcellheight.substring(0, rawcellheight.length - 3));
const rawgapsize = getComputedStyle(document.documentElement).getPropertyValue('--gapsize');
const gapsize = Number(rawgapsize.substring(0, rawgapsize.length - 3));


// populate month array - which stores data about each month 
// data taken from 'anatomy of year' variables

const month = [];

for (let i = 0; i < 14; i++) {

    month[i] = {
        name : monthname[i],
        dpm : dpm[i],
        startsonweek : 0,        
        span : 0
    };
    
};


// LOOP TO CREATE EACH DAY OF THE CALENDAR - RECORDING DATE, DAY, DAYNUM, MONTH, WEEK

let thisday = 1;
let thisweek = 1;
let thisdaycode = 0;        //daycode is a day's unique ID number, starting from 0

for (let thismonth = 0; thismonth <= 13; thismonth++) {                 //loop each month

    for (let thisdate = 1; thisdate <= dpm[thismonth]; thisdate++) {    //loop each day

        let thisweekL = thisweek;                            /* local copy of global variable */
        let thisdayL = thisday;                              /* local copy of global variable */
        let thisdaycodeL = thisdaycode;                      /* local copy of global variable */

        let thisdateCorrected = thisdate;
        if (thismonth == 0) {
            thisdateCorrected = thisdate + (31 - month[0].dpm);            /* first month only has 1 week, so date adjustment is necessary*/
        };

        createcell(thisdateCorrected, thismonth, thisdayL, thisweekL, thisdaycodeL);       /* create today's cell, using today's data */
       
        if (thisdate == 1) {            
            month[thismonth].startsonweek = thisweek;            /* on 1st day of month, record this month's starting week number */
        };

        thisdaycode++;                                           /**increment daycode */
        thisday++;                                               /**increment day */
        if (thisday == 8 && thismonth == 13) {break};           /* exit loop after final day */
        if (thisday == 8) {thisday = 1; thisweek++};             /* start a new week */

    };
};


/* CREATES A CELL FOR THE SPECIFIED DAY */

function createcell (thisdate, thismonth, thisday, thisweek, thisdaycode) {

    // make a copy of HTML template cell
    let newcell = celllink.cloneNode(true);              
    
    // set data to the new cell    
    newcell.setAttribute('class', 'cell');
    newcell.setAttribute('data-date', thisdate.toString());
    newcell.setAttribute('data-month', month[thismonth].name);
    newcell.setAttribute('data-day', thisday.toString());
    newcell.setAttribute('data-week', thisweek.toString()); 
    newcell.setAttribute('data-code', thisdaycode.toString()); 
    newcell.removeAttribute('id');
    
    // set data to new cell's marker box 
    newcell.querySelector('#cellmarkertemplate').setAttribute('class', 'cellmarker');    
    newcell.querySelector('#cellmarkertemplate').innerHTML = thisdate;
    newcell.querySelector('#cellmarkertemplate').removeAttribute('id');

    // set data to new cell's comment box 
    if ( thismonth == favmonth && thisdate == favday ) {newcell.querySelector('#cellcommenttemplate').innerHTML = "Favourite day"};
    newcell.querySelector('#cellcommenttemplate').setAttribute('class', 'cellcomment');
    newcell.querySelector('#cellcommenttemplate').removeAttribute('id');

    // add a click event listener to new cell
    newcell.addEventListener('click', () => {        
        formworker(newcell);        
    });

    //append new cell to HTML doc
    document.querySelector('main').appendChild(newcell);   
    
};


// after user clicks a cell, attach the text input form to it

function formworker (thiscell) {

    if (activecell !== thiscell) {          //ignore if this cell is already active

        activecell = thiscell;               //this cell becomes the active cell
        
        //creates link to this cell's comment element
        let activecomment = thiscell.querySelector('.cellcomment');
        
        //copy this cell's comment text to the form
        inputlink.value = activecomment.innerText;
        
        //delete this cell's comment text
        activecomment.innerText = '';                    
        
        //attach form to this cell
        activecomment.appendChild(formlink);
        
        //make form visible
        formlink.classList.remove('invisible');
        
        //set keyboard focus to the form
        inputlink.focus();

        //populate the infobar with this cell's metadata
        infobarDaylink.innerText = weekdayname[thiscell.getAttribute('data-day') - 1 ];
        infobarDatelink.innerText = thiscell.getAttribute('data-date');
        infobarMonthlink.innerText = thiscell.getAttribute('data-month');
        let daycode = Number( thiscell.getAttribute('data-code') ) - (firstofjan-1);
        infobarCodelink.innerText = 'Day: ' + daycode;
        infobarWeeklink.innerText = 'Week: ' + thiscell.getAttribute('data-week');
                      

    };

};


// when the textinput form loses keyboard focus, close it and copy its text to the active day cell

inputlink.addEventListener('focusout', () => {            

    formlink.classList.add('invisible');
    formlink.remove();
    
    //copy the input form's text to the active cell
    activecell.querySelector('.cellcomment').innerText = inputlink.value;
    
    //no cell is now active
    activecell = -1;
});


// function is auto-called by HTML form element when the form is submitted
// function submitted() {
//     temporaryinput.blur()
// }


// calculate value of 'span' for each month (how many weeks each month covers)

for (let thismonth = 0; thismonth < 13; thismonth++) {    
    month[thismonth].span = month[thismonth+1].startsonweek - month[thismonth].startsonweek;
};

month[13].span = 1;     //Jan of next year is only 1 week 


// INSERT THE MONTH ELEMENTS ONTO THE SIDEFRAME

month.forEach(monthitem => {

    if (monthitem.name !== 'Dec.') {

        //make a copy of the HTML month template
        let newmonth = monthlink.cloneNode(true);

        //calculate the height of this month's row according to the number of weeks it spans
        let heightval = ((cellheight * monthitem.span) + (gapsize * (monthitem.span-1)));
        
        newmonth.removeAttribute('id');
        newmonth.setAttribute('class', 'monthcell');
        newmonth.style.setProperty('height', heightval.toString() + 'rem');     
        newmonth.querySelector('span').innerHTML = monthitem.name;

        //append this month element to the sideframe elememnt
        document.querySelector('#sideframe').appendChild(newmonth);

    };

});
