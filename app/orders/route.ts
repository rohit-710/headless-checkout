import { NextRequest, NextResponse } from "next/server";
import { callCrossmintAPI } from "@/app/utils/crossmint";

// required for CORS
export async function OPTIONS(req: NextRequest, res: NextResponse) {
  return NextResponse.json({ status: 200 });
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();
    console.log("create order: ", body);

    const apiResponse = await callCrossmintAPI("/orders", {
      method: "POST",
      body,
    });

    return NextResponse.json(apiResponse, { status: 200 });
  } catch (error) {
    console.log("failed to create order");
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 }
    );
  }
}
