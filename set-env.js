const { writeFileSync } = require("fs");

const uploaderEnvPath = "./src/environments/environment.prod.ts";
const uploaderEnvFile = `export const environment = {
  fileBaseUrl: '${process.env.FILE_BASE_URL || ""}',
  userBaseUrl: '${process.env.USER_BASE_URL || ""}',
  TOKEN_KEY: '${process.env.TOKEN_KEY || ""}'
};
`;

writeFileSync(uploaderEnvPath, uploaderEnvFile);
console.log(`✅ Uploader environment file generated at ${uploaderEnvPath}`);
