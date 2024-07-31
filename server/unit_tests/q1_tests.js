var tests = {
    "test1": {
        "input_args": [[2, 3]],
        "expected_outputs": [5],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test2": {
        "input_args": [[5, 2], [3, 4]],
        "expected_outputs": [7, 7],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test3": {
        "input_args": [[0, 0], [20, 7]],
        "expected_outputs": [0, 27],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    }
}

module.exports = { tests };