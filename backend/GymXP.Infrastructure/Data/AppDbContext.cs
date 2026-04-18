using GymXP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GymXP.Infrastructure.Data;

/// <summary>EF Core database context for GymXP.</summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<XPRecord> XPRecords => Set<XPRecord>();
    public DbSet<Streak> Streaks => Set<Streak>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.Profile)
                .WithOne(p => p.User)
                .HasForeignKey<UserProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(u => u.Streak)
                .WithOne(s => s.User)
                .HasForeignKey<Streak>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Workout
        modelBuilder.Entity<Workout>(e =>
        {
            e.HasKey(w => w.Id);
            e.HasMany(w => w.Exercises)
                .WithOne(ex => ex.Workout)
                .HasForeignKey(ex => ex.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // XPRecord
        modelBuilder.Entity<XPRecord>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasOne(r => r.Workout)
                .WithMany()
                .HasForeignKey(r => r.WorkoutId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
