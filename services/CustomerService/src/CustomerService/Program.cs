using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using CustomerService.Data;
using CustomerService.Errors;
using CustomerService.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddAuthentication(defaultScheme: JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options => 
	{
		var publicKey = @"
			-----BEGIN RSA PUBLIC KEY-----
			MIIBCgKCAQEArGBClPz4jmy1JDINqK5anvTFI3n9Y52dC0Mw1u5m01kKDt+eRuqc
			+zuGSokp9laTnmtp7BGPiJUDHri5036anmMtmacY9i3XqemEQFjYWmTXuIBT8X9R
			Xt7Yv4P2Uqx7opxS2ppdFF77FD17Q6koymim/iakCN1LJswsvDN7/CTxPHXYgfmS
			15LFEWUQoezaRW4kz+aWJwP6m6wEDZy+6sGVgd02fYuQ286A9JJj2H4jztPl4mdO
			QQe1JwFn/NYW3WGaqzoGc/EklxbZMxQFwsBxL9GMCY43n0QXS/HrMjJY3XC5ClK0
			jyUc4GTH1f995OqQ3UuQpJOmKMJvziGk5QIDAQAB
			-----END RSA PUBLIC KEY-----
		";
		var rsa = RSA.Create();
		rsa.ImportFromPem(publicKey);
		var key = new RsaSecurityKey(rsa);

		options.TokenValidationParameters = new TokenValidationParameters()
		{
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = key,
			ValidIssuer = "AuthGateway",
			ValidAudience = "Internal"
		};
	});

builder.Services.AddAWSLambdaHosting(LambdaEventSource.RestApi);

builder.Services.AddSingleton<ICustomersRepository, CustomersRepository>();
builder.Services.AddSingleton<IContactsRepository, ContactsRepository>();

var app = builder.Build();

app.ConfigureExceptionHandler();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.UseMiddleware<PermissionMiddleware>();

app.MapFallback(() => Results.Problem("Not Found", statusCode: 400));

app.Run();
