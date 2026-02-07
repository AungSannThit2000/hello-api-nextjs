import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET() {
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const result = await db.collection("user").find({}, { projection: { password: 0 } }).toArray();
    const normalized = result.map((u) => ({ ...u, _id: u._id.toString() }));
    return NextResponse.json(normalized, { headers: corsHeaders });
  } catch (exception) {
    const errorMsg = exception.toString();
    return NextResponse.json({ message: errorMsg }, { status: 400, headers: corsHeaders });
  }
}

export async function POST(req) {
  const data = await req.json();
  const { username, email, password, firstname, lastname } = data;
  if (!username || !email || !password) {
    return NextResponse.json({ message: "Missing mandatory data" }, { status: 400, headers: corsHeaders });
  }
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const result = await db.collection("user").insertOne({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      firstname,
      lastname,
      status: "ACTIVE",
    });
    return NextResponse.json({ id: result.insertedId }, { status: 200, headers: corsHeaders });
  } catch (exception) {
    const errorMsg = exception.toString();
    let displayErrorMsg = "";
    if (errorMsg.includes("duplicate")) {
      if (errorMsg.includes("username")) displayErrorMsg = "Duplicate Username!!";
      else if (errorMsg.includes("email")) displayErrorMsg = "Duplicate Email!!";
    }
    return NextResponse.json({ message: displayErrorMsg }, { status: 400, headers: corsHeaders });
  }
}
