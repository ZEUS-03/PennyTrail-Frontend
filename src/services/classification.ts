import { transactionExtractionApi, transactionPredictionApi } from "./api";

export const classifyTransaction = async (transaction) => {
  try {
    const response = await transactionPredictionApi.post(
      "/predict",
      transaction
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const extractTransaction = async (transaction) => {
  try {
    const response = await transactionExtractionApi.post(
      "/extract",
      transaction
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const extractionServerHealth = async () => {
  try {
    const response = await transactionPredictionApi.head("/health");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const predictionServerHealth = async () => {
  try {
    const response = await transactionPredictionApi.head("/health");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
