namespace CustomerService.Middleware;

public class PermissionAttribute : Attribute
{
	public string Permission { get; set; }

	public PermissionAttribute(string permission)
	{
		Permission = permission;
	}
}