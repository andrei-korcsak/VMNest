using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using VMNest.Server.Models;

namespace VMNest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MetricsController : ControllerBase
    {
        private readonly MongoDbContext _dbContext;

        public MetricsController(MongoDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateMachineMetrics([FromBody] MetricsUpdateRequest request)
        {
            try
            {
                var filter = Builders<MachineModel>.Filter.Eq(m => m.Ip, request.IpAddress);
                var update = Builders<MachineModel>.Update
                    .Set(m => m.Metrics, request.Metrics)
                    .Set(m => m.LastUpdated, DateTime.UtcNow);

                var result = await _dbContext.Machines.UpdateOneAsync(filter, update);

                if (result.MatchedCount == 0)
                {
                    return NotFound($"Machine with IP {request.IpAddress} not found");
                }

                return Ok(new { message = "Metrics updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class MetricsUpdateRequest
    {
        public string IpAddress { get; set; } = string.Empty;
        public MachineMetrics Metrics { get; set; } = new();
    }
}