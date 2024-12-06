import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as https from "https";

@Injectable()
export class AxiosService {
  private axiosInstance: AxiosInstance;

  constructor() {
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    this.axiosInstance = axios.create({
      httpsAgent,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async get(url: string, ...args: any[]): Promise<AxiosResponse<any, any>> {
    return this.axiosInstance.get(url, ...args);
  }

  async post(url: string, ...args: any[]): Promise<AxiosResponse<any, any>> {
    return this.axiosInstance.post(url, ...args);
  }

  async delete(url: string, params?: any): Promise<AxiosResponse<any, any>> {
    return this.axiosInstance.delete(url, { params });
  }
}
