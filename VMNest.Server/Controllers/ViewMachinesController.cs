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
        public IActionResult GetIpsAndMacs()
        {
            try
            {
                var result = _ipNetTable.GetIpsAndMacs();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
