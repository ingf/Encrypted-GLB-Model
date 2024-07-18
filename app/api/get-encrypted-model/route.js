import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 设置密钥和初始化向量 (IV)
const key = crypto.randomBytes(32); // 32 字节密钥
const iv = crypto.randomBytes(16); // 16 字节 IV

// 加密函数
function encrypt(filePath, outputFilePath) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const input = fs.createReadStream(filePath);
  const output = fs.createWriteStream(outputFilePath);

  return new Promise((resolve, reject) => {
    input.pipe(cipher).pipe(output);
    output.on('finish', () => resolve());
    output.on('error', (err) => reject(err));
  });
}

export async function GET() {
  const encryptedFile = 'model_encrypted.glb';
  const filePath = path.resolve('public/model.glb');
  const outputFilePath = path.resolve('public', encryptedFile);

  // 加密文件
  await encrypt(filePath, outputFilePath);

  // demo 简单实现许可证管理
  return NextResponse.json({
    encryptedFile: `/${encryptedFile}`,
    key: Array.from(key),
    iv: Array.from(iv),
  });
}
