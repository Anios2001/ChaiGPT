const { Connector } = require("@google-cloud/cloud-sql-connector");

async function connectToCloudSQL() {
  //Error here put this in get Options
  const connector = new Connector({
    instanceConnectionName: "micro-spanner-404517:asia-south1:mysqlcloud",
    type: "PUBLIC",
    authType: "IAM",
  });
  console.log(connector.authType);
  try {
    const options = await connector.getOptions();
    // Use the options to connect to your database

    // ...
  } catch (error) {
    console.error("Error connecting to Cloud SQL:", error);
    // Handle the error, e.g., retry the connection or notify the user
  }
}
connectToCloudSQL();
