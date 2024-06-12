function extractGrades() {
    const rows = document.querySelectorAll('#resultatlisteForm tbody tr');
    const grades = [];
    // var hold_course = "";
    // var hold_grade = ""; 
    // var hold_credits = 0;
    // var WaitForDate = false;
    rows.forEach(row => {
        //Add exception if courseElement, gradeElement, creditsElement, dateElement is null
        if (!row.querySelector('.col2Emne .infoLinje') || !row.querySelector('.col6Resultat .infoLinje span') || !row.querySelector('.col7Studiepoeng span') || !row.querySelector('.col1Semester div[class="uuHidden"]')) {
            return;
        }
        console.log(row);
        const course = row.querySelector('.col2Emne .infoLinje').innerText;
        const grade = row.querySelector('.col6Resultat .infoLinje span').innerText;
        const credits = parseFloat(row.querySelector('.col7Studiepoeng span').innerText.replace(',', '.'));
        const date = row.querySelector('.col1Semester div[class="uuHidden"]').innerText; //row.querySelector('.col4ResultatDato span').innerText;
        console.log(course, grade, credits, date);
        grades.push({ course, grade, credits, date });  
    });
    return grades;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractGrades') {
        sendResponse({ grades: extractGrades() });
    }
});
