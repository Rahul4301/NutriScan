# MySQL Database Configuration for NutriScan

Add the following environment variables to your `.env.local` file at the root of your project:

```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=nutriscan
```

- Make sure to update the values as per your MySQL setup.
- The app will use these variables to connect to your MySQL database.
