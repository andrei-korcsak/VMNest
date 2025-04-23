var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    // React

    options.AddPolicy("AllowPolicy",
        policyBuilder => {

            //Cors:WithOrigins
            var withOriginsConfigurationSection = config.GetSection("Cors:WithOrigins");
            string[]? corsWithOrigins = null;
            if (withOriginsConfigurationSection is not null)
            {
                var corsWithOriginsArray = withOriginsConfigurationSection.Get<string[]>();
                if (corsWithOriginsArray is not null && corsWithOriginsArray.Length != 0)
                {
                    corsWithOrigins = corsWithOriginsArray;
                }
                else
                {
                    if (!string.IsNullOrEmpty(withOriginsConfigurationSection.Value))
                    {
                        corsWithOrigins = [withOriginsConfigurationSection.Value];
                    }
                }
            }
            if (corsWithOrigins is not null)
            {
                if (corsWithOrigins[0].Equals("*", StringComparison.OrdinalIgnoreCase))
                {
                    policyBuilder.AllowAnyOrigin();
                }
                else
                {
                    policyBuilder.WithOrigins(corsWithOrigins);
                    policyBuilder.AllowCredentials();
                }
            }

            //Cors:WithMethods
            var corsWithMethodsConfigurationSection = config.GetSection("Cors:WithMethods");
            string[]? corsWithMethods = null;
            if (corsWithMethodsConfigurationSection is not null)
            {
                var corsWithMethodsArray = corsWithMethodsConfigurationSection.Get<string[]>();
                if (corsWithMethodsArray is not null && corsWithMethodsArray.Length != 0)
                {
                    corsWithMethods = corsWithMethodsArray;
                }
                else
                {
                    if (!string.IsNullOrEmpty(corsWithMethodsConfigurationSection.Value))
                    {
                        corsWithMethods = [corsWithMethodsConfigurationSection.Value];
                    }
                }
            }
            if (corsWithMethods is not null)
            {
                if (corsWithMethods[0].Equals("*", StringComparison.OrdinalIgnoreCase))
                {
                    policyBuilder.AllowAnyMethod();
                }
                else
                {
                    policyBuilder.WithMethods(corsWithMethods);
                }
            }

            //Cors:WithHeaders
            var corsWithHeadersConfigurationSection = config.GetSection("Cors:WithHeaders");
            string[]? corsWithHeaders = null;
            if (corsWithHeadersConfigurationSection is not null)
            {
                var corsWithHeadersArray = corsWithHeadersConfigurationSection.Get<string[]>();
                if (corsWithHeadersArray is not null && corsWithHeadersArray.Length != 0)
                {
                    corsWithHeaders = corsWithHeadersArray;
                }
                else
                {
                    if (!string.IsNullOrEmpty(corsWithHeadersConfigurationSection.Value))
                    {
                        corsWithHeaders = [corsWithHeadersConfigurationSection.Value];
                    }
                }
            }

            if (corsWithHeaders is not null)
            {
                if (corsWithHeaders[0].Equals("*", StringComparison.OrdinalIgnoreCase))
                {
                    policyBuilder.AllowAnyHeader();
                }
                else
                {
                    policyBuilder.WithHeaders(corsWithHeaders);
                }
            }
        });
});

// Add MongoDB context
builder.Services.AddSingleton<MongoDbContext>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowPolicy");

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
