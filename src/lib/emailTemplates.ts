/**
 * SecureVote — Email Templates
 * Professional HTML email templates for all system notifications
 */

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px; margin: 0 auto; background: #0f0f13; color: #e2e8f0;
`;

const cardStyle = `
  background: #1a1a24; border: 1px solid rgba(139,92,246,0.2);
  border-radius: 16px; padding: 32px; margin: 24px 0;
`;

const btnStyle = `
  display: inline-block; background: linear-gradient(135deg, #8b5cf6, #a855f7);
  color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none;
  font-weight: 600; font-size: 15px; margin: 16px 0;
`;

const mutedStyle = `color: #64748b; font-size: 13px; line-height: 1.6;`;

/** Voter approved — sends Secret ID */
export const secretIdEmail = (params: {
  voterName: string;
  electionTitle: string;
  secretId: string;
  startDate: string;
  endDate: string;
  votingUrl: string;
}) => ({
  subject: `🗳️ Your Secret Voter ID — ${params.electionTitle}`,
  bodyHtml: `
<div style="${baseStyle}">
  <div style="text-align:center; padding: 32px 0 16px;">
    <div style="font-size:32px; margin-bottom:8px;">🛡️</div>
    <h1 style="color:#8b5cf6; font-size:24px; margin:0;">SecureVote</h1>
    <p style="${mutedStyle} margin-top:4px;">Secure Online Election Management</p>
  </div>

  <div style="${cardStyle}">
    <h2 style="color:#f8fafc; font-size:20px; margin:0 0 8px;">You're approved to vote!</h2>
    <p style="color:#94a3b8; margin:0 0 24px;">Hello <strong style="color:#e2e8f0;">${params.voterName}</strong>, your registration for <strong style="color:#8b5cf6;">${params.electionTitle}</strong> has been approved.</p>

    <div style="background:#0f0f13; border:2px solid #8b5cf6; border-radius:12px; padding:20px 24px; text-align:center; margin:20px 0;">
      <p style="${mutedStyle} margin:0 0 8px; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Your Secret Voter ID</p>
      <div style="font-family: 'Courier New', monospace; font-size:26px; font-weight:700; color:#a855f7; letter-spacing:4px;">${params.secretId}</div>
      <p style="${mutedStyle} margin:8px 0 0; font-size:11px;">⚠️ Keep this private. Never share it with anyone.</p>
    </div>

    <div style="background:rgba(139,92,246,0.08); border-radius:10px; padding:16px; margin:20px 0;">
      <p style="color:#94a3b8; font-size:13px; margin:0 0 6px;"><strong style="color:#c4b5fd;">📅 Voting Period:</strong></p>
      <p style="color:#e2e8f0; font-size:14px; margin:0;">
        <strong>Start:</strong> ${params.startDate}<br>
        <strong>End:</strong> ${params.endDate}
      </p>
    </div>

    <div style="text-align:center;">
      <a href="${params.votingUrl}" style="${btnStyle}">
        🗳️ Cast Your Vote
      </a>
    </div>

    <p style="${mutedStyle} margin:16px 0 0;">You will need to enter this Secret ID to verify your identity before voting. Your vote is anonymous — no one can link your Secret ID to your vote.</p>
  </div>

  <p style="${mutedStyle} text-align:center;">SecureVote — Transparent, Anonymous, Secure</p>
</div>
  `,
});

/** Voter registration submitted — confirmation to voter */
export const registrationConfirmEmail = (params: {
  voterName: string;
  electionTitle: string;
  status: 'pending' | 'waitlisted';
}) => ({
  subject: `✅ Registration Received — ${params.electionTitle}`,
  bodyHtml: `
<div style="${baseStyle}">
  <div style="text-align:center; padding: 32px 0 16px;">
    <h1 style="color:#8b5cf6; font-size:24px; margin:0;">SecureVote</h1>
  </div>
  <div style="${cardStyle}">
    <h2 style="color:#f8fafc; font-size:20px; margin:0 0 8px;">
      ${params.status === 'waitlisted' ? '⏳ You\'ve been waitlisted' : '📋 Registration received!'}
    </h2>
    <p style="color:#94a3b8;">Hello <strong style="color:#e2e8f0;">${params.voterName}</strong>,</p>
    ${params.status === 'pending'
      ? `<p style="color:#94a3b8;">Your registration for <strong style="color:#8b5cf6;">${params.electionTitle}</strong> has been received and is under review. The election creator will approve or reject your application. You'll receive an email with your Secret Voter ID once approved.</p>`
      : `<p style="color:#94a3b8;">The voter slots for <strong style="color:#8b5cf6;">${params.electionTitle}</strong> are currently full. You've been added to the waitlist. If a spot opens up, you'll be notified automatically.</p>`
    }
  </div>
  <p style="${mutedStyle} text-align:center;">SecureVote — Transparent, Anonymous, Secure</p>
</div>
  `,
});

/** Notify election creator when a new voter registers */
export const newVoterRegistrationEmail = (params: {
  creatorName: string;
  electionTitle: string;
  voterName: string;
  voterEmail: string;
  pendingCount: number;
  dashboardUrl: string;
}) => ({
  subject: `👤 New voter registration — ${params.electionTitle}`,
  bodyHtml: `
<div style="${baseStyle}">
  <div style="text-align:center; padding: 32px 0 16px;">
    <h1 style="color:#8b5cf6; font-size:24px; margin:0;">SecureVote</h1>
  </div>
  <div style="${cardStyle}">
    <h2 style="color:#f8fafc; font-size:20px; margin:0 0 16px;">New voter registration</h2>
    <p style="color:#94a3b8;">Hello <strong style="color:#e2e8f0;">${params.creatorName}</strong>,</p>
    <p style="color:#94a3b8;"><strong style="color:#e2e8f0;">${params.voterName}</strong> (${params.voterEmail}) has registered for your election <strong style="color:#8b5cf6;">${params.electionTitle}</strong>.</p>
    <div style="background:rgba(139,92,246,0.08); border-radius:10px; padding:14px 18px; margin:16px 0;">
      <p style="color:#c4b5fd; font-size:14px; margin:0;">⏳ <strong>${params.pendingCount}</strong> voter${params.pendingCount !== 1 ? 's' : ''} pending approval</p>
    </div>
    <div style="text-align:center;">
      <a href="${params.dashboardUrl}" style="${btnStyle}">Review Registrations</a>
    </div>
  </div>
  <p style="${mutedStyle} text-align:center;">SecureVote — Transparent, Anonymous, Secure</p>
</div>
  `,
});

/** Voter registration rejected */
export const registrationRejectedEmail = (params: {
  voterName: string;
  electionTitle: string;
  reason?: string;
}) => ({
  subject: `❌ Registration Update — ${params.electionTitle}`,
  bodyHtml: `
<div style="${baseStyle}">
  <div style="text-align:center; padding: 32px 0 16px;">
    <h1 style="color:#8b5cf6; font-size:24px; margin:0;">SecureVote</h1>
  </div>
  <div style="${cardStyle}">
    <h2 style="color:#f8fafc; font-size:20px; margin:0 0 16px;">Registration not approved</h2>
    <p style="color:#94a3b8;">Hello <strong style="color:#e2e8f0;">${params.voterName}</strong>,</p>
    <p style="color:#94a3b8;">Unfortunately, your registration for <strong style="color:#8b5cf6;">${params.electionTitle}</strong> was not approved.</p>
    ${params.reason ? `<div style="background:rgba(255,51,102,0.08); border:1px solid rgba(255,51,102,0.2); border-radius:10px; padding:14px 18px; margin:16px 0;"><p style="color:#fca5a5; font-size:14px; margin:0;"><strong>Reason:</strong> ${params.reason}</p></div>` : ''}
    <p style="color:#64748b; font-size:13px;">If you believe this was a mistake, please contact the election organizer directly.</p>
  </div>
  <p style="${mutedStyle} text-align:center;">SecureVote — Transparent, Anonymous, Secure</p>
</div>
  `,
});

/** Election cancelled — notify all registered voters */
export const electionCancelledEmail = (params: {
  voterName: string;
  electionTitle: string;
  reason?: string;
}) => ({
  subject: `🚫 Election Cancelled — ${params.electionTitle}`,
  bodyHtml: `
<div style="${baseStyle}">
  <div style="text-align:center; padding: 32px 0 16px;">
    <h1 style="color:#8b5cf6; font-size:24px; margin:0;">SecureVote</h1>
  </div>
  <div style="${cardStyle}">
    <h2 style="color:#f8fafc; font-size:20px; margin:0 0 16px;">Election has been cancelled</h2>
    <p style="color:#94a3b8;">Hello <strong style="color:#e2e8f0;">${params.voterName}</strong>,</p>
    <p style="color:#94a3b8;">We regret to inform you that the election <strong style="color:#8b5cf6;">${params.electionTitle}</strong> has been cancelled.</p>
    ${params.reason ? `<div style="background:rgba(255,184,0,0.08); border-radius:10px; padding:14px 18px; margin:16px 0;"><p style="color:#fde68a; font-size:14px; margin:0;"><strong>Reason:</strong> ${params.reason}</p></div>` : ''}
    <p style="color:#64748b; font-size:13px;">We apologize for any inconvenience. Browse other active elections on SecureVote.</p>
  </div>
  <p style="${mutedStyle} text-align:center;">SecureVote — Transparent, Anonymous, Secure</p>
</div>
  `,
});

/** Creator application approved */
export const creatorApprovedEmail = (params: {
  creatorName: string;
  dashboardUrl: string;
}) => ({
  subject: `🎉 Your Election Creator application is approved!`,
  bodyHtml: `
<div style="${baseStyle}">
  <div style="text-align:center; padding: 32px 0 16px;">
    <h1 style="color:#8b5cf6; font-size:24px; margin:0;">SecureVote</h1>
  </div>
  <div style="${cardStyle}">
    <h2 style="color:#f8fafc; font-size:20px; margin:0 0 16px;">Welcome aboard, Election Creator! 🎉</h2>
    <p style="color:#94a3b8;">Hello <strong style="color:#e2e8f0;">${params.creatorName}</strong>,</p>
    <p style="color:#94a3b8;">Your Election Creator application has been approved by the SecureVote administrator. You can now create and manage elections on the platform.</p>
    <div style="text-align:center; margin-top:24px;">
      <a href="${params.dashboardUrl}" style="${btnStyle}">🗳️ Go to Dashboard</a>
    </div>
  </div>
  <p style="${mutedStyle} text-align:center;">SecureVote — Transparent, Anonymous, Secure</p>
</div>
  `,
});
