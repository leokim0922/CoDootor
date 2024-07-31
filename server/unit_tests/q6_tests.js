var tests = {
    "test1": {
        "input_args": [[""]],
        "expected_outputs": [true],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test2": {
        "input_args": [["a"]],
        "expected_outputs": [true],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test3": {
        "input_args": [["racecar"]],
        "expected_outputs": [true],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test4": {
        "input_args": [["mlem mlom"]],
        "expected_outputs": [false],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test5": {
        "input_args": [["The quick brown fox jumps over the lazy dog."]],
        "expected_outputs": [false],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    }
}

module.exports = { tests };