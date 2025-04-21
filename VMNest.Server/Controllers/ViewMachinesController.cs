using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using VMNest.Server.Models;

namespace VMNest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ViewMachinesController : Controller
    {
        private readonly IpNetTable _ipNetTable;
        private readonly MongoDbContext _dbContext;

        public ViewMachinesController(MongoDbContext dbContext)
        {
            _ipNetTable = new IpNetTable();
            _dbContext = dbContext;
        }

        [HttpGet("ips-and-macs")]
        public async Task<IActionResult> GetIpsAndMacs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                // Get paginated machine data
                var (items, totalPages) = _ipNetTable.GetIpsAndMacs(page, pageSize);

                // Resolve DNS names asynchronously
                var resolvedDnsNames = new List<string>();
                await foreach (var dnsName in _ipNetTable.TryDnsResolveAsync(items, 1)) // Adjust buffer size as needed
                {
                    resolvedDnsNames.Add(dnsName);
                }

                // Attach resolved DNS names to the machine models
                for (int i = 0; i < resolvedDnsNames.Count; i++)
                {
                    items[i].Name = resolvedDnsNames[i];
                }

                // Get all IPs from the database
                var allDbIps = await _dbContext.Machines
                    .Find(_ => true)
                    .Project(m => m.Ip)
                    .ToListAsync();

                // Extract IPs from the API response
                var apiIps = items.Select(m => m.Ip).ToHashSet();

                // Find IPs in the database that are not in the API response
                var ipsToSetOff = allDbIps.Where(dbIp => !apiIps.Contains(dbIp)).ToList();

                // Update the status of unmatched IPs to "Off"
                if (ipsToSetOff.Any())
                {
                    var filter = Builders<MachineModel>.Filter.In(m => m.Ip, ipsToSetOff);
                    var update = Builders<MachineModel>.Update.Set(m => m.Status, "Off");
                    await _dbContext.Machines.UpdateManyAsync(filter, update);
                }

                // Insert or update machines in MongoDB
                foreach (var machine in items)
                {
                    var filter = Builders<MachineModel>.Filter.Eq(m => m.Ip, machine.Ip);
                    var update = Builders<MachineModel>.Update
                        .Set(m => m.Status, "Running")
                        .SetOnInsert(m => m.Name, machine.Name)
                        .SetOnInsert(m => m.MacAddress, machine.MacAddress)
                        .SetOnInsert(m => m.Type, machine.Type)
                        .SetOnInsert(m => m.IsEnabled, machine.IsEnabled);

                    await _dbContext.Machines.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
                }

                // Read saved machines from MongoDB
                var savedMachines = await _dbContext.Machines
                    .Find(_ => true)
                    .Skip((page - 1) * pageSize)
                    .Limit(pageSize)
                    .ToListAsync();

                // Calculate total pages based on database count
                var totalRecords = await _dbContext.Machines.CountDocumentsAsync(_ => true);
                var totalPagesFromDb = (int)Math.Ceiling((double)totalRecords / pageSize);

                return Ok(new { items = savedMachines, totalPages = totalPagesFromDb });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
