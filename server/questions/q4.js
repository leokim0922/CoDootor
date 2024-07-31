function foo(x) {
    if (x.length == 0) {
        return 'empty';
    }

    let y = x[0];

    for (let i = 0; i < x.length; i++) {
        if (x[i] > y) {
            y = x[i];
        }
    }

    return y;
}