function foo(x) {
    if (x == 0) {
        return 0;
    }

    if (x == 1) {
        return 1;
    }

    return foo(x - 1) + foo(x - 2);
}