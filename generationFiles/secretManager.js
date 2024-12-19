const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
function urlEncode(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&");
}
async function getToken() {
  const header = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
  });
  let auth_plug = {
    client_id: "TuKHuzWiStV2bwybknHxce0hMJg4JW16",
    client_secret:
      "Z8UDRXSZo1beZmgVOzCrncQTj29ZnPTXjYi2UEF6t_knu3MIRLiOUKCJJKX2rvpB",
    grant_type: "client_credentials",
    audience: "https://api.hashicorp.cloud",
  };
  const response = await fetch("https://auth.idp.hashicorp.com/oauth2/token", {
    method: "POST",
    headers: header,
    body: urlEncode(auth_plug),
  });
  const data = await response.json();
  //console.log(data);
  return data.access_token;
}
async function getKey() {
  const token = await getToken();
  const header = new Headers({ Authorization: `Bearer ${token}` });
  const response = await fetch(
    "https://api.cloud.hashicorp.com/secrets/2023-11-28/organizations/6660c11b-5540-429e-9bc7-89ccafb9e730/projects/1bccd6ef-0699-4549-910a-43fedb9ec5a3/apps/my-default-app/secrets:open",
    {
      method: "GET",
      headers: header,
    }
  );
  const data = await response.json();
  return data.secrets[0].static_version.value;
}
module.exports = { getKey };
