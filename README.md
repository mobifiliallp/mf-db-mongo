# Mobifilia Common - Mongo DB Wrapper
Simple wrapper over official nodejs Mongodb driver.
Also logs basic db events.

## Configuration
  The module reads the configuration of the app if available. Sample configuration
  ```JSON
    "mongodb": {
      "url": "mongodb://localhost:27017",
      "options": {
        "auth": {
          "user": "",
          "password": ""
        }
     }
   }
  ```

## Usage
Call the `initialize` method before accessing the database client
