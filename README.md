# PLP Service: Provider

[![travis-ci](http://img.shields.io/travis/hackers4peace/plp-provider.svg?style=flat)](https://travis-ci.org/hackers4peace/plp-provider)
[![David](http://img.shields.io/david/hackers4peace/plp-provider.svg?style=flat)](https://david-dm.org/hackers4peace/plp-provider)
[![David](http://img.shields.io/david/dev/hackers4peace/plp-provider.svg?style=flat)](https://david-dm.org/hackers4peace/plp-provider#info=devDependencies)

[![issues](http://img.shields.io/github/issues/hackers4peace/plp-provider.svg?style=flat)](https://github.com/hackers4peace/plp-provider/issues)
[![Gitter](http://img.shields.io/badge/chat-Gitter-blue.svg?style=flat)](https://gitter.im/hackers4peace/plp-docs)
[![Unlicense](http://img.shields.io/badge/license-Unlicense-blue.svg?style=flat)](http://unlicense.org)



## About

[Portable Link Profiles](https://github.com/hackers4peace/plp-docs) - Provider Services store profiles. They interact with [PLP Directories](https://github.com/hackers4peace/plp-directory), serving them profiles, and with [PLP Editors](https://github.com/hackers4peace/plp-editor), which can create/update/delete profiles stored on Providers.

## API

Supports CORS ([Cross-Origin Resource Sharing](http://enable-cors.org/))

*We evaluate [Hydra](http://www.hydra-cg.com/) and [LDP](http://www.w3.org/TR/ldp/)*


### GET /:uuid

status: *basic implementation*

gets single profile

#### request

* content-type: **application/ld+json**

#### response

* code: **200 OK**
* payload: *JSON-LD object with full profile*

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

* errors
 * *HTTP 301 Moved Permanently* - if profile moved elsewhere
 * *HTTP 404 Not Found* - if profile never existed
 * *HTTP 410 Gone* - if profile existed but got deleted
 * *HTTP 500 Internal Server Error*

### POST /

status: *basic implementation*

creates new profile

#### request

* content-type: **application/ld+json**
* headers
 * *Authorization: Bearer [token]*
* payload: *profile data* ([PLP
Editor](https://github.com/hackers4peace/plp-editor) can
generate it)


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


#### response

* code: **201 Created**
* content-type: **application/ld+json**
* payload: *JSON-LD object with URI of newly created profile based on
provider's domain name and generated [UUID](http://en.wikipedia.org/wiki/Universally_unique_identifier)*

```js
{
 "@context": "http://plp.hackers4peace.net/context.jsonld",
 "@id": "http://provider-domain.tld/449b829a-0fbd-420a-bbe4-70d11527d62b",
 "@type" "Person"
}
```

* errors
 * *HTTP 401 Unauthorized* - if authentication fails
 * *HTTP 409 Conflict* - if payload includes ```@id```
 * *HTTP 500 Internal Server Error*

### PUT /:uuid

status: *basic implementation*

updates profile

#### request

* content-type: **application/ld+json**
* headers
 * *Authorization: Bearer [token]*
* payload: *same as POST but requires payload to have an @id matching one of stored profiles stored on this provider*

#### response

* code: **200 OK**
* errors
 * *HTTP 401 Unauthorized* - if authentication fails
 * *HTTP 403 Forbidden* - if authorization fails
 * *HTTP 400 Bad Request* - if payload includes ```@id``` different then requested URI
 * *HTTP 500 Internal Server Error*

### DELETE /:uuid

status: *basic implementation*

deletes profile

#### request

* headers
 * *Authorization: Bearer [token]*

#### response

* code: *204 No Content*
* errors
 * *HTTP 401 Unauthorized* - if authentication fails
 * *HTTP 403 Forbidden* - if authorization fails
 * *HTTP 500 Internal Server Error*


## Authentication

Currently we use
[Mozilla Persona](https://developer.mozilla.org/en-US/Persona) and
[JSON Web Token (JWT)](http://jwt.io/)

### POST /auth/login

status: *basic implementation*

#### request

* content-type: **application/json**
* payload: [Mozilla Persona assertion](https://developer.mozilla.org/en-US/docs/Web/API/navigator.id.get)

```json
{ "assertion": "[assertion]" }
```

#### response

* content-type: **application/json**
* payload: [JSON Web Token (JWT)](http://jwt.io)

```json
{ "token": "[token]" }
```

### POST /auth/logout

status: *planned*


## Development

```bash
$ cp config.example.js config.js
```

edit *config.js* to specify your domain and port

```bash
$ npm install
$ npm start
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
