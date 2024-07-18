use wasm_bindgen::prelude::*;
use aes::Aes256;
use block_modes::{BlockMode, Cbc};
use block_modes::block_padding::Pkcs7;
use js_sys::{Uint8Array};

type Aes256Cbc = Cbc<Aes256, Pkcs7>;

#[wasm_bindgen]
pub fn decrypt_glb(encrypted_data: &[u8], key: &[u8], iv: &[u8]) -> Result<Uint8Array, JsValue> {
    let cipher = Aes256Cbc::new_from_slices(key, iv).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let decrypted_data = cipher.decrypt_vec(encrypted_data).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(Uint8Array::from(&decrypted_data[..]))
}