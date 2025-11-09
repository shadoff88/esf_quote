/**
 * Netlify Serverless Function: AirTable Record Fetch
 * Securely fetches in-progress form records from AirTable for session restoration
 */

exports.handler = async (event, context) => {
    // CORS headers for cross-origin requests
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Get recordId from query parameters
        const recordId = event.queryStringParameters?.recordId;

        // Validate recordId format
        if (!recordId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required parameter: recordId'
                })
            };
        }

        // Validate recordId format (must start with 'rec')
        if (!recordId.startsWith('rec')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid record ID format'
                })
            };
        }

        // Get AirTable credentials from environment variables
        const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
        const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
        const AIRTABLE_TABLE_NAME = 'Form Submissions';

        if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
            console.error('Missing AirTable credentials in environment variables');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Server configuration error'
                })
            };
        }

        // Construct AirTable API URL
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${recordId}`;

        // Fetch record from AirTable
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('AirTable API error:', result);

            // Handle record not found
            if (response.status === 404) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Record not found'
                    })
                };
            }

            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: result.error?.message || 'Failed to fetch record'
                })
            };
        }

        // Check if record has status field and if it's 'in_progress'
        // Only allow fetching in-progress records for privacy/security
        if (result.fields && result.fields.status !== 'in_progress') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Cannot restore completed or submitted records'
                })
            };
        }

        // Return success response with record fields
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                recordId: result.id,
                fields: result.fields || {},
                message: 'Record fetched successfully'
            })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};
