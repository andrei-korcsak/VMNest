using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace VMNest.Server.Models;

public class MachineModel
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Ip { get; set; }
    public string? MacAddress { get; set; }
    public string? Status { get; set; }
    public string? Type { get; set; }
    public bool IsEnabled { get; set; }
    public MachineMetrics? Metrics { get; set; }
    public DateTime? LastUpdated { get; set; }
    public NetworkHistory? PreviousNetwork { get; set; } 
}

public class MachineMetrics
{
    public double CpuUsagePercent { get; set; }
    public MemoryInfo? Memory { get; set; }
    public List<DiskInfo>? Disks { get; set; }
    public NetworkInfo? Network { get; set; }
    public TimeSpan? Uptime { get; set; }
    public int ProcessCount { get; set; }
    public string? EthernetAdapter { get; set; }
}

public class MemoryInfo
{
    public long TotalBytes { get; set; }
    public long UsedBytes { get; set; }
    public double UsagePercent => TotalBytes > 0 ? (UsedBytes * 100.0) / TotalBytes : 0;
}

public class DiskInfo
{
    public string? DriveName { get; set; }
    public long TotalBytes { get; set; }
    public long UsedBytes { get; set; }
    public double UsagePercent => TotalBytes > 0 ? (UsedBytes * 100.0) / TotalBytes : 0;
}

public class NetworkInfo
{
    public long BytesSent { get; set; }
    public long BytesReceived { get; set; }
    public double DownloadSpeedMbps { get; set; } 
    public double UploadSpeedMbps { get; set; }   
}

public class NetworkHistory  
{
    public long BytesSent { get; set; }
    public long BytesReceived { get; set; }
    public DateTime Timestamp { get; set; }
}
