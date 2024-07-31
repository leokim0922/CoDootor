function foo(str) {
    var ans = "";

    for (var i = 0; i < str.length; i++) {
        ans += str[i].toLowerCase();
    }

    return ans;
}
