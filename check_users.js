const admin = require('./backend/src/config/firebaseAdmin');

async function checkAdmin() {
    try {
        const db = admin.firestore();
        const usersSnapshot = await db.collection('users').get();

        console.log(`Found ${usersSnapshot.size} total users in Firestore.`);
        if (usersSnapshot.size === 0) {
            console.log("No users found. To fix: login once as student using admin@msrit.edu, then I will assign the admin role.");
        }

        let foundAdmin = false;
        for (let docSnapshot of usersSnapshot.docs) {
            const data = docSnapshot.data();
            console.log(`ID: ${docSnapshot.id} | Email: ${data.email} | Role: ${data.role}`);

            if (data.email === 'admin@msrit.edu') {
                foundAdmin = true;
                if (data.role !== 'admin') {
                    console.log(`-> Need to promote ${data.email}...`);
                    await db.collection('users').doc(docSnapshot.id).update({ role: 'admin' });
                    console.log(`-> Successfully updated ${data.email} to 'admin' role!`);
                } else {
                    console.log(`-> ${data.email} is already an 'admin'.`);
                }
            }
        }

        if (!foundAdmin && usersSnapshot.size > 0) {
            console.log("\nThe user 'admin@msrit.edu' is NOT in the database.");
            console.log("To fix: You must first register/login this email on the frontend (Student tab) to create the account in Firestore, so I can assign it the admin role.");
        }

    } catch (e) {
        console.error("Error reading users:", e.message);
    }
}

checkAdmin();
