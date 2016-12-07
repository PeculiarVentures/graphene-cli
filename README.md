# graphene-cli
[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/PeculiarVentures/graphene-cli/master/LICENSE)
[![NPM version](https://badge.fury.io/js/graphene-cli.svg)](http://badge.fury.io/graphene-cli)

[![NPM](https://nodei.co/npm-dl/graphene-cli.png?months=2&height=2)](https://nodei.co/npm/graphene-cli/)

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

> test sign -it 200 -a all

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
