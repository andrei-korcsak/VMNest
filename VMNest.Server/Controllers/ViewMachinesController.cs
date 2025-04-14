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
        public IActionResult GetIpsAndMacs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var (items, totalPages) = _ipNetTable.GetIpsAndMacs(page, pageSize);
            return Ok(new { items, totalPages });
        }
    }
}
