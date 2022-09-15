using CustomerService.Models;

namespace CustomerService.Data;

public interface ICustomersRepository
{
	public IEnumerable<Customer> All();

	public Customer ById(string customerId);
	public IEnumerable<Customer> ForOrganizations(IEnumerable<string> organizationId);
}