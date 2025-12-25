using System.Diagnostics;
using System.Management;
using VMNest.Server.Models;

namespace VMNest.Server.Services;

public class MetricsCollectionService
{
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