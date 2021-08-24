# graphene-cli
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/PeculiarVentures/graphene-cli/master/LICENSE)

[![NPM](https://nodei.co/npm/graphene-cli.png?compact=true)](https://nodei.co/npm/graphene-cli/)

Graphene is a cross platform command line tool for working with PKCS#11 devices. 

## Install

```
npm install graphene-cli --global
```

## Usage
```
user@peculiar-02:~# graphene
> module load -l /usr/safenet/lunaclient/lib/libCryptoki2_64.so -n SoftHSMv2.0

Module info
==============================
  Library: /usr/safenet/lunaclient/lib/libCryptoki2_64.so
  Name: SoftHSMv2.0
  Description: Chrystoki                      
  Cryptoki version: 2.20

> slot open --slot 0 -p 1234567890

Session is started

> test sign -it 200 -a all -s 0

| Algorithm                 |     Sign |   Verify |   Sign/s | Verify/s |
|---------------------------|---------:|---------:|---------:|---------:|
| RSA-1024                  |   5.77ms |   2.42ms |   173.31 |  413.223 |
| RSA-2048                  | 16.715ms |  3.755ms |   59.827 |  266.312 |
| RSA-4096                  |  85.44ms |   5.54ms |   11.704 |  180.505 |
| ECDSA-SECP192R1           |  17.17ms |  19.91ms |   58.241 |   50.226 |
| ECDSA-SECP256R1           |  25.93ms |  29.52ms |   38.565 |   33.875 |
| ECDSA-SECP384R1           | 61.685ms |   72.8ms |   16.211 |   13.736 |
| ECDSA-SECP256K1           |  28.31ms |  32.76ms |   35.323 |   30.525 |
| ECDSA-BRAINPOOLP192R1     | 29.685ms | 32.465ms |   33.687 |   30.802 |
| ECDSA-BRAINPOOLP224R1     |  24.83ms | 28.735ms |   40.274 |   34.801 |
| ECDSA-BRAINPOOLP256R1     |  28.93ms |  33.23ms |   34.566 |   30.093 |
| ECDSA-BRAINPOOLP320R1     |  48.54ms | 56.265ms |   20.602 |   17.773 |

> 
```

### Open module with config file

JSON file structure
```
lib         Required. Path to PKCS#11 library.
libName     Optional. custom name of library.
slot        Default 0. Index of slot.
pin         Optional. PIN for the token
readWrite   Default false. Open session in edit mode
```

Example of config file for SoftHSMv2
```
// config.json
{
  "lib": "/usr/local/lib/softhsm/libsofthsm2.so",
  "libName": "SoftHSMv2.0",
  "slot": 0,
  "pin": "password"
}
```

Start console application

```
graphene
```

Load module from config file

```
> module load -p config.json
```