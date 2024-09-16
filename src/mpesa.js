import crypto from "crypto";
import axios from "axios";
import { config } from "dotenv";

config();

export function initializeMpesa({
  publicKey,
  apiKey,
  serviceProviderCode,
  env,
}) {
  const baseUri =
    env === "live" ? "https://api.vm.co.mz" : "https://api.sandbox.vm.co.mz";

  const publicKeyEnv = publicKey || process.env.MPESA_PUBLIC_KEY;
  const apiKeyEnv = apiKey || process.env.MPESA_API_KEY;
  const serviceProviderCodeEnv =
    serviceProviderCode || process.env.MPESA_SERVICE_PROVIDER_CODE;

  if (!publicKeyEnv || !apiKeyEnv || !serviceProviderCodeEnv) {
    throw new Error(
      "Public Key, API Key, or Service Provider Code is missing."
    );
  }

  function getToken() {
    if (publicKeyEnv && apiKeyEnv) {
      let key = "-----BEGIN PUBLIC KEY-----\n";
      key += publicKeyEnv.match(/.{1,60}/g).join("\n");
      key += "\n-----END PUBLIC KEY-----";

      const buffer = Buffer.from(apiKeyEnv, "utf-8");
      const encrypted = crypto.publicEncrypt(
        {
          key: key,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        buffer
      );

      return encrypted.toString("base64");
    }
    throw new Error("Invalid public key or API key");
  }

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      origin: "developer.mpesa.vm.co.mz",
      Connection: "keep-alive",
    };
  }

  async function makeRequest(url, port, method, fields = {}) {
    try {
      const response = await axios({
        method: method,
        url: `${baseUri}:${port}${url}`,
        headers: getHeaders(),
        data: method === "POST" ? fields : undefined,
        params: method !== "POST" ? fields : undefined,
        timeout: 90000,
      });

      return {
        response: response.data,
        status: response.status,
      };
    } catch (error) {
      return {
        response: error.response ? error.response.data : error.message,
        status: error.response ? error.response.status : 500,
      };
    }
  }

  async function c2b(
    transactionReference,
    customerMSISDN,
    amount,
    thirdPartyReference,
    serviceProviderCodeParam = serviceProviderCodeEnv
  ) {
    const fields = {
      input_TransactionReference: transactionReference,
      input_CustomerMSISDN: customerMSISDN,
      input_Amount: amount,
      input_ThirdPartyReference: thirdPartyReference,
      input_ServiceProviderCode: serviceProviderCodeParam,
    };

    return makeRequest(
      "/ipg/v1x/c2bPayment/singleStage/",
      18352,
      "POST",
      fields
    );
  }

  async function b2c(
    transactionReference,
    customerMSISDN,
    amount,
    thirdPartyReference,
    serviceProviderCodeParam = serviceProviderCodeEnv
  ) {
    const fields = {
      input_TransactionReference: transactionReference,
      input_CustomerMSISDN: customerMSISDN,
      input_Amount: amount,
      input_ThirdPartyReference: thirdPartyReference,
      input_ServiceProviderCode: serviceProviderCodeParam,
    };

    return makeRequest("/ipg/v1x/b2cPayment/", 18345, "POST", fields);
  }

  async function transactionReversal(
    transactionID,
    securityCredential,
    initiatorIdentifier,
    thirdPartyReference,
    serviceProviderCodeParam = serviceProviderCodeEnv,
    reversalAmount
  ) {
    const fields = {
      input_TransactionID: transactionID,
      input_SecurityCredential: securityCredential,
      input_InitiatorIdentifier: initiatorIdentifier,
      input_ThirdPartyReference: thirdPartyReference,
      input_ServiceProviderCode: serviceProviderCodeParam,
      input_ReversalAmount: reversalAmount,
    };
    return makeRequest("/ipg/v1x/reversal/", 18354, "POST", fields);
  }

  async function status(
    thirdPartyReference,
    queryReference,
    serviceProviderCodeParam = serviceProviderCodeEnv
  ) {
    const fields = {
      input_ThirdPartyReference: thirdPartyReference,
      input_QueryReference: queryReference,
      input_ServiceProviderCode: serviceProviderCodeParam,
    };

    return makeRequest(
      "/ipg/v1x/queryTransactionStatus/",
      18353,
      "GET",
      fields
    );
  }

  return {
    c2b,
    b2c,
    transactionReversal,
    status,
    getToken,
  };
}
