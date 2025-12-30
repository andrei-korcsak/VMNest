using System.Net.Http.Json;
using System.Diagnostics;
using System.Management;
using System.Net.NetworkInformation;
using System.Net.Sockets;

namespace VMNest.Agent;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly TimeSpan _collectionInterval;

    public Worker(ILogger<Worker> logger, IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
        _collectionInterval = TimeSpan.FromSeconds(_configuration.GetValue<int>("MetricsCollectionIntervalSeconds", 30));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var serverUrl = _configuration["ServerUrl"] ?? throw new InvalidOperationException("ServerUrl not configured");
        var machineId = _configuration["MachineId"] ?? Environment.MachineName;

        _logger.LogInformation("Agent starting for machine: {MachineId}, reporting to: {ServerUrl}", machineId, serverUrl);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var metrics = await CollectMetricsAsync(machineId);
                await SendMetricsAsync(serverUrl, metrics, stoppingToken);
                _logger.LogInformation("Metrics RAM: {Metrics}", metrics.RamUsagePercentage);
                _logger.LogInformation("Metrics Process Count: {Process}", metrics.ProcessCount);
                _logger.LogInformation("Metrics sent successfully at: {Time}", DateTimeOffset.Now);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error collecting or sending metrics");
            }

            await Task.Delay(_collectionInterval, stoppingToken);
        }
    }

    private async Task<MachineMetrics> CollectMetricsAsync(string machineId)
    {
        return await Task.Run(() =>
        {
            var cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
            cpuCounter.NextValue(); // First call returns 0
            System.Threading.Thread.Sleep(100);
            var cpuUsage = cpuCounter.NextValue();

            var ramCounter = new PerformanceCounter("Memory", "Available MBytes");
            var availableRam = ramCounter.NextValue();

            // Get total RAM using WMI
            long totalRam = 0;
            if (OperatingSystem.IsWindows())
            {
                using var searcher = new ManagementObjectSearcher("SELECT TotalVisibleMemorySize FROM Win32_OperatingSystem");
                foreach (ManagementObject obj in searcher.Get())
                {
                    totalRam = Convert.ToInt64(obj["TotalVisibleMemorySize"]) / 1024; // KB to MB
                }
            }

            var ramUsage = totalRam > 0 ? ((totalRam - availableRam) / totalRam) * 100 : 0;

            var drives = DriveInfo.GetDrives()
                .Where(d => d.IsReady && d.DriveType == DriveType.Fixed)
                .Select(d => new DiskMetrics
                {
                    DriveName = d.Name,
                    TotalSpace = d.TotalSize,
                    FreeSpace = d.AvailableFreeSpace,
                    UsagePercentage = ((double)(d.TotalSize - d.AvailableFreeSpace) / d.TotalSize) * 100
                })
                .ToList();

            var uptime = TimeSpan.FromMilliseconds(Environment.TickCount64);

            // Get network info including bytes sent/received
            var (ipAddress, ethernetAdapter, bytesSent, bytesReceived) = GetNetworkInfo();

            // Get process count
            var processCount = Process.GetProcesses().Length;

            return new MachineMetrics
            {
                MachineId = machineId,
                IpAddress = ipAddress,
                EthernetAdapter = ethernetAdapter,
                Timestamp = DateTimeOffset.UtcNow,
                CpuUsagePercentage = Math.Round(cpuUsage, 2),
                RamUsagePercentage = Math.Round(ramUsage, 2),
                TotalRamMB = totalRam,
                AvailableRamMB = (long)availableRam,
                DiskMetrics = drives,
                NetworkSent = bytesSent,
                NetworkReceived = bytesReceived,
                Uptime = uptime.ToString(@"d\.hh\:mm\:ss"),
                ProcessCount = processCount
            };
        });
    }

    private (string ipAddress, string ethernetAdapter, long bytesSent, long bytesReceived) GetNetworkInfo()
    {
        try
        {
            // Get all network interfaces
            var networkInterfaces = NetworkInterface.GetAllNetworkInterfaces()
                .Where(ni => ni.OperationalStatus == OperationalStatus.Up &&
                            ni.NetworkInterfaceType != NetworkInterfaceType.Loopback)
                .OrderByDescending(ni => ni.Speed); // Prefer faster adapters

            foreach (var ni in networkInterfaces)
            {
                var ipProperties = ni.GetIPProperties();
                var ipv4Address = ipProperties.UnicastAddresses
                    .FirstOrDefault(addr => addr.Address.AddressFamily == AddressFamily.InterNetwork &&
                                          !System.Net.IPAddress.IsLoopback(addr.Address));

                if (ipv4Address != null)
                {
                    // Get network statistics
                    var stats = ni.GetIPv4Statistics();
                    return (
                        ipv4Address.Address.ToString(), 
                        ni.Name,
                        stats.BytesSent,
                        stats.BytesReceived
                    );
                }
            }

            return ("Unknown", "Unknown", 0, 0);
        }
        catch (Exception)
        {
            return ("Unknown", "Unknown", 0, 0);
        }
    }

    private async Task SendMetricsAsync(string serverUrl, MachineMetrics metrics, CancellationToken cancellationToken)
    {
        var response = await _httpClient.PostAsJsonAsync($"{serverUrl}/api/metrics", metrics, cancellationToken);
        response.EnsureSuccessStatusCode();
    }
}

public class MachineMetrics
{
    public string MachineId { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string EthernetAdapter { get; set; } = string.Empty;
    public DateTimeOffset Timestamp { get; set; }
    public double CpuUsagePercentage { get; set; }
    public double RamUsagePercentage { get; set; }
    public long TotalRamMB { get; set; }
    public long AvailableRamMB { get; set; }
    public List<DiskMetrics> DiskMetrics { get; set; } = new();
    public long NetworkSent { get; set; }
    public long NetworkReceived { get; set; }
    public string Uptime { get; set; } = string.Empty;
    public int ProcessCount { get; set; }
}

public class DiskMetrics
{
    public string DriveName { get; set; } = string.Empty;
    public long TotalSpace { get; set; }
    public long FreeSpace { get; set; }
    public double UsagePercentage { get; set; }
}
