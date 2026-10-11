// ==============================================================================
// MatrixLab Backend API - Cloud Hosting & Production Configuration (Lab 11)
// ==============================================================================

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------------------------------------------------
// 1. CORS Configuration (Task 03 - Essential for Cloud Deployment)
// Whitelists our deployed Netlify frontend origin to allow cross-origin requests
// ------------------------------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("https://matrixlab-web.netlify.app") // Netlify production origin
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ------------------------------------------------------------------------------
// 2. Production Environment Variables & Database Configuration (Task 04)
// Double underscore ConnectionStrings__Default overrides ConnectionStrings:Default
// ------------------------------------------------------------------------------
var connectionString = builder.Configuration.GetConnectionString("Default");
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MatrixLab";

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// ------------------------------------------------------------------------------
// 3. Middleware Pipeline: Apply CORS before routing & endpoints
// ------------------------------------------------------------------------------
app.UseCors("Frontend");

// Health check endpoint for Cloud Host (Render / Railway)
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "Healthy",
    tier = "MatrixLab Cloud API Tier",
    platform = "Render Web Service",
    timestamp = DateTime.UtcNow
}));

// Computation payload endpoint
app.MapPost("/api/matrix/compute", (MatrixPayload payload) =>
{
    return Results.Ok(new
    {
        message = "Calculation payload received by cloud backend",
        receivedAt = DateTime.UtcNow,
        matrix = payload.Matrix
    });
});

app.Run();

// Data Transfer Object
public record MatrixPayload(double[][] Matrix, string? Timestamp);
