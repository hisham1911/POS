namespace KasserPro.API.Middleware;

using Serilog.Context;

/// <summary>
/// P1 PRODUCTION: Generates correlation ID per request for end-to-end tracing
/// </summary>
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationIdHeader = "X-Correlation-Id";

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Generate unique correlation ID for this request
        var correlationId = Guid.NewGuid().ToString();
        
        // Store in HttpContext for access by other middleware/services
        context.Items["CorrelationId"] = correlationId;
        
        // Add to response headers for client tracking
        context.Response.Headers.Append(CorrelationIdHeader, correlationId);
        
        // Push to Serilog context for automatic inclusion in all logs
        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
