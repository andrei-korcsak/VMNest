using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using VMNest.Server.Models;
using VMNest.Server.Services;

namespace VMNest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MetricsController : ControllerBase
    {
        private readonly ILogger<MetricsController> _logger;
        private readonly MetricsCollectionService _metricsService;
        private readonly MongoDbContext _dbContext;

        public MetricsController(ILogger<MetricsController> logger, MetricsCollectionService metricsService)
        {
            _logger = logger;
            _metricsService = metricsService;
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateMachineMetrics([FromBody] MetricsUpdateRequest request)
        {
            try
            {
                var filter = Builders<MachineModel>.Filter.Eq(m => m.Ip, request.IpAddress);
                var update = Builders<MachineModel>.Update
                    .Set(m => m.Metrics, request.Metrics);

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

        [HttpPost]
        public async Task<IActionResult> ReceiveMetrics([FromBody] MachineMetricsDto metrics)
        {
            _logger.LogInformation("Received metrics from machine: {MachineId} ({IpAddress})", 
                metrics.MachineId, metrics.IpAddress);

            await _metricsService.StoreMetricsAsync(metrics);

            return Ok(new { received = true, timestamp = DateTimeOffset.UtcNow });
        }

        [HttpGet("{machineId}/latest")]
        public async Task<ActionResult<MachineMetricsDto>> GetLatestMetrics(string machineId)
        {
            var metrics = await _metricsService.GetLatestMetricsAsync(machineId);

            if (metrics == null)
                return NotFound();

            return Ok(metrics);
        }

        [HttpGet("{machineId}/history")]
        public async Task<ActionResult<IEnumerable<MachineMetricsDto>>> GetMetricsHistory(
            string machineId,
            [FromQuery] int hours = 24)
        {
            var metrics = await _metricsService.GetMetricsHistoryAsync(machineId, hours);
            return Ok(metrics);
        }
    }

    public class MetricsUpdateRequest
    {
        public string IpAddress { get; set; } = string.Empty;
        public MachineMetrics Metrics { get; set; } = new();
    }

    public class MachineMetricsDto
    {
        public string MachineId { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public DateTimeOffset Timestamp { get; set; }
        public double CpuUsagePercentage { get; set; }
        public double RamUsagePercentage { get; set; }
        public long TotalRamMB { get; set; }
        public long AvailableRamMB { get; set; }
        public List<DiskMetricsDto> DiskMetrics { get; set; } = new();
        public long NetworkSent { get; set; }
        public long NetworkReceived { get; set; }
        public string Uptime { get; set; } = string.Empty;
    }

    public class DiskMetricsDto
    {
        public string DriveName { get; set; } = string.Empty;
        public long TotalSpace { get; set; }
        public long FreeSpace { get; set; }
        public double UsagePercentage { get; set; }
    }
}