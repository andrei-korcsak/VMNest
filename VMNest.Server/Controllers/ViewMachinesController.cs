using Microsoft.AspNetCore.Mvc;

namespace VMNest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ViewMachinesController : Controller
    {
        private readonly IpNetTable _ipNetTable;

        public ViewMachinesController()
        {
            _ipNetTable = new IpNetTable();
        }

        [HttpGet("ips-and-macs")]
        public async Task<IActionResult> GetIpsAndMacs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                // Get paginated machine data
                var (items, totalPages) = _ipNetTable.GetIpsAndMacs(page, pageSize);

                // Resolve DNS names asynchronously
                var resolvedDnsNames = new List<string>();
                await foreach (var dnsName in _ipNetTable.TryDnsResolveAsync(items, 1)) // Adjust buffer size as needed
                {
                    resolvedDnsNames.Add(dnsName);
                }

                // Attach resolved DNS names to the machine models
                for (int i = 0; i < resolvedDnsNames.Count; i++)
                {
                    items[i].Name = resolvedDnsNames[i];
                }

                return Ok(new { items, totalPages });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
