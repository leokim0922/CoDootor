function foo(x) {
    let y = '';

    for (let i = x.length - 1; i >= 0; i--) {
        y += x[i];
    }

    return y;
}