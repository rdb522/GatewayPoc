using CustomerService.Models;

namespace CustomerService.Data;

public class ContactsRepository : IContactsRepository
{

	private List<Contact> _contacts => new(){
		new Contact("1,", "1", "ContactA"),
		new Contact("2", "2", "ContactB")
	};

	public IEnumerable<Contact> ByCustomerId(string customerId)
	{
		return _contacts.Where(contact => contact.CustomerId == customerId);
	}
}