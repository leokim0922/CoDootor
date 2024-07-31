function fail_tests(tests, errMsg) {
    var results = []
    const keys = Object.keys(tests);
    for (var i = 0; i < keys.length; i++) {
        const curTest = tests[keys[i]]
        // We need to clone the test so that we don't write in the same test object
        let clonedTest = JSON.parse(JSON.stringify(curTest))
        results.push(clonedTest);
        for (var j = 0; j < curTest.input_args.length; j++) {
            const actualOutput = errMsg;
            results[i].actual_outputs.push(actualOutput);
        }
    }

    return results;
}

function run_tests(fn, tests) {
    var results = []
    const keys = Object.keys(tests);
    for (var i = 0; i < keys.length; i++) {
        const curTest = tests[keys[i]]
        const args = curTest.input_args;
        const outputs = curTest.expected_outputs;
        // We need to clone the test so that we don't write in the same test object
        let clonedTest = JSON.parse(JSON.stringify(curTest))
        results.push(clonedTest);
        for (var j = 0; j < curTest.input_args.length; j++) {
            try {
                const actualOutput = fn(...args[j])
                const expectedOutput = outputs[j]

                results[i].actual_outputs.push(actualOutput);
                
                // If comparing arrays to see if equal, we need to compare every element directly
                if (Array.isArray(expectedOutput)) {
                    results[i].passed = check_array_equality(actualOutput, expectedOutput);
                } else if (actualOutput == expectedOutput) {
                    results[i].passed = true;
                }

            } catch (err) {
                results[i].actual_outputs.push(err.message);
            }
        }
    }

    return results;
}

function check_array_equality(act, exp) {
    return Array.isArray(act) && act.length == exp.length && exp.every((ele, idx) => ele == act[idx]);
}

function is_valid_fp(fp) {
    try {
        require(fp);
    } catch (e) {
        return false;
    }

    return true;
}

module.exports = { run_tests, fail_tests, is_valid_fp }