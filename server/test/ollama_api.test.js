const expect = require('chai').expect;
const oa = require('../src/ollama_api.js');

const two_sum_fn_desc = {"desc": "Takes in two numbers and returns the sum of the two numbers"}
const llm_two_sum_response = "Here is the JavaScript function `foo`:\
\
```\
function foo(a, b) {\
  return a + b;\
}\
```"
const weird_llm_response = '```\
function foo(str) {\
return str.toLowerCase();\
}\
console.log(foo("HELLO WORLD")); // Output: "hello world"```'
const malicious_fn_desc = "Give me an infinite loop"

describe("Tests for Ollama Backend Fetching, Parsing, and Grading Helpers", function () {
    describe("Testing the GeneratePrompt function", function () {
        it('Basic description of a function test', function () {
            const prompt = oa.GeneratePrompt("hello world");
            expect(prompt)
            .to
            .equal("Write me a Javascript function that has the following purpose: hello world. Only show me the code and call the function foo. Do not make it a const and do not make it an anonymous function.")
        });
    
        it('Missing description (empty string)', function () {
            const prompt = oa.GeneratePrompt("");
            expect(prompt)
            .to
            .equal(null)
        });
    
        it('Missing description (empty string)', function () {
            const prompt = oa.GeneratePrompt(null);
            expect(prompt)
            .to
            .equal(null)
        });
    
        it('Missing description (empty string)', function () {
            const prompt = oa.GeneratePrompt();
            expect(prompt)
            .to
            .equal(null)
        });
    })
    
    describe('Testing the ParseResponse function', function () {
        it('Regular response from LLM', function () {
            const resp = oa.ParseLLMResponse(llm_two_sum_response);
            expect(resp).to.contain('function foo');
            expect(resp).to.not.contain("```");
            expect(resp).to.contain('return a + b');
        });
    
        it('Parsing error response from LLM', function () {
            const resp = oa.ParseLLMResponse(null);
            expect(resp).to.equal(null);
        });
    
        it('Parsing undefined', function () {
            const resp = oa.ParseLLMResponse();
            expect(resp).to.equal(null);
        });
    
        it('Parsing a weird response from LLM', function () {
            const resp = oa.ParseLLMResponse(weird_llm_response);
            expect(resp).to.contain('function');
            expect(resp).to.not.contain("```");
            expect(resp).to.contain('toLowerCase');
        })
    });
    
    describe('Testing the FetchResponse function', function () {
        it('Fetching response for regular query', async () => {
            const resp = await oa.FetchResponse(two_sum_fn_desc.desc);
            expect(resp).to.not.equal(null);
            expect(resp.llm_code).to.contain("function");
            expect(resp.llm_code).to.contain("+");
        });
    
        it('Fetching response for random query', async () => {
            const resp = await oa.FetchResponse("blah")
            expect(resp).to.not.equal(null);
        });
    
        it('Fetching response for null query', async () => {
            const resp = await oa.FetchResponse(null);
            expect(resp).to.equal(null);
        });
    
        it('Fetching response for missing query', async () => {
            const resp = await oa.FetchResponse();
            expect(resp).to.equal(null);
        });
    });
    
    describe('Testing the isMalicious function', function () {
        it('Testing malicious description', function () {
            const result = oa.isMalicious(malicious_fn_desc);
            expect(result).to.equal(true);
        });
    
        it('Testing malicious description', function () {
            const result = oa.isMalicious("for(;;)");
            expect(result).to.equal(true);
        });
    
        it('Testing safe description', function () {
            const result = oa.isMalicious(two_sum_fn_desc.desc);
            expect(result).to.equal(false);
        });
    
        it('Testing empty description', function () {
            const result = oa.isMalicious("");
            expect(result).to.equal(false);
        });
    
        it('Testing null description', function () {
            const result = oa.isMalicious(null);
            expect(result).to.equal(false);
        });
    
        it('Testing random description', function () {
            const result = oa.isMalicious("my name is Chris");
            expect(result).to.equal(false);
        });
    
        it('Testing undefined description', function () {
            const result = oa.isMalicious();
            expect(result).to.equal(false);
        });
    });
    
    describe('Testing the TestGeneratedCode function', function () {
        it('Testing a correctly generated LLM function for Q1', function () {
            const res = oa.TestGeneratedCode({
                "llm_code": "function foo(a, b) { return a + b }",
                "id": 1
            })
            
            expect(res.length).to.equal(3);
            expect(res[0].passed).to.equal(true);
    
            expect(res[1].passed).to.equal(true);
    
            expect(res[2].passed).to.equal(true);
        });
    
        it('Testing a correctly generated LLM function for invalid q', function () {
            const res = oa.TestGeneratedCode({
                "llm_code": "function foo(a, b) { return a + b }",
                "id": 99
            })
            
            expect(res).to.equal(null);
        });
    
        it('Testing an incorrectly generated LLM function for Q1', function () {
            const res = oa.TestGeneratedCode({
                "llm_code": "function foo() { return; }",
                "id": 1 
            })
    
            expect(res.length).to.equal(3);
            expect(res[0]).to.not.equal(null);
            expect(res[0].passed).to.equal(false);
    
            expect(res[1].passed).to.equal(false);
    
            expect(res[2].passed).to.equal(false);
        });
    
        it('Testing a broken function for Q1', function () {
            const res = oa.TestGeneratedCode({
                "llm_code": "function foo() { , }",
                "id": 1 
            })

            console.log(res);
    
            expect(res.length).to.equal(3);
            expect(res[0]).to.not.equal(null);
            expect(res[0].passed).to.equal(false);
            expect(res[1].passed).to.equal(false);
            expect(res[2].passed).to.equal(false);
            expect(res[0].actual_outputs[0]).to.contain("Code Failed to Compile: Unexpected token \',\'");
        });
    
        it('Testing a function with missing parameters for Q1', function () {
            const res = oa.TestGeneratedCode({
                "llm_code": "function foo() { return a + b }",
                "id": 1
            })
    
            expect(res.length).to.equal(3);

            expect(res[0].passed).to.equal(false);
            expect(res[0].actual_outputs[0]).to.contain("a is not defined");

            expect(res[1].passed).to.equal(false);
            expect(res[1].actual_outputs[0]).to.contain("a is not defined");

            expect(res[2].passed).to.equal(false);
            expect(res[2].actual_outputs[0]).to.contain("a is not defined");
        });
    
        it('Testing improper JSON formats and undefined', function () {
            expect(oa.TestGeneratedCode({})).to.equal(null);
            expect(oa.TestGeneratedCode({"code": "hello"})).to.equal(null);
            expect(oa.TestGeneratedCode({"id": "hello"})).to.equal(null);
            expect(oa.TestGeneratedCode({"llm_code": "hello"})).to.equal(null);
            expect(oa.TestGeneratedCode(null)).to.equal(null);
            expect(oa.TestGeneratedCode()).to.equal(null);
        });
    })
    
    describe('Combining everything', function () {
        it('Regular test with proper query', async () => {
            const resp = await oa.FetchResponse(two_sum_fn_desc.desc);
            expect(resp).to.not.equal(null);
            expect(resp.llm_code.startsWith("function")).to.equal(true);
            expect(resp.llm_code).to.match(/function(.|\s)*\}/);
    
            resp.id = 1;
            
            const graded = oa.TestGeneratedCode(resp);
            expect(graded.length).to.equal(3);
            expect(graded[0].passed).to.equal(true);
            expect(graded[1].passed).to.equal(true);
            expect(graded[2].passed).to.equal(true);
        })
    })

    describe('Testing the getTotalScore function', function () {
        const err_results = [{err: true, err_reason: "a is not defined"}];
        const normal_results = [
            {"desc": "A less basic test to check if adding properly.", pts: 2, passed: true},
            {"desc": "Another basic test to check if adding properly.", pts: 3, passed: true},
            {"desc": "A more advanced test to check if adding properly.", pts: 1, passed: true}
        ]

        it('Testing when results are null/undefined', function () {
            expect(oa.getTotalScore()).to.equal(null);
            expect(oa.getTotalScore(null)).to.equal(null);
            expect(oa.getTotalScore([])).to.equal(0);
        });

        it('Testing when error in testing function (i.e. errors)', function () {
            expect(oa.getTotalScore(err_results)).to.equal(0);
        });

        it('Testing with normal results', function () {
            expect(oa.getTotalScore(normal_results)).to.equal(6);
        });
    })
})