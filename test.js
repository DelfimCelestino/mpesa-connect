import { initializeMpesa } from "./src/mpesa.js";

const mpesa = initializeMpesa({
  env: "test", // Use 'live' for production and 'test' for testing
});

const run = async () => {
  try {
    const result = await mpesa.c2b("TX123456", "258857250244", 10, "REF123");
    console.log("C2B Result:", result);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

run();
