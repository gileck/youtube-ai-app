import type { NextApiRequest, NextApiResponse } from "next";
import { processChatRequest, ChatResponse } from "../../../api/ai/chat";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(200).json({
      result: "",
      cost: { totalCost: 0 },
      error: "Method not allowed. Please use POST."
    });
  }

  const response = await processChatRequest(req.body);
  return res.status(200).json(response);
}
