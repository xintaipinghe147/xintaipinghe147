import { NextResponse } from "next/server";
import { bumpViews } from "@/lib/data";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const views = await bumpViews(id);
  return NextResponse.json({ views });
}
