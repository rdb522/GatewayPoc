using Microsoft.AspNetCore.Diagnostics;
using System.Net;

namespace CustomerService.Errors;

public static class ExceptionMiddlewareExtensions
{
	public static void ConfigureExceptionHandler(this IApplicationBuilder app)
	{
		app.UseExceptionHandler(appError =>
		{
			appError.Run(async context =>
			{
				context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
				context.Response.ContentType = "application/json";
				var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
				Exception? exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
				if(contextFeature != null)
				{ 
					await context.Response.WriteAsync(new ErrorDetails()
					{
						StatusCode = context.Response.StatusCode,
						Message = exception.Message
					}.ToString());
				}
			});
		});
	}
}