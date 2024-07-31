function foo(n) {
    return n <= 1 ? 1 : n * foo(n - 1);
}