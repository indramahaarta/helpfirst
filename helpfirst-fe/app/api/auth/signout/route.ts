import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  cookies().delete("accessToken");
  return NextResponse.json(null, {
    status: 200,
  });
}
