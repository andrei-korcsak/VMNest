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
    public string? Status { get; set; } = "alert-warning";
    public string? Type { get; set; }
    public bool IsEnabled { get; set; }
}
