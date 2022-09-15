using CustomerService.Models;

namespace CustomerService.Data;

public class CustomersRepository : ICustomersRepository
{

	private List<Customer> _customers => new(){
		new Customer("1", "1", "CustomerA"),
		new Customer("2", "2", "CustomerB")
	};

	public IEnumerable<Customer> All()
	{
		return _customers;
	}

	public Customer ById(string customerId)
	{
		return _customers.Single(customer => customer.Id == customerId);
	}

	public IEnumerable<Customer> ForOrganizations(IEnumerable<string> organizationIds)
	{
		return _customers.Where(customer => organizationIds.Contains(customer.OrganizationId));
	}
}