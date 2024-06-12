        //         } else {
        //             const hold_course = row.querySelector('.col2Emne .infoLinje').innerText;
        //             const hold_grade = row.querySelector('.col6Resultat .infoLinje span').innerText;
        //             const hold_credits = parseFloat(row.querySelector('.col7Studiepoeng span').innerText);
        //             if (!row.querySelector('.col4ResultatDato span')) {
        //                 WaitForDate = true;
        //             }
        // |       }
                
        //         if (row.querySelector('.col2Emne .infoLinje') || !row.querySelector('.col6Resultat .infoLinje span') || !row.querySelector('.col7Studiepoeng span')) {
        //             console.log(row)
        //             return;
        //         }
        //             const course_ = row.querySelector('.col2Emne .infoLinje').innerText;
        //             const grade = row.querySelector('.col6Resultat .infoLinje span').innerText;
        //             const credits = parseFloat(row.querySelector('.col7Studiepoeng span').innerText);
        //             const date = row.querySelector('.col4ResultatDato span').innerText;
        //             console.log(course, grade, credits, date);
        //             grades.push({ course, grade, credits, date });

        // If date is not available, but course, grade and credits are available, then put course, grade and credits in hold variables and wait for date
        // if (!row.querySelector('.col4ResultatDato span') && (row.querySelector('.col2Emne .infoLinje') && row.querySelector('.col6Resultat .infoLinje span') && row.querySelector('.col7Studiepoeng span'))) {
        //     console.log("Case 1")
        //     console.log(row)
        //     try {
        //         // const course = row.querySelector('.col2Emne .infoLinje').innerText;
        //         // console.log(course)
        //         hold_course = row.querySelector('.col2Emne .infoLinje').innerText;
        //         hold_grade = row.querySelector('.col6Resultat .infoLinje span').innerText;
        //         hold_credits = parseFloat(row.querySelector('.col7Studiepoeng span').innerText);

        //     } catch (error) {
        //         console.log("Hold variables are empty")
        //     }
            
        //     WaitForDate = true;
        // } else if (WaitForDate && row.querySelector('.col4ResultatDato span')) {
        //     console.log("Case 3")
            
        //     const date = row.querySelector('.col4ResultatDato span').innerText;
        //     grades.push({ course: hold_course, grade: hold_grade, credits: hold_credits, date });
        //     console.log(hold_course, hold_grade, hold_credits, date);
        //     console.log(row)
        //     WaitForDate = false;
        // } else if (!row.querySelector('.col2Emne .infoLinje') || !row.querySelector('.col6Resultat .infoLinje span') || !row.querySelector('.col7Studiepoeng span') || !row.querySelector('.col4ResultatDato span')){
        // console.log("Case 2")
        // console.log("Skip!")
        // console.log(row)
        // return;
        // }
        // else {
        //     console.log("Case 4");
            
        //     const course = row.querySelector('.col2Emne .infoLinje').innerText;
        //     const grade = row.querySelector('.col6Resultat .infoLinje span').innerText;
        //     const credits = parseFloat(row.querySelector('.col7Studiepoeng span').innerText);
        //     const date = row.querySelector('.col4ResultatDato span').innerText;
        //     console.log(course, grade, credits, date);
        //     console.log(row);
        //     grades.push({ course, grade, credits, date });
        // }