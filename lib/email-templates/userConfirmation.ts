export type UserConfirmationData = {
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  country: string;
};

export function getUserConfirmationEmail(data: UserConfirmationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - Sealord Skipper</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #001a72; padding: 20px; text-align: center;">
    <h1 style="color: #fff; margin: 0;">Sealord Skipper</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; margin-top: 20px;">
    <h2 style="color: #001a72; margin-top: 0;">Thank You, ${data.firstName}!</h2>
    
    <p>We're excited to have you on board! You've successfully registered to be notified when <strong>Sealord Skipper</strong> launches in your area.</p>
    
    <p>Here's what happens next:</p>
    <ul>
      <li>We'll keep you updated on our launch progress</li>
      <li>You'll be among the first to know when Skipper becomes available near you</li>
      <li>You'll receive special introductory offers and samples for your pet</li>
    </ul>
    
    <div style="background-color: #fff; padding: 20px; margin: 20px 0; border-left: 4px solid #32c2d9;">
      <p style="margin: 0;"><strong>Your Details:</strong></p>
      <p style="margin: 5px 0;">Name: ${data.firstName} ${data.lastName}</p>
      <p style="margin: 5px 0;">Email: ${data.email}</p>
      <p style="margin: 5px 0;">Country: ${data.country}</p>
      ${data.company ? `<p style="margin: 5px 0;">Company: ${data.company}</p>` : ''}
    </div>
    
    <p>For the love of seafood.<br>For the love of pets.</p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>The Sealord Skipper Team</strong></p>
  </div>
  
  <div style="background-color: #f0ecec; padding: 20px; margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
    <p style="margin: 0;">Made by Sealord - New Zealand's No.1 Seafood Company</p>
    <p style="margin: 5px 0;">This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
  `;
}

