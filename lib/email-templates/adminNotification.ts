export type AdminNotificationData = {
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  country: string;
};

export function getAdminNotificationEmail(data: AdminNotificationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Data Capture - ${data.firstName} ${data.lastName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #001a72; padding: 20px; text-align: center;">
    <h1 style="color: #fff; margin: 0;">New Data Capture</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; margin-top: 20px;">
    <h2 style="color: #001a72; margin-top: 0;">New Form Submission Received</h2>
    
    <div style="background-color: #fff; padding: 20px; margin: 20px 0; border-left: 4px solid #32c2d9;">
      <p style="margin: 0;"><strong>Submission Details:</strong></p>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
      <p style="margin: 5px 0;"><strong>Country:</strong> ${data.country}</p>
      ${data.company ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${data.company}</p>` : ''}
      <p style="margin: 5px 0;"><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

