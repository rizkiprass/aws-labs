/**
 * Email Templates - HTML templates for various email types
 */

/**
 * Welcome Email Template
 */
export function getWelcomeTemplate({ userName, actionUrl }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 50px 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Welcome! 🎉</h1>
            </td>
          </tr>
          
          <!-- White Content Card -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px;">
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px; font-size: 20px;">
                      Hello, ${userName}!
                    </h2>
                    <p style="color: #6b7280; line-height: 1.7; margin: 0 0 24px; font-size: 16px;">
                      Thank you for joining us. We're thrilled to have you on board! 
                      Your account has been successfully created and you're ready to get started.
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${actionUrl}" 
                             style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 16px;">
                            Get Started →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #9ca3af; margin: 24px 0 0; font-size: 14px; text-align: center;">
                      If you didn't create this account, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 13px;">
                Sent with ❤️ using Amazon SES
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Notification Email Template
 */
export function getNotificationTemplate({ title, message, type = 'info', actionUrl, actionText }) {
    const colors = {
        info: { bg: '#3b82f6', icon: 'ℹ️' },
        success: { bg: '#10b981', icon: '✅' },
        warning: { bg: '#f59e0b', icon: '⚠️' },
        error: { bg: '#ef4444', icon: '❌' }
    };

    const { bg, icon } = colors[type] || colors.info;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
          <!-- Header -->
          <tr>
            <td style="background: ${bg}; padding: 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #ffffff; font-size: 24px;">${icon}</td>
                  <td style="color: #ffffff; font-size: 18px; font-weight: 600; padding-left: 12px;">
                    ${title}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #e2e8f0; line-height: 1.7; margin: 0 0 20px; font-size: 16px;">
                ${message}
              </p>
              
              ${actionUrl ? `
              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr>
                  <td>
                    <a href="${actionUrl}" 
                       style="display: inline-block; padding: 12px 28px; background: ${bg}; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 14px;">
                      ${actionText || 'View Details'}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #334155;">
              <p style="color: #64748b; margin: 0; font-size: 12px;">
                This is an automated notification • Sent via Amazon SES
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * OTP Verification Email Template
 */
export function getOtpTemplate({ otp, userName = 'User', expiryMinutes = 5 }) {
    const otpDigits = otp.toString().split('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 50%; line-height: 60px; font-size: 28px;">
                🔐
              </div>
              <h1 style="color: #1f2937; margin: 20px 0 8px; font-size: 24px;">
                Verification Code
              </h1>
              <p style="color: #6b7280; margin: 0; font-size: 15px;">
                Hello ${userName}, here's your one-time password
              </p>
            </td>
          </tr>
          
          <!-- OTP Display -->
          <tr>
            <td style="padding: 20px 40px 30px; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  ${otpDigits.map(digit => `
                    <td style="padding: 0 6px;">
                      <div style="width: 50px; height: 60px; background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 10px; border: 2px solid #cbd5e1; line-height: 56px; font-size: 28px; font-weight: 700; color: #1f2937;">
                        ${digit}
                      </div>
                    </td>
                  `).join('')}
                </tr>
              </table>
              
              <p style="color: #ef4444; margin: 20px 0 0; font-size: 14px; font-weight: 500;">
                ⏱️ Valid for ${expiryMinutes} minutes
              </p>
            </td>
          </tr>
          
          <!-- Warning -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="color: #92400e; margin: 0; font-size: 13px; line-height: 1.5;">
                      ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. 
                      Our team will never ask for your OTP.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center;">
                If you didn't request this code, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export default {
    getWelcomeTemplate,
    getNotificationTemplate,
    getOtpTemplate
};
