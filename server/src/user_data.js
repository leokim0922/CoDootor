const fs = require('fs');
const path = require('path');

var users = [];

function getUsers() {
    return users;
}

/*
    Gets the data for the specified user from file
*/
function getUserDataFile(folder, userID) {
    if (!userID) return null;
    const baseUserPath = path.join(__dirname, '..', `/${folder}/`);

    try {
        const user = JSON.parse(fs.readFileSync(baseUserPath + userID + ".json"));
        return user;
    } catch (e) {
        return null;
    }
}

// Reads all the user data files stored in folder and stores it in users
function loadUserDataOnStart(folder) {
    users = []
    const baseUserPath = path.join(__dirname, '..', `/${folder}/`);
    var files;

    try {
        files = fs.readdirSync(baseUserPath);
    } catch (e) {
        return null;
    }

    for (var i = 0; i < files.length; i++) {
        if (files[i].includes(".json")) {
            const file = fs.readFileSync(baseUserPath + files[i]);
            users.push(JSON.parse(file));
        }
    }

    return users;
}

// Initialize new user data for user with given userID and nickname
function initializeUserDataFile(folder, userID, nickname) {
    const baseUserPath = path.join(__dirname, '..', `/${folder}/`);
    var files;

    try {
        files = fs.readdirSync(baseUserPath);
    } catch (e) {
        return null;
    }

    if (!userID || !nickname) return null;

    // If user already exists in database, then return null
    if (files.includes(userID + ".json")) return null;

    // Otherwise, create a new file with default values except for userID and nickname
    const defaultUserInfo = {
        "user_id": `${userID}`,
        "nickname": `${nickname}`,
        "questions_solved": {},
        "num_points": 0,
        "attempts": []
    }

    users.push(defaultUserInfo);
    const data = JSON.stringify(defaultUserInfo);
    fs.writeFileSync(baseUserPath + userID + ".json", data);

    return "success";
}

/* 
    Overwrites the current user data file with the new one, assuming it already exists.
    Otherwise, it will create a new file for the user.
*/
function updateUserDataFile(folder, user, userID) {
    if (!folder || !user) return null;

    const baseUserPath = path.join(__dirname, '..', `/${folder}/`);
    try {
        userID ? fs.writeFileSync(baseUserPath + userID + ".json", JSON.stringify(user)) : 
        fs.writeFileSync(baseUserPath + user.user_id + ".json", JSON.stringify(user));
    } catch (e) {
        return null;
    }

    return "success";
}

/*
    Adds an attempt to the user's data
    If user doesn't exist yet, initialize it
    Assumes that the attemptData is in correct format
    attemptData is in format {"results": List[Object], "desc": String}
*/
function addAttemptToUserData(folder, userID, qid, attemptData) {
    if (!userID || !attemptData || !folder) return null;
    var data = getUserDataFile(folder + `/${qid}`, userID);
    if (!data) data = initializeAttemptData(folder, qid, userID);

    data.push(attemptData);
    const res = updateUserDataFile(folder + `/${qid}`, data, userID);

    return res === "success" ? "success" : null;
}

/*
    Gets all the attempt data for a specific question and a given user
    If the user doesn't exist for the question, then return empty list
*/
function getAttemptData(folder, questionID, userID) {
    if (!folder || !questionID || !userID) return null;

    var user = getUserDataFile(folder + `/${questionID}`, userID);
    if (!user) user = [];

    return user;
}

/*
    Initializes the attempt data for a particular user for a particular question
    if the user doesn't have data already
*/
function initializeAttemptData(folder, questionID, userID) {
    if (!folder || !questionID || !userID) return null;
    const basePath = path.join(__dirname, '..', `/${folder}/${questionID}/`);

    // Create the directory incase it doesn't exist yet
    createDataFolder(folder, questionID);

    const user = getUserDataFile(folder + `/${questionID}`, userID);
    if (user) return null;

    defaultData = [];

    const data = JSON.stringify(defaultData);
    try {
        fs.writeFileSync(basePath + userID + ".json", data);
    } catch (e) {
        console.error(e);
        return null;
    }

    return defaultData;
}

function createDataFolder(folder, questionID) {
    if (!folder || !questionID) return null;
    const basePath = path.join(__dirname, '..', `/${folder}/${questionID}/`);

    try {
        fs.mkdirSync(basePath, {recursive: true});
    } catch (e) {
        console.error(e);
        return null;
    }

    return "success";
}

/*
    Finds the relevant question based on qid for a user and updates their score with
    the max of the curScore and newScore

    Returns the updated user object
*/
function updateQuestionScore(user, questionData) {
    if (!user || !questionData) return null;

    const qs = Object.keys(user.questions_solved);

    for (var i = 0; i < qs.length; i++) {
        // If the questionID already exists and they scored higher, then increase points and score
        // otherwise, if it exists, do nothing
        if ((qs[i] == questionData.qid)) { 
            if (questionData.score > user.questions_solved[qs[i]]) {
                user.num_points += questionData.score - user.questions_solved[qs[i]];
                user.questions_solved[qs[i]] = questionData.score
            }
            
            return user;
        }
    }

    // If it doesn't exist, then increase their points and question score
    user.questions_solved[questionData.qid] = questionData.score;
    user.num_points += questionData.score;
    return user;
}

/*
    Given the user's ID and the score data for a question (qid, score)
    update the user's score for that question in the database

    Assumes that the given question data (qid, score) are valid
*/
function updatedUserFileWithNewScore(folder, userID, questionData) {
    // If missing userID or questionData, then return null;
    if (!userID || !questionData) return null;

    // Find the user in the data folder
    const user = getUserDataFile(folder, userID);
    if (!user) return null;

    // Update the question score if user exists
    const updatedUser = updateQuestionScore(user, questionData);

    for (var i = 0; i < users.length; i++) {
        if (users[i].user_id == updatedUser.user_id) users[i] = updatedUser;
    }

    const res = updateUserDataFile(folder, updatedUser);

    if (res) return "success"
    else return null;
}

const accessTokenCache = new Map();
const testUser = {
    sub: 'auth0|75043986',
    nickname: 'test_user',
    name: 'test_user@nonsense.com',
    picture: 'https://3.bp.blogspot.com/-ID7X_zoPZU4/U15kP1ZRjbI/AAAAAAAACn0/YYoB8eGQXc8/s1600/115762827_5b98c976f1_b.jpg',
    updated_at: '2024-07-25T23:16:12.536Z',
    email: 'test_user@nonsense.com',
    email_verified: true
};
accessTokenCache.set(process.env.JWT_TEST_TOKEN, testUser);
async function getUserInfo(accessToken) {
    if (accessTokenCache.has(accessToken)) {
        return accessTokenCache.get(accessToken);
    }
    const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    const data = await response.json();
    accessTokenCache.set(accessToken, data);
    return data;
}

module.exports = {
    getUserDataFile, loadUserDataOnStart, initializeUserDataFile, updateUserDataFile,
    updateQuestionScore, updatedUserFileWithNewScore, getUsers, getUserInfo, addAttemptToUserData, getAttemptData, initializeAttemptData
};
