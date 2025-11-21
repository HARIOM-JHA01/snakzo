import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using env vars
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn(
    'Cloudinary environment variables are missing: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Don't proceed if Cloudinary isn't configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured on the server' },
        { status: 500 }
      );
    }

    // Only accept multipart/form-data POSTs
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file found in request' },
        { status: 400 }
      );
    }

    // Convert File to base64 string usable by cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const fileDataUrl = `data:${file.type};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(fileDataUrl, {
      folder: 'snakzo/products',
      resource_type: 'image',
      // you can add transformations or options here as needed
    });

    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Image upload error', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
