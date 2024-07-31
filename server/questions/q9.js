function foo(a, b) {
    let c = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] == b) {
            c++;
        }
    }
    return c;
}