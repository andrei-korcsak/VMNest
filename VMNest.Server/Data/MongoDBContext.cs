using MongoDB.Driver;
using VMNest.Server.Models;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {

        var connectionString = configuration.GetValue<string>("MongoDb:ConnectionString");
        var databaseName = configuration.GetValue<string>("MongoDb:DatabaseName");

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<MachineModel> Machines => _database.GetCollection<MachineModel>("machines");
}
