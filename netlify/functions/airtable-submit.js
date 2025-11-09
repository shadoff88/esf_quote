/**
 * Netlify Serverless Function: AirTable Form Submission
 * Securely handles form submissions to AirTable without exposing API keys
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
        const requestData = JSON.parse(event.body);
        const { operation, recordId, fields } = requestData;

        // Validate required fields
        if (!operation || !fields) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: operation and fields are required'
                })
            };
        }

        // Validate operation type
        if (operation !== 'create' && operation !== 'update') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid operation. Must be "create" or "update"'
                })
            };
        }

        // For updates, recordId is required
        if (operation === 'update' && !recordId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'recordId is required for update operations'
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

        // Clean payload - remove empty strings, null values, and internal fields
        // This is critical for AirTable compatibility
        const cleanedFields = {};
        for (const [key, value] of Object.entries(fields)) {
            // Skip internal fields that shouldn't be sent to AirTable
            if (key === 'airtable_record_id') continue;

            // Fix double-encoded JSON strings (defensive coding)
            // Some values may be double or triple encoded: ""value"" or """value"""
            let cleanValue = value;
            if (typeof value === 'string') {
                // Keep parsing until we get a non-string or no more quotes
                while (typeof cleanValue === 'string' && cleanValue.startsWith('"') && cleanValue.endsWith('"') && cleanValue.length > 1) {
                    try {
                        const parsed = JSON.parse(cleanValue);
                        cleanValue = parsed;
                    } catch (e) {
                        // If parse fails, stop trying
                        break;
                    }
                }
            }

            // Include boolean values and non-empty strings
            if (typeof cleanValue === 'boolean' || (cleanValue !== '' && cleanValue !== undefined && cleanValue !== null)) {
                cleanedFields[key] = cleanValue;
            }
        }

        // Construct AirTable API URL
        const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
        const url = operation === 'update' ? `${baseUrl}/${recordId}` : baseUrl;
        const method = operation === 'update' ? 'PATCH' : 'POST';

        // Make request to AirTable
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields: cleanedFields })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('AirTable API error:', result);
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: result.error?.message || `AirTable API error: ${response.status}`
                })
            };
        }

        // Return success response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                recordId: result.id,
                message: operation === 'update' ? 'Record updated successfully' : 'Record created successfully'
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
