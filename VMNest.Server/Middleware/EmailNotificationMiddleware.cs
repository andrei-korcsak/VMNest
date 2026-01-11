using System.Net;

namespace VMNest.Server.Middleware;

public class EmailNotificationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<EmailNotificationMiddleware> _logger;
    
    // Simple boolean flag - only send email once per server session
    private static bool _emailSent = false;
    private static readonly object _lock = new object();

    public EmailNotificationMiddleware(RequestDelegate next, ILogger<EmailNotificationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, Services.EmailService emailService)
    {
        // Check if email has already been sent
        bool shouldSendEmail = false;
            
        lock (_lock)
        {
            if (!_emailSent)
            {
                _emailSent = true;
                shouldSendEmail = true;
            }
        }

        if (shouldSendEmail)
        {
            var ipAddress = GetClientIpAddress(context);
            var userAgent = context.Request.Headers["User-Agent"].ToString();
            var timestamp = DateTime.Now;

            _logger.LogInformation("First access detected. Sending email notification. IP: {IP}", ipAddress);

            // Send email in background (don't block the request)
            _ = Task.Run(async () =>
            {
                try
                {
                    await emailService.SendAccessNotificationAsync(ipAddress, userAgent, timestamp);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send access notification");
                }
            });
        }
        else
        {
            _logger.LogInformation("Email already sent. Skipping notification.");
        }
        

        await _next(context);
    }

    private string GetClientIpAddress(HttpContext context)
    {
        // Try to get real IP from headers (useful when behind proxy/load balancer)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        // Get the remote IP address
        var remoteIp = context.Connection.RemoteIpAddress;
        
        if (remoteIp == null)
        {
            return "Unknown";
        }

        // Convert IPv6 loopback to IPv4 for readability
        if (remoteIp.Equals(IPAddress.IPv6Loopback))
        {
            return "127.0.0.1 (localhost)";
        }

        // If it's IPv4-mapped IPv6 address, extract the IPv4
        if (remoteIp.IsIPv4MappedToIPv6)
        {
            return remoteIp.MapToIPv4().ToString();
        }

        return remoteIp.ToString();
    }
}