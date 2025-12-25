using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace VMNest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly MongoDbContext _dbContext;

        public DashboardController(MongoDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var allMachines = await _dbContext.Machines
                    .Find(_ => true)
                    .ToListAsync();

                var runningMachines = allMachines.Where(m => m.Status == "Running").ToList();
                var offMachines = allMachines.Where(m => m.Status == "Off").ToList();

                var machinesWithMetrics = runningMachines.Where(m => m.Metrics != null).ToList();

                var stats = new
                {
                    TotalMachines = allMachines.Count,
                    RunningMachines = runningMachines.Count,
                    OffMachines = offMachines.Count,
                    AverageCpuUsage = machinesWithMetrics.Any() 
                        ? machinesWithMetrics.Average(m => m.Metrics!.CpuUsagePercent) 
                        : 0,
                    AverageMemoryUsage = machinesWithMetrics.Any() && machinesWithMetrics.Any(m => m.Metrics?.Memory != null)
                        ? machinesWithMetrics.Where(m => m.Metrics?.Memory != null).Average(m => m.Metrics!.Memory!.UsagePercent)
                        : 0,
                    HighCpuMachines = machinesWithMetrics.Count(m => m.Metrics!.CpuUsagePercent > 80),
                    HighMemoryMachines = machinesWithMetrics.Count(m => m.Metrics?.Memory != null && m.Metrics.Memory.UsagePercent > 80),
                    LastUpdated = DateTime.UtcNow
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("machines-metrics")]
        public async Task<IActionResult> GetMachinesMetrics()
        {
            try
            {
                var machines = await _dbContext.Machines
                    .Find(m => m.Status == "Running")
                    .ToListAsync();

                var metricsData = machines.Select(m => new
                {
                    m.Id,
                    m.Name,
                    m.Ip,
                    m.Status,
                    CpuUsage = m.Metrics?.CpuUsagePercent ?? 0,
                    MemoryUsage = m.Metrics?.Memory?.UsagePercent ?? 0,
                    MemoryUsedMB = m.Metrics?.Memory != null ? m.Metrics.Memory.UsedBytes / (1024.0 * 1024.0) : 0,
                    MemoryTotalMB = m.Metrics?.Memory != null ? m.Metrics.Memory.TotalBytes / (1024.0 * 1024.0) : 0,
                    ProcessCount = m.Metrics?.ProcessCount ?? 0,
                    Uptime = m.Metrics?.Uptime?.ToString(@"d\.hh\:mm\:ss"),
                    m.LastUpdated
                }).ToList();

                return Ok(metricsData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}