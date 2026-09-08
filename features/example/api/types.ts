// API & Domain Types for Items Feature

export interface Item {
  id: string | number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateItemDto {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface UpdateItemDto {
  id: string | number;
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface GetItemsParams {
  search?: string;
  status?: "all" | "completed" | "pending";
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}
