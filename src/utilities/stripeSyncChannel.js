const CHANNEL_NAME = "busybeans-stripe-sync";
const STRIPE_CONNECTED_EVENT = "employee-stripe-connected";

export const broadcastEmployeeStripeConnected = (payload = {}) => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return;
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({
    type: STRIPE_CONNECTED_EVENT,
    payload,
  });
  channel.close();
};

export const subscribeEmployeeStripeConnected = (onMessage) => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return () => {};
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event) => {
    if (event?.data?.type === STRIPE_CONNECTED_EVENT) {
      onMessage?.(event.data.payload || {});
    }
  };

  return () => {
    channel.close();
  };
};
