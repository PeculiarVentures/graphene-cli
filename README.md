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

Create config file
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
> module init -p config.json
```

Get list of objects
```
> object list -s 0 
```
