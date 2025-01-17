"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeMpesa = initializeMpesa;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function initializeMpesa({ publicKey, apiKey, serviceProviderCode, env, }) {
    const baseUri = env === "live" ? "https://api.vm.co.mz" : "https://api.sandbox.vm.co.mz";
    const publicKeyEnv = publicKey || process.env.MPESA_PUBLIC_KEY;
    const apiKeyEnv = apiKey || process.env.MPESA_API_KEY;
    const serviceProviderCodeEnv = serviceProviderCode || process.env.MPESA_SERVICE_PROVIDER_CODE;
    if (!publicKeyEnv || !apiKeyEnv || !serviceProviderCodeEnv) {
        throw new Error("Public Key, API Key, or Service Provider Code is missing.");
    }
    function getToken() {
        if (publicKeyEnv && apiKeyEnv) {
            let key = "-----BEGIN PUBLIC KEY-----\n";
            key += publicKeyEnv.match(/.{1,60}/g).join("\n");
            key += "\n-----END PUBLIC KEY-----";
            const buffer = Buffer.from(apiKeyEnv, "utf-8");
            const encrypted = crypto_1.default.publicEncrypt({
                key: key,
                padding: crypto_1.default.constants.RSA_PKCS1_PADDING,
            }, buffer);
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
    function makeRequest(url_1, port_1, method_1) {
        return __awaiter(this, arguments, void 0, function* (url, port, method, fields = {}) {
            try {
                const response = yield (0, axios_1.default)({
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
            }
            catch (error) {
                return {
                    response: error.response ? error.response.data : error.message,
                    status: error.response ? error.response.status : 500,
                };
            }
        });
    }
    function c2b(transactionReference_1, customerMSISDN_1, amount_1, thirdPartyReference_1) {
        return __awaiter(this, arguments, void 0, function* (transactionReference, customerMSISDN, amount, thirdPartyReference, serviceProviderCodeParam = serviceProviderCodeEnv) {
            const fields = {
                input_TransactionReference: transactionReference,
                input_CustomerMSISDN: customerMSISDN,
                input_Amount: amount,
                input_ThirdPartyReference: thirdPartyReference,
                input_ServiceProviderCode: serviceProviderCodeParam,
            };
            return makeRequest("/ipg/v1x/c2bPayment/singleStage/", 18352, "POST", fields);
        });
    }
    function b2c(transactionReference_1, customerMSISDN_1, amount_1, thirdPartyReference_1) {
        return __awaiter(this, arguments, void 0, function* (transactionReference, customerMSISDN, amount, thirdPartyReference, serviceProviderCodeParam = serviceProviderCodeEnv) {
            const fields = {
                input_TransactionReference: transactionReference,
                input_CustomerMSISDN: customerMSISDN,
                input_Amount: amount,
                input_ThirdPartyReference: thirdPartyReference,
                input_ServiceProviderCode: serviceProviderCodeParam,
            };
            return makeRequest("/ipg/v1x/b2cPayment/", 18345, "POST", fields);
        });
    }
    function transactionReversal(transactionID_1, securityCredential_1, initiatorIdentifier_1, thirdPartyReference_1) {
        return __awaiter(this, arguments, void 0, function* (transactionID, securityCredential, initiatorIdentifier, thirdPartyReference, serviceProviderCodeParam = serviceProviderCodeEnv, reversalAmount) {
            const fields = {
                input_TransactionID: transactionID,
                input_SecurityCredential: securityCredential,
                input_InitiatorIdentifier: initiatorIdentifier,
                input_ThirdPartyReference: thirdPartyReference,
                input_ServiceProviderCode: serviceProviderCodeParam,
                input_ReversalAmount: reversalAmount,
            };
            return makeRequest("/ipg/v1x/reversal/", 18354, "POST", fields);
        });
    }
    function status(thirdPartyReference_1, queryReference_1) {
        return __awaiter(this, arguments, void 0, function* (thirdPartyReference, queryReference, serviceProviderCodeParam = serviceProviderCodeEnv) {
            const fields = {
                input_ThirdPartyReference: thirdPartyReference,
                input_QueryReference: queryReference,
                input_ServiceProviderCode: serviceProviderCodeParam,
            };
            return makeRequest("/ipg/v1x/queryTransactionStatus/", 18353, "GET", fields);
        });
    }
    return {
        c2b,
        b2c,
        transactionReversal,
        status,
        getToken,
    };
}
