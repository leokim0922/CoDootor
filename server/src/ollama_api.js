/*
Functions that interact with Ollama to retrieve the LLM generated code
Parses the response, contacts the LLM, and writes the code to a file.
*/
const tester = require("../unit_tests/tests_util.js");
const { default: ollama } = require('ollama');
const MODEL_NAME = "granite-code:3b"

async function autoPullModelOnStart() {
    console.log("Pulling the LLM model, assuming that it hasn't been pulled already.")
    const response = await fetch("http://host.docker.internal:11434/api/pull", {
        method: "POST",
        body: JSON.stringify({"model": MODEL_NAME, "stream": false})
    }).then(resp => {
        return resp.json();
    }).then(resp => {
        return resp.status;
    }).catch(err => {
        console.log(err);
    })
    console.log("LLM model was pulled with code: ", response);

    return;
}

async function loadModelOnStart() {
    console.log("Preloading model ", MODEL_NAME, "...")
    const response = await fetch("http://host.docker.internal:11434/api/generate", {
        method: "POST",
        body: JSON.stringify({"model": MODEL_NAME})
    });

    return;
}

/*
    Given the description as a string, generates the prompt for the LLM by appending the
    necessary background info to generate the function.

    If the string is missing or empty, then return null instead
*/

function GeneratePrompt(x) {
    if (x == null || x == undefined || x == "") return null;
    return "Write me a Javascript function that has the following purpose: " + x + 
    ". Only show me the code and call the function foo. Do not make it a const and do not make it an anonymous function."
}

/*
    Validates the user description to check for potentially malicious context, such as infinite loop.
    Returns true if the description contains one of these, otherwise false. 
*/

function isMalicious(desc) {
    if (!desc || typeof desc !== "string") return false;

    const lowerDesc = desc.toLowerCase();
    const maliciousContext = [
        "infinite loop",
        "while(true)",
        "for(;;)",
        "eval",
    ];
    const codeBlockPattern = /function\s+\w+\s*\(.*\)\s*\{[^]*?\}/;

    if (codeBlockPattern.test(desc)) {
        return true;
    }

    return maliciousContext.some(context => lowerDesc.includes(context));
}

/*
    Contacts Ollama using the llama3 model with the parsed query and waits for the response
    Returns the response once it is received or NULL if the LLM failed to provide a proper response
*/
async function FetchResponse(desc) {
    // If the fn description is missing, or the json is not properly formatted, return null
    if (desc == undefined || desc == null || desc == "") return null;
    const prompt = GeneratePrompt(desc);

    if (prompt == null) return null;
    
    const data = {
        "model": MODEL_NAME, 
        "prompt": prompt,
        "stream": false,
        "keep_alive": -1,
        "options": {
            "seed": 101,
            "temperature": 0
        }
    };

    // If fetching from outside the container, then use localhost, otherwise need to use host.docker.internal
    const response = await fetch("http://host.docker.internal:11434/api/generate", {
        method: "POST",
        body: JSON.stringify(data)
    }).then(resp => {
        return resp.json();
    }).then(resp => {
        return resp.response;
    }).catch(err => {
        console.log(err);
    })

    // If response can't be acquired from LLM
    if (response == null) return null;

    const parsedResponse = ParseLLMResponse(response);

    return {"llm_code": parsedResponse};
}

/*
    Takes the Ollama response which should be in the form of a string and then
    parses it so that only the code remains

    Returns null if LLM response is null or if the response isn't in the proper format
    E.g. ``` CODE ```
*/
function ParseLLMResponse(resp) {
    if (resp == undefined || resp == null) return null;
    const words = resp.split("```");

    if (words.length == 1) {
        const match = resp.match(/function(\s|\S)*\}/)
        console.log(match);
        if (match) return match[0]
    } else {
        const code = words[1];
        const regexMatch = code.match(/function(\s|\S)*\}/)
        if (regexMatch == null) return null;
        if (regexMatch.length != 0) return regexMatch[0];
        else return null;
    }   
}

/*  
    Given the generated code, and question ID, it will
    evaluate the generated code by running test cases for the question
    by writing the LLM code to a js file and running tests on it
    The test cases are retrieved from the appropriate test file based on the QID

    If the specified question ID doesn't exist or the JSON is invalid or null, then return null

    Returns an array with the score and desc for each unit test separately
    E.g. [{"score": 1, "desc": "A basic test"}]
*/

function TestGeneratedCode(code_json) {
    if (code_json == undefined || code_json == null || code_json == {}) return null;

    const code = code_json.llm_code;
    const qid = code_json.id; 

    if (code == null || qid == null || isNaN(qid)) return null;

    // Convert the stringified code to an actual function and ensures the fn is named foo

    // Parse the file path for the question's tests
    const test_fp = "../unit_tests/" + "q" + qid.toString() + "_tests.js";
    var res = null;

    if (!tester.is_valid_fp(test_fp)) return null;
    const qut = require(test_fp);

    // Run the tests on the foo function
    try {
        eval("var foo = " + code);
        res = tester.run_tests(foo, qut.tests);
    } catch (err) {
        res = tester.fail_tests(qut.tests, "Code Failed to Compile: " + err.message);
    }

    return res;
}

/*
    Given the test results for a question, figure out why the final score is
    If the 
*/
function getTotalScore(results) {
    if (!results) return null;
    if (results.length == 1 && results[0].err) return 0;
    
    var totalScore = 0;

    for (var i = 0; i < results.length; i++) {
        results[i].passed ? totalScore += results[i].pts : null
    }

    return totalScore;
}

module.exports = { GeneratePrompt, isMalicious, ParseLLMResponse, FetchResponse, TestGeneratedCode, getTotalScore, autoPullModelOnStart, loadModelOnStart };