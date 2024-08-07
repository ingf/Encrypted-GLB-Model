use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Crypto, SubtleCrypto, Window, CryptoKey};
use js_sys::{Uint8Array, Promise, Reflect, Object};
use web_sys::console;

#[wasm_bindgen]
pub async fn decrypt_glb(
    encrypted_data: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array,
) -> Result<Uint8Array, JsValue> {
    console::log_1(&"Starting decryption process".into());

    let window: Window = web_sys::window().ok_or_else(|| {
        console::log_1(&"No window object available".into());
        JsValue::from_str("No window object available")
    })?;
    console::log_1(&"Window object obtained".into());

    let crypto: Crypto = window.crypto().map_err(|_| {
        console::log_1(&"Unable to get crypto".into());
        JsValue::from_str("Unable to get crypto")
    })?;
    console::log_1(&"Crypto object obtained".into());

    let subtle: SubtleCrypto = crypto.subtle();
    console::log_1(&"SubtleCrypto object obtained".into());

    // Create key import parameters
    let key_promise: Promise = subtle.import_key_with_str(
        "raw",
        &key,
        "AES-CBC",
        false,
        &js_sys::Array::of1(&JsValue::from_str("decrypt")),
    )?;
    console::log_1(&"Key import promise created".into());

    let key: CryptoKey = JsFuture::from(key_promise).await?.unchecked_into();
    console::log_1(&"Key imported successfully".into());

    // Create decryption parameters
    let decrypt_algo = Object::new();
    Reflect::set(&decrypt_algo, &JsValue::from_str("name"), &JsValue::from_str("AES-CBC"))?;
    Reflect::set(&decrypt_algo, &JsValue::from_str("iv"), &iv)?;
    console::log_1(&"Decryption algorithm parameters set".into());

    let decrypt_promise: Promise = subtle.decrypt_with_object_and_buffer_source(
        &decrypt_algo,
        &key,
        &encrypted_data,
    )?;
    console::log_1(&"Decryption promise created".into());

    let decrypted = JsFuture::from(decrypt_promise).await?;
    console::log_1(&"Decryption completed".into());

    let decrypted_array = Uint8Array::new(&decrypted);
    console::log_1(&"Decrypted data converted to Uint8Array".into());

    Ok(decrypted_array)
}