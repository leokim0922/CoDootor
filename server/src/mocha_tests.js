const Mocha = require("mocha");
const mocha = new Mocha({"reporter": "mochawesome", "timeout": 30000});
const path = require('path');

function run_mocha_tests() {
    mocha.addFile(path.join(__dirname, "..", "/test/app.test.js"));
    mocha.addFile(path.join(__dirname, "..", "/test/ollama_api.test.js"));
    mocha.addFile(path.join(__dirname, "..", "/test/user_data.test.js"));

    mocha.run();
}

module.exports = {run_mocha_tests};