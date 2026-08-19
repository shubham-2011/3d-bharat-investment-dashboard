// services/apiClient.js
// Simulates network behavior for all services: latency + occasional failures.
// Keeping this in one place means every service behaves like the same "server".

const MIN_DELAY = 300;
const MAX_DELAY = 800;
const ERROR_RATE = 0.07; // ~7% of calls fail, so error UI is demonstrable

const randomDelay = () =>
  new Promise((resolve) =>
    setTimeout(resolve, MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY))
  );

/**
 * Wraps any data-producing function to behave like a network call.
 * @param {Function} produce - returns the response payload
 * @param {Object} options - { failable: boolean } disable errors for critical reads
 */
export async function simulateRequest(produce, { failable = true } = {}) {
  await randomDelay();

  if (failable && Math.random() < ERROR_RATE) {
    // Mimic a server error shape so UI error handling is realistic
    throw new Error("Network error: failed to fetch data. Please try again.");
  }

  return produce();
}
