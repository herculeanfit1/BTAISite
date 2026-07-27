# Email Function Testing Guide

This document provides a step-by-step guide for testing the Bridging Trust AI email function in the production environment.

## Prerequisites

- Azure CLI installed and configured
- Access to Azure Portal with appropriate permissions
- Bash shell environment (or Windows equivalent)
- `jq` for JSON processing (can be installed via `brew install jq` on macOS)

## Test Plan Overview

1. Run automated test script
2. Manually verify email delivery
3. Test error handling scenarios
4. Document test results

## Step 1: Run Automated Test Script

We have prepared a test script located at `scripts/test-email-function.sh` that will exercise different scenarios:

```bash
# Navigate to the project root directory
cd /path/to/BridgingTrustAI

# Run the test script
bash scripts/test-email-function.sh
```

This script will test:
- Valid email submissions (with and without company field)
- Missing required fields (name, email, message)
- Invalid email format
- Empty request body

## Step 2: Verify Email Delivery

After running the test script, verify that:

1. Check the inbox of the email address configured in `EMAIL_TO` environment variable (contact@bridgingtrust.ai)
2. You should receive emails from the successful test cases only (Test Cases 1 and 2)
3. Verify that the email content matches the expected format:
   - Subject should be "Contact Form: Test User"
   - Email should contain the name, email, company (if provided), and message
   - Reply-to should be set to the email provided in the form
4. Check that HTML formatting is correctly applied

## Step 3: Test Error Handling

Verify error handling by checking Azure Function logs:

1. Log into the Azure Portal
2. Navigate to the Function App (btai-email-relay)
3. Go to "Functions" > "SendContactForm" > "Monitor"
4. Review logs for each test case
5. Verify appropriate error messages are logged for failed test cases
6. Check Application Insights for detailed error tracking

Additional manual tests to consider:

- Test with very long message content
- Test with special characters and different languages
- Test the rate limiting by sending multiple requests in quick succession

## Step 4: Document Test Results

Create a test results document with the following information:

| Test Case | Description | Expected Result | Actual Result | Status |
|-----------|-------------|-----------------|--------------|--------|
| 1 | Valid submission with all fields | Email sent successfully | | |
| 2 | Valid submission without company | Email sent successfully | | |
| 3 | Missing name field | 400 Bad Request | | |
| 4 | Missing email field | 400 Bad Request | | |
| 5 | Missing message field | 400 Bad Request | | |
| 6 | Invalid email format | 400 Bad Request | | |
| 7 | Empty request body | 400 Bad Request | | |
| 8 | Long message content | Email sent successfully | | |
| 9 | Special characters | Email sent successfully | | |
| 10 | Rate limiting | Requests throttled after threshold | | |

## Production Integration Testing

Verify that the contact form on the website correctly integrates with the email function:

1. Navigate to the live website's contact page
2. Fill out the contact form with test data
3. Submit the form
4. Verify the success message appears
5. Check that the email is received at the destination address
6. Verify the email content matches what was submitted in the form

## Error Cases to Verify

Ensure the following error cases are properly handled:

1. **Server Configuration Errors**:
   - Test what happens if environment variables are missing
   - Verify appropriate error messages are returned

2. **API Rate Limits**:
   - Verify Resend API rate limits are properly handled
   - Check error messages when rate limits are exceeded

3. **Network Issues**:
   - Simulate network connectivity problems
   - Verify proper error handling and retry logic

## Next Steps After Testing

Once testing is complete:

1. Update the todo.md file to mark off the completed testing tasks
2. Document any issues found during testing in a separate document
3. Create a plan for resolving any identified issues
4. Consider implementing additional monitoring for the email functionality 