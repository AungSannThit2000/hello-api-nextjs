import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

function normalizeId(id) {
  if (!id) return { filter: null };
  const clean = id.toString().trim();
  if (ObjectId.isValid(clean)) {
    return { filter: { _id: new ObjectId(clean) } };
  }
  const match = clean.match(/[a-fA-F0-9]{24}/);
  if (match && ObjectId.isValid(match[0])) {
    return { filter: { _id: new ObjectId(match[0]) } };
  }
  return { filter: { _id: clean } };
}

function getNewImageName(mimeType) {
  const ext = ALLOWED_IMAGE_TYPES[mimeType];
  const unguessablePart = crypto.randomBytes(32).toString("hex");
  return `${unguessablePart}.${ext}`;
}

function getPublicImagePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  if (!imageUrl.startsWith("/profile-images/")) return null;
  const relativePath = imageUrl.replace(/^\//, "");
  return path.join(process.cwd(), "public", relativePath);
}

async function parseMultipartFormData(req) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data")) {
    throw new Error("Invalid content-type");
  }
  return req.formData();
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(req, { params }) {
  const { id } = await params;
  const { filter } = normalizeId(id);
  if (!filter) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400, headers: corsHeaders });
  }

  let formData;
  try {
    formData = await parseMultipartFormData(req);
  } catch (_error) {
    return NextResponse.json({ message: "Invalid form data" }, { status: 400, headers: corsHeaders });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400, headers: corsHeaders });
  }

  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    return NextResponse.json({ message: "Only image files allowed" }, { status: 400, headers: corsHeaders });
  }

  const filename = getNewImageName(file.type);
  const imageUrl = `/profile-images/${filename}`;
  const savePath = getPublicImagePath(imageUrl);
  if (!savePath) {
    return NextResponse.json({ message: "Failed to build image path" }, { status: 500, headers: corsHeaders });
  }

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const currentUser = await db.collection("user").findOne(filter);
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404, headers: corsHeaders });
    }

    if (currentUser.profileImage) {
      const oldFilePath = getPublicImagePath(currentUser.profileImage);
      if (oldFilePath) {
        await fs.rm(oldFilePath, { force: true });
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    await fs.mkdir(path.dirname(savePath), { recursive: true });
    await fs.writeFile(savePath, Buffer.from(arrayBuffer));

    await db.collection("user").updateOne({ _id: currentUser._id }, { $set: { profileImage: imageUrl } });
    return NextResponse.json({ imageUrl }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  const { filter } = normalizeId(id);
  if (!filter) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400, headers: corsHeaders });
  }

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const currentUser = await db.collection("user").findOne(filter);
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404, headers: corsHeaders });
    }

    if (currentUser.profileImage) {
      const oldFilePath = getPublicImagePath(currentUser.profileImage);
      if (oldFilePath) {
        await fs.rm(oldFilePath, { force: true });
      }
    }

    await db.collection("user").updateOne({ _id: currentUser._id }, { $set: { profileImage: null } });
    return NextResponse.json({ message: "OK" }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500, headers: corsHeaders });
  }
}
