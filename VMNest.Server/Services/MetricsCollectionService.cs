using System.Diagnostics;
using System.Management;
using MongoDB.Driver;
using VMNest.Server.Models;
using VMNest.Server.Controllers;

namespace VMNest.Server.Services;

public class MetricsCollectionService
{
    private readonly MongoDbContext _dbContext;
    private readonly ILogger<MetricsCollectionService> _logger;

    public MetricsCollectionService(MongoDbContext dbContext, ILogger<MetricsCollectionService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task StoreMetricsAsync(MachineMetricsDto metricsDto)
    {
        try
        {
            // Get current machine to access previous network data
            var filter = Builders<MachineModel>.Filter.Eq(m => m.Ip, metricsDto.IpAddress);
            var currentMachine = await _dbContext.Machines.Find(filter).FirstOrDefaultAsync();

            // Calculate bandwidth if we have previous data
            double downloadSpeedMbps = 0;
            double uploadSpeedMbps = 0;

            if (currentMachine?.PreviousNetwork != null)
            {
                var timeDiff = (DateTime.UtcNow - currentMachine.PreviousNetwork.Timestamp).TotalSeconds;

                if (timeDiff > 0)
                {
                    // Calculate bytes transferred since last reading
                    long bytesReceivedDiff = metricsDto.NetworkReceived - currentMachine.PreviousNetwork.BytesReceived;
                    long bytesSentDiff = metricsDto.NetworkSent - currentMachine.PreviousNetwork.BytesSent;

                    // Convert to Mbps (Megabits per second)
                    // bytes -> bits (*8) -> megabits (/1,000,000) -> per second (/timeDiff)
                    downloadSpeedMbps = Math.Round((bytesReceivedDiff * 8.0) / (1_000_000 * timeDiff), 2);
                    uploadSpeedMbps = Math.Round((bytesSentDiff * 8.0) / (1_000_000 * timeDiff), 2);

                    // Handle potential counter resets (system reboot)
                    if (downloadSpeedMbps < 0) downloadSpeedMbps = 0;
                    if (uploadSpeedMbps < 0) uploadSpeedMbps = 0;
                }
            }

            // Convert DTO to domain model
            var metrics = new MachineMetrics
            {
                CpuUsagePercent = metricsDto.CpuUsagePercentage,
                Memory = new MemoryInfo
                {
                    TotalBytes = metricsDto.TotalRamMB * 1024 * 1024,
                    UsedBytes = (metricsDto.TotalRamMB - metricsDto.AvailableRamMB) * 1024 * 1024
                },
                Disks = metricsDto.DiskMetrics.Select(d => new DiskInfo
                {
                    DriveName = d.DriveName,
                    TotalBytes = d.TotalSpace,
                    UsedBytes = d.TotalSpace - d.FreeSpace
                }).ToList(),
                Network = new NetworkInfo
                {
                    BytesSent = metricsDto.NetworkSent,
                    BytesReceived = metricsDto.NetworkReceived,
                    DownloadSpeedMbps = downloadSpeedMbps,
                    UploadSpeedMbps = uploadSpeedMbps
                },
                Uptime = TimeSpan.TryParse(metricsDto.Uptime, out var uptime) ? uptime : TimeSpan.Zero,
                ProcessCount = metricsDto.ProcessCount,
                EthernetAdapter = metricsDto.EthernetAdapter
            };

            // Store current values as previous for next calculation
            var networkHistory = new NetworkHistory
            {
                BytesSent = metricsDto.NetworkSent,
                BytesReceived = metricsDto.NetworkReceived,
                Timestamp = DateTime.UtcNow
            };

            // Update the machine with new metrics, LastUpdated timestamp, and network history
            var update = Builders<MachineModel>.Update
                .Set(m => m.Metrics, metrics)
                .Set(m => m.LastUpdated, DateTime.UtcNow)
                .Set(m => m.PreviousNetwork, networkHistory);

            var result = await _dbContext.Machines.UpdateOneAsync(filter, update);

            if (result.MatchedCount == 0)
            {
                _logger.LogWarning("Machine {MachineId} not found in database", metricsDto.MachineId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error storing metrics for machine {MachineId}", metricsDto.MachineId);
            throw;
        }
    }

    public async Task<MachineMetricsDto?> GetLatestMetricsAsync(string machineId)
    {
        var filter = Builders<MachineModel>.Filter.Eq(m => m.Name, machineId);
        var machine = await _dbContext.Machines.Find(filter).FirstOrDefaultAsync();

        if (machine?.Metrics == null)
            return null;

        return ConvertToDto(machineId, machine.Metrics, machine.LastUpdated ?? DateTime.UtcNow);
    }

    public async Task<IEnumerable<MachineMetricsDto>> GetMetricsHistoryAsync(string machineId, int hours)
    {
        // For now, return the latest metrics
        // TODO: Implement time-series storage for historical data
        var latest = await GetLatestMetricsAsync(machineId);
        return latest != null ? new[] { latest } : Array.Empty<MachineMetricsDto>();
    }

    private MachineMetricsDto ConvertToDto(string machineId, MachineMetrics metrics, DateTime timestamp)
    {
        var uptime = metrics.Uptime ?? TimeSpan.Zero;
        return new MachineMetricsDto
        {
            MachineId = machineId,
            Timestamp = timestamp,
            CpuUsagePercentage = metrics.CpuUsagePercent,
            RamUsagePercentage = (double)metrics.Memory.UsedBytes / metrics.Memory.TotalBytes * 100,
            TotalRamMB = metrics.Memory.TotalBytes / (1024 * 1024),
            AvailableRamMB = (metrics.Memory.TotalBytes - metrics.Memory.UsedBytes) / (1024 * 1024),
            DiskMetrics = metrics.Disks.Select(d => new DiskMetricsDto
            {
                DriveName = d.DriveName,
                TotalSpace = d.TotalBytes,
                FreeSpace = d.TotalBytes - d.UsedBytes,
                UsagePercentage = (double)d.UsedBytes / d.TotalBytes * 100
            }).ToList(),
            Uptime = uptime.ToString(@"d\.hh\:mm\:ss"),
            ProcessCount = metrics.ProcessCount
        };
    }

    public MachineMetrics CollectLocalMetrics()
    {
        var metrics = new MachineMetrics
        {
            CpuUsagePercent = GetCpuUsage(),
            Memory = GetMemoryInfo(),
            Disks = GetDiskInfo(),
            Uptime = GetUptime(),
            ProcessCount = Process.GetProcesses().Length
        };

        return metrics;
    }

    private double GetCpuUsage()
    {
        using var cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
        cpuCounter.NextValue(); // First call always returns 0
        Thread.Sleep(100);
        return Math.Round(cpuCounter.NextValue(), 2);
    }

    private MemoryInfo GetMemoryInfo()
    {
        if (OperatingSystem.IsWindows())
        {
            using var searcher = new ManagementObjectSearcher("SELECT TotalVisibleMemorySize, FreePhysicalMemory FROM Win32_OperatingSystem");
            foreach (ManagementObject obj in searcher.Get())
            {
                var totalKB = Convert.ToInt64(obj["TotalVisibleMemorySize"]);
                var freeKB = Convert.ToInt64(obj["FreePhysicalMemory"]);
                var totalBytes = totalKB * 1024;
                var usedBytes = (totalKB - freeKB) * 1024;

                return new MemoryInfo
                {
                    TotalBytes = totalBytes,
                    UsedBytes = usedBytes
                };
            }
        }

        return new MemoryInfo();
    }

    private List<DiskInfo> GetDiskInfo()
    {
        var disks = new List<DiskInfo>();

        foreach (var drive in DriveInfo.GetDrives().Where(d => d.IsReady && d.DriveType == DriveType.Fixed))
        {
            disks.Add(new DiskInfo
            {
                DriveName = drive.Name,
                TotalBytes = drive.TotalSize,
                UsedBytes = drive.TotalSize - drive.AvailableFreeSpace
            });
        }

        return disks;
    }

    private TimeSpan GetUptime()
    {
        return TimeSpan.FromMilliseconds(Environment.TickCount64);
    }
}