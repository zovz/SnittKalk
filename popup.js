document.getElementById('calculateGrades').addEventListener('click', () => {
    // Reset the dropdown menu to default position
    document.getElementById('options').selectedIndex = 0;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: extractGrades
        }, (results) => {
            const grades = results[0].result;
            displayGrades(grades);
        });
    });
});

// document.getElementById('sortAsc').addEventListener('click', () => sortCourses('asc'));
// document.getElementById('sortDesc').addEventListener('click', () => sortCourses('desc'));
document.getElementById('sortToggle').addEventListener('change', () => {
    document.getElementById('options').selectedIndex = 0;
    currentSortOrder = document.getElementById('sortToggle').checked ? 'asc' : 'desc';
    displayGrades(gradesData);
});

let gradesData = [];
let currentSortOrder = 'desc'; // Default sort order


document.getElementById('options').addEventListener('change', (event) => {
    const selectedOption = event.target.value;
    renderChart(selectedOption);
});



function extractGrades() {
    const rows = document.querySelectorAll('#resultatlisteForm tbody tr');
    const grades = [];
    rows.forEach(row => {
        if (!row.querySelector('.col2Emne .infoLinje') || !row.querySelector('.col6Resultat .infoLinje span') || !row.querySelector('.col7Studiepoeng span') || !row.querySelector('.col1Semester div[class="uuHidden"]')) {
            return 0;
        }
        const semesterElement = row.querySelector('.col2Emne .column-info');
        const course = semesterElement.getElementsByTagName('div')[1].innerText + " - " + semesterElement.getElementsByTagName('div')[2].innerText;
        const grade = row.querySelector('.col6Resultat .infoLinje span').innerText;
        const credits = parseFloat(row.querySelector('.col7Studiepoeng span').innerText.replace(',', '.'));
        const date = row.querySelector('.col1Semester div[class="uuHidden"]').innerText;
        grades.push({ course, grade, credits, date });  
    });
    return grades;
}



// Function to sort courses
function sortCourses(order) {
    currentSortOrder = order;
    displayGrades(gradesData);
}

// Update displayGrades to handle sorting
function displayGrades(grades) {
    gradesData = grades; // Store grades data for use in rendering charts
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';

    const semesterGroups = {};

    grades.forEach((grade, index) => {
        if (!semesterGroups[grade.date]) {
            semesterGroups[grade.date] = [];
        }
        semesterGroups[grade.date].push({ ...grade, index });
    });

    const sortedSemesters = Object.keys(semesterGroups).sort((a, b) => {
        if (currentSortOrder === 'asc') {
            return formatSortableDate(a).localeCompare(formatSortableDate(b));
        } else {
            return formatSortableDate(b).localeCompare(formatSortableDate(a));
        }
    });

    sortedSemesters.forEach(semester => {
        const semesterLi = document.createElement('li');
        const semesterSpan = document.createElement('span');
        semesterSpan.textContent = semester;

        semesterLi.appendChild(semesterSpan);
        courseList.appendChild(semesterLi);

        const courseUl = document.createElement('ul');
        semesterGroups[semester].forEach(grade => {
            const courseLi = document.createElement('li');
            courseLi.classList.add('course-li');
            const courseSpan = document.createElement('span');
            courseSpan.textContent = `${grade.course} - ${grade.grade} (${grade.credits} stp)`;
            const removeCourseButton = document.createElement('button');
            removeCourseButton.textContent = 'Remove';
            removeCourseButton.addEventListener('click', () => {
                document.getElementById('options').selectedIndex = 0;
                grades.splice(grade.index, 1);
                displayGrades(grades);
                calculateAndDisplayResults(grades);
            });
            courseLi.appendChild(courseSpan);
            courseLi.appendChild(removeCourseButton);
            courseUl.appendChild(courseLi);
        });

        semesterLi.appendChild(courseUl);

        const removeSemesterButton = document.createElement('button');
        removeSemesterButton.innerHTML = 'Remove<br/>Semester';
        removeSemesterButton.classList.add('removeSemesterButton');
        removeSemesterButton.addEventListener('click', () => {
            document.getElementById('options').selectedIndex = 0;
            grades = grades.filter(grade => grade.date !== semester);
            displayGrades(grades);
            calculateAndDisplayResults(grades);
        });
        semesterLi.appendChild(removeSemesterButton);
    });

    calculateAndDisplayResults(grades);
    renderChart('averageGrade'); // Default view
}

function calculateAndDisplayResults(grades) {
    if (grades.length === 0) {
        document.getElementById('averageGrade').textContent = 'N/A';
        document.getElementById('totalCredits').textContent = 'N/A';
        return;
    }
    const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);
    const filteredGrades = grades.filter(grade => grade.grade !== 'Bestått' && grade.grade !== 'Passed');
    const totalCreditsWithoutPassGrade = filteredGrades.reduce((sum, grade) => sum + grade.credits, 0);
    const gradeToPoint = {
        'A': 5,
        'B': 4,
        'C': 3,
        'D': 2,
        'E': 1,
        'F': 0,
    };

    const weightedSum = filteredGrades.reduce((sum, grade) => sum + gradeToPoint[grade.grade] * grade.credits, 0);
    const averageGrade = weightedSum / totalCreditsWithoutPassGrade;
    document.getElementById('averageGrade').textContent = averageGrade.toFixed(2);
    document.getElementById('totalCredits').textContent = totalCredits;
}

function formatSortableDate(date) {
    const [year, semester] = date.split(' ');
    if (semester === 'VÅR' || semester === 'SPRING') {
        return `${year}-1`;
    } else {
        return `${year}-2`;
    }
}

let chart;

function renderChart(view) {
    if (chart) {
        chart.destroy(); // Destroy previous chart instance if exists
    }

    const ctx = document.getElementById('gradesChart').getContext('2d');
    const semesterMap = {};

    let lastDate = '';
    let lastDateWithoutPass = '';
    gradesDataCopy = gradesData.slice();
    gradesDataCopy = gradesDataCopy.reverse();
    gradesDataCopy.forEach(({ date, grade, credits }) => {
        if (!semesterMap[date]) {
            semesterMap[date] = { totalGradePoints: 0, cumulativeGradePoints: 0, cumulativeTotalCreditsWithoutPass: 0, totalCredits: 0, totalCreditsWithoutPass: 0, cumulativeCredits: 0, count: 0};
        }
        const gradeToPoint = {
            'A': 5,
            'B': 4,
            'C': 3,
            'D': 2,
            'E': 1,
            'F': 0,
        };
        if (gradeToPoint[grade] !== undefined) {
            semesterMap[date].totalGradePoints += gradeToPoint[grade] * credits;
            semesterMap[date].totalCreditsWithoutPass += credits;
            if (lastDateWithoutPass) {
                semesterMap[date].cumulativeGradePoints = semesterMap[lastDateWithoutPass].cumulativeGradePoints + gradeToPoint[grade] * credits;
                semesterMap[date].cumulativeTotalCreditsWithoutPass = semesterMap[lastDateWithoutPass].cumulativeTotalCreditsWithoutPass + credits;
            }
            else {
                semesterMap[date].cumulativeGradePoints = gradeToPoint[grade] * credits;
                semesterMap[date].cumulativeTotalCreditsWithoutPass = credits;
            }
            lastDateWithoutPass = date;
        }
        semesterMap[date].totalCredits += credits;
        semesterMap[date].count += 1;

        if (lastDate) {
            semesterMap[date].cumulativeCredits = semesterMap[lastDate].cumulativeCredits + credits;
        }
        else {
            semesterMap[date].cumulativeCredits = credits;
        }
        lastDate = date;
    });

    const labels = Object.keys(semesterMap)
        .sort((a, b) => formatSortableDate(a).localeCompare(formatSortableDate(b)));
    const averageGrades = labels.map(label => semesterMap[label].totalGradePoints / semesterMap[label].totalCreditsWithoutPass);
    const totalCredits = labels.map(label => semesterMap[label].totalCredits);
    const cumulativeAverageGrades = labels.map(label => semesterMap[label].cumulativeGradePoints / semesterMap[label].cumulativeTotalCreditsWithoutPass);

    const gradeCounts = {};
    const weightedGrades = {};

    gradesData.forEach(({ grade, credits }) => {
        if (!gradeCounts[grade]) {
            gradeCounts[grade] = 0;
        }
        gradeCounts[grade] += 1;

        if (!weightedGrades[grade]) {
            weightedGrades[grade] = 0;
        }
        weightedGrades[grade] += credits;
    });

    const defaultGrades = ['A', 'B', 'C', 'D', 'E', 'F'];
    const foundGrades = Object.keys(gradeCounts).filter(grade => !defaultGrades.includes(grade));
    const allGrades = defaultGrades.concat(foundGrades);

    const gradeData = allGrades.map(grade => gradeCounts[grade] || 0);
    const weightedGradeData = allGrades.map(grade => ((weightedGrades[grade] || 0) / gradesData.reduce((sum, { credits }) => sum + credits, 0)) * 100);

    const data = {
        labels,
        datasets: []
    };

    if (view === 'averageGrade') {
        data.datasets.push({
            label: 'Average Grade',
            data: averageGrades,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y',
        });
    } else if (view === 'totalCredits') {
        data.datasets.push({
            label: 'Total Credits',
            data: totalCredits,
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            yAxisID: 'y',
        });
    } else if (view === 'cumulativeCredits') {
        data.datasets.push({
            label: 'Cumulative Credits',
            data: labels.map(label => semesterMap[label].cumulativeCredits),
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
            yAxisID: 'y',
        });
    } else if (view === 'cumulativeAverageGrade') {
        data.datasets.push({
            label: 'Average Grade Over Time',
            data: cumulativeAverageGrades,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            yAxisID: 'y',
        });
    } else if (view === 'gradeCount') {
        data.labels = allGrades;
        data.datasets.push({
            label: 'Grade Count',
            data: gradeData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        });
    } else if (view === 'weightedGrade') {
        data.labels = allGrades;
        data.datasets.push({
            label: 'Weighted Grade (%)',
            data: weightedGradeData,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
        });
    }

    // Detect if dark mode is enabled
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    chart = new Chart(ctx, {
        type: view === 'gradeCount' || view === 'weightedGrade' ? 'bar' : 'line',
        data: data,
        options: {
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: view === 'averageGrade' ? 'Grade' : view === 'totalCredits' ? 'Credits' : view === 'cumulativeCredits' ? 'Credits' : view === 'cumulativeAverageGrade' ? 'Grade' : view === 'gradeCount' ? 'Count' : 'Percentage',
                    },
                    grid: {
                        color: isDarkMode ? '#444' : '#ccc'
                    }
                },
                x: {
                    grid: {
                        color: isDarkMode ? '#444' : '#ccc'
                    }
                }
            }
        }
    });
}

// Listen for changes in color scheme and re-render the chart if it changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    renderChart(document.getElementById('options').value);
});
