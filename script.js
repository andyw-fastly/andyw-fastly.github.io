document.getElementById('fakeLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    
    // We send this to a path that doesn't exist on GitHub.
    // Fastly WAF will see the 'POST' body before it even hits the origin.
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: e.target.username.value,
            password: e.target.password.value
        })
    })
    .then(response => {
        if (response.status === 406 || response.status === 403) {
            messageDiv.innerHTML = "<b style='color:red;'>Blocked by Fastly WAF!</b>";
        } else {
            messageDiv.innerText = "Login attempt sent to origin.";
        }
    })
    .catch(err => {
        messageDiv.innerText = "Connection error.";
    });
});