import time
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

# 生成密钥和初始向量
key = get_random_bytes(32)  # AES-256 密钥
iv = get_random_bytes(16)  # 初始向量

# 创建 AES cipher
cipher = AES.new(key, AES.MODE_CBC, iv)

# 生成一个 3MB 的随机文件内容
data = get_random_bytes(3 * 1024 * 1024)

# 加密文件
start_time = time.time()
encrypted_data = cipher.encrypt(data)
encrypt_time = time.time() - start_time

# 创建新的 AES cipher 用于解密
cipher = AES.new(key, AES.MODE_CBC, iv)

# 解密文件
start_time = time.time()
decrypted_data = cipher.decrypt(encrypted_data)
decrypt_time = time.time() - start_time

# 验证解密结果是否正确
assert data == decrypted_data

print(f"Encryption time: {encrypt_time * 1000} ms")
print(f"Decryption time: {decrypt_time * 1000 } ms")
