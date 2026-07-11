import fetch, { Response } from "node-fetch";
import { client } from "../utils/redis";
import { UserData } from "../types/handlers.type";

interface Headers {
  [key: string]: string;
}

export const postToServer = async <T = any>(
  url: string,
  payload: any,
  headers: Headers = {},
): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(payload),
  });

  return response.json() as Promise<T>;
};

export const newPostToServer = async <T = any>(
  url: string,
  body: any,
  headers: Headers = {},
): Promise<T> => {
  const response: Response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  return await response.json();
};

export const getFromServer = async (
  url: string,
  headers: Headers = {},
): Promise<any> => {
  const response: Response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  return await response.json();
};

export const getFromLLM = async (
  url: string,
  headers: Headers = {},
): Promise<any> => {
  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
};

export const getAuthToken = async (
  url: string,
  body: any,
): Promise<Response> => {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

export const httpService = async (
  url: string = "",
  headers: Headers = {},
  method: string = "GET",
  body: any = {},
  _Default: boolean | null = null,
): Promise<Response> => {
  if (!method) {
    throw new Error("Method is not defined");
  }
  if (!url) {
    throw new Error("Url is not defined");
  }
  if (!headers) {
    throw new Error("Headers is not defined");
  }

  let fetchParams: {
    method: string;
    headers: Headers;
    body?: string;
  } = {
    method: method,
    headers: headers,
  };

  if (method === "POST" || method === "PATCH") {
    fetchParams["body"] = JSON.stringify(body);
  }

  return await fetch(url, fetchParams);
};

export const getRedisData = async (
  redisKey: string,
  id: string,
): Promise<UserData> => {
  return await client.hget(redisKey, id);
};

export default {
  postToServer,
  newPostToServer,
  getFromServer,
  getAuthToken,
  httpService,
  getRedisData,
};
