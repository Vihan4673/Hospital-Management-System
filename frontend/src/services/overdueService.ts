import apiClient from "./apiClient"

export const getOverDues = async() => {
   const response =  await apiClient.get(`/overdue`)
   return response.data;
}

export const notifyOverdue = async () => {
   const response = await apiClient.post(`/notify/overdue`)
   return response.data;
}