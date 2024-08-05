use aes::Aes256;
use block_modes::block_padding::Pkcs7;
use block_modes::{BlockMode, Cbc};
use js_sys::{Date, Uint8Array};
use wasm_bindgen::prelude::*;

type Aes256Cbc = Cbc<Aes256, Pkcs7>;

#[wasm_bindgen]
pub fn decrypt_glb(encrypted_data: &[u8], key: &[u8], iv: &[u8]) -> Result<Uint8Array, JsValue> {
    // 记录开始时间
    let start = Date::now();

    // 创建 cipher 实例
    let cipher =
        Aes256Cbc::new_from_slices(key, iv).map_err(|e| JsValue::from_str(&e.to_string()))?;

    // 解密数据
    let decrypted_data = cipher
        .decrypt_vec(encrypted_data)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    // 记录结束时间
    let duration = Date::now() - start;
    web_sys::console::log_1(&JsValue::from_str(&format!(
        "Wasm Decryption took: {} ms",
        duration
    )));

    // 返回解密后的数据
    Ok(Uint8Array::from(&decrypted_data[..]))
}
