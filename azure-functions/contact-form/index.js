module.exports = async function (context, req) {
  context.log('Processing contact form submission');

  if (!req.body) {
    context.res = {
      status: 400,
      body: { message: "Please provide form data in the request body" }
    };
    return;
  }

  const { name, email, message, subject } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    context.res = {
      status: 400,
      body: { message: "Name, email, and message are required fields" }
    };
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    context.res = {
      status: 400,
      body: { message: "Please provide a valid email address" }
    };
    return;
  }

  // Set up the email
  context.bindings.message = {
    subject: subject || `New contact form submission from ${name}`,
    content: [{
      type: 'text/html',
      value: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This email was sent from the Bridging Trust AI website contact form.</em></p>
      `
    }]
  };

  // Return a success response
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: { message: "Your message has been sent successfully!" }
  };
};