import { NextRequest, NextResponse } from "next/server";
import fabrics from "@/data/forSanity/fabrics.json";
import colors from "@/data/forSanity/colors.json";
import products from "@/data/forSanity/products.json";

type DataType = "brand" | "fabric" | "color" | "product";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const typeParam = body.type;

    if (!typeParam) {
      return NextResponse.json(
        { error: "Type field is required in the request body" },
        { status: 400 }
      );
    }

    const type = typeParam.toLowerCase() as DataType;

    let data;

    switch (type) {
      case "fabric":
        data = fabrics;
        break;
      case "color":
        data = colors;
        break;
      case "product":
        data = products;
        break;
      default:
        return NextResponse.json(
          { error: `Invalid type: ${typeParam}` },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process request", details: err.message },
      { status: 500 }
    );
  }
}