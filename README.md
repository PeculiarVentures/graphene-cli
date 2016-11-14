# graphene-cli

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