const express = require('express');
const cors = require('cors')
const fs = require('fs');
const path = require('path');
const { auth } = require('express-oauth2-jwt-bearer');
const oa = require('./ollama_api.js');
const app = express();
const port = 5001;
const udata = require('./user_data.js');
const mocha = require('./mocha_tests.js');

require('dotenv').config();

const jwtCheck = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token === process.env.JWT_TEST_TOKEN) {
      return next(); // Bypass middleware for test token
    }
  }
  const _jwtCheck = auth({
    audience: process.env.YOUR_API_IDENTIFIER,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
  });

  return _jwtCheck(req, res, next);
};

app.use(express.json());
app.use(cors());
// app.use(jwtCheck);

app.get('/', (req, res) => {
  res.send("Hello world.");
})

/*
  API endpoints for user data
*/
app.get('/user', jwtCheck, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const userInfo = await udata.getUserInfo(token);
  
  const user_id = userInfo.sub.split('|')[1];
  const nickname = userInfo.nickname;

  if (!user_id || user_id == "") return res.status(400).json({"error": "Invalid user id was provided"})

  const user = udata.getUserDataFile("data", user_id);
  
  if (!user) {
    return createUser(req, res, user_id, nickname);
  }

  else return res.status(200).json(user);
})

const createUser = (req, res, user_id, nickname) => {
  if (!user_id || user_id == "") return res.status(400).json({"error": "Invalid user id was provided"})
  if (!nickname || nickname == "") return res.status(400).json({"error": "Invalid nickname was provided"})
  
  const result = udata.initializeUserDataFile("data", user_id, nickname);
  const user = udata.getUserDataFile("data", user_id);

  if (result == "success") return res.status(200).json(user);
  else return res.status(400).send("There was an error initializing the user in the database.");
};

app.get('/otherUser', (req, res) => {
  const uid = req.query.uid;
  const user = udata.getUserDataFile("data", uid);
  
  if (!user) res.status(400).json({"error": "User could not be found."});
  else res.status(200).json(user);
})

/*
  API endpoint for leaderboards
*/
app.get('/leaderboard', (req, res) => {
  let users = udata.getUsers();
  // sort the users in descending order by num_points
  users.sort((a, b) => b.num_points - a.num_points);
  res.status(200).json(users);
})

/*
  API endpoint to GET proper questions as user wants
*/
app.get('/question/:id', (req, res) => {
  const questionId = req.params.id;
  const questionPath = `./questions/q${questionId}.js`;
  try {
    const data = fs.readFileSync(questionPath, "utf8");
    res.json(data);
  } catch (e) {
    res.status(400).send({"error": "Failed to retrieve the question."});
  } 
});

/*
    API endpoint to POST the description of the function to the LLM
    and retrieve the generated code from the LLM

    Make sure to use Content-Type: application/json as a header in your request
*/
app.post('/code', async (req, res) => {
  const desc = req.body.desc;
  
  if (desc == null || desc == "") return res.status(400).json({"error": "No description was provided."});
  
  if (oa.isMalicious(desc)) {
    return res.status(400).json({"error": "Malicious description included, modify your description."});
  }
  
  const resp = await oa.FetchResponse(desc);

  if (resp) {
    return res.status(200).json(resp);
  } else {
    return res.status(400).json({"error": "Failed to generate code from Ollama"});
  }
})

/*
    API endpoint to submit generated code for scoring via
    running the unit tests against the code

    Test manually using:
    curl -d "{\"desc\": \"Takes in two numbers and returns the sum of both of them\", \"id\": 1}" \
    --header "Content-Type: application/json" localhost:5001/grade
*/
app.post('/grade', jwtCheck, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const userInfo = await udata.getUserInfo(token);
  
  const desc = req.body.desc;
  const comment = req.body.comment;
  const id = req.body.id;
  const user_id = userInfo.sub.split('|')[1];
  
  // If any of the required parameters are missing send a 400 response
  if (desc == null || desc == "") return res.status(400).json({"error": "No description was provided."});
  if (id == null || id == "") return res.status(400).json({"error": "No question ID was provided."});
  if (user_id == null || user_id == "") return res.status(400).json({"error": "No user ID was provided."});
  
  // If description is malicious, then send 400 response
  if (oa.isMalicious(desc)) {
    return res.status(400).json({"error": "Malicious description included, modify your description."});
  }
  
  // Get the LLM code as an object based on the given description
  var resp = await oa.FetchResponse(desc);

  // If valid response, then append the question ID and submit for grading
  if (resp) resp.id = id;
  else return res.status(400).json({"error": "Failed to generate code from Ollama"});

  var testResults = oa.TestGeneratedCode(resp);
  resp.results = testResults;
  resp.score = oa.getTotalScore(testResults);

  const questionData = {
    "qid": id.toString(),
    "score": resp.score
  }

  // Update the user's score for this question
  // We don't use a separate endpoint because it is more secure to only update
  // when the user has their question graded
  udata.updatedUserFileWithNewScore("data", user_id, questionData);

  // Update the user's attempt data given the specified question and userID
  // includes the generatedCode, testResults, desc of given function, and optional comment
  const attemptData = {
    "results": testResults,
    "desc": desc,
    "comment": comment
  }

  udata.addAttemptToUserData("data/attempts", user_id, id, attemptData);
  
  if (testResults && testResults.length >= 1) {
    if (testResults[0].err) res.status(400).json(resp);
    else res.status(200).json(resp);
  } else {
    resp.error = "Failed to grade the provided code.";
    res.status(400).json(resp);
  }
})

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  
  await oa.autoPullModelOnStart();
  await oa.loadModelOnStart();
  mocha.run_mocha_tests();

  udata.loadUserDataOnStart("data");
})


/*
  API endpoint for retrieving list of questions for homepage
*/
app.get('/question_list', (req, res) => {
  try {
    const question_list = fs.readFileSync('./question_list.json', 'utf-8');
    const return_questions = JSON.parse(question_list)
    res.status(200).json(question_list);
  } catch(e) {
    res.status(400).send({"error": "Failed to retrieve questions"})
  }
})

app.get('/question_list/length', (req, res) => {
  try {
    const data = fs.readFileSync('./question_list.json', 'utf-8');
    const num_questions = JSON.parse(data).question_list.length;
    res.status(200).send({"num_questions": num_questions});
  } catch(e) {
    res.status(400).send({"error": "Failed to retrieve question list length"})
  }
})

/*
  API endpoints for user attempts
*/
// app.post('/question/attempts', jwtCheck, async (req, res) => {
//   const token = req.headers.authorization.split(' ')[1];
//   const userInfo = await udata.getUserInfo(token);

//   const userID = userInfo.sub.split('|')[1];
//   const attemptData = req.body;

//   if (!attemptData || Object.keys(attemptData).length === 0) {
//       return res.status(400).json({"error": "Invalid attempt data"});
//   }

//   const result = udata.addAttemptToUserData("data", userID, attemptData);

//   if (result === "success") {
//       res.status(200).send("Attempt added successfully");
//   } else {
//       res.status(400).send("Failed to add attempt");
//   }
// });

app.get('/question/:id/attempts', jwtCheck, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const userInfo = await udata.getUserInfo(token);

  const userID = userInfo.sub.split('|')[1];
  const qid = req.params.id.toString();
  const user = udata.getAttemptData("data/attempts", qid, userID);

  if (user) {
      res.status(200).json(user);
  } else {
      res.status(400).json({"error": "No attempts found for this user"});
  }
});

module.exports = { app };

/*
  API endpoint for retrieving test cases for answering page
*/
app.get('/unit_tests/:id', (req, res) => {
  const testId = req.params.id;
  const testPath = `../unit_tests/q${testId}_tests.js`;
  try {
    dummy_fn = function() {};
    const descs = require(testPath);
    const tester = require("../unit_tests/tests_util.js");
    const result = tester.run_tests(dummy_fn, descs.tests);
    res.send(result);
  } catch (e) {
    res.status(400).send({"error": "Failed to retrieve test cases."});
  } 
});

/*
  Endpoint to view the tests that were generated
*/
app.use('/tests', express.static(path.resolve(__dirname, "..", "mochawesome-report"), options={index: "mochawesome.html"}));

/*
  API endpoint for retrieving list of questions for homepage
*/
app.get('/stats', (req, res) => {
  const users = udata.getUsers();
  try {
    let list = fs.readFileSync('./question_list.json', 'utf-8');
    list = JSON.parse(list);
    
    list.question_list.forEach(question => {
      let totalScore = 0;
      let userCount = 0;
      let numSolved = 0;

      users.forEach(user => {
        const userScore = user.questions_solved[question.stage];
        if (!isNaN(userScore)) {
          totalScore += user.questions_solved[question.stage];
          userCount++;

          userScore >= question.max_score ? numSolved++ : null;
        }
      });
      question.average_score = userCount > 0 ? totalScore / userCount : 0;
      question.num_attempted = userCount;
      question.num_solved = numSolved;
    });

    res.status(200).json(list);
  } catch(e) {
    res.status(400).send({"error": "Failed to retrieve questions"})
  }
})