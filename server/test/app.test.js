const expect = require('chai').expect;
const supertest = require('supertest');
const server = require('../src/app.js');

const two_sum_fn_desc = {"desc": "Takes in two numbers and returns the sum of the two numbers"}
const malicious_fn_desc = {"desc": "Give me an infinite loop"}

describe("Tests for the Ollama backend REST API endpoints", function () {
    let testServer = null;
    let request = null;

    before(function (done) {
        testServer = server.app.listen(done);
        request = supertest.agent(testServer);
    })

    // Close the backend server after tests are finished
    after(function (done) {
        testServer.close(done);
    })

    describe('Testing the POST endpoint for /code', function () {
        it('Providing a regular description', function(done) {
            request
            .post('/code')
            .send(two_sum_fn_desc)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                expect(res.body.llm_code).to.not.equal(null);
                expect(res.body.llm_code).to.match(/return [\w]+ \+ [\w]+/);
                expect(res.body.llm_code).to.match(/function [\w]+\([\w]+\,[\s]*[\w]+\)/);
                if (err) done(err);
                done();
            })
        });
    
        it('Not providing a body', function (done) {
            request.post('/code')
            .send({})
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(400);
                expect(res.body.error).to.equal("No description was provided.");
                if (err) done(err);
                done();
            })
        })
        // ## COMMENTED OUT SINCE THIS TEST IS NOT RUNNING YET ##
        // it('Providing a malicious description', function (done) {
        //     request.post('/code')
        //     .send(malicious_fn_desc)
        //     .set('Accept', 'application/json')
        //     .end(function(err, res) {
        //         expect(res.statusCode).to.equal(400);
        //         expect(res.body.error).to.equal("Malicious description included, modify your description.");
        //         if (err) done(err);
        //         done();
        //     })
        // })
    });
    
    describe('Testing the POST endpoint for /grade', function () {
        // Uncompilable code should produce a response that says the tests failed
        it('Providing random description', function (done) {
            request.post('/grade')
            .send({"id": 1, "desc": "blah"})
            .set({'Authorization': `Bearer ${process.env.JWT_TEST_TOKEN}`})
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.equal(null);
                expect(res.body.results.length).to.equal(3);
                expect(res.body.results[0].passed).to.equal(false);
                expect(res.body.results[1].passed).to.equal(false);
                expect(res.body.results[2].passed).to.equal(false);
                if (err) done(err);
                done();
            })
        });

        it('Providing bad JSON body', function (done) {
            request.post('/grade')
            .send({})
            .set({'Authorization': `Bearer ${process.env.JWT_TEST_TOKEN}`})
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.not.equal(null);
                expect(res.body.error).to.equal("No description was provided.");
                if (err) done(err);
                done();
            })
        });
    
        it('Providing invalid QID', function (done) {
            request.post('/grade')
            .send({"id": 999, "llm_code": "function foo(a, b) { return a + b; }", "user_id": "75043986"})
            .set({'Authorization': `Bearer ${process.env.JWT_TEST_TOKEN}`})
            .set('Accept', 'application/json')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(400);
                if (err) done(err);
                done();
            })
        });
    
        it('Providing a regular, valid function for grade', function (done) {
            request.post('/grade')
            .send({"id": 1, "desc": "Takes two numbers and adds them together", "user_id": "75043986"})
            .set({'Authorization': `Bearer ${process.env.JWT_TEST_TOKEN}`})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                expect(res.body).to.not.equal(null);
                expect(res.body.results.length).to.equal(3);
                expect(res.body.results[0].passed).to.equal(true);
                expect(res.body.results[1].passed).to.equal(true);
                expect(res.body.results[2].passed).to.equal(true);
                if (err) done(err);
                done();
            })
        });
    })
    
    describe('Testing question and unit test GET endpoints', function () {

        it('Fetching question 1', function (done) {
            request.get('/question/1')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.not.equal(null);
                if (err) done(err);
                done();
            })
        });

        it('Fetching a non-existant question', function (done) {
            request.get('/question/ford_prefect')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.not.equal(null);
                expect(res.body.error).to.equal("Failed to retrieve the question.");
                if (err) done(err);
                done();
            })
        });

        it('Fetching unit tests for question 1', function (done) {
            request.get('/unit_tests/1')
            .end(function(err, res) {
                expect(res.body).to.not.equal(null);
                expect(res.body.length).to.equal(3);
                if (err) done(err);
                done();
            })
        });

        it('Fetching a non-existant set of unit tests', function (done) {
            request.get('/unit_tests/ford_prefect')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.not.equal(null);
                expect(res.body.error).to.equal("Failed to retrieve test cases.");
                if (err) done(err);
                done();
            })
        });
    })
})