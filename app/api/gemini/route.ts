import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || "");

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return NextResponse.json({ result: text });
}
