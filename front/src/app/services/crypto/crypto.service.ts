import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private _rsaKeyLength = 4096;
  private _publicKey: CryptoKey = null;
  private _privateKey: CryptoKey = null;
  private _serverPublicKey: CryptoKey = null;

  constructor() {
  }

  private arrayBufferToBase64(arrayBuffer): string {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for (var i = 0; i < byteArray.byteLength; i++) {
      byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
  }

  private base64ToArrayBuffer(base64): ArrayBuffer {
    var binaryString = window.atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

  /*
  Convert  an ArrayBuffer into a string
  from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
  */
  private ab2str(buf: ArrayBuffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  /*
  Export the given key.
  */
  private exportCryptoKeyToPem(key: ArrayBuffer): string {

    const exportedAsString = this.ab2str(key);
    const exportedAsBase64 = btoa(exportedAsString);
    const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;

    return pemExported;
  }

  private str2ab(str: string): ArrayBuffer {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  private async importRsaKey(pem: string): Promise<CryptoKey> {
    // fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);

    // base64 decode the string to get the binary data
    const binaryDerString = atob(pemContents);

    // convert from a binary string to an ArrayBuffer
    const binaryDer = this.str2ab(binaryDerString);
    return crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSA-OAEP",
        hash: "SHA-512"
      },
      true,
      ["encrypt"]
    );
  }

  public generateKeyPair(options = { force: false }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (options.force == false && (this._publicKey != null || this._privateKey != null)) {
        reject('Key pair already exists');
      } else {
        try {

          const keypair = await crypto.subtle.generateKey({
            name: "RSA-OAEP",
            modulusLength: this._rsaKeyLength,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: { name: "SHA-512" }
          }, true, ["encrypt", "decrypt"]);

          this._privateKey = keypair.privateKey;
          this._publicKey = keypair.publicKey;

          resolve('ok');
        } catch (e) {
          reject(e);
        }
      }
    });
  }

  public removeKeyPair(): void {
    this._publicKey = null;
    this._privateKey = null;
  }

  public async setServerPublicKey(serverPublicKey): Promise<void> {
    this._serverPublicKey = await this.importRsaKey(serverPublicKey);
  }

  public async getServerPublicKey(): Promise<ArrayBuffer> {
    return await crypto.subtle.exportKey(
      "spki",
      this._serverPublicKey
    );
  }

  public async getServerPublicKeyPem(): Promise<string> {

    return this.exportCryptoKeyToPem(await crypto.subtle.exportKey(
      "spki",
      this._serverPublicKey
    ));
  }

  public async getPublicKey(): Promise<ArrayBuffer> {
    return await crypto.subtle.exportKey(
      "spki",
      this._publicKey
    );
  }

  public async getPublicKeyPem(): Promise<string> {
    return this.exportCryptoKeyToPem(await crypto.subtle.exportKey(
      "spki",
      this._publicKey
    ));
  }

  public async encryptMessage(message: string): Promise<string> {
    return this.arrayBufferToBase64(await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      this._publicKey,
      this.str2ab(message)
    ));
  }

  public async decryptMessage(message: string): Promise<string> {
    return this.ab2str(await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP"
      },
      this._privateKey,
      this.base64ToArrayBuffer(message)
    ));
  }
}
