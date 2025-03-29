export const digestTemplate = `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h1 style="color: #0B73B1;">AZbytegems Daily Digest</h1>
  
  <p>Dear {{name}},</p>
  
  <p>Here are today's featured articles from AZbytegems:</p>
  
  <div style="margin: 20px 0; border-top: 1px solid #eee; padding-top: 20px;">
    <h2 style="color: #0B73B1; font-size: 20px; margin-bottom: 15px;">TODAY'S HIGHLIGHTS</h2>
    
    {{#articles}}
    <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f5f5f5;">
      <div style="display: flex; gap: 15px; margin-bottom: 10px;">
        <div style="flex: 0 0 100px; height: 100px; overflow: hidden; border-radius: 4px;">
          <img src="{{image}}" alt="{{title}}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 5px 0; font-size: 18px;">
            <a href="{{url}}" style="color: #0B73B1; text-decoration: none;">{{title}}</a>
          </h3>
          <p style="margin: 0; color: #666; font-size: 14px;">
            By {{author}} in {{publication}}
          </p>
          <p style="margin: 8px 0; color: #333; font-size: 15px; line-height: 1.4;">
            {{description}}
          </p>
          <div style="display: flex; align-items: center; font-size: 13px; color: #666; gap: 10px;">
            <span>{{readTime}} min read</span>
            <span>•</span>
            <span>{{views}} views</span>
            <span>•</span>
            <span>{{claps}} claps</span>
          </div>
        </div>
      </div>
    </div>
    {{/articles}}
  </div>
  
  <p style="margin-top: 20px;">Happy reading!</p>
  
  <p>Best regards,<br>The AZbytegems Team</p>
  
  <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
    <p style="font-size: 12px; color: #666; margin: 0;">
      You're receiving this email because you subscribed to AZbytegems Newsletter.
      <a href="{{unsubscribeLink}}" style="color: #0B73B1;">Unsubscribe</a>.
    </p>
  </div>
</div>
`;
