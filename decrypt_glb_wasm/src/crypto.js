export async function decrypt_data(encrypted_data, key, iv) {
  console.log('encrypted_data', new Uint8Array(encrypted_data))
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-CBC' },
    false,
    ['decrypt'],
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: iv },
    cryptoKey,
    encrypted_data,
  )

  console.log('decrypted', new Uint8Array(decrypted))

  return new Uint8Array(decrypted)
}
