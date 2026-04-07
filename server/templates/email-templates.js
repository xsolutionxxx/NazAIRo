export const getActivationTemplate = (link) => `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activate your Golobe account</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 40px 16px; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table class="wrapper" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #111212; border: 1px solid #2a2a2a; border-radius: 20px; overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #111111 100%); padding: 48px 40px 40px; border-bottom: 1px solid #2a2a2a;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 28px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                           <img src="https://res.cloudinary.com/dgjaib2bq/image/upload/v1775576045/logo_light_c3nrco.svg" alt="Golobe" style="height: 42px" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-family: 'Montserrat', Arial, sans-serif; font-size: 28px; line-height: 1.15; color: #ffffff; letter-spacing: -0.5px; font-weight: 600;">
                    Activate your <span style="color: #8dd3bb">Golobe</span> account
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #999999; margin: 0 0 16px 0;">Hi there 🖖</p>
              <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #999999; margin: 0 0 28px 0;">
                Thanks for signing up! To get started, you need to
                <strong style="color: #e8e8e8; font-weight: 500;">confirm your email address</strong> by clicking the button below.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" bgcolor="#8dd3bb" style="border-radius: 100px;">
                          <a href="${link}" target="_blank" style="display: inline-block; padding: 16px 40px; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #0f0f0f; text-decoration: none; letter-spacing: 0.1px;">
                            Activate my account 🛩️
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #232323; border: 1px solid #2a2a2a; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #999999; margin: 0 0 8px 0;">Button not working? Paste this link into your browser:</p>
                    <a href="${link}" style="font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #88d3bb; text-decoration: none; word-break: break-all;">${link}</a>
                  </td>
                </tr>
              </table>

              <div style="height: 1px; background-color: #2a2a2a; margin: 32px 0;"></div>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #232323; border: 1px solid #2a2a2a; border-left: 3px solid #ffbc57; border-radius: 10px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="24" valign="top" style="font-size: 16px;">⚠️</td>
                        <td style="font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #999999; line-height: 1.6; padding-left: 8px;">
                          This link will expire in <strong style="color: #e8e8e8; font-weight: 500;">24 hours</strong>. If you didn't create an account, you can safely ignore this email.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #2a2a2a; background-color: #111212;">
              <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 12px; color: #666666; line-height: 1.6; margin: 0;">
                © ${new Date().getFullYear()} Golobe. All rights reserved.<br/>
                You received this email because you registered at
                <a href="${process.env.CLIENT_URL}" style="color: #888888; text-decoration: none;">${process.env.CLIENT_URL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const getEmailChangeTemplate = (link) => `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activate your Golobe account</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 40px 16px; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table class="wrapper" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #111212; border: 1px solid #2a2a2a; border-radius: 20px; overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #111111 100%); padding: 48px 40px 40px; border-bottom: 1px solid #2a2a2a;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 28px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                           <img src="https://res.cloudinary.com/dgjaib2bq/image/upload/v1775576045/logo_light_c3nrco.svg" alt="Golobe" style="height: 42px" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-family: 'Montserrat', Arial, sans-serif; font-size: 28px; line-height: 1.15; color: #ffffff; letter-spacing: -0.5px; font-weight: 600;">
                    Confirm your <span style="color: #8dd3bb">new</span> email address
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #999999; margin: 0 0 16px 0;">Hi there 🖖</p>
              <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #999999; margin: 0 0 28px 0;">
                We received a request to change the email address on your account. Click below to confirm this change.
                <strong style="color: #e8e8e8; font-weight: 500;">confirm this change</strong>.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" bgcolor="#8dd3bb" style="border-radius: 100px;">
                          <a href="${link}" target="_blank" style="display: inline-block; padding: 16px 40px; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #0f0f0f; text-decoration: none; letter-spacing: 0.1px;">
                            Confirm new email 👇
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #232323; border: 1px solid #2a2a2a; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #999999; margin: 0 0 8px 0;">Button not working? Paste this link into your browser:</p>
                    <a href="${link}" style="font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #88d3bb; text-decoration: none; word-break: break-all;">${link}</a>
                  </td>
                </tr>
              </table>

              <div style="height: 1px; background-color: #2a2a2a; margin: 32px 0;"></div>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #232323; border: 1px solid #2a2a2a; border-left: 3px solid #ffbc57; border-radius: 10px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="24" valign="top" style="font-size: 16px;">⚠️</td>
                        <td style="font-family: 'Montserrat', Arial, sans-serif; font-size: 13px; color: #999999; line-height: 1.6; padding-left: 8px;">
                          If you didn't request this change, please <strong style="color: #e8e8e8; font-weight: 500;">secure your account immediately</strong> — someone may have access to it.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #2a2a2a; background-color: #111212;">
              <p style="font-family: 'Montserrat', Arial, sans-serif; font-size: 12px; color: #666666; line-height: 1.6; margin: 0;">
                © ${new Date().getFullYear()} Golobe. All rights reserved.<br/>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
