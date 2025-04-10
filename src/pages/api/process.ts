import { processApiCall } from "@/apis/processApiCall";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  console.log('API request:', req.body);
  
  const response = await processApiCall(req);

  // console.log('API response:', response);
  return res.status(200).json(response);
}