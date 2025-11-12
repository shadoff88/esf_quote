/**
 * Netlify Serverless Function: Send Documents Email via Mandrill
 * Sends form submission summary with file attachments to documents@easyfreight.co.nz
 */

exports.handler = async (event, context) => {
    // CORS headers for cross-origin requests
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse request body
        const { formData, submissionSummary, attachments, quoteReference } = JSON.parse(event.body);

        // Validate required fields
        if (!formData || !submissionSummary) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: formData and submissionSummary are required'
                })
            };
        }

        // Get Mandrill API key from environment variables
        const MANDRILL_API_KEY = process.env.MANDRILL_API;

        if (!MANDRILL_API_KEY) {
            console.error('Missing MANDRILL_API environment variable');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Server configuration error: Missing API key'
                })
            };
        }

        // Prepare Mandrill message
        const mandrillPayload = {
            key: MANDRILL_API_KEY,
            message: {
                from_email: 'contact_form@easyfreight.co.nz',
                from_name: 'Easy Freight Quote System',
                to: [
                    {
                        email: 'documents@easyfreight.co.nz',
                        name: 'Easy Freight Documents Team',
                        type: 'to'
                    }
                ],
                subject: `New Quote Submission - ${formData.first_name} ${formData.last_name}${quoteReference ? ' - ' + quoteReference : ''}`,
                html: submissionSummary,
                attachments: attachments || [],
                important: true,
                track_opens: true,
                track_clicks: false,
                auto_text: true,
                preserve_recipients: false,
                tags: ['quote-submission', 'documents']
            }
        };

        console.log(`📧 Sending email to documents@easyfreight.co.nz with ${attachments?.length || 0} attachment(s)`);

        // Send via Mandrill API
        const mandrillResponse = await fetch('https://mandrillapp.com/api/1.0/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mandrillPayload)
        });

        const mandrillResult = await mandrillResponse.json();

        // Check for Mandrill API errors
        if (mandrillResult.status === 'error') {
            console.error('Mandrill API error:', mandrillResult);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: mandrillResult.message || 'Mandrill API error'
                })
            };
        }

        // Check if message was rejected
        if (Array.isArray(mandrillResult) && mandrillResult[0]) {
            const result = mandrillResult[0];
            
            if (result.status === 'rejected' || result.status === 'invalid') {
                console.error('Email rejected:', result);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: `Email ${result.status}: ${result.reject_reason || 'Unknown reason'}`
                    })
                };
            }

            // Success
            console.log('✅ Email sent successfully:', {
                id: result._id,
                email: result.email,
                status: result.status
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Email sent successfully',
                    messageId: result._id,
                    status: result.status
                })
            };
        }

        // Unexpected response format
        console.error('Unexpected Mandrill response:', mandrillResult);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Unexpected response from email service'
            })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Internal server error'
            })
        };
    }
};
