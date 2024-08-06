use aes::Aes256;
use block_modes::block_padding::Pkcs7;
use block_modes::{BlockMode, Cbc};
use js_sys::{Date, Uint8Array};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, Response};
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

#[wasm_bindgen]
pub async fn fetch_data(url: String) -> Result<JsValue, JsValue> {
    let mut opts = RequestInit::new();
    opts.method("GET");

    let request = Request::new_with_str_and_init(&url, &opts)?;
    let window = web_sys::window().unwrap();
    let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;
    let resp: Response = resp_value.dyn_into().unwrap();
    let json = JsFuture::from(resp.json()?).await?;

    Ok(json)
}
