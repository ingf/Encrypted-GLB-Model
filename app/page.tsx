'use client'

import { useEffect, useState } from 'react'
import init, {
  decrypt_glb,
  fetch_data,
} from '../decrypt_glb_wasm/pkg/decrypt_glb_wasm.js'

// const mode = 'paratial'
const mode = ''

async function fetchEncryptedModelInfo() {
  const response = await fetch(
    mode === 'paratial'
      ? '/api/encrypted-model-paratial'
      : '/api/get-encrypted-model',
  )
  const data = await response.json()
  return {
    encryptedFile: data.encryptedFile,
    key: new Uint8Array(data.key),
    iv: new Uint8Array(data.iv),
  }
}

async function fetchEncryptedModel(url) {
  const response = await fetch(url)
  return new Uint8Array(await response.arrayBuffer())
}

async function decryptGLB(encryptedData, key, iv) {
  const algorithm = { name: 'AES-CBC', iv: iv }
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    algorithm,
    false,
    ['decrypt'],
  )
  const decryptedData = await crypto.subtle.decrypt(
    algorithm,
    cryptoKey,
    encryptedData,
  )
  return decryptedData
}

async function decryptGLBPartial(encryptedData, key, iv) {
  // 解密文件的前 1024 字节
  const encryptedDataParatial = encryptedData.slice(0, 1024)
  const decryptedData = await decryptGLB(encryptedDataParatial, key, iv)

  // 将解密后的数据与未加密的部分合并
  const decryptedArrayBuffer = new Uint8Array(encryptedData.byteLength)
  decryptedArrayBuffer.set(new Uint8Array(decryptedData), 0)
  decryptedArrayBuffer.set(new Uint8Array(encryptedData.slice(1024)), 1024)
  return decryptedArrayBuffer
}

export default function Home() {
  const [modelUrl, setModelUrl] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        // Initialize WebAssembly module
        await init()

        const l = '/api/encrypted-model-paratial'
        try {
          const data = await fetch_data(l)
          console.log('Data fetched from API:', data)
        } catch (err) {
          console.error('Failed to fetch data:', err)
        }

        const { encryptedFile, key, iv } = await fetchEncryptedModelInfo()
        const encryptedData = await fetchEncryptedModel(encryptedFile)

        const start = performance.now()
        // Use WebAssembly function to decrypt
        const decryptedData = decrypt_glb(encryptedData, key, iv)

        // const decryptedData =
        //   mode === 'paratial'
        //     ? await decryptGLBPartial(encryptedData, key, iv)
        //     : await decryptGLB(encryptedData, key, iv)

        console.log('Time taken:', performance.now() - start)
        console.log('Decrypted data:', decryptedData)

        const decryptedBlob = new Blob([decryptedData], {
          type: 'model/gltf-binary',
        })
        const url = URL.createObjectURL(decryptedBlob)
        setModelUrl(url)

        return () => {
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('Error decrypting GLB file:', error)
      }
    })()
  }, [])

  return (
    <div>
      <model-viewer
        id="model"
        src={modelUrl}
        alt="3D Model"
        auto-rotate
        camera-controls
        style={{ width: '100%', height: '100vh' }}
      ></model-viewer>
    </div>
  )
}
