using CustomerService.Errors;
using Microsoft.AspNetCore.Http.Features;

namespace CustomerService.Middleware;

public class PermissionMiddleware
{
	private RequestDelegate _next;
	
	public PermissionMiddleware(RequestDelegate next)
	{
		_next = next;
	}

	public async Task Invoke(HttpContext context)
	{

		var endpoint = context.Features.Get<IEndpointFeature>()?.Endpoint;
		var attribute = endpoint?.Metadata.GetMetadata<PermissionAttribute>();

		Console.WriteLine($"attribute: {attribute?.ToString()}");

		if (attribute is null) //No Permission specified
		{
			Console.WriteLine($"attribute is null");
			await _next(context);
		}
		else{

			var permissions = context.User.Claims
			.Where(c => c.Type == "permissions")
			.Select(p => p.Value)
			.ToList();

			var passed = false;

			Console.WriteLine($"permission: {attribute.Permission}");
			foreach (var permission in permissions)
			{
				Console.WriteLine(permission);
				if (permission == attribute.Permission){
					Console.WriteLine($"Exact Match");
					passed = true;
					break;
				}

				if (!passed && permission.Contains("*"))
				{
					var index = permission.IndexOf("*");
					var userPermissionSubstr = permission.Substring(0, index);
					var permissionSubstr = permission.Substring(0, index);
					
					Console.WriteLine($"UserSubstr: {userPermissionSubstr}, PermSubstr: {permissionSubstr}");

					if (permissionSubstr == userPermissionSubstr){
						Console.WriteLine($"Wildcard Match");
						passed = true;
						break;
					}

				}
			}

			if (passed){
				await _next(context);
			}
			else
			{
				context.Response.StatusCode =  StatusCodes.Status401Unauthorized;
				await context.Response.WriteAsync(new ErrorDetails()
				{
					StatusCode = StatusCodes.Status401Unauthorized,
					Message = "Insufficient Permissions"
				}.ToString());
			}
		}
		
	}
}