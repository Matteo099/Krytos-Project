var Buffer = require('buffer/').Buffer;

b64_encode = function(data){
    return Buffer.from(data, 'base64').toString('ascii');
}

b64_decode = function(data){
    return Buffer.from(data).toString('base64');
}

blobToImage = function(data){
    return 'data:image/jpeg;base64,'+b64_decode(data);
}