import api from './api';

export async function placeOrder() {
  const response = await api.post('/orders');
  return response.data;
}

export async function getOrderHistory() {
  const response = await api.get('/orders/history');
  return response.data;
}

export async function getAllOrders() {
  const response = await api.get('/orders');
  return response.data;
}

export async function getOrder(id) {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}