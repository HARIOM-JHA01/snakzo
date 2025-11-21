# Cloudinary Setup

This project supports uploading images to Cloudinary using a server-side API route.

1. Create a Cloudinary account (https://cloudinary.com/) if you don't already have one.
2. Create an API Key & API Secret from the Cloudinary dashboard.
3. Add the following environment variables to your `.env.local` file:

```
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>
```

4. Optionally, set a folder name or additional transformations in `app/api/admin/upload-image/route.ts`.

Notes:

- This route requires an authenticated Admin session to upload images.
- If you prefer unsigned uploads (direct from the client) you will need to configure an unsigned preset in Cloudinary and adapt the client code accordingly.
- For production, ensure the environment variables are set in the hosting environment.

Security:

- Server-side uploads keep your Cloudinary API secret on the server.
- If migrating to direct client uploads, use signed uploads or an unsigned preset carefully to avoid misuse.
