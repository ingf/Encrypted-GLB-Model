use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, Response};

#[wasm_bindgen(module = "/src/crypto.js")]
extern "C" {
    #[wasm_bindgen(catch)]
    async fn decrypt_data(
        encrypted_data: Uint8Array,
        key: Uint8Array,
        iv: Uint8Array,
    ) -> Result<JsValue, JsValue>;
}

#[wasm_bindgen]
pub async fn decrypt_glb(
    encrypted_data: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array,
) -> Result<Uint8Array, JsValue> {
    let decrypted_js_value = decrypt_data(encrypted_data, key, iv).await?;
    let decrypted_data: Uint8Array = decrypted_js_value.dyn_into()?;
    Ok(decrypted_data)
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
