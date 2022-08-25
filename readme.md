# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i


Part 3:

??Update routes/auth. post/token to add admin status to token

add middleware for ensure admin to auth.js

in companies routes, add ensureadmin to: post /, patch /:handle, delete /handle

in users routes, add ensureadmin to get /, get /:username, patch, patch /:username, delete/:username

Maybe additional middleware that checks ensureloggedin || ensureadmin