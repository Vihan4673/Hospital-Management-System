import nodemailer from 'nodemailer';

// ⚡ TypeScript Interface එකක් මඟින් ගන්නා parameters ටික define කිරීම
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;  // HTML වැඩ නොකරන email clients සඳහා backup text එකක් (Optional)
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Email එක යැවීම
  await transporter.sendMail({
    from: `"Hospital Management" <${process.env.EMAIL_USER}>`, // මෙහෙම දුන්නම Patient ට පේන්නේ Hospital Management කියලා ලස්සනට
    to: options.to,
    subject: options.subject,
    text: options.text || '', // text එකක් ආවේ නැත්නම් හිස්ව තබයි
    html: options.html,
  });
};