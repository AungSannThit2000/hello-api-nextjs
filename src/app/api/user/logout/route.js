import corsHeaders from "@/lib/cors";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" }, { status: 200, headers: corsHeaders });
  res.cookies.set("token", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
