import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

function parseCloudinaryUrl(url: string) {
  // cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  const match = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url);
  if (!match) {
    throw new Error("Invalid CLOUDINARY_URL format");
  }
  return {
    apiKey: match[1],
    apiSecret: match[2],
    cloudName: match[3],
  };
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      return NextResponse.json(
        { error: "Missing CLOUDINARY_URL" },
        { status: 500 },
      );
    }

    const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl(cloudinaryUrl);

    const form = await request.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file" },
        { status: 400 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "renters";

    const signature = signCloudinaryParams(
      {
        folder,
        timestamp,
      },
      apiSecret,
    );

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp);
    uploadForm.append("folder", folder);
    uploadForm.append("signature", signature);

    const cloudinaryResp = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadForm,
      },
    );

    const bodyText = await cloudinaryResp.text();
    if (!cloudinaryResp.ok) {
      return NextResponse.json(
        { error: "Cloudinary upload failed", details: bodyText },
        { status: 502 },
      );
    }

    const body = JSON.parse(bodyText) as {
      secure_url?: string;
      public_id?: string;
    };

    if (!body.secure_url) {
      return NextResponse.json(
        { error: "Cloudinary response missing secure_url" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      secureUrl: body.secure_url,
      publicId: body.public_id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to upload renter photo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
