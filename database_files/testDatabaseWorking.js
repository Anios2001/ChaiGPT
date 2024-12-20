const mysql = require("mysql2/promise");
const { Connector } = require("@google-cloud/cloud-sql-connector");

// In case the PRIVATE_IP environment variable is defined then we set
// the ipType=PRIVATE for the new connector instance, otherwise defaults
// to public ip type.
const getIpType = () => "PUBLIC";

// connectWithConnector initializes a connection pool for a Cloud SQL instance
// of MySQL using the Cloud SQL Node.js Connector.
const connectWithConnector = async (config) => {
  // Note: Saving credentials in environment variables is convenient, but not
  // secure - consider a more secure solution such as
  // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
  // keep secrets safe.
  const connector = new Connector();
  const clientOpts = await connector.getOptions({
    instanceConnectionName: "micro-spanner-404517:asia-south1:mysqlcloud",
    ipType: "PUBLIC",
  });
  const dbConfig = {
    ...clientOpts,
    user: "aniket", // e.g. 'my-db-user'
    password: "aniket9644#", // e.g. 'my-db-password'
    database: "chaigpt", // e.g. 'my-database'
    // ... Specify additional properties here.
    ...config,
  };
  // Establish a connection to the database.
  return mysql.createPool(dbConfig);
};
connectWithConnector().then((result) =>
  result.getConnection().then((connection) => {
    connection.execute("Select 2*3;").then((result) => console.log(result));
  })
);
