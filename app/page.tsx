'use client'

import { useEffect, useState } from 'react'
import init, { decrypt_glb } from '../decrypt_glb_wasm/pkg/decrypt_glb_wasm.js'

async function fetchEncryptedModelInfo() {
  const response = await fetch('/api/get-encrypted-model')
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

export default function Home() {
  const [modelUrl, setModelUrl] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        // Initialize WebAssembly module
        await init()

        const { encryptedFile, key, iv } = await fetchEncryptedModelInfo()
        const encryptedData = await fetchEncryptedModel(encryptedFile)

        // Use WebAssembly function to decrypt
        const decryptedData = decrypt_glb(encryptedData, key, iv)
        console.log('WebAssembly Decrypted GLB file:', decryptedData)

        // const decryptedDataByJS = await decryptGLB(encryptedData, key, iv)
        // console.log('JS Decrypted GLB file:', decryptedDataByJS)

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
