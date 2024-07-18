'use client';

import { useEffect, useState } from 'react';

async function fetchEncryptedModelInfo() {
  const response = await fetch('/api/get-encrypted-model');
  const data = await response.json();
  return {
    encryptedFile: data.encryptedFile,
    key: new Uint8Array(data.key),
    iv: new Uint8Array(data.iv),
  };
}

async function fetchEncryptedModel(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return await blob.arrayBuffer();
}

async function decryptGLB(encryptedData, key, iv) {
  const algorithm = { name: 'AES-CBC', iv: iv };
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    algorithm,
    false,
    ['decrypt']
  );
  const decryptedData = await crypto.subtle.decrypt(
    algorithm,
    cryptoKey,
    encryptedData
  );
  return new Blob([decryptedData], { type: 'model/gltf-binary' });
}

export default function Home() {
  const [modelUrl, setModelUrl] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { encryptedFile, key, iv } = await fetchEncryptedModelInfo();
        const encryptedData = await fetchEncryptedModel(encryptedFile);
        const decryptedBlob = await decryptGLB(encryptedData, key, iv);
        const url = URL.createObjectURL(decryptedBlob);
        setModelUrl(url);

        // 撤销对象 URL 以增强安全性
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error('Error decrypting GLB file:', error);
      }
    })();
  }, []);

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
  );
}
