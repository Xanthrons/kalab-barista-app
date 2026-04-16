const fs = require("fs");
const path = require("path");
const https = require("https");

const uploadsDirectory = path.join(__dirname, "..", "uploads", "payments");

function ensureUploadsDirectory() {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

function buildPublicUploadUrl(relativePath) {
  const baseUrl =
    process.env.SERVER_PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 5000}`;

  return `${baseUrl.replace(/\/$/, "")}${relativePath}`;
}

function sanitizeFileName(value) {
  return (
    String(value ?? "file")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "file"
  );
}

function downloadFile(sourceUrl, destinationPath) {
  return new Promise((resolve, reject) => {
    const request = https.get(sourceUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(
          new Error(`Failed to download file. Status code: ${response.statusCode}`)
        );
        response.resume();
        return;
      }

      const stream = fs.createWriteStream(destinationPath);
      response.pipe(stream);

      stream.on("finish", () => {
        stream.close(resolve);
      });

      stream.on("error", reject);
    });

    request.on("error", reject);
  });
}

async function saveTelegramPhoto(bot, fileId, filePrefix) {
  ensureUploadsDirectory();

  const fileUrl = await bot.getFileLink(fileId);
  const parsedUrl = new URL(fileUrl);
  const extension = path.extname(parsedUrl.pathname) || ".jpg";
  const fileName = `${Date.now()}-${sanitizeFileName(filePrefix)}${extension}`;
  const absolutePath = path.join(uploadsDirectory, fileName);

  await downloadFile(fileUrl, absolutePath);

  return buildPublicUploadUrl(`/uploads/payments/${fileName}`);
}

module.exports = {
  buildPublicUploadUrl,
  saveTelegramPhoto
};
