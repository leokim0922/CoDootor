var tests = {
    "test1": {
        "input_args": [[[0, 1, 2, 3, 4, 5]]],
        "expected_outputs": [5],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test2": {
        "input_args": [[[5, 4, 3, 2, 1, 0]]],
        "expected_outputs": [5],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test3": {
        "input_args": [[[-101, 452, 97, 2, 78, 6546, 6102, 0, 9982]]],
        "expected_outputs": [9982],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test4": {
        "input_args": [[[]]],
        "expected_outputs": ['empty'],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    }
}

module.exports = { tests };
