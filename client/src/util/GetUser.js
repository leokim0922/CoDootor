export default async function GetUser(accessToken) {
    // Get the user data for the user id of the current logged-in user
    let userData = await fetch(process.browser
      ? 'http://localhost:5001/user'
      : 'http://host.docker.internal:5001/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },})
        .then(res => {
        if (res.ok) return res.json();
        else return null;
    });
    return userData;
}