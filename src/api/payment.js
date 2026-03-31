import apiClient from "./client";

export async function initiatePayment({
  amount,
  taxAmount = 0,
  serviceCharge  = 0,
  deliveryCharge = 0,
}) {
  const response = await apiClient.post("/api/payment/initiate/", {
    amount,
    tax_amount: taxAmount,
    service_charge: serviceCharge,
    delivery_charge: deliveryCharge,
  });
  return response.data;
}

export async function getPaymentStatus(paymentId) {
  const response = await apiClient.get(`/api/payment/${paymentId}/status/`);
  return response.data.payment;
}

export async function getPaymentHistory() {
  const response = await apiClient.get("/api/payment/");
  return response.data; // { count: N, payments: [...] }
}

export function redirectToEsewa(esewaUrl, esewaPayload) {
  // Remove any stale form
  const existing = document.getElementById("__esewa_form__");
  if (existing) existing.remove();

  const form    = document.createElement("form");
  form.id       = "__esewa_form__";
  form.method   = "POST";
  form.action   = esewaUrl;

  Object.entries(esewaPayload).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type  = "hidden";
    input.name  = key;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit(); // Browser navigates to eSewa login page
}

export async function handleUpgradeWithEsewa({
  amount,
  taxAmount      = 0,
  serviceCharge  = 0,
  deliveryCharge = 0,
}) {
  const data = await initiatePayment({ amount, taxAmount, serviceCharge, deliveryCharge });

  // Save so PaymentCallback can poll status after eSewa redirects back
  sessionStorage.setItem("esewa_payment_id",       String(data.payment_id));
  sessionStorage.setItem("esewa_transaction_uuid",  data.transaction_uuid);

  redirectToEsewa(data.esewa_url, data.esewa_payload);
  // ← Browser leaves the page here
}