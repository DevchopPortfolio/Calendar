
// function is called when the user submits the form

function formsubmitted (starton, leapyear, favdate) {
    
    
    sessionStorage.setItem('starton', starton)
    
    sessionStorage.setItem('leapyear', leapyear)

    let favmonth = favdate.substring(5, 7)
    sessionStorage.setItem('favmonth', favmonth)

    let favday = favdate.substring(8, 10)    
    sessionStorage.setItem('favday', favday)
    




    location.href = "./calendar.html"

}
