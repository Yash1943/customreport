// src/api/api.ts
import axios from "axios";

// Define a more robust response type
type ServiceResponse<T> = {
  message: T;
  success?: boolean;
  status?: number;
};

// Define a more flexible params interface
interface ServiceParams {
  [key: string]: any;
}

/**
 * Makes an API call with proper error handling and logging
 */
const makeApiCall = async <T>(
  endpoint: string,
  params?: ServiceParams,
  method: 'get' | 'post' = 'get'
): Promise<ServiceResponse<T>> => {
  // Load environment variables
  const username = import.meta.env.VITE_USERNAME;
  const password = import.meta.env.VITE_PASSWORD;
  const base_url = import.meta.env.VITE_API_BASE_URL;
  
  // Check if environment variables are defined
  if (!username || !password || !base_url) {
    console.error('Missing environment variables for API call');
    throw new Error('API configuration is incomplete. Check your environment variables.');
  }
  
  const auth = btoa(`${username}:${password}`);
  
  // Construct the full URL with appropriate formatting
  const apiUrl = `${base_url}/${endpoint}`;
  
  console.log(`Making ${method.toUpperCase()} request to: ${apiUrl}`);
  
  try {
    let response;
    const config = {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    };
    
    if (method === 'get') {
      response = await axios.get<ServiceResponse<T>>(apiUrl, {
        ...config,
        params: params,
      });
    } else { // 'post'
      response = await axios.post<ServiceResponse<T>>(apiUrl, params, config);
    }
    
    console.log(`API call successful:`, response.status);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`API call failed:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
      
      throw {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        endpoint,
        error: error.response?.data
      };
    }
    
    console.error(`Unknown error in API call:`, error);
    throw error;
  }
};

/**
 * Service to get the first report
 */
export const getFirstReportService = async <T>(): Promise<ServiceResponse<T>> => {
  return makeApiCall<T>("customreport.reportapi.get_first_report");
};

/**
 * Additional service for more flexibility
 */
export const getCustomReport = async <T>(reportPath: string, params?: ServiceParams): Promise<ServiceResponse<T>> => {
  return makeApiCall<T>(`customreport.reportapi.${reportPath}`, params);
};