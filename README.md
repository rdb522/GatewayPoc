# Overview
This POC shows a microservice setup using a centralized authentication gateway at the ingress. Downstream resources authenticate based on a standard token from the Auth Gateway, rather than each service implementing its own authentication and user store. All traffic into the system is sent through the Auth Gateway url.

Each service will receive the original request with a modified authentication header in the form of an asymmetrically signed JWT containing the user's identity, organizations, and permission details.  Once verified with a public key provided by the Auth Gateway, the services can use the this information for whatever purpose needed.

It is up to the services to provide the authorization of the user's permissions against the requirements of the service.  The Auth Gateway only provides a trusted representation of the client, and will not perform any checks on permissions.  Each service here implements a permission middleware to do these checks.

This code is not meant for anything other than demonstration purposes
***
# Usage
In this serverless example, both services are running on AWS Lambda proxied behind API Gateways, and the authentication and routing of requests are handled by a series of AWS API Gateways.

Authentication is done simply be providing a query parameter of `user` to each endpoint

To deploy the POC, run:
```
cdk deploy
```

Once deployed, Cloudformation will output the urls for each API Gateway. Using the Auth Gateway's url, the following endpoints and authentication query parameter can be appended in order to demonstrate the authentication, routing, and permission middlewares present on each service.
ex:
```
{Auth Gateway URL}/customers?user=globalAdmin
```
***
# Gateways
## Auth Gateway
The Auth Gateway maintains the repository of users and permissions, and uses an authorization function to exchange external credentials for a signed JWT containing details and permissions about the user, for consumption by a downstream service.  It does not register any services, and instead passes the modified request to the Service Gateway for routing.  This gateway would also expose an endpoint to provide the public key for downstream services to cache and use for verifying the token.

## Service Gateway
The Service Gateway only routes requests based on the url path, and does not authenticate or change the request.  Each service's entry url is mapped to a top level endpoint at the service gateway. `ex. Customer Service -> /customers`
***
# Services
## Customer Service
.NET 6 WebApi on Lambda
### Endpoints
 - `/customers` - Returns a list of customers for the user's organizations
 	- Requires: `customers:list`
 - `/customers/{customerId}/contacts` Returns a list of contacts for a customer
 	- Requires: `customers:listContacts`

## Payment Service
Typescript Web App on Lambda
### Endpoints
 - `/payments` - Returns a list of payments for the user's organizations
 	- Requires: `payments:list`
 - `/payments/{paymentId}/void` - Voids a payment
 	- Requires: `payments:update`

***
# Users
## ?user=`globalAdmin`
	- Organizations: 1,2
	- Permissions: *
## ?user=`org1User`
	- Organizations: 1
	- Permissions: customers:list, payments:list
## ?user=`org1Admin`
	- Organizations: 1
	- Permissions: customers:list*, payments:*
## ?user=`org2User`
	- Organizations: 2
	- Permissions: customers:list, payments:list, payments:update
## ?user=`org2Admin`
	- Organizations: 2
	- Permissions:customers:list*, payments:list, payments:update