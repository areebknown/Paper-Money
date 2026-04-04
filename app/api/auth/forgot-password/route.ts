import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bidwars.xyz';
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

function buildResetEmailHtml(resetUrl: string, username: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#020617;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#0f172a;border:1px solid #1e293b;border-radius:24px;overflow:hidden;max-width:520px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 40px 28px;text-align:center;border-bottom:1px solid #1e293b;">
            <div style="font-size:28px;font-weight:900;color:#FBBF24;letter-spacing:-1px;line-height:1;">BID WARS</div>
            <div style="font-size:10px;color:#475569;letter-spacing:4px;text-transform:uppercase;margin-top:6px;">Account Security</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <p style="font-size:13px;color:#94a3b8;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:2px;">Hey ${username},</p>
            <h1 style="font-size:22px;font-weight:900;color:#f1f5f9;margin:0 0 16px 0;letter-spacing:-0.5px;">Reset Your Password</h1>
            <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 28px 0;">
              We received a request to reset the password for your Bid Wars account. Click the button below to set a new one. This link is valid for <strong style="color:#f1f5f9;">1 hour</strong>.
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="${resetUrl}"
                     style="display:inline-block;background:#FBBF24;color:#020617;font-size:13px;font-weight:900;text-decoration:none;padding:16px 40px;border-radius:14px;letter-spacing:1px;text-transform:uppercase;">
                    Reset Password →
                  </a>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="border-top:1px solid #1e293b;"></td>
              </tr>
            </table>

            <p style="font-size:11px;color:#334155;margin:0 0 8px 0;">Or copy this link into your browser:</p>
            <p style="font-size:11px;color:#475569;word-break:break-all;background:#0a0f1e;border:1px solid #1e293b;border-radius:8px;padding:10px 14px;margin:0 0 24px 0;">${resetUrl}</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#080e1e;border-top:1px solid #1e293b;padding:20px 40px;text-align:center;">
            <p style="font-size:11px;color:#1e293b;margin:0 0 6px 0;">If you didn't request this, you can safely ignore this email.</p>
            <p style="font-size:10px;color:#1e293b;margin:0;">Bid Wars · Virtual Paper Money Only · No real funds involved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            return NextResponse.json({
                error: 'USER_NOT_FOUND',
                message: 'No account found with this email.'
            }, { status: 404 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000);

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });

        const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

        if (!process.env.RESEND_API_KEY) {
            console.log('[Forgot Password] DEV: Reset URL:', resetUrl);
            return NextResponse.json({ success: true, message: '[DEV] Reset link logged to console.' });
        }

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [email],
                subject: 'Reset Your Bid Wars Password',
                html: buildResetEmailHtml(resetUrl, user.username),
            }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
            console.error('[Forgot Password] Resend error:', resendData);
            return NextResponse.json({
                error: 'RESEND_ERROR',
                message: 'Failed to send email. Please try again or contact support.'
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Reset link sent to your inbox.' });

    } catch (error) {
        console.error('[Forgot Password] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
