"use server";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.NEXT_STREAM_API_SECRET_KEY;

export const tokenProvider = async (userId: string) => {
  if (!apiKey || !apiSecret) return null;

  const client = new StreamClient(apiKey, apiSecret);
  const validity = 60 * 60;
  const exp = Math.round(Date.now() / 1000) + validity;
  const issued = Math.floor(Date.now() / 1000) - 60;

  return client.createToken(userId, exp, issued);
};
