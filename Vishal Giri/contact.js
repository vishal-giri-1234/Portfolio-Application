document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const data = {
            name: form.querySelector('[name="from_name"]').value.trim(),
            email: form.querySelector('[name="from_email"]').value.trim(),
            message: form.querySelector('[name="message"]').value.trim(),
            subject: form.querySelector('[name="subject"]').value.trim()
        };

        if (!data.name || !data.email || !data.message) {
            alert("Please fill in all required fields before sending.");
            return;
        }

        try {
            const res = await fetch("/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                alert("Message sent successfully!");
                form.reset();
            } else {
                const errorData = await res.json();
                console.error("Email API error", errorData);
                alert(errorData.message || "Failed to send message");
            }
        } catch (err) {
            console.error(err);
            alert("Error sending message");
        }
    });
});