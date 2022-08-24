# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i


Part 2:

Models/company:
- update get all method
- accepts parameters for filtering as optional arguments
- generates SQL
- returns "Query returned no results" in 400

model test:
- multiple happy paths:
    - name
    - min emp
    - max emp
    - all of them
    - query with no results

- sad route
    - 

route:
- logically select getAll or getSome based on query string if query string is length zero
- handle min>max
- error handling on validation for no extra query fields passed in

route test: 
- happy route for no query string
- many happy routes for different querystring paramaters
- sad route min>max - return 400
- sad route for invalid filter fields passed in

