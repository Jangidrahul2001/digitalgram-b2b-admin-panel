
// Mock Data
import { MOCK_MANAGE_SERVICES_LIST } from "./mock-data";

/**
 * Fetches the list of all manageable services.
 * @returns {Promise<typeof MOCK_MANAGE_SERVICES_LIST>}
 */
export const fetchManageableServices = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_MANAGE_SERVICES_LIST);
    }, 400); // Simulate network latency
  });
};
