using CustomerService.Models;

namespace CustomerService.Data;

public interface IContactsRepository
{
	public IEnumerable<Contact> ByCustomerId(string customerId);
}