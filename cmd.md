module load -l /usr/local/lib/softhsm/libsofthsm2.so -n SoftHSM
module load -l /usr/local/lib/libeTPkcs11.dylib -n SafeNET
slot open -s 0 -p 12345678
test sign --alg rsa
test gen --alg rsa-1024