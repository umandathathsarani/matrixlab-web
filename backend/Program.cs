var builder = WebApplication.CreateBuilder(args);

// Configure CORS policy to allow requests from the deployed Netlify frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("https://matrixlab-web.netlify.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Read database and authentication settings from environment variables
var connectionString = builder.Configuration.GetConnectionString("Default");
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MatrixLab";

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Apply CORS middleware before request routing
app.UseCors("Frontend");

// Health check endpoint for cloud monitoring
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "Healthy",
    tier = "MatrixLab API",
    timestamp = DateTime.UtcNow
}));

// Endpoint for receiving matrix computation payloads
app.MapPost("/api/matrix/compute", (MatrixPayload payload) =>
{
    return Results.Ok(new
    {
        message = "Calculation payload received",
        receivedAt = DateTime.UtcNow,
        matrix = payload.Matrix
    });
});

app.Run();

// Data transfer record for computation requests
public record MatrixPayload(double[][] Matrix, string? Timestamp);
