import { serverAxios } from "@/utils/axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const data = await req.json();
  try {
    const res = await serverAxios.post("/api/auth/signin", data);
    cookies().set("accessToken", res.data?.accessToken);
    return NextResponse.json(res.data, {
      status: res.status,
    });
  } catch (error: any) {
    return NextResponse.json(error?.response?.data, {
      status: error.response ? error.response.status : 500,
    });
  }
}
