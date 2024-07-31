var tests = {
    "test1": {
        "input_args": [[[1,2,3,4,5,6,7,8,9,10]]],
        "expected_outputs": [[2,4,6,8,10]],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test2": {
        "input_args": [[[1,3,5,7,9]]],
        "expected_outputs": [[]],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test3": {
        "input_args": [[[]]],
        "expected_outputs": [[]],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test4": {
        "input_args": [[[111, 123, 161, 180]]],
        "expected_outputs": [[180]],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    }
}

module.exports = { tests };