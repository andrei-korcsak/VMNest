using VMNest.Server.Services;
using VMNest.Server.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MongoDB Configuration
builder.Services.AddSingleton<MongoDbContext>();

// Register MetricsCollectionService
builder.Services.AddScoped<MetricsCollectionService>();

// Register Email Service
builder.Services.AddScoped<EmailService>();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseMiddleware<EmailNotificationMiddleware>(); 
app.UseAuthorization();
app.MapControllers();

app.Run();
