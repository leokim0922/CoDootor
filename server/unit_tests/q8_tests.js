var tests = {
    "test1": {
        "input_args": [["Hello, ", "World!"]],
        "expected_outputs": ["Hello, World!"],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test2": {
        "input_args": [["Good", "Morning"]],
        "expected_outputs": ["GoodMorning"],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    },
    "test3": {
        "input_args": [["", "Test"]],
        "expected_outputs": ["Test"],
        "pts": 1,
        "passed": false,
        "actual_outputs": []
    }
}

module.exports = { tests };
