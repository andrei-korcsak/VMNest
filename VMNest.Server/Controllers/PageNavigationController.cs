using Microsoft.AspNetCore.Mvc;

namespace VMNest.Server.Controllers;

[ApiController]
[Route("api/page-navigation")]
public class PageNavigationController : ControllerBase
{
    private readonly ILogger<PageNavigationController> _logger;

    public PageNavigationController(ILogger<PageNavigationController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult NotifyPageNavigation()
    {
        _logger.LogInformation("Page navigation endpoint called");
        return Ok(new { success = true });
    }
}