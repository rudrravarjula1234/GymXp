using GymXP.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace GymXP.IntegrationTests;

/// <summary>
/// Custom WebApplicationFactory that replaces the Npgsql DB with an EF Core
/// in-memory database so tests run without a live PostgreSQL instance.
/// </summary>
public class GymXpWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the real Npgsql DbContext registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Also remove any AppDbContext direct registration
            var ctxDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(AppDbContext));
            if (ctxDescriptor != null)
                services.Remove(ctxDescriptor);

            // Add EF Core in-memory database
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));

            // Ensure schema is created (Migrate() is a no-op on in-memory, but EnsureCreated works)
            using var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        });

        // Override config to provide JWT settings without needing appsettings.json
        builder.UseSetting("JwtSettings:Secret", "IntegrationTest_SuperSecretKey_AtLeast32Chars!!");
        builder.UseSetting("JwtSettings:Issuer", "GymXP");
        builder.UseSetting("JwtSettings:Audience", "GymXPUsers");
        builder.UseSetting("ConnectionStrings:DefaultConnection", "Host=localhost;Database=test;"); // overridden above
        builder.UseSetting("OpenAI:ApiKey", ""); // ensures AI fallback path is used
    }
}
