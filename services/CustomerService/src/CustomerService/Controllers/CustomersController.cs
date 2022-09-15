using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CustomerService.Data;
using CustomerService.Middleware;

namespace CustomerService.Controllers;

[ApiController]
[Route("/")]
[Authorize]
public class CustomersController : ControllerBase
{
	private ICustomersRepository _customers;
	private IContactsRepository _contacts;

	public CustomersController(ICustomersRepository customers, IContactsRepository contacts)
	{
		_customers = customers;
		_contacts = contacts;
	}

	[HttpGet]
	[Permission("customers:list")]
	public IActionResult ListCustomers()
	{
		var orgIds = User.Claims.Where(claim => claim.Type == "orgs").Select(c => c.Value);
		var data = _customers.ForOrganizations(orgIds);
		return Ok(data);
	}

	[HttpGet("{id}/contacts")]
	[Permission("customers:listContacts")]
	public IActionResult UpdateCustomer(string id)
	{
		var customer = _customers.ById(id);
		var orgIds = User.Claims.Where(claim => claim.Type == "orgs").Select(c => c.Value);

		if (!orgIds.Contains(customer.OrganizationId)){
			return Problem("Entity Not Found", statusCode: StatusCodes.Status400BadRequest);
		}

		var data = _contacts.ByCustomerId(customer.Id);
		return Ok(data);
	}

	[HttpGet("token")]
	public IActionResult Token()
	{
		return Ok(Request.Headers["Authorization"]);
	}
}