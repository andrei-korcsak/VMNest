namespace VMNest.Server.Models;

public class MachineModel
{
    public string? Name { get; set; }
    public string? Ip { get; set; }
    public string? MacAddress { get; set; }
    public string? Status { get; set; } = "alert-warning";
    public string? Type { get; set; }
    public bool IsEnabled { get; set; }
}
