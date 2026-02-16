namespace KasserPro.API.Middleware;

using Microsoft.Extensions.Caching.Memory;
using System.Text;

public class IdempotencyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private readonly ILogger<IdempotencyMiddleware> _logger;

    // Endpoints that require idempotency
    private static readonly HashSet<string> IdempotentEndpoints = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/orders",
        "/api/payments",
        "/api/shifts/open",
        "/api/shifts/close"
    };

    public IdempotencyMiddleware(RequestDelegate next, IMemoryCache cache, ILogger<IdempotencyMiddleware> logger)
    {
        _next = next;
        _cache = cache;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only check POST/PUT requests
        if (context.Request.Method != "POST" && context.Request.Method != "PUT")
        {
            await _next(context);
            return;
        }

        var path = context.Request.Path.Value?.ToLower() ?? "";
        var requiresIdempotency = IdempotentEndpoints.Any(e => path.StartsWith(e.ToLower())) ||
                                   path.Contains("/complete") ||
                                   path.Contains("/cancel") ||
                                   path.Contains("/refund");

        if (!requiresIdempotency)
        {
            await _next(context);
            return;
        }

        var idempotencyKey = context.Request.Headers["Idempotency-Key"].FirstOrDefault();

        if (string.IsNullOrEmpty(idempotencyKey))
        {
            // Add warning header but allow request
            context.Response.Headers.Append("X-Idempotency-Warning", "Missing Idempotency-Key header");
            await _next(context);
            return;
        }

        var cacheKey = $"idempotency:{idempotencyKey}";

        // Check if we have a cached response
        if (_cache.TryGetValue(cacheKey, out CachedResponse? cachedResponse) && cachedResponse != null)
        {
            _logger.LogInformation("Returning cached response for idempotency key: {Key}", idempotencyKey);
            
            context.Response.StatusCode = cachedResponse.StatusCode;
            context.Response.ContentType = cachedResponse.ContentType;
            context.Response.Headers.Append("X-Idempotency-Replayed", "true");
            context.Response.Headers.Append("X-Idempotency-Original-Time", cachedResponse.CreatedAt.ToString("O"));
            
            await context.Response.WriteAsync(cachedResponse.Body);
            return;
        }

        // Capture the response
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        await _next(context);

        // Cache successful responses (2xx status codes)
        if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
        {
            responseBody.Seek(0, SeekOrigin.Begin);
            var responseText = await new StreamReader(responseBody).ReadToEndAsync();

            var cached = new CachedResponse
            {
                StatusCode = context.Response.StatusCode,
                ContentType = context.Response.ContentType ?? "application/json",
                Body = responseText,
                CreatedAt = DateTime.UtcNow
            };

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(24));

            _cache.Set(cacheKey, cached, cacheOptions);
            _logger.LogInformation("Cached response for idempotency key: {Key}", idempotencyKey);
        }

        // Copy the response back
        responseBody.Seek(0, SeekOrigin.Begin);
        await responseBody.CopyToAsync(originalBodyStream);
    }

    private class CachedResponse
    {
        public int StatusCode { get; set; }
        public string ContentType { get; set; } = "application/json";
        public string Body { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}

public static class IdempotencyMiddlewareExtensions
{
    public static IApplicationBuilder UseIdempotency(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<IdempotencyMiddleware>();
    }
}
