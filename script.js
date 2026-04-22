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


// Function to simulate API traffic for Fastly Discovery
async function simulateApiTraffic() {
    // 1. The "Official" API
    fetch('/api/v2/config.json');

    // 2. The "Shadow" API (Hidden tracking/telemetry)
    fetch('/api/v1/telemetry/report', {
        method: 'POST',
        body: JSON.stringify({ event: 'page_load', ts: Date.now() })
    });

    // 3. The "Legacy" API (An old endpoint we forgot to delete)
    fetch('/api/deprecated/user-stats');
}

// Run on load
window.addEventListener('DOMContentLoaded', simulateApiTraffic);

async function triggerManualApi() {
    const method = document.getElementById('api-method').value;
    const path = document.getElementById('api-path').value;
    const log = document.getElementById('api-log');

    if (!path.startsWith('/')) {
        alert("Path must start with /");
        return;
    }

    log.innerHTML = `Sending <strong>${method}</strong> to <code>${path}</code>...`;

    try {
        const response = await fetch(path, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: method !== 'GET' ? JSON.stringify({ demo: "data" }) : null
        });

        // We show the status. Even a 404 is "Discovered" by Fastly!
        log.innerHTML = `Sent: <strong>${method}</strong> ${path}<br>Response: <span style="color: ${response.ok ? 'green' : 'orange'}">${response.status} ${response.statusText}</span><br><small>Check Fastly API Discovery for this new path!</small>`;
    } catch (err) {
        log.innerHTML = `<span style="color: red;">Error: ${err.message}</span>`;
    }
}