function foo(a) {
    let bar = [];
    for (var i = 0; i < a.length; i++) {
        if (foo2(a[i])) bar.push(a[i]);
    }

    return bar;
}

function foo2(a) {
    return a % 2 == 0;
}