using System.Text.Json;
namespace CustomerService.Errors;
public class ErrorDetails
{
	public int StatusCode { get; set; }
	public string Message { get; set; } = String.Empty;

	public override string ToString()
	{
		return JsonSerializer.Serialize(this);
	}
}
