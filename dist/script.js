document.getElementById("anemiaForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Fetching input values
    const lmp = new Date(document.getElementById("lmp").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const currentHb = parseFloat(document.getElementById("currentHb").value);

    // Calculate POG (Period of Gestation) in weeks
    const today = new Date();
    const timeDifference = today - lmp;
    const pogWeeks = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
    document.getElementById("pogResult").innerText = `POG: ${pogWeeks} weeks`;

    // Determine Trimester
    let trimester = '';
    if (pogWeeks < 14) {
        trimester = "First";
    } else if (pogWeeks < 28) {
        trimester = "Second";
    } else {
        trimester = "Third";
    }

    // Anemia Classification
    let anemiaGrade = '';
    if (currentHb < 7) {
        anemiaGrade = "Severe";
    } else if (currentHb < 10) {
        anemiaGrade = "Moderate";
    } else {
        anemiaGrade = "Mild";
    }

    // Treatment plan logic
    let treatmentPlan = '';
    if (currentHb < 5) {
        treatmentPlan = "Blood Transfusion is required.";
    } else if (anemiaGrade === "Severe") {
        if (pogWeeks > 34) {
            treatmentPlan = "Blood Transfusion";
        } else {
            treatmentPlan = "Injectable Iron is recommended.";
        }
    } else if (anemiaGrade === "Moderate") {
        if (pogWeeks < 34) {
            treatmentPlan = "Oral Iron Tablets (2 tablets/day)";
        } else {
            treatmentPlan = "Injectable Iron is recommended.";
        }
    } else {
        treatmentPlan = "Oral Iron Tablets (2 tablets/day)";
    }
    document.getElementById("treatmentResult").innerText = `Treatment Plan: ${treatmentPlan}`;

    // Calculate follow-up date
    const followUpDate = new Date();
    followUpDate.setDate(today.getDate() + 30);
    document.getElementById("followUpDate").innerText = `Follow-up Date: ${followUpDate.toDateString()}`;

    // Calculate total iron dose using Ganzoni formula
    const totalIronDose = calculateGanzoniDose(weight, currentHb);
    document.getElementById("ironDoseResult").innerText = `Total Iron Dose (Ganzoni): ${totalIronDose.toFixed(2)} mg`;

    // Show or hide the IV dosing container based on the treatment plan
    const ivDosingContainer = document.getElementById("ivDosingContainer");
    if (treatmentPlan.includes("Injectable Iron")) {
        ivDosingContainer.style.display = "block";  // Show the IV container
        const ironSucroseBody = document.getElementById("ironSucroseBody");
        const ferricCarboxymaltoseBody = document.getElementById("ferricCarboxymaltoseBody");

        ironSucroseBody.innerHTML = '';  // Clear previous Iron Sucrose table content
        ferricCarboxymaltoseBody.innerHTML = '';  // Clear previous FCM table content

        const ironSucroseSchedule = calculateIvDosingIronSucrose(totalIronDose);
        const ferricCarboxymaltoseSchedule = calculateIvDosingFCM(totalIronDose);

        // Populate Iron Sucrose Table
        ironSucroseSchedule.forEach(function(session) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${session.session}</td>
                <td>${session.date}</td>
                <td>${session.sucroseDose}</td>
            `;
            ironSucroseBody.appendChild(row);
        });

        // Populate Ferric Carboxymaltose Table
        ferricCarboxymaltoseSchedule.forEach(function(session) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${session.session}</td>
                <td>${session.date}</td>
                <td>${session.carboxymaltoseDose}</td>
            `;
            ferricCarboxymaltoseBody.appendChild(row);
        });
    } else {
        ivDosingContainer.style.display = "none";  // Hide the IV container if not required
    }
});

// Calculate Ganzoni formula for total iron dose
function calculateGanzoniDose(weight, currentHb) {
    return (weight * (15 - currentHb) * 2.4) + 500;
}

// Calculate IV dosing schedule for Iron Sucrose
function calculateIvDosingIronSucrose(totalIronDose) {
    const ironSucroseDosePerSession = 200; // 200 mg per session
    const schedule = [];
    const today = new Date();

    let remainingDose = totalIronDose;

    let sessionCount = 1;
    while (remainingDose > 0) {
        const doseForThisSession = Math.min(ironSucroseDosePerSession, remainingDose);
        const sessionDate = new Date(today);
        schedule.push({
            session: sessionCount,
            date: sessionDate.toDateString(),
            sucroseDose: `${doseForThisSession} mg`
        });
        remainingDose -= doseForThisSession;
        today.setDate(today.getDate() + 7); // 1 week gap
        sessionCount++;
    }

    return schedule;
}

// Calculate IV dosing schedule for Ferric Carboxymaltose
function calculateIvDosingFCM(totalIronDose) {
    const fcmDosePerSession = 1000; // Max 1000 mg per week
    const schedule = [];
    const today = new Date();

    let remainingDose = totalIronDose;

    let sessionCount = 1;
    while (remainingDose > 0) {
        const doseForThisSession = Math.min(fcmDosePerSession, remainingDose);
        const sessionDate = new Date(today);
        schedule.push({
            session: sessionCount,
            date: sessionDate.toDateString(),
            carboxymaltoseDose: `${doseForThisSession} mg`
        });
        remainingDose -= doseForThisSession;
        today.setDate(today.getDate() + 7); // 1 week gap
        sessionCount++;
    }

    return schedule;
}