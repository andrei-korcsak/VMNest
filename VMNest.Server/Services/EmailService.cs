using System.Net;
using System.Net.Mail;

namespace VMNest.Server.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendAccessNotificationAsync(string ipAddress, string userAgent, DateTime accessTime)
    {
        try
        {
            var enableNotifications = _configuration.GetValue<bool>("Email:EnableNotifications", false);
            if (!enableNotifications)
            {
                _logger.LogInformation("Email notifications are disabled in configuration.");
                return;
            }

            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpPort = _configuration.GetValue<int>("Email:SmtpPort");
            var fromEmail = _configuration["Email:FromEmail"];
            var fromPassword = _configuration["Email:FromPassword"];
            var toEmail = _configuration["Email:ToEmail"];

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(fromEmail) || 
                string.IsNullOrEmpty(fromPassword) || string.IsNullOrEmpty(toEmail))
            {
                _logger.LogWarning("Email configuration is incomplete. Skipping notification.");
                return;
            }

            var subject = "VMNest Website Access Alert";
            var body = $@"
VMNest was accessed!

Time: {accessTime:yyyy-MM-dd HH:mm:ss}
IP Address: {ipAddress}
User Agent: {userAgent}

This is an automated notification from your VMNest monitoring system.
";

            using var client = new SmtpClient(smtpHost, smtpPort);
            client.EnableSsl = true;
            client.Credentials = new NetworkCredential(fromEmail, fromPassword);

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = false
            };
            mailMessage.To.Add(toEmail);

            
            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Access notification email sent to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send access notification email");
        }
    }
}