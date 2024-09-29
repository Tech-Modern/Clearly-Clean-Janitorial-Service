const nodemailer = require('nodemailer');
const axios = require('axios'); // To fetch the PDF
const fs = require('fs');

exports.handler = async (event, context) => {
    try {
        // Ensure the event body is correctly parsed
        if (!event.body) {
            throw new Error('No data received');
        }

        const { firstName, lastName, userEmail, pdf, fileName } = JSON.parse(event.body);

        if (!firstName || !lastName || !userEmail || !pdf) {
            throw new Error('Missing required form fields');
        }

        // Download the PDF from Uploadcare URL
        const pdfResponse = await axios.get(pdf, {
            responseType: 'arraybuffer'  // This ensures the PDF is fetched as binary data
        });

        // Create the transporter object for Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,  // Use EMAIL_USER
                pass: process.env.EMAIL_PASS   // Use EMAIL_PASS
            }
        });

        // Email to you with PDF attachment
        const internalEmailOptions = {
            from: process.env.EMAIL_USER,   // Use EMAIL_USER
            to: 'tyler@tech-modern.com',
            subject: `New Job Application - ${firstName} ${lastName}`,
            text: `A new job application has been submitted by ${firstName} ${lastName}. The PDF is attached to this email.`,
            attachments: [
                {
                    filename: fileName,
                    content: pdfResponse.data,  // Attach the downloaded PDF
                    contentType: 'application/pdf'
                }
            ]
        };

        // Email to the applicant
        const applicantEmailOptions = {
            from: process.env.EMAIL_USER,   // Use EMAIL_USER
            to: userEmail,
            subject: 'Application Received - Clearly Clean Janitorial Service',
            text: `
        Dear ${firstName} ${lastName},

        Thank you for your application to Clearly Clean Janitorial Service.
        We will review your application and reach out with further steps.

        If you have any questions, feel free to email us at tyler@tech-modern.com.

        Best regards,
        Clearly Clean Janitorial Service Team
      `
        };

        // Send the internal email with PDF attachment
        await transporter.sendMail(internalEmailOptions);

        // Send the confirmation email to the applicant
        await transporter.sendMail(applicantEmailOptions);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Job application submitted successfully!' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to submit job application.', error: error.message })
        };
    }
};