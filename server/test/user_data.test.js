const expect = require('chai').expect;
const udata = require('../src/user_data.js');
const fs = require('fs');
const path = require('path');

const user0 = {"user_id": "1234567890", "nickname": "mikey"};
const user1 = {"user_id": "2345678901", "nickname": "davey"};
const testFolderName = "testDataFolder";

const attemptDataBadExample = {
    "results": [{ "input_args":[[2,3]],
    "expected_outputs":[5],
    "pts":1,
    "desc":"A test to check if adding properly.",
    "passed":false,
    "actual_outputs":[]
    }, 
    { "input_args": [[5,2],[3,4]],
    "expected_outputs":[7,7],
    "pts":1,
    "desc":"A less basic test to check if adding properly.",
    "passed":false,
    "actual_outputs":[]},
    {"input_args":[[0,0],[20,7]],
    "expected_outputs":[0,27],
    "pts":1,
    "desc":"Another basic test to check if adding properly.",
    "passed":false,
    "actual_outputs":[]}],
    "desc":"blah"
};

const attemptDataGoodExample = { 
    "results": [{"input_args":[[2,3]],
        "expected_outputs":[5],
        "pts":1,
        "desc":"A test to check if adding properly.",
        "passed":true,
        "actual_outputs":[5]
    },
    {"input_args":[[5,2],[3,4]],
        "expected_outputs":[7,7],
        "pts":1,
        "desc":"A less basic test to check if adding properly.",
        "passed":true,
        "actual_outputs":[7,7]},
    {"input_args":[[0,0],[20,7]],
        "expected_outputs":[0,27],
        "pts":1,
        "desc":"Another basic test to check if adding properly.",
        "passed":true,
        "actual_outputs":[0,27]}],
    "desc":"Takes two numbers and adds them together"
};

const clearFolder = () => {
    const fp = path.join(__dirname, "../", testFolderName)
    const readme = path.join(fp, "/", "README.md");
    const readmeText = "This folder is used to store the test user data in the form of JSON files. Only JSON files will be read here."

    try {
        fs.rmSync(fp, {recursive: true});
        fs.mkdirSync(fp);
        fs.writeFileSync(readme, readmeText);
        udata.loadUserDataOnStart(testFolderName);
    } catch (e) {
    }
}

describe("Tests for user_data functions", function () {
    beforeEach(function () {
        clearFolder();
    });

    after(function () {
        clearFolder();
        udata.loadUserDataOnStart("data");
    });

    describe("Testing the loadUserDataOnStart function", function () {
        it('Testing an empty folder', function () {
            const users = udata.loadUserDataOnStart(testFolderName);
            expect(users.length).to.equal(0);
        });

        it('Testing a non-empty folder', function () {
            udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            udata.initializeUserDataFile(testFolderName, user1.user_id, user1.nickname);
            const users = udata.loadUserDataOnStart(testFolderName);
            expect(users.length).to.equal(2);
        });

        it('Testing a non-existent folder', function () {
            const users = udata.loadUserDataOnStart("nonExistentFolder");
            expect(users).to.equal(null);
        });

        it('Testing null or missing folder param', function () {
            const users = udata.loadUserDataOnStart();
            expect(users).to.equal(null);

            const users2 = udata.loadUserDataOnStart(null);
            expect(users2).to.equal(null);
        });
    })

    describe("Testing the initializeUserDataFile function", function () {
        it('Initializing an existing user', function () {
            let res = udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            expect(udata.getUsers().length).to.equal(1);
            expect(res).to.equal("success");

            res = udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            expect(udata.getUsers().length).to.equal(1);
            expect(res).to.equal(null);
        });

        it('Initializing multiple users', function () {
            let res = udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            expect(udata.getUsers().length).to.equal(1);
            expect(res).to.equal("success");

            res = udata.initializeUserDataFile(testFolderName, user1.user_id, user1.nickname);
            expect(udata.getUsers().length).to.equal(2);
            expect(res).to.equal("success");
        });

        it('Initializing with null and invalid folder', function () {
            let res = udata.initializeUserDataFile(null, user0.user_id, user0.nickname);
            expect(res).to.equal(null);
            expect(udata.getUsers().length).to.equal(0);

            res = udata.initializeUserDataFile("nonExistentFolder", user0.user_id, user0.nickname);
            expect(res).to.equal(null);
            expect(udata.getUsers().length).to.equal(0);
        });

        it('Initializing with null/missing userid/nickname', function () {
            let res = udata.initializeUserDataFile(testFolderName, null, null);
            expect(res).to.equal(null);
            expect(udata.getUsers().length).to.equal(0);

            res = udata.initializeUserDataFile("nonExistentFolder");
            expect(res).to.equal(null);
            expect(udata.getUsers().length).to.equal(0);
        });

        it('Initializing with all null/missing params', function () {
            let res = udata.initializeUserDataFile(null, null, null);
            expect(res).to.equal(null);
            expect(udata.getUsers().length).to.equal(0);

            res = udata.initializeUserDataFile();
            expect(res).to.equal(null);
            expect(udata.getUsers().length).to.equal(0);
        });
    })
    
    describe("Testing the updateUserDataFile function", function () {
        it('Updating an existing user, correct directory', function () {
            udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            const updatedUser = {
                "user_id": "1234567890",
                "nickname": "mikey",
                "questions_solved": {
                    "1": 3,
                    "2": 2
                },
                "num_points": 5
            }

            res = udata.updateUserDataFile(testFolderName, updatedUser);
            expect(res).to.equal("success");

            const retrievedUser = udata.getUserDataFile(testFolderName, updatedUser.user_id);
            expect(retrievedUser.user_id).to.equal(updatedUser.user_id);
            expect(retrievedUser.nickname).to.equal(updatedUser.nickname);
            expect(retrievedUser.questions_solved["1"]).to.equal(3);
            expect(retrievedUser.questions_solved["2"]).to.equal(2);
            expect(retrievedUser.num_points).to.equal(5);
        });

        it('Updating an existing user, wrong directory', function () {
            udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            const updatedUser = {
                "user_id": "1234567890",
                "nickname": "mikey",
                "questions_solved": {
                    "1": 3,
                    "2": 2
                },
                "num_points": 5
            }
            res = udata.updateUserDataFile("nonExistentFolder", updatedUser);
            expect(res).to.equal(null);
        });

        it('Updating with null/undefined params', function () {
            expect(udata.updateUserDataFile(null, null)).to.equal(null);
            expect(udata.updateUserDataFile()).to.equal(null);
            expect(udata.updateUserDataFile(null, user0)).to.equal(null);
            expect(udata.updateUserDataFile(testFolderName, null)).to.equal(null);
        });

        it('Updating non-existent user, correct directory', function () {
            const updatedUser = {
                "user_id": "1234567890",
                "nickname": "mikey",
                "questions_solved": {
                    "1": 3,
                    "2": 2
                },
                "num_points": 5
            }
            res = udata.updateUserDataFile(testFolderName, updatedUser);
            expect(res).to.equal("success");

            const retrievedUser = udata.getUserDataFile(testFolderName, updatedUser.user_id);
            expect(retrievedUser.user_id).to.equal(updatedUser.user_id);
            expect(retrievedUser.nickname).to.equal(updatedUser.nickname);
            expect(retrievedUser.questions_solved["1"]).to.equal(3);
            expect(retrievedUser.questions_solved["2"]).to.equal(2);
            expect(retrievedUser.num_points).to.equal(5);
        });
    })

    describe("Testing the updateQuestionScore function", function () {
        const newQuestionData = {
            "qid": "2",
            "score": 2
        }
        const newQuestionDataHigher = {
            "qid": "2",
            "score": 3
        }
        const newQuestionDataLower = {
            "qid": "2",
            "score": 1
        }

        it("Testing null/undefined params", function () {
            expect(udata.updateQuestionScore(null, null)).to.equal(null);
            expect(udata.updateQuestionScore()).to.equal(null);
            expect(udata.updateQuestionScore(null, newQuestionData)).to.equal(null);
            expect(udata.updateQuestionScore(user0, null)).to.equal(null);
        })

        it("Testing valid user, new score", function () {
            udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            let user = udata.getUserDataFile(testFolderName, user0.user_id);

            let updatedUser = udata.updateQuestionScore(user, newQuestionData)
            expect(updatedUser.questions_solved[newQuestionData.qid]).to.equal(newQuestionData.score);
            expect(updatedUser.num_points).to.equal(2);
        })

        it("Testing valid user, lower score", function () {
            udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            let user = udata.getUserDataFile(testFolderName, user0.user_id);

            let updatedUser0 = udata.updateQuestionScore(user, newQuestionData);
            let updatedUser1 = udata.updateQuestionScore(updatedUser0, newQuestionDataLower);

            expect(updatedUser1.questions_solved[newQuestionData.qid]).to.equal(newQuestionData.score);
            expect(updatedUser1.num_points).to.equal(2);
        })

        it("Testing valid user, higher score", function () {
            udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            let user = udata.getUserDataFile(testFolderName, user0.user_id);

            let updatedUser0 = udata.updateQuestionScore(user, newQuestionData);
            let updatedUser1 = udata.updateQuestionScore(updatedUser0, newQuestionDataHigher);
            expect(updatedUser1.questions_solved[newQuestionData.qid]).to.equal(newQuestionDataHigher.score);
            expect(updatedUser1.num_points).to.equal(3);
        })
    });

    describe("Testing the updatedUserFileWithNewScore function", function () {
        const newQuestionData = {
            "qid": "2",
            "score": 2
        }
        const newQuestionDataHigher = {
            "qid": "2",
            "score": 3
        }
        const newQuestionDataLower = {
            "qid": "2",
            "score": 1
        }

        const diffQuestionData = {
            "qid": "3",
            "score": 3
        }

        it("Testing null/undefined params", function () {
            expect(udata.updatedUserFileWithNewScore(testFolderName, null, null)).to.equal(null);
            expect(udata.updatedUserFileWithNewScore("nonExistentFolder", null, null)).to.equal(null);
            expect(udata.updatedUserFileWithNewScore(null, null, null)).to.equal(null);
            expect(udata.updatedUserFileWithNewScore(null, user0.user_id, null)).to.equal(null);
            expect(udata.updatedUserFileWithNewScore(null, null, user0.user_id)).to.equal(null);
            expect(udata.updatedUserFileWithNewScore()).to.equal(null);
        });

        it("Testing updating the score for a new question", function () {
            udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            let res = udata.updatedUserFileWithNewScore(testFolderName, user0.user_id, newQuestionData);
            expect(res).to.equal("success");

            let user = udata.getUserDataFile(testFolderName, user0.user_id);
            expect(user.questions_solved[newQuestionData.qid]).to.equal(newQuestionData.score);
            expect(user.num_points).to.equal(2);
        });

        it("Testing updating the score for an existing question with lower score", function () {
            udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            udata.updatedUserFileWithNewScore(testFolderName, user0.user_id, newQuestionData);
            let res = udata.updatedUserFileWithNewScore(testFolderName, user0.user_id, newQuestionDataLower);
            expect(res).to.equal("success");

            let user = udata.getUserDataFile(testFolderName, user0.user_id);
            expect(user.questions_solved[newQuestionData.qid]).to.equal(newQuestionData.score);
            expect(user.num_points).to.equal(2);
        });

        it("Testing updating the score for an existing question with higher score", function () {
            udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            udata.updatedUserFileWithNewScore(testFolderName, user0.user_id, newQuestionData);
            let res = udata.updatedUserFileWithNewScore(testFolderName, user0.user_id, newQuestionDataHigher);
            expect(res).to.equal("success");

            let user = udata.getUserDataFile(testFolderName, user0.user_id);
            expect(user.questions_solved[newQuestionData.qid]).to.equal(newQuestionDataHigher.score);
            expect(user.num_points).to.equal(3);
        });

        it("Testing updating the score for multiple questions", function () {
            udata.initializeUserDataFile(testFolderName, user0.user_id, user0.nickname);
            udata.updatedUserFileWithNewScore(testFolderName, user0.user_id, newQuestionData);
            udata.updatedUserFileWithNewScore(testFolderName, user0.user_id, diffQuestionData);

            let user = udata.getUserDataFile(testFolderName, user0.user_id);
            expect(user.questions_solved[newQuestionData.qid]).to.equal(newQuestionData.score);
            expect(user.questions_solved[diffQuestionData.qid]).to.equal(diffQuestionData.score);
            expect(user.num_points).to.equal(5);
        });
    });

    describe("Testing initializeAttemptData function" , function () {
        const attemptsFolder = testFolderName + "/attempts";
        it("Testing null/missing input", function () {
            expect(udata.initializeAttemptData()).to.equal(null);

            expect(udata.initializeAttemptData(null, null, null)).to.equal(null);

            expect(udata.initializeAttemptData(attemptsFolder, null, null)).to.equal(null);
            expect(udata.initializeAttemptData(null, 1, null)).to.equal(null);
            expect(udata.initializeAttemptData(null, 1, user0.user_id)).to.equal(null);
        });

        it("Testing normal input", function () {
            const res = udata.initializeAttemptData(attemptsFolder, 1, user0.user_id);
            expect(res).to.eql([]);
            expect(udata.getAttemptData(attemptsFolder, 1, user0.user_id)).to.eql([]);
        });

        it("Testing existing user", function () {
            udata.initializeAttemptData(attemptsFolder, 1, user0.user_id);
            expect(udata.initializeAttemptData(attemptsFolder, 1, user0.user_id)).to.equal(null);
        });
    });

    describe("Testing addAttemptToUserData function", function () {
        const attemptsFolder = testFolderName + "/attempts";
        it("Testing null/undefined input", function () {
            expect(udata.addAttemptToUserData(attemptsFolder, null, null, null)).to.equal(null);
            expect(udata.addAttemptToUserData(null, user0.user_id, 1, attemptDataBadExample)).to.equal(null);
            expect(udata.addAttemptToUserData()).to.equal(null);
            expect(udata.addAttemptToUserData(null, null, null, null)).to.equal(null);
        });

        it("Testing normal input with non-existing attempt data file", function () {
            expect(udata.addAttemptToUserData(attemptsFolder, user0.user_id, 1, attemptDataGoodExample)).to.equal("success");
            const data = udata.getAttemptData(attemptsFolder, 1, user0.user_id);
            expect(data.length).to.equal(1);
            expect(data[0].results.length).to.equal(3);
            expect(data[0].desc).to.not.equal(null);
        });

        it("Testing normal input with existing attempt data file", function () {
            udata.initializeAttemptData(attemptsFolder, 1, user0.user_id);
            expect(udata.addAttemptToUserData(attemptsFolder, user0.user_id, 1, attemptDataGoodExample)).to.equal("success");
            const data = udata.getAttemptData(attemptsFolder, 1, user0.user_id);
            expect(data.length).to.equal(1);
            expect(data[0].results.length).to.equal(3);
            expect(data[0].desc).to.not.equal(null);
        });
    });
});