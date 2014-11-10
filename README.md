# PLP Service: Provider

Portable Linked Profile Provider. This repo will host definitions and implementations for Providers working with PLP

## About

PLP Providers store profiles. They interact with PLP-Directories, serving them profiles, and with PLP-Editors, which create/update/delete the profiles stored on them

## API

Supports CORS ([Cross-Origin Resource Sharing](http://enable-cors.org/))

We evaluate [Hydra](http://www.hydra-cg.com/) and [LDP](http://www.w3.org/TR/ldp/), for now simple Level-3 REST

### POST /

status: *basic implementation*

if payload includes ```@id``` returns *HTTP 409 Conflict*, otherwise creates new profile

request: *expects JSON-LD object with profile data* ([PLP
Editor](https://github.com/hackers4peace/plp-editor) can
generate them)


```js
{
  "@context": "http://plp.hackers4peace.net/context.jsonld",
  "@type": "Person",
  "name": "Alice Wonderland",
  "memberOf": [
    {
      "@id": "http://wl.tld",
      "@type": "Organization",
      "name": "Wonderlanderians"
    },
    ...
  ],
  ...
 }
```

content-type: *application/ld+json*

response: *JSON-LD object with URI of newly created profile based on
provider's domain name and generated [UUID](http://en.wikipedia.org/wiki/Universally_unique_identifier)*

```js
{
 "@context": "http://plp.hackers4peace.net/context.jsonld",
 "@id": "http://provider-domain.tld/449b829a-0fbd-420a-bbe4-70d11527d62b",
 "@type" "Person"
}
```

### GET /:uuid

status: *basic implementation*

gets single profile

request: *currently expects no parameters*

content-type: *application/ld+json*

response: *JSON-LD object with full profile*

```js
{
  "@context": "http://plp.hackers4peace.net/context.jsonld",
  "@id": "http://provider-domain.tld/449b829a-0fbd-420a-bbe4-70d11527d62b",
  "@type": "Person",
  "name": "Alice Wonder",
  "memberOf": [
    {
      "@id": "http://wl.tld",
      "@type": "Organization",
      "name": "Wonderlanderians"
    },
    ...
  ],
  ...
}
```

### PUT /:uuid

status: *basic implementation*

updates profile

same as POST but requires payload to have an @id matching one of the
profiles stored on this provider


### DELETE /:uuid

status: *basic implementation*

deletes profile

request: *currently expects no parameters*
response: 200 OK


## Setup

```bash
$ cp config.example.js config.js
```

edit *config.js* to specify your domain and port

```bash
$ npm install
$ grunt
```

## Unlicense

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
