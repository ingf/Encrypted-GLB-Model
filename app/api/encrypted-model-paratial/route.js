import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// 设置密钥和初始化向量 (IV)
const key = crypto.randomBytes(32) // 32 字节密钥
const iv = crypto.randomBytes(16) // 16 字节 IV

// 加密 buffer
function encryptBuffer(buffer) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  return encrypted
}

// 部分加密函数
async function encryptPartial(filePath, outputFilePath, offset, length) {
  const input = fs.readFileSync(filePath)
  const outputBuffer = Buffer.alloc(input.length)
  input.copy(outputBuffer) // 复制原始数据到输出 buffer

  const partToEncrypt = input.slice(offset, offset + length)
  const encryptedPart = encryptBuffer(partToEncrypt)
  encryptedPart.copy(outputBuffer, offset)

  fs.writeFileSync(outputFilePath, outputBuffer)
}

export async function GET() {
  const encryptedFile = 'model_encrypted.glb'
  const filePath = path.resolve('public/model.glb')
  const outputFilePath = path.resolve('public', encryptedFile)

  const offset = 0 // 从文件开头开始加密
  const length = 1024 // 加密前 1024 字节

  const start = Date.now()
  // 部分加密文件
  await encryptPartial(filePath, outputFilePath, offset, length)
  console.log(`Encrypt time: ${Date.now() - start}ms`)

  // 简单实现许可证管理
  return NextResponse.json({
    encryptedFile: `/${encryptedFile}`,
    key: Array.from(key),
    iv: Array.from(iv),
  })
}