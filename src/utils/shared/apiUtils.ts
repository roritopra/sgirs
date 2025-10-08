import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { API_BASE_URL } from "@/config/api";
import { setupAxiosInterceptors } from "./axiosInterceptors";

const DEFAULT_TIMEOUT = 90000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const secureBaseURL =
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  API_BASE_URL
    ? API_BASE_URL.replace("http:", "https:")
    : API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: secureBaseURL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configurar interceptors para manejo automático de tokens
setupAxiosInterceptors(axiosInstance);

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: AxiosError) => boolean;
}

export async function apiRequest<T>(
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  data?: any,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  const {
    maxRetries = MAX_RETRIES,
    retryDelay = RETRY_DELAY,
    retryCondition = defaultRetryCondition,
    ...axiosConfig
  } = config || {};

  let retries = 0;
  let lastError: AxiosError | Error | null = null;

  const fullUrl = url.startsWith("http")
    ? url
    : url.startsWith("/")
    ? `${API_BASE_URL}${url}`
    : `${API_BASE_URL}/${url}`;

  const secureUrl =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? fullUrl.replace("http:", "https:")
      : fullUrl;

  console.log(`API REQUEST: [${method.toUpperCase()}] ${secureUrl}`);

  while (retries <= maxRetries) {
    try {
      let response: AxiosResponse;

      const startTime = Date.now();

      switch (method) {
        case "get":
          response = await axiosInstance.get(secureUrl, axiosConfig);
          break;
        case "post":
          response = await axiosInstance.post(secureUrl, data, axiosConfig);
          break;
        case "put":
          response = await axiosInstance.put(secureUrl, data, axiosConfig);
          break;
        case "patch":
          response = await axiosInstance.patch(secureUrl, data, axiosConfig);
          break;
        case "delete":
          response = await axiosInstance.delete(secureUrl, axiosConfig);
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${method}`);
      }

      const requestTime = Date.now() - startTime;

      // Log response basics
      console.log(
        `API RESPONSE: [${method.toUpperCase()}] ${secureUrl} - Status: ${
          response.status
        } (${requestTime}ms)`
      );

      if (!response.data) {
        console.warn(`API WARNING: Empty response data from ${secureUrl}`);
        return {} as T;
      }

      return response.data as T;
    } catch (error: any) {
      lastError = error as AxiosError | Error;

      console.error(`API ERROR [${method.toUpperCase()}] ${secureUrl}:`, error);

      if (error.response) {
        console.error(`Status: ${error.response.status}`, error.response.data);
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor", error.request);
      } else {
        console.error("Error al configurar la solicitud:", error.message);
      }

      if (
        retries < maxRetries &&
        error instanceof AxiosError &&
        retryCondition(error)
      ) {
        retries++;

        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        axiosConfig.timeout = (axiosConfig.timeout || DEFAULT_TIMEOUT) * 1.5;

        console.warn(
          `Reintentando solicitud (${retries}/${maxRetries}): ${secureUrl}`
        );
      } else {
        break;
      }
    }
  }

  handleApiError(lastError);

  throw lastError;
}

function defaultRetryCondition(error: AxiosError): boolean {
  return (
    !error.response ||
    error.code === "ECONNABORTED" ||
    [408, 429, 500, 502, 503, 504].includes(error.response?.status || 0)
  );
}
export function handleApiError(error: AxiosError | Error | null): never {
  if (!error) {
    throw new Error("Se produjo un error desconocido");
  }

  if (axios.isAxiosError(error)) {
    let message = "Error en la solicitud";
    let details = "";

    if (error.response) {
      message = `Error ${error.response.status}: ${error.response.statusText}`;
      details = JSON.stringify(error.response.data, null, 2);
    } else if (error.request) {
      message = "No se recibió respuesta del servidor";
      details =
        error.code === "ECONNABORTED"
          ? "La solicitud excedió el tiempo máximo de espera"
          : error.message;
    } else {
      message = "Error al configurar la solicitud";
      details = error.message;
    }

    console.error(`${message}\n${details}`);

    const enhancedError = new Error(message);
    enhancedError.name = "ApiError";
    (enhancedError as any).originalError = error;
    (enhancedError as any).details = details;

    throw enhancedError;
  }

  console.error(`Error: ${error.message}`);
  throw error;
}

export async function batchRequests<T>(
  requests: Promise<any>[],
  allOrNothing: boolean = false
): Promise<T[]> {
  if (allOrNothing) {
    return Promise.all(requests) as Promise<T[]>;
  } else {
    const results = await Promise.allSettled(requests);

    const successfulResults = results
      .filter(
        (result): result is PromiseFulfilledResult<T> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);

    results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      )
      .forEach((result, index) => {
        console.error(`La solicitud ${index} falló:`, result.reason);
      });

    return successfulResults;
  }
}

export async function downloadFile(
  url: string,
  config?: AxiosRequestConfig & RetryConfig
): Promise<string> {
  const fullUrl = url.startsWith("http")
    ? url
    : url.startsWith("/")
    ? `${API_BASE_URL}${url}`
    : `${API_BASE_URL}/${url}`;

  const secureUrl =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? fullUrl.replace("http:", "https:")
      : fullUrl;

  try {
    const response = await axiosInstance.get(secureUrl, {
      ...config,
      responseType: "json",
    });

    if (
      response.data &&
      typeof response.data === "object" &&
      response.data.enlace
    ) {
      return response.data.enlace;
    } else if (response.data && typeof response.data === "string") {
      return response.data;
    } else {
      throw new Error("No se pudo obtener una URL válida para el documento");
    }
  } catch (error) {
    handleApiError(error as AxiosError | Error);
    throw error;
  }
}

export function get<T>(
  url: string,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  const urlWithTimestamp = url.includes("?")
    ? `${url}&_t=${Date.now()}`
    : `${url}?_t=${Date.now()}`;

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return apiRequest<T>("get", urlWithTimestamp, undefined, {
      ...config,
      baseURL: API_BASE_URL?.replace("http:", "https:"),
    });
  }

  return apiRequest<T>("get", urlWithTimestamp, undefined, config);
}

export function post<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  return apiRequest<T>("post", url, data, config);
}

export function put<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  return apiRequest<T>("put", url, data, config);
}

export function del<T>(
  url: string,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  return apiRequest<T>("delete", url, undefined, config);
}

export function patch<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig & RetryConfig
): Promise<T> {
  return apiRequest<T>("patch", url, data, config);
}
