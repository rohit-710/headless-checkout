import { NextRequest, NextResponse } from "next/server";
import { callCrossmintAPI } from "@/app/utils/crossmint";

// required for CORS
export async function OPTIONS(req: NextRequest, res: NextResponse) {
  return NextResponse.json({ status: 200 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  if (params.orderId) {
    const order = await callCrossmintAPI(`/orders/${params.orderId}`, {
      method: "GET",
    });

    return NextResponse.json(order, { status: 200 });
  } else {
    return NextResponse.json(
      { error: true, message: "Missing orderId" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    console.log("req:", req);
    const body = await req.json();
    console.log("update order: ", body);

    const apiResponse = await callCrossmintAPI(`/orders/${params.orderId}`, {
      method: "PATCH",
      body,
    });

    console.log("apiResponse:", apiResponse);

    return NextResponse.json(apiResponse, { status: 200 });
  } catch (error) {
    console.log("failed to create order");
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 }
    );
  }
}
